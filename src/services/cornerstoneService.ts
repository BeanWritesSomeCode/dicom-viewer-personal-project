import {
    init as coreInit,
    RenderingEngine,
    volumeLoader,
    cornerstoneStreamingImageVolumeLoader,
    eventTarget,
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
import { useViewerStore } from '../stores/viewerStore';
import { useSegmentationStore } from '../stores/segmentationStore';

type CornerstoneCoreEvent =  keyof typeof coreEnums.Events;
type CornerstoneToolsEvent = keyof typeof toolEnums.Events;

type EventType = CornerstoneCoreEvent | CornerstoneToolsEvent;

const ENGINE_ID = 'EXAMPLE_RENDERING_ENGINE';
const TOOL_GROUP_2D_ID = 'TOOL_GROUP_2D';
const TOOL_GROUP_3D_ID = 'TOOL_GROUP_3D';

let toolGroup2D: toolTypes.IToolGroup | undefined = undefined;
let toolGroup3D: toolTypes.IToolGroup | undefined = undefined;
let renderingEngine: RenderingEngine | null = null;
let isInitialized = false;

const listeners: (() => void)[] = [];
const on = (evt: EventType, callback: (evt: any) => void) => {
    eventTarget.addEventListener(evt, callback);
    listeners.push(() => eventTarget.removeEventListener(evt, callback));
}

async function initialize(): Promise<void> {
    if (isInitialized) return;

    volumeLoader.registerUnknownVolumeLoader(
        cornerstoneStreamingImageVolumeLoader as any as coreTypes.VolumeLoaderFn
    );

    await coreInit();
    await toolsInit();
    imageLoaderInit({ maxWebWorkers: 1 });
    registerDefaultProviders();

    on(coreEnums.Events.ELEMENT_ENABLED, syncViewports);
    on(coreEnums.Events.ELEMENT_DISABLED, syncViewports);
    on(toolEnums.Events.SEGMENTATION_DATA_MODIFIED, (evt) => {console.log('SEG DATA MODIFIED EVT', evt)});
    on(toolEnums.Events.SEGMENTATION_MODIFIED, (evt) => {console.log('SEG MODIFIED EVT', evt)});
    on(toolEnums.Events.SEGMENTATION_REPRESENTATION_ADDED, (evt) => {console.log('REP ADDED', evt)});
    on(toolEnums.Events.SEGMENTATION_REPRESENTATION_MODIFIED, (evt) => {console.log('REP MODIFIED', evt)});

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
    segmentation.state.destroy();
    useSegmentationStore.setState({ segmentations: {}});
    for (const l of listeners) {
        l();
    }
    isInitialized = false;
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

function syncViewports(evt: coreTypes.EventTypes.ElementEnabledEventDetail) {
    const viewportIds = getRenderingEngine().getViewports().map((v) => v.id);
    useViewerStore.setState({ viewports: viewportIds });
}

function syncSegmentations1(evt: toolTypes.EventTypes.SegmentationAddedEventDetail) {
    const activeViewport = useViewerStore.getState().activeViewport;
    const segs = segmentation.state.getSegmentations().map(seg => {
        const indices = Object.keys(seg.segments).map(Number);
        return {
            id: seg.segmentationId,
            label: seg.label,
            segments: indices.map(i => ({
                segmentIndex: i,
                label: seg.segments[i].label,
                color: segmentation.config.color.getSegmentIndexColor(activeViewport ?? 'v1', seg.segmentationId, i),
                visible: segmentation.config.visibility.getSegmentIndexVisibility(activeViewport ?? 'v1', { segmentationId: seg.segmentationId, type: toolEnums.SegmentationRepresentations.Contour}, i),
                active: segmentation.segmentIndex.getActiveSegmentIndex(seg.segmentationId) === i,
                locked: segmentation.segmentLocking.isSegmentIndexLocked(seg.segmentationId, i),
            }))
        }
    });
    //useViewerStore.setState({ segmentations: segs });
}

const cornerstoneService = {
    initialize,
    destroy,
    getRenderingEngine,
    viewports: {
        enableViewport,
        disableViewport,
    },
    segmentation: {
        setSegmentVisibility: segmentation.config.visibility.setSegmentIndexVisibility,
        setSegmentColor: segmentation.config.color.setSegmentIndexColor,
        setStyle: segmentation.config.style.setStyle,
    }
};
export default cornerstoneService;