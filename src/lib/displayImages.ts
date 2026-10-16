import { volumeLoader, RenderingEngine, Enums, cache, setVolumesForViewports } from '@cornerstonejs/core';
import cornerstoneService from '../services/cornerstoneService';
import { useViewerStore } from '../stores/viewerStore';

export default async function displayImages(imageIds: string[]) {
    //const { renderingEngine } = useCornerstoneStore.getState();
    const renderingEngine = cornerstoneService.getRenderingEngine();

    if (!renderingEngine) return;

    const viewports = renderingEngine.getViewports();
    const stackViewportIds = viewports.filter((v) => {
        v.type === Enums.ViewportType.STACK
    }).map((v) => v.id);
    const volumeViewportIds = viewports.filter((v) => {
        v.type === Enums.ViewportType.ORTHOGRAPHIC || v.type === Enums.ViewportType.VOLUME_3D
    }).map((v) => v.id);


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

    console.log('set a volume for viewports: ', viewportIds);
}