import { Enums, CONSTANTS, type Types } from '@cornerstonejs/core';
import type { ViewportLayout } from '../types/types';

const viewportLayouts: Record<string, ViewportLayout> = {
    singleVolume: {
        gridTemplateAreas: `
        "v1 v1"
        "v1 v1"
        `,
        viewports: [
            {
                type: Enums.ViewportType.ORTHOGRAPHIC,
                viewportId: 'v1',
                defaultOptions: {
                    orientation: Enums.OrientationAxis.ACQUISITION
                }


            },
        ]
    },
    volumeBy3d: {
        gridTemplateAreas: `
        "v1 v2"
        "v1 v2"
        `,
        viewports: [
            {
                type: Enums.ViewportType.ORTHOGRAPHIC,
                viewportId: 'v1',
                defaultOptions: {
                    orientation: Enums.OrientationAxis.ACQUISITION,
                },
            },
            {
                type: Enums.ViewportType.VOLUME_3D,
                viewportId: 'v2',
                defaultOptions: {
                    orientation: Enums.OrientationAxis.CORONAL,
                    background: CONSTANTS.BACKGROUND_COLORS.slicer3D as Types.RGB,
                },
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
                type: Enums.ViewportType.ORTHOGRAPHIC,
                viewportId: 'v1',
                defaultOptions: {
                    orientation: Enums.OrientationAxis.ACQUISITION,
                }
            },
            {
                type: Enums.ViewportType.ORTHOGRAPHIC,
                viewportId: 'v2',
                defaultOptions: {
                    orientation: Enums.OrientationAxis.ACQUISITION
                }
            },
            {
                type: Enums.ViewportType.ORTHOGRAPHIC,
                viewportId: 'v3',
                defaultOptions: {
                    orientation: Enums.OrientationAxis.ACQUISITION
                }
            }
        ],
    }
}

export default viewportLayouts;
