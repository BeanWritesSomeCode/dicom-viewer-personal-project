import { useState, useRef } from 'react';
import type { MouseEvent, ChangeEvent, DragEvent } from 'react';
import { loadLocalDicomImages } from '../lib/loadLocalDicomImages';
import displayImages from '../lib/displayImages';


export default function ImportDicomButton() {
    const inputElementRef = useRef<HTMLInputElement | null>(null);

    const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files && files.length > 0) {

            const imageIds = await loadLocalDicomImages(Array.from(files));
            console.log('Loaded image IDs:', imageIds);

            displayImages(imageIds);
        }
    };

    const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        inputElementRef.current?.click();
    }

    return (
        <div>
            <button onClick={handleButtonClick}>
                Upload Files
            </button>
            <input
                ref={inputElementRef}
                type="file"
                accept=".dcm,.dicom"
                multiple
                onChange={handleInputChange}
                style={{ display: 'none' }}
            />

        </div>
    )
}
