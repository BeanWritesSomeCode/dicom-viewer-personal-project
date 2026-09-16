import { Enums, CONSTANTS } from '@cornerstonejs/core';
import type { ViewportLayout, ViewportLayoutItem } from '../types/types';

const viewportLayouts = {
    singleVolume: {
        gridTemplateAreas: `
        "v1 v1"
        "v1 v1"
        `,
        viewports: [
            {
                viewportType: Enums.ViewportType.ORTHOGRAPHIC,
                viewportOrientation: Enums.OrientationAxis.ACQUISITION,
            }
        ]
    },
    volumeBy3d: {
        gridTemplateAreas: `
        "v1 v2"
        "v1 v2"
        `,
        viewports: [
            {
                viewportType: Enums.ViewportType.ORTHOGRAPHIC,
                viewportOrientation: Enums.OrientationAxis.ACQUISITION,
            },
            {
                viewportType: Enums.ViewportType.VOLUME_3D,
                viewportOrientation: Enums.OrientationAxis.CORONAL,
                viewportBackgroundColor: CONSTANTS.BACKGROUND_COLORS.slicer3D,
            }
        ]
    },
    volumeThreeAxis: {
        gridTemplateAreas: `
        "v1 v2"
        "v1 v3"
        `,
        viewports: [
            {
                viewportType: Enums.ViewportType.ORTHOGRAPHIC,
                viewportOrientation: Enums.OrientationAxis.ACQUISITION,
            },
            {
                viewportType: Enums.ViewportType.ORTHOGRAPHIC,
                viewportOrientation: Enums.OrientationAxis.ACQUISITION,
            },
            {
                viewportType: Enums.ViewportType.ORTHOGRAPHIC,
                viewportOrientation: Enums.OrientationAxis.ACQUISITION,
            }
        ],
    }
}

export default viewportLayouts;
