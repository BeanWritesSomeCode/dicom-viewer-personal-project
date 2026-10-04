import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface SeriesMeta {
    seriesInstanceUID: string;
    studyInstanceUID: string;
    modality: string;
    description?: string;
    seriesNumber?: number;
    instanceCount: number;
    imageIds: string[];
}

export interface StudyMeta {
    studyInstanceUID: string;
    patientName?: string;
    patientId?: string;
    studyDate?: string;
    description?: string;
    seriesUIDs: string[];
}

export interface ParsedInstance {
    studyInstanceUID: string;
    seriesInstanceUID: string;
    modality: string;
    patientName?: string;
    patientId?: string;
    studyDate?: string;
    studyDescription?: string;
    seriesDescription?: string;
    seriesNumber?: number;
    imageId: string;
}

interface StudyState {
    studyUIDs: string[];
    studies: Record<string, StudyMeta>;
    series: Record<string, SeriesMeta>;
    selectedStudyUID: string | null;

    addInstances: (batch: ParsedInstance[]) => void;
    selectStudy: (uid: string | null) => void;
}

export const useStudyStore = create<StudyState>()(
    immer((set) => ({
        studyUIDs: [],
        studies: {},
        series: {},
        selectedStudyUID: null,

        addInstances: (batch) => 
            set((s) => {
                for (const inst of batch) {
                    let study = s.studies[inst.studyInstanceUID];
                    if (!study) {
                        s.studies[inst.studyInstanceUID] = study = {
                            studyInstanceUID: inst.studyInstanceUID,
                            patientName: inst.patientName,
                            patientId: inst.patientId,
                            studyDate: inst.studyDate,
                            description: inst.studyDescription,
                            seriesUIDs: [],
                        };
                        s.studyUIDs.push(inst.studyInstanceUID);
                    }

                    let series = s.series[inst.seriesInstanceUID];
                    if (!series) {
                        s.series[inst.seriesInstanceUID] = series = {
                            seriesInstanceUID: inst.seriesInstanceUID,
                            studyInstanceUID: inst.studyInstanceUID,
                            modality: inst.modality,
                            description: inst.seriesDescription,
                            seriesNumber: inst.seriesNumber,
                            imageIds: [],
                            instanceCount: 0,
                        };
                        study.seriesUIDs.push(inst.seriesInstanceUID);
                    }
                    series.instanceCount += 1;
                    series.imageIds.push(inst.imageId);
                }
            }),

        selectStudy: (uid) => set((s) => { s.selectedStudyUID = uid }),
    }))
)