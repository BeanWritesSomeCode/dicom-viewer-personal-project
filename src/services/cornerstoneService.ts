import {
    init as coreInit,
    RenderingEngine,
    volumeLoader,
    cornerstoneStreamingImageVolumeLoader,
    Enums,
    type Types,
} from '@cornerstonejs/core';
import { init as toolsInit, segmentation } from '@cornerstonejs/tools';
import { init as imageLoaderInit } from '@cornerstonejs/dicom-image-loader';
import { registerDefaultProviders } from '@cornerstonejs/metadata';

const ENGINE_ID = 'EXAMPLE_RENDERING_ENGINE';

let renderingEngine: RenderingEngine | null = null;
let isInitialized = false;

// TODO: Add init options
async function initialize(): Promise<void> {
    if (isInitialized) return;

    volumeLoader.registerUnknownVolumeLoader(
        cornerstoneStreamingImageVolumeLoader
    );

    await coreInit();
    await toolsInit();
    imageLoaderInit({ maxWebWorkers: 1 });
    registerDefaultProviders();

    console.log("Creating rendering engine");
    renderingEngine = new RenderingEngine(ENGINE_ID);
    console.log("Rendering engine created");
    isInitialized = true;
    console.log('Initialized');
}

function getRenderingEngine(): RenderingEngine {
    if (!renderingEngine) {
        throw new Error('Rendering engine is not ready!')
    }

    return renderingEngine;
}

/**
 * Enables a new viewport, either args or viewportInput must be specified
 * @param args An object containing the element, id, and type for the viewport
 * @param viewportInput A full Cornerstone PublicViewportInput object for more fine-grained control
 */
function enableViewport(viewportInput: Types.PublicViewportInput): void {
    if (!renderingEngine) {
        console.warn("Attempting to enable a viewport without a RenderingEngine");
        return;
    }

    renderingEngine.enableElement(viewportInput);
}

function disableViewport(viewportId: string): void {
    if (renderingEngine) {
        renderingEngine.disableElement(viewportId);
    }
}

function getStackViewports(): Types.IViewport[] {
    if (!renderingEngine) return [];

    const viewports = renderingEngine.getViewports();
    return viewports.filter(viewport => {
       return viewport.type === Enums.ViewportType.STACK
    });
}

function getVolumeViewports(): Types.IViewport[] {
    if (!renderingEngine) return [];

    const viewports = renderingEngine.getViewports();
    return viewports.filter(viewport => {
        return viewport.type === Enums.ViewportType.ORTHOGRAPHIC
    })
}

function destroy(): void {
    if (renderingEngine) {
        console.log('Destroying rendering engine');
        renderingEngine.destroy();
        renderingEngine = null;
    }
}

const cornerstoneService = {
    initialize,
    getRenderingEngine,
    enableViewport,
    disableViewport,
    getViewports: () => {return renderingEngine?.getViewports()},
    getStackViewports,
    getVolumeViewports,
    destroy,
};
export default cornerstoneService;