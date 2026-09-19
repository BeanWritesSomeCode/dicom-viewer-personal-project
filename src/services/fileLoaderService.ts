import { imageLoader, metaData, Enums } from '@cornerstonejs/core';
import cornerstoneDicomImageLoader from '@cornerstonejs/dicom-image-loader';
import dicomParser from 'dicom-parser';

interface SeriesGroup {
    seriesInstanceUID: string;
    modality: string;
    imageIds: string[];
}

const cacheFile = cornerstoneDicomImageLoader.wadouri.fileManager.add;

function getFile(index: number) {
    return cornerstoneDicomImageLoader.wadouri.fileManager.get(index) as File;
}

async function getDicomP10Dataset(file: Blob) {
    const buffer = await file.arrayBuffer();

    try {
        return dicomParser.parseDicom(new Uint8Array(buffer));
    } catch (err) {
        // Not handled in this function
    }
}

function getImageIdFile(imageId: string) {
    const seperatorIndex = imageId.indexOf(':');
    if (!(seperatorIndex+1)) return;

    const fileIndex = parseInt(imageId.slice(seperatorIndex+1));
    return getFile(fileIndex);
}

async function loadLocalFiles(files: FileList) {
    const imageIds = Array.from(files).map((file) => cacheFile(file));

    const loadedImageIds = [];
    const nonloadedImageIds = [];
    for (const imageId of imageIds) {
        if (!metaData.get(Enums.MetadataModules.NATURALIZED, imageId)) {
            try {
                await imageLoader.loadAndCacheImage(imageId);
                loadedImageIds.push(imageId);
            } catch { 
                nonloadedImageIds.push(imageId);
            }
        }
    }

    const loadedSeries = groupImageIdsBySeries(loadedImageIds);

    // Future
    // Choose which series to render (user or programatic)
    // Load RTSTRUCTS and other modalities.
}

function groupImageIdsBySeries(imageIds: string[]) {
    const groups = new Map<string, SeriesGroup>();

    imageIds.forEach((imageId) => {
        const seriesModule = metaData.getTyped(Enums.MetadataModules.GENERAL_SERIES, imageId);
        if (seriesModule) {
            const { modality, seriesInstanceUID } = seriesModule;
            const group = groups.get(seriesInstanceUID);
            if (group) {
                group.imageIds.push(imageId);
            } else {
                groups.set(
                    seriesInstanceUID, 
                    {
                        seriesInstanceUID,
                        modality,
                        imageIds: [imageId]
                    }
                );
            }
        }
    });
    return Array.from(groups.values());
}

const fileLoaderService = {

};
export default fileLoaderService;