import { create } from 'zustand';
import { init as cornerstoneInit } from '@cornerstonejs/core';
import { init as cornerstoneToolsInit } from '@cornerstonejs/tools';
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader';
import { registerDefaultProviders } from '@cornerstonejs/metadata';
import { RenderingEngine, volumeLoader, cornerstoneStreamingImageVolumeLoader } from '@cornerstonejs/core';
import type { Types } from '@cornerstonejs/core';

interface CornerstoneStoreState {
    isInitialized: boolean;
    renderingEngine: RenderingEngine | null;
    renderingEngineId: "FunnyName";
    viewportInputs: Types.PublicViewportInput[];
    addViewport: (viewportId: Types.PublicViewportInput) => void;
    removeViewport: (viewportId: string) => void;
    initialize: () => void;
    destroy: () => void;
}

const useCornerstoneStore = create<CornerstoneStoreState>((set, get) => ({
    isInitialized: false,
    renderingEngine: null,
    renderingEngineId: "FunnyName",
    viewportInputs: [],

    initialize: async () => {
        if (get().isInitialized) return;

        volumeLoader.registerUnknownVolumeLoader(
        // @ts-ignore This can be saefely ignored because the type is correct, but the typescript compiler doesn't know that.
        cornerstoneStreamingImageVolumeLoader
        );

        await cornerstoneInit();
        await cornerstoneToolsInit();
        dicomImageLoaderInit({ maxWebWorkers: 1 });
        registerDefaultProviders();

        const renderingEngine = new RenderingEngine(get().renderingEngineId);

        set({ 
            isInitialized: true,
            renderingEngine: renderingEngine
        });
    },

    destroy: () => {
        const renderingEngine = get().renderingEngine;
        if (renderingEngine) {
            renderingEngine.destroy();
            set({ renderingEngine: null, isInitialized: false });
        }
    },

    addViewport: (viewportId: Types.PublicViewportInput) => {
        const viewportIds = get().viewportInputs;
        if (!viewportIds.includes(viewportId)) {
            set({ viewportInputs: [...viewportIds, viewportId] });
        }
    },

    removeViewport: (viewportId: string) => {
        const viewportInputs = get().viewportInputs;
        if (viewportInputs.find(input => input.viewportId === viewportId)) {
            set({ viewportInputs: viewportInputs.filter(input => input.viewportId !== viewportId) });
        }
    }

}));

export default useCornerstoneStore;