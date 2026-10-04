import { memo, useState, useRef, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useStudyStore } from '../stores/studyStore';
import { loadFiles } from '../services/fileLoaderService';

// Show list of studies from PACS in future
// For now allow uploading files, group files by study, series, modality
// Choose one, put in a store, and consume in MainPage.tsx

export default function StudyBrowser() {
    const studyUIDs = useStudyStore((s) => s.studyUIDs);
    const inputElementRef = useRef<HTMLInputElement | null>(null);

    const handleUploadFiles = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files && files.length > 0) {
            await loadFiles(Array.from(files));
        }
    };

    return (
        <>
            <div>
                <button
                    onClick={() => inputElementRef.current?.click()}
                >
                    Upload Files
                </button>
                <input
                    ref={inputElementRef}
                    type="file"
                    accept=".dcm,.dicom"
                    multiple
                    onChange={handleUploadFiles}
                    style={{position: 'absolute', display: 'none'}}
                />
            </div>
            <ul>
                {studyUIDs.map((uid) => <StudyRow key={uid} uid={uid} />)}
            </ul>
        </>
    );
}

const StudyRow = memo(function StudyRow({ uid }: { uid: string }) {
    const study = useStudyStore((s) => s.studies[uid]);
    const selectStudy = useStudyStore.getState().selectStudy;
    const navigate = useNavigate();

    const handleSelect = async () => {
        selectStudy(uid);
        navigate('/viewer');
    }

    const modalities = useStudyStore(
        useShallow((s) => 
        [...new Set(study.seriesUIDs.map((id) => s.series[id].modality))].sort()
        )
    );

    return (
        <li
            onClick={handleSelect}
        >
            <span>{study.patientName}</span>
            <span>{study.description}</span>
            <span>{study.studyDate}</span>
            <span>{modalities.join(', ')}</span>
            <span>{study.seriesUIDs.length} series</span>
        </li>
    );
});