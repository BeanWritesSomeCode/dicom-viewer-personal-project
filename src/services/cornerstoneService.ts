import {
    init as coreInit,
    RenderingEngine,
    Enums,
    type Types,
} from '@cornerstonejs/core';
import { init as toolsInit } from '@cornerstonejs/tools';

const ENGINE_ID = 'EXAMPLE_RENDERING_ENGINE';

let renderingEngine: RenderingEngine | null = null;
let isInitialized = false;

// TODO: Add init options
async function initialize(): Promise<void> {
    if (isInitialized) return;

    await coreInit();
    await toolsInit();

    renderingEngine = new RenderingEngine(ENGINE_ID);
    isInitialized = true;
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

function destroy(): void {
    if (renderingEngine) {
        renderingEngine.destroy();
        renderingEngine = null;
    }
}

const cornerstoneService = {
    initialize,
    getRenderingEngine,
    enableViewport,
    disableViewport,
    destroy,
};
export default cornerstoneService;