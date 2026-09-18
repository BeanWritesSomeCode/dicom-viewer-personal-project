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

interface ViewportLayout {
    name: string;
    count: number;
    viewports: {
        id: string;
        orientation: Enums.OrientationAxis;
        type: Enums.ViewportType;
        background?: Types.RGB;
    }[],
    gridLayout: CSSProperties
}

interface ImageSet {
    modality: string;
    seriesInstanceId: string;
    imageIds: string[];
}