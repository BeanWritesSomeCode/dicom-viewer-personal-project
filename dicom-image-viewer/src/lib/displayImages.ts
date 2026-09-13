import { volumeLoader, RenderingEngine, Enums, cache, setVolumesForViewports } from '@cornerstonejs/core';
import useCornerstoneStore from '../stores/cornerstoneStore';


export default async function displayImages(imageIds: string[]) {
    const { renderingEngine, viewportInputs } = useCornerstoneStore.getState();

    if (!renderingEngine) return;

    const stackViewportIds = viewportInputs.filter(input => input.type === Enums.ViewportType.STACK).map(input => input.viewportId);
    const volumeViewportIds = viewportInputs.filter(
        input => input.type === Enums.ViewportType.ORTHOGRAPHIC || input.type === Enums.ViewportType.VOLUME_3D
    ).map(input => input.viewportId);

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