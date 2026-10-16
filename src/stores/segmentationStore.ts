import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Types as coreTypes } from '@cornerstonejs/core';
import { segmentation, type Types as toolTypes, Enums as toolEnums } from '@cornerstonejs/tools';
import { useViewerStore } from './viewerStore';

interface Segmentation {
    segmentationId: string;
    label: string;
    segmentOrder?: number[];
    segments: Record<number, Segment>;
}

// Properties not reflected in Cornerstone segmentation state are synced with activeViewport
interface Segment {
    segmentIndex: number;
    active: boolean;
    label: string;
    locked: boolean;
    //color: coreTypes.Color;
    //visible: boolean;
}

interface SegmentationState {
    segmentations: Record<string, Segmentation>;
}

interface SegmentationActions {
    syncSegmentations: () => void;
    syncSegments: (segmentationId: string) => void;
}

export const useSegmentationStore = create<SegmentationState & SegmentationActions>()(
    immer((set) => ({
        segmentations: {},

        // Use when adding segmentation
        syncSegmentations: () => set((state) => {
            const activeViewport = useViewerStore.getState().activeViewport;
            const next = segmentation.state.getSegmentations();

            for (const seg of next) {
                if (state.segmentations[seg.segmentationId]) continue;

                const indices = seg.segmentOrder ?? Object.keys(seg.segments).map(Number);
                const segments = indices.map(i => ({
                    segmentIndex: i,
                    label: seg.segments[i].label,
                    //color: segmentation.config.color.getSegmentIndexColor(activeViewport ?? 'v1', seg.segmentationId, i),
                    //visible: segmentation.config.visibility.getSegmentIndexVisibility(activeViewport ?? 'v1', { segmentationId: seg.segmentationId, type: toolEnums.SegmentationRepresentations.Contour},i),
                    active: seg.segments[i].active,
                    locked: seg.segments[i].locked,
                }));
                state.segmentations[seg.segmentationId] = {
                    segmentationId: seg.segmentationId,
                    label: seg.label,
                    segmentOrder: seg.segmentOrder,
                    segments: Object.fromEntries(segments.map(s => [s.segmentIndex, s])),
                };
            }
        }),

        syncSegments: (segmentationId: string) => set((state) => {
            const seg = segmentation.state.getSegmentation(segmentationId);
            if (!seg) return;

            const activeViewport = useViewerStore.getState().activeViewport;
            const indices = seg.segmentOrder ?? Object.keys(seg.segments).map(Number);
            for (const i of indices) {
                const curr = state.segmentations[segmentationId].segments[i];
                const next = {
                    ...seg.segments[i],
                    color: segmentation.config.color.getSegmentIndexColor(activeViewport ?? 'v1', seg.segmentationId, i),
                    visible: segmentation.config.visibility.getSegmentIndexVisibility(activeViewport ?? 'v1', { segmentationId: seg.segmentationId, type: toolEnums.SegmentationRepresentations.Contour},i),
                };

                if (curr.label !== next.label) curr.label = next.label;
                if (curr.active !== next.active) curr.active = next.active;
                if (curr.locked !== next.locked) curr.locked = next.locked;
                //if (curr.visible !== next.visible) curr.visible = next.visible;
                //if (curr.color.some((v, k) => v !== next.color[k])) curr.color = next.color;
            
            }
        })
    }))
);