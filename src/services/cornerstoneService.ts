import {
    init as coreInit,
    RenderingEngine,
    volumeLoader,
    cornerstoneStreamingImageVolumeLoader,
    Enums as coreEnums,
    type Types as coreTypes,
} from '@cornerstonejs/core';
import { 
    init as toolsInit, 
    ToolGroupManager,
    segmentation,
    Enums as toolEnums,
    type Types as toolTypes,
} from '@cornerstonejs/tools';
import * as csTools from '@cornerstonejs/tools';
import { StackScrollTool } from '@cornerstonejs/tools';
import { init as imageLoaderInit } from '@cornerstonejs/dicom-image-loader';
import { registerDefaultProviders } from '@cornerstonejs/metadata';
import { viewport } from '@cornerstonejs/tools/utilities';

const ENGINE_ID = 'EXAMPLE_RENDERING_ENGINE';
const TOOL_GROUP_2D_ID = 'TOOL_GROUP_2D';
const TOOL_GROUP_3D_ID = 'TOOL_GROUP_3D';

let toolGroup2D: toolTypes.IToolGroup | undefined = undefined;
let toolGroup3D: toolTypes.IToolGroup | undefined = undefined;
let renderingEngine: RenderingEngine | null = null;
let isInitialized = false;

// TODO: Add init options
async function initialize(): Promise<void> {
    if (isInitialized) return;

    volumeLoader.registerUnknownVolumeLoader(
        cornerstoneStreamingImageVolumeLoader as any as coreTypes.VolumeLoaderFn
    );

    await coreInit();
    await toolsInit();
    imageLoaderInit({ maxWebWorkers: 1 });
    registerDefaultProviders();

    csTools.addTool(StackScrollTool);

    toolGroup2D = ToolGroupManager.createToolGroup(TOOL_GROUP_2D_ID);
    toolGroup3D = ToolGroupManager.createToolGroup(TOOL_GROUP_3D_ID);

    if (toolGroup2D) {
        console.log('Toolgroup2D exists');
        toolGroup2D.addTool(StackScrollTool.toolName);
        toolGroup2D.setToolActive(StackScrollTool.toolName, {
            bindings: [{mouseButton: toolEnums.MouseBindings.Primary}]
        });
    }

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

function destroy(): void {
    if (renderingEngine) {
        console.log('Destroying rendering engine');
        renderingEngine.destroy();
        renderingEngine = null;
    }
    ToolGroupManager.destroy();
}

// ====================================
// Viewports
// ====================================

/**
 * Enables a new viewport, either args or viewportInput must be specified
 * @param args An object containing the element, id, and type for the viewport
 * @param viewportInput A full Cornerstone PublicViewportInput object for more fine-grained control
 */
function enableViewport(viewportInput: coreTypes.PublicViewportInput): void {
    if (!renderingEngine) {
        console.warn("Attempting to enable a viewport without a RenderingEngine");
        return;
    }

    renderingEngine.enableElement(viewportInput);
    if (viewportInput.type === coreEnums.ViewportType.VOLUME_3D && toolGroup3D) {
        toolGroup3D.addViewport(viewportInput.viewportId);
    } else if (toolGroup2D) {
        console.log(`Adding viewport: ${viewportInput.viewportId} to toolGroup2D`);
        console.log(toolGroup2D);
        toolGroup2D.addViewport(viewportInput.viewportId);
    }
}

function disableViewport(viewportId: string): void {
    if (renderingEngine) {
        const viewport = renderingEngine.getViewport(viewportId);
        if (viewport.type === coreEnums.ViewportType.VOLUME_3D && toolGroup3D) {
            toolGroup3D.removeViewports(renderingEngine.id, viewport.id);
        } else if (toolGroup2D) {
            toolGroup2D.removeViewports(renderingEngine.id, viewport.id);
        }

        renderingEngine.disableElement(viewportId);
    }
}

function getStackViewports(): coreTypes.IViewport[] {
    if (!renderingEngine) return [];

    const viewports = renderingEngine.getViewports();
    return viewports.filter(viewport => {
       return viewport.type === coreEnums.ViewportType.STACK
    });
}

function getVolumeViewports(): coreTypes.IViewport[] {
    if (!renderingEngine) return [];

    const viewports = renderingEngine.getViewports();
    return viewports.filter(viewport => {
        return viewport.type === coreEnums.ViewportType.ORTHOGRAPHIC
    })
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