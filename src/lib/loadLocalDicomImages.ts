import { imageLoader, metaData, Enums } from '@cornerstonejs/core'
import dicomParser from 'dicom-parser';
import cornerstoneDicomImageLoader from '@cornerstonejs/dicom-image-loader';
import type { ImageSet } from '../types/types';


export async function loadLocalDicomImages(files: File[]): Promise<string[]> {
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

export async function loadLocalFiles(files: File[]) {
    const imageIds = files.map(f => cornerstoneDicomImageLoader.wadouri.fileManager.add(f));
    const seriesToRender = [];

    const extractedSeries = await groupImageIdsBySeriesUID(imageIds);
    for (const series of extractedSeries) {
        if (series.modality === 'CT') {
            for (const imageId of series.imageIds) {
                if (!metaData.get(Enums.MetadataModules.NATURALIZED, imageId)) {
                    await imageLoader.loadAndCacheImage(imageId);
                }
            }
            seriesToRender.push(series);
        }
    }

    return seriesToRender;
}

async function groupImageIdsByModality(imageIds: string[]) {
    const groups = new Map<string, string[]>();

    for (const imageId of imageIds) {
        const fileIndex = parseInt(imageId.slice(imageId.indexOf(':')+1));
        const file = cornerstoneDicomImageLoader.wadouri.fileManager.get(fileIndex);
        if (!file) continue;

        const buffer = await file.arrayBuffer();

        try {
            const dataSet = dicomParser.parseDicom(new Uint8Array(buffer));
            const modality = dataSet.string("x00080060");
            if (!modality) continue;

            if (groups.has(modality)) {
                groups.get(modality)!.push(imageId);
            } else {
                groups.set(modality, [imageId]);
            }
        } catch (err) {
            cornerstoneDicomImageLoader.wadouri.fileManager.remove(fileIndex);
        }
    }

    return groups;
}

async function groupImageIdsBySeriesUID(imageIds: string[]) {
    const groups = new Map<string, ImageSet>();

    for (const imageId of imageIds) {
        const fileIndex = parseInt(imageId.slice(imageId.indexOf(':')+1));
        const file = cornerstoneDicomImageLoader.wadouri.fileManager.get(fileIndex);
        if (!file) continue;

        const buffer = await file.arrayBuffer();

        try {
            const dataSet = dicomParser.parseDicom(new Uint8Array(buffer));
            const modality = dataSet.string("x00080060");
            const seriesInstanceUID = dataSet.string('x0020000e');
            if (!seriesInstanceUID) continue;

            if (groups.has(seriesInstanceUID)) {
                groups.get(seriesInstanceUID)!.imageIds.push(imageId);
            } else {
                groups.set(seriesInstanceUID, {
                    seriesInstanceId: seriesInstanceUID,
                    modality: modality ?? 'unknown',
                    imageIds: [imageId]
                });
            }
        } catch (err) {
            cornerstoneDicomImageLoader.wadouri.fileManager.remove(fileIndex);
        }
    }

    return Array.from(groups.values());
}