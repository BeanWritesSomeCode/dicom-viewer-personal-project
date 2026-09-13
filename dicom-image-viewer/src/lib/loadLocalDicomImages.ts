import { imageLoader, metaData, Enums } from '@cornerstonejs/core'
import cornerstoneDicomImageLoader from '@cornerstonejs/dicom-image-loader';


export async function loadLocalDicomImages(files: File[]): Promise<string[]> {
    const imageIds: string[] = [];
    const imageIdPromises: Promise<string>[] = [];

    files.forEach((file) => imageIdPromises.push(loadLocalDicomImage(file)));

    return Promise.all(imageIdPromises);
}

export async function loadLocalDicomImage(file: File): Promise<string> {
    const imageId = cornerstoneDicomImageLoader.wadouri.fileManager.add(file);

    console.log(`loading imageId: ${imageId}`);
    if (!metaData.get(Enums.MetadataModules.NATURALIZED, imageId)) {
        await imageLoader.loadAndCacheImage(imageId);
    }

    return imageId;
}

export function purgeFileCache() {
    cornerstoneDicomImageLoader.wadouri.fileManager.purge();
}