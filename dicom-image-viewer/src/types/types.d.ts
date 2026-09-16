import { Enums, CONSTANTS, type Types } from '@cornerstonejs/core';

interface ViewportLayout {
    gridTemplateAreas: string;
    viewports: ViewportLayoutItem[];
}

interface ViewportLayoutItem {
    viewportType: Enums.ViewportType;
    viewportOrientation: Enums.OrientationAxis = Enums.OrientationAxis.ACQUISITION;
    viewportBackgroundColor?: number[];
}

interface ImageSet {
    modality: string;
    seriesInstanceId: string;
    imageIds: string[];
}