import type { CSSProperties } from 'react';
import type { ViewportLayout } from '../types/types';
import { Enums, CONSTANTS, Viewport } from '@cornerstonejs/core';
import { orientation } from '@cornerstonejs/tools/utilities';

export const baseLayout: CSSProperties = {
    position: 'relative',
    display: 'grid',
    width: '100%',
    height: '100%',
    gap: '4px',
}

export const viewportLayouts: Record<string, ViewportLayout> = {
    'single': {
        name: 'single',
        count: 1,
        viewports: [
            { 
                id: 'viewport1',
                orientation: Enums.OrientationAxis.ACQUISITION,
                type: Enums.ViewportType.ORTHOGRAPHIC,
            },
        ],
        gridLayout: {
            ...baseLayout,
            gridTemplateRows: '1fr 1fr',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateAreas: `
                "viewport1 viewport1"
                "viewport1 viewport1"
            `
        }
    },

    'mpr': {
        name: 'mpr',
        count: 3,
        viewports: [
            {
                id: 'viewport1',
                orientation: Enums.OrientationAxis.AXIAL,
                type: Enums.ViewportType.ORTHOGRAPHIC,
            },
            {
                id: 'viewport2',
                orientation: Enums.OrientationAxis.SAGITTAL,
                type: Enums.ViewportType.ORTHOGRAPHIC,
            },
            {
                id: 'viewport3',
                orientation: Enums.OrientationAxis.CORONAL,
                type: Enums.ViewportType.ORTHOGRAPHIC,
            },
        ],
        gridLayout: {
            ...baseLayout,
            gridTemplateRows: '1fr',
            gridTemplateColumns: '1fr 1fr 1fr',
            gridTemplateAreas: `
                "viewport1 viewport2 viewport3"
            `
        }
    },

    'one-by-three': {
        name: 'one-by-three',
        count: 4,
        viewports: [
            {
                id: 'viewport1',
                orientation: Enums.OrientationAxis.CORONAL,
                type: Enums.ViewportType.VOLUME_3D,
                background: CONSTANTS.BACKGROUND_COLORS.slicer3D,
            },
            {
                id: 'viewport2',
                orientation: Enums.OrientationAxis.AXIAL,
                type: Enums.ViewportType.ORTHOGRAPHIC,
            },
            {
                id: 'viewport3',
                orientation: Enums.OrientationAxis.SAGITTAL,
                type: Enums.ViewportType.ORTHOGRAPHIC,
            },
            {
                id: 'viewport4',
                orientation: Enums.OrientationAxis.CORONAL,
                type: Enums.ViewportType.ORTHOGRAPHIC,
            },
        ],
        gridLayout: {
            ...baseLayout,
            gridTemplateRows: '1fr 1fr',
            gridTemplateColumns: '1fr 1fr 1fr',
            gridTemplateAreas: `
                "viewport1 viewport1 viewport1"
                "viewport2 viewport3 viewport4"
            `
        }
    }
};