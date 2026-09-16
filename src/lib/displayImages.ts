import { volumeLoader, RenderingEngine, Enums, cache, setVolumesForViewports } from '@cornerstonejs/core';
import useCornerstoneStore from '../stores/cornerstoneStore';
import viewportManager from './managers/viewportManager';


export default async function displayImages(imageIds: string[]) {
    const { renderingEngine } = useCornerstoneStore.getState();

    if (!renderingEngine) return;

    const stackViewportIds = viewportManager.getStackViewports()?.map(v => v.id);
    const volumeViewportIds = viewportManager.getVolumeViewports()?.map(v => v.id);

    loadImagesIntoStackViewports(imageIds, renderingEngine, stackViewportIds);
    loadImagesIntoVolumeViewports(imageIds, renderingEngine, volumeViewportIds);
}


async function loadImagesIntoStackViewports(imageIds: string[], renderingEngine: RenderingEngine, viewportIds: string[]) {
    if (viewportIds.length === 0) return;

    for (const viewportId of viewportIds) {
        const viewport = renderingEngine.getViewport(viewportId);
        if (viewport) {
            // @ts-ignore This method does indeed exist, but TypeScript doesn't see it.
            viewport.setStack(imageIds);
        }
    }
}

async function loadImagesIntoVolumeViewports(imageIds: string[], renderingEngine: RenderingEngine, viewportIds: string[]) {
    if (viewportIds.length === 0) return;

    const idx = cache.getVolumes().length + 1;
    const volumeId = `localImageVolume:${idx}`;

    await volumeLoader.createAndCacheVolumeFromImages(volumeId, imageIds);

    setVolumesForViewports(
        renderingEngine,
        [{ volumeId: volumeId }],
        viewportIds,
        true
    );
}