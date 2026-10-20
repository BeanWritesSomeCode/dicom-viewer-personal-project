import { cache, Enums as coreEnums, type Types as coreTypes, utilities } from '@cornerstonejs/core';
import { segmentation, Enums as toolEnums, type Types as toolTypes } from '@cornerstonejs/tools';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';
import cornerstoneService from './cornerstoneService';
import { buildCornerstoneContours } from '../lib/parseRTSTRUCT';
import { useStudyStore, type SeriesMeta } from '../stores/studyStore';
import { useSegmentationStore } from '../stores/segmentationStore';

interface ViewportSegmentationDetail {
    active: boolean;
    segmentationId: string;
    segments: Record<string, SegmentDetail>;
}

interface SegmentDetail {
    label: string;
    visible: boolean;
    color: [number, number, number];
    outlineWidth: number;
    outlineOpacity: number;
    outlineDash: string;
    activeSegmentOutlineWidthDelta: number;
    renderOutline: boolean;
    renderFille: boolean;
    fillAlpha: number;
}

interface StyleSpecifier {
    viewportId?: string;
    segmentationId?: string;
    type: toolEnums.SegmentationRepresentations;
    segmentIndex?: number;
}

interface ContourStyle {
    renderFill?: boolean;
    renderOutline?: boolean;
    outlineWidth?: number;
    outlineOpacity?: number;
    outlineDash?: boolean;
    fillAlpha?: number;
}

interface setStyleProps {
    specifier: StyleSpecifier;
    style: ContourStyle;
}

export async function addFromRTStructSeries(series: SeriesMeta) {
    const segmentationId = `segmentation:${series.studyInstanceUID}`;
    if (segmentation.state.getSegmentation(segmentationId)) return;

    const imageId = series.imageIds[0];
    const fileIndex = parseInt(imageId.split(':')[1], 10);
    const file = cornerstoneDICOMImageLoader.wadouri.fileManager.get(fileIndex) as File;

    const buffer = new Uint8Array(await file.arrayBuffer());

    try {
        const result = await buildCornerstoneContours(buffer);
        if (!(result && result.geometryIds)) return;
        segmentation.addSegmentations([
            {
                segmentationId,
                representation: {
                    type: toolEnums.SegmentationRepresentations.Contour,
                    data: {
                        geometryIds: result.geometryIds
                    },
                },
                config: {
                    label: 'RTSTRUCT',
                    segments: result.segments,
                },
            },
        ]);
    } catch (err) {
        console.warn("Failed to load RTSTRUCT segmentation");
        console.error(err);
    }
}

export function getStyle(specifier: StyleSpecifier): ContourStyle {
    return segmentation.config.style.getStyle(specifier) as ContourStyle;
}

export function getSegmentStyle(viewportId: string, segmentationId: string, segmentIndex: number) {
    return segmentation.config.style.getStyle({
                viewportId,
                segmentationId,
                segmentIndex,
                type: toolEnums.SegmentationRepresentations.Contour
            });
}

export function getSegmentationSegments(segmentationId: string) {
    return segmentation.state.getSegmentation(segmentationId)?.segments;
}

export function setSegmentIndexStyle(viewportId: string, segmentationId: string, segmentIndex: number, newStyle: Partial<toolTypes.ContourStyle>) {
    try {
        segmentation.config.style.setStyle(
            {
                viewportId,
                segmentationId,
                segmentIndex,
                type: toolEnums.SegmentationRepresentations.Contour,
            },
            newStyle,
        );
        return true;
    } catch (err) {
        return false;
    }
}

export const getSegmentIndexColor = segmentation.config.color.getSegmentIndexColor;
export const setSegmentIndexColor = (viewportId: string, segmentationId: string, segmentIndex: number, color: coreTypes.Color) => {
    try {
        segmentation.config.color.setSegmentIndexColor(viewportId, segmentationId, segmentIndex, color);
        return true;
    } catch (err) {
        return false;
    }
};
export const getSegmentIndexVisibility = (viewportId: string, segmentationId: string, segmentIndex: number) => 
    segmentation.config.visibility.getSegmentIndexVisibility(
        viewportId,
        {
            segmentationId,
            type: toolEnums.SegmentationRepresentations.Contour
        },
        segmentIndex
    );
export const setSegmentIndexVisibility = (viewportId: string, segmentationId: string, segmentIndex: number, visibility: boolean) => {
    try {
        segmentation.config.visibility.setSegmentIndexVisibility(
            viewportId,
            {
                segmentationId,
                type: toolEnums.SegmentationRepresentations.Contour
            },
            segmentIndex,
            visibility
        );
        return true;
    } catch (err) {
        return false;
    }
};

const segmentationService = {
    addFromRTStructSeries,
    getStyle,
    getSegmentStyle,
    setSegmentIndexStyle,
    getSegmentationSegments,
    getSegmentIndexColor,
    setSegmentIndexColor,
    getSegmentIndexVisibility,
    setSegmentIndexVisibility
};

export default segmentationService;

// For console debug
window.segmentHelpers = {
    segmentation,
    store: useSegmentationStore.getState,
    getStyle,
    getSegmentStyle,
    getSegmentationSegments,
    getSegmentIndexColor,
    setSegmentIndexColor,
    getSegmentIndexVisibility,
    setSegmentIndexVisibility,
};