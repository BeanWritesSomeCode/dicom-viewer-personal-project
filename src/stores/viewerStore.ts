import { create } from 'zustand';
import type { Types as coreTypes } from '@cornerstonejs/core';
import type { Types as toolTypes } from '@cornerstonejs/tools';

/**
 * Change segment color -> SEG REP MODIFIED EVT
 * 
 */

interface ViewerStoreState {
    viewports: string[];
    activeViewport: string | null;
}


export const useViewerStore = create<ViewerStoreState>(() => ({
    viewports: [],
    activeViewport: null,
}));