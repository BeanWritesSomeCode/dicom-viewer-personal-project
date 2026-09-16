import { init as cornerstoneInit } from '@cornerstonejs/core';
import { init as cornerstoneToolsInit } from '@cornerstonejs/tools';
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader';
import { volumeLoader, cornerstoneStreamingImageVolumeLoader } from '@cornerstonejs/core';

let cornerstoneInitialized = false;

export default async function initCornerstone() {
    if (cornerstoneInitialized) {
        return;
    }

    volumeLoader.registerUnknownVolumeLoader(
        // @ts-ignore This can be saefely ignored because the type is correct, but the typescript compiler doesn't know that.
        cornerstoneStreamingImageVolumeLoader
    );

    await cornerstoneInit();
    await cornerstoneToolsInit();
    dicomImageLoaderInit({ maxWebWorkers: 1 });

    cornerstoneInitialized = true;
}
