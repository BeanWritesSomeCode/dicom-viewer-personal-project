import type { CSSProperties } from 'react';
import { Enums, CONSTANTS, type Types } from '@cornerstonejs/core';

// interface ViewportLayout {
//     gridTemplateAreas: string;
//     viewports: ViewportLayoutItem[];
// }

// interface ViewportLayoutItem {
//     viewportType: Enums.ViewportType;
//     viewportOrientation: Enums.OrientationAxis = Enums.OrientationAxis.ACQUISITION;
//     viewportBackgroundColor?: number[];
// }

type ViewportProperties = Omit<Types.PublicViewportInput, 'element'>;

interface ViewportLayout {
    gridTemplateAreas: string;
    viewports: ViewportProperties[],
}

interface ImageSet {
    modality: string;
    seriesInstanceId: string;
    imageIds: string[];
}