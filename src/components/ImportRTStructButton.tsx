import { useRef } from 'react';
import type { MouseEvent, ChangeEvent } from 'react';
import { loadRTStructFile } from '../lib/loadLocalDicomImages';
import cornerstoneService from '../services/cornerstoneService';


export default function ImportRTStructButton() {
    const inputElementRef = useRef<HTMLInputElement | null>(null);

    const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files && files.length > 0) {
            const segmentationId = await loadRTStructFile(files[0]);

            const renderingEngine = cornerstoneService.getRenderingEngine();
            const viewportIds = 
        }
    };
}
