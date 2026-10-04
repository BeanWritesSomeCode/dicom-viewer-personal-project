import dicomParser from 'dicom-parser';
import { 
    imageLoader, 
    volumeLoader, 
    metaData, 
    Enums, 
    cache, 
    setVolumesForViewports 
} from '@cornerstonejs/core';
import { segmentation, Enums as toolEnums } from '@cornerstonejs/tools';
import cornerstoneDicomImageLoader from '@cornerstonejs/dicom-image-loader';
import { useStudyStore, type ParsedInstance, type SeriesMeta } from '../stores/studyStore';
import cornerstoneService from './cornerstoneService';
import { buildCornerstoneContours } from '../lib/parseRTSTRUCT';

const IMAGE_MODALITIES = ['CT'];

export async function loadFiles(files: File[]): Promise<void> {
    const parsed = [];

    for (const file of files) {
        const buff = new Uint8Array(await file.arrayBuffer());

        try {
            const dataSet = dicomParser.parseDicom(buff, { 
                untilTag: 'x7fe0010'
            });

            const imageId = cornerstoneDicomImageLoader.wadouri.fileManager.add(file);

            const studyInstanceUID = dataSet.string('x0020000d');
            const seriesInstanceUID = dataSet.string('x0020000e');
            const modality = dataSet.string('x00080060');

            if (!studyInstanceUID || !seriesInstanceUID || !modality) {
                const fileIndex = parseInt(imageId.split(':')[1], 10);
                cornerstoneDicomImageLoader.wadouri.fileManager.remove(fileIndex);
                continue;
            }

            const instanceMeta: ParsedInstance = {
                studyInstanceUID,
                seriesInstanceUID,
                modality,
                patientName: dataSet.string('x00100010'),
                studyDate: dataSet.string('x00080020'),
                studyDescription: dataSet.string('x00081030'),
                seriesDescription: dataSet.string('x0008103e'),
                seriesNumber: dataSet.int32('x00200011'),
                imageId,
            };

            parsed.push(instanceMeta);
        } catch (err) {
            continue;
        }
    }
    useStudyStore.getState().addInstances(parsed);
}

export async function loadCurrentStudy() {
    const studyUID = useStudyStore.getState().selectedStudyUID;
    if (studyUID == null) return;

    const study = useStudyStore.getState().studies[studyUID];
    if (!study) return;

    for (const seriesUID of study.seriesUIDs) {
        const series = useStudyStore.getState().series[seriesUID];
        if (!series) continue;

        if (IMAGE_MODALITIES.includes(series.modality)) {
            await loadImageSeries(series);
        }
        else if (series.modality === "RTSTRUCT") {
            await loadRTStructSeries(series);
        }

    }
    console.log("done loading files");
}

export async function displayActiveViewports() {
    const renderingEngine = cornerstoneService.getRenderingEngine();
    
    const viewports = renderingEngine.getViewports();
    const volumeIds = cache.getVolumes().map(v => v.volumeId);
    const segmentations = segmentation.state.getSegmentations();

    console.log('Setting display:');
    console.log(viewports.map(v => v.id));
    console.log(volumeIds);

    await setVolumesForViewports(renderingEngine,
        volumeIds.map(v => ({ volumeId: v })),
        viewports.map(v => v.id),
        true
    );

    segmentations.forEach(s => {
        viewports.forEach(v => {
        if (v.defaultOptions.orientation == Enums.OrientationAxis.ACQUISITION) {
            segmentation.addContourRepresentationToViewport(v.id, 
                [{ segmentationId: s.segmentationId }]
            );
        }});
    });
}

async function loadImageSeries(series: SeriesMeta) {
    const imageIds = series.imageIds;
    for (const imageId of imageIds) {
        if (!metaData.get(Enums.MetadataModules.NATURALIZED, imageId)) {
            await imageLoader.loadAndCacheImage(imageId);
        }
    }

    const volumeId = `localImageVolume:${series.seriesInstanceUID}`;
    if (!cache.getVolume(volumeId)) {
        await volumeLoader.createAndCacheVolumeFromImages(volumeId, imageIds);
    }
}

async function loadRTStructSeries(series: SeriesMeta) {
    const segmentationId = `segmentation:${series.studyInstanceUID}`;
    if (segmentation.state.getSegmentation(segmentationId)) {
        return;
    }

    const imageId = series.imageIds[0];
    const fileIndex = parseInt(imageId.split(':')[1], 10);
    const file = cornerstoneDicomImageLoader.wadouri.fileManager.get(fileIndex) as File;

    const buffer = new Uint8Array(await file.arrayBuffer());

    try {
        const geometryIds = await buildCornerstoneContours(buffer);
        segmentation.addSegmentations([
            {
                segmentationId,
                representation: {
                    type: toolEnums.SegmentationRepresentations.Contour,
                    data: {
                        geometryIds
                    },
                },
            },
        ]);
    } catch (err) {
        console.warn("Failed to load RTSTRUCT segmentation");
    }
}