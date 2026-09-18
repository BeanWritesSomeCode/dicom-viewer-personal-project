import { Enums, type Types } from '@cornerstonejs/core';
import type { ViewportLayout } from '../../types/types';
import useCornerstoneStore from '../../stores/cornerstoneStore';


function addViewport(viewportInput: Types.PublicViewportInput): void {
    const renderingEngine = useCornerstoneStore.getState().renderingEngine;
    if (!renderingEngine) return;

    const viewportIds = renderingEngine.getViewports().map(v => v.id);
    const viewportId = viewportInput.viewportId;
    if (viewportIds.includes(viewportId)) return;

    renderingEngine.enableElement(viewportInput);
}

function removeViewport(viewportId: string): void {
    const renderingEngine = useCornerstoneStore.getState().renderingEngine;
    if (!renderingEngine) return;

    const viewportIds = renderingEngine.getViewports().map(v => v.id);
    
    if (viewportIds.includes(viewportId)) {
        renderingEngine.disableElement(viewportId);
    }
}

function resizeViewports(): void {
    const renderingEngine = useCornerstoneStore.getState().renderingEngine;
    if (!renderingEngine) return;

    renderingEngine.resize();
}

function enableLayout(layout: ViewportLayout, elements: Map<string, HTMLDivElement>) {
    for (const v of layout.viewports) {
        if (!elements.get(v.id)) return;
        const viewportInput = {
            viewportId: v.id,
            type: v.type,
            element: elements.get(v.id)!,
            defaultOptions: {
                orientation: v.orientation,
                background: v.background,
            },
        }
        addViewport(viewportInput)
    }
}

function getViewports() {
    return useCornerstoneStore.getState().renderingEngine?.getViewports() || [];
}

function getVolumeViewports() {
    const viewports = getViewports();
    return viewports.filter(v => v.type === Enums.ViewportType.ORTHOGRAPHIC || v.type === Enums.ViewportType.VOLUME_3D);
}

function getStackViewports() {
    const viewports = getViewports();
    return viewports.filter(v => v.type === Enums.ViewportType.STACK);
}

function getViewportIds() {
    return getViewports().map(v => v.id);
}

function getViewport(viewportId: string) {
    return useCornerstoneStore.getState().renderingEngine?.getViewport(viewportId);
} 

const viewportManager = {
    addViewport,
    removeViewport,
    resizeViewports,
    enableLayout,
    getViewports,
    getVolumeViewports,
    getStackViewports,
    getViewportIds,
    getViewport
};
export default viewportManager;
