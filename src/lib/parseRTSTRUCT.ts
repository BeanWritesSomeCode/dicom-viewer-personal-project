import dicomParser from 'dicom-parser';
import type { Element, DataSet } from 'dicom-parser';
import { geometryLoader, Enums } from '@cornerstonejs/core';

type Point3 = [number, number, number];

interface ROIMetaData {
    name?: string;
    algorithm?: string;
    referencedFrameOfReferenceUID?: string;
}

interface Contour {
    referencedSOPInstanceUID: string;
    contourGeometricType: string;
    numPoints: number;
    points: Point3[];
}

interface ROIContourSet {
    roiNumber: number;
    metadata: ROIMetaData;
    roiColor: Point3;
    contourSequence: Contour[];
}


const TAGS = {
    // Sequence Elements
    StructureSetROISequence: "x30060020",
    ROIContourSequence: "x30060039",
    ContourSequence: "x30060040",
    ContourImageSequence: "x30060016",

    // Integer Strings
    ROINumber: "x30060022",
    ReferencedROINumber: "x30060084",
    ROIDisplayColor: "x3006002a",

    // Strings
    ROIName: "x30060026",
    ROIGenerationAlgorithm: "x30060036",
    ReferencedFrameOfReferenceUID: "x30060024",
    ReferencedSOPInstanceUID: "x00081155",
    ContourGeometricType: "x30060042",
    SOPInstanceUID: "x00080018",
    FrameOfReferenceUID: "x00200052",

    // Float Strings
    ContourData: "x30060050",
}

function getSequenceElements(dataSet: DataSet, tag: string) {
    try {
        const sequence = dataSet.elements[tag];
        if (sequence) return sequence.items;
    } catch (err) {
        return undefined;
    }
}

function getROIDisplayColor(dataSet: DataSet) {
    const rawString = dataSet.string(TAGS.ROIDisplayColor);
    if (!rawString) return;

    return rawString.split('\\').map(Number) as Point3;
}

function buildROIMetaData(dataSet: DataSet) {
    const roiMetaData = new Map<number, ROIMetaData>();

    const rois = getSequenceElements(dataSet, TAGS.StructureSetROISequence);
    if (!rois) return;

    rois.forEach((roi, idx) => {
        const roiDataSet = roi.dataSet;
        if (!roiDataSet) {
            console.warn("StructureSetROI missing");
            return;
        }
        const roiNumber = roiDataSet.intString(TAGS.ROINumber);
        if (roiNumber) {
            roiMetaData.set(roiNumber, {
                name: roiDataSet.string(TAGS.ROIName) ?? `unnamed${idx}`,
                algorithm: roiDataSet.string(TAGS.ROIGenerationAlgorithm),
                referencedFrameOfReferenceUID: roiDataSet.string(TAGS.ReferencedFrameOfReferenceUID),
            });
        }
    });

    return roiMetaData;
}

function parseContourData(contour: DataSet) {
    const rawString = contour.string(TAGS.ContourData);
    const flatPoints = rawString?.split("\\");
    if (!flatPoints || !(flatPoints.length % 3 === 0)) return;

    const points: Point3[] = [];
    for (let i = 0; i < flatPoints.length; i = i + 3) {
        const point = flatPoints.slice(i, i+3).map(Number) as Point3;
        points.push(point);
    }

    return points;
}

function parseContourSequence(elements: Element[]) {
    const contourSequence = [];
    for (const element of elements) {
        const item = element.dataSet;
        if (!item) continue;

        const contourImageSequence = item.elements[TAGS.ContourImageSequence]?.items;
        if (!contourImageSequence) continue;
        const referencedSOPInstanceUID = contourImageSequence[0].dataSet?.string(TAGS.ReferencedSOPInstanceUID);
        let contourGeometricType = item.string(TAGS.ContourGeometricType);
        if (!contourGeometricType || !(contourGeometricType === 'CLOSED_PLANAR' || contourGeometricType === 'OPEN_PLANAR')) continue;

        const points = parseContourData(item);
        if (!referencedSOPInstanceUID || !contourGeometricType || !points) continue;
        contourSequence.push({
            referencedSOPInstanceUID: referencedSOPInstanceUID,
            contourGeometricType: contourGeometricType,
            numPoints: points.length,
            points: points
        })
    }
    return contourSequence;
}

function parseROIContourSequence(dataSet: DataSet, roiMetaData: Map<number, ROIMetaData>): ROIContourSet[] | undefined {
    const contourSequences = [];

    const roiContourSequenceElements = dataSet
        .elements[TAGS.ROIContourSequence].items;

    if (!roiContourSequenceElements) return;

    // First loop
    for (const sequence of roiContourSequenceElements) {
        const sequenceItem = sequence.dataSet;
        if (!sequenceItem) continue;

        const contourSequenceElements = sequenceItem
            .elements[TAGS.ContourSequence]?.items;
        if (!contourSequenceElements) continue;

        const contourSequence = parseContourSequence(contourSequenceElements);

        const referencedROINumber = sequenceItem.intString(TAGS.ReferencedROINumber);
        const ROIDisplayColor = getROIDisplayColor(sequenceItem);

        if (!referencedROINumber) continue;
        const metaData = roiMetaData.get(referencedROINumber)
        if (!metaData || !ROIDisplayColor || contourSequence.length < 1) continue;
        contourSequences.push({
            roiNumber: referencedROINumber,
            metadata: metaData,
            roiColor: ROIDisplayColor,
            contourSequence: contourSequence,
        })
    }
    return contourSequences;
}

export async function buildCornerstoneContours(buffer: Uint8Array<ArrayBufferLike>) {
    const dataSet = dicomParser.parseDicom(buffer);
    const roiMetaData = buildROIMetaData(dataSet);
    if (!roiMetaData) {
        console.warn('Could not parse ROI metadata');
        return;
    }
    console.log('ROI Metadata: ', roiMetaData);

    const contourSets = parseROIContourSequence(dataSet, roiMetaData);
    if (!contourSets) {
        console.warn('Could not parse Contours');
        return;
    }
    console.log('Contour Sets: ', contourSets);

    const geometryIds: string[] = [];
    const promises = contourSets.map((contourSet, idx) => {
        const color = contourSet.roiColor;
        const contourData = contourSet.contourSequence.map((contour) => ({
            points: contour.points,
            type: contour.contourGeometricType as Enums.ContourType,
            color: color,
            segmentIndex: idx,
        }))

        const structSOPInstanceUID = dataSet.string(TAGS.SOPInstanceUID);
        const contourSetData = {
            id: contourSet.metadata.name!,
            data: contourData,
            frameOfReferenceUID: contourSet.metadata.referencedFrameOfReferenceUID!,
            color: contourSet.roiColor,
            segmentIndex: idx,
        }
        console.log(contourSetData);
        geometryIds.push(contourSetData.id);
        return geometryLoader.createAndCacheGeometry(contourSetData.id, {
            type: Enums.GeometryType.CONTOUR,
            geometryData: contourSetData,
            segmentIndex: idx,
        })
    })
    
    await Promise.all(promises);
    console.log(promises);
    console.log(geometryIds);
    return geometryIds;
}
