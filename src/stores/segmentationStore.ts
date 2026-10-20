import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Types as coreTypes } from '@cornerstonejs/core';
import { segmentation, type Types as toolTypes, Enums as toolEnums } from '@cornerstonejs/tools';
import { useViewerStore } from './viewerStore';

interface Segmentation {
    segmentationId: string;
    label: string;
    segmentOrder?: number[];
    segments: Record<number, ContourSegment>;
}

// Properties not reflected in Cornerstone segmentation state are synced with activeViewport
interface ContourSegment {
    segmentIndex: number;
    active: boolean;
    label: string;
    locked: boolean;
    colors: Record<string, coreTypes.Color>; // viewportId: Color
    visibility: Record<string, boolean>; // viewportId: visible
    styles: Record<string, toolTypes.ContourStyle>; // viewportId: ContourStyle
}

interface SegmentationRepresentation {
    segmentationId: string;
    active: boolean;
    config: {},
    segments: Record<number, RepresentationSegment>;
    type: string;
    visible: boolean;
}

interface RepresentationSegment {
    visible: boolean;
    color: coreTypes.Color;
    style: toolTypes.ContourStyle;
}

interface SegmentationState {
    segmentations: Record<string, Segmentation>;
}

interface SegmentationActions {
    syncSegmentations: () => void;
    sync: (segmentationId: string, viewportId: string) => void;
}

export const useSegmentationStore = create<SegmentationState & SegmentationActions>()(
    immer((set) => ({
        segmentations: {},
        representations: {},

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

        sync: (segmentationId: string, viewportId: string) => set((s) => {
            const csSeg = segmentation.state.getSegmentation(segmentationId);
            if (!csSeg) return;

            let currSeg = s.segmentations[segmentationId];
            if (!currSeg) {
                s.segmentations[segmentationId] = currSeg = {
                    segmentationId: csSeg.segmentationId,
                    label: csSeg.label,
                    segmentOrder: csSeg.segmentOrder,
                    segments: {},
                };
            }

            const indices = csSeg.segmentOrder ?? Object.keys(csSeg.segments).map(Number);
            for (const i of indices) {
                const newSegment = csSeg.segments[i];

                let currSegment = currSeg.segments[i];
                if (!currSegment) {
                    currSeg.segments[i] = currSegment = {
                        ...newSegment,
                        colors: {},
                        visibility: {},
                        styles: {},
                    };
                }
                
                const viewportSegmentColor = segmentation.config.color.getSegmentIndexColor(viewportId, segmentationId, i);
                const viewportSegmentVisibility = segmentation.config.visibility.getSegmentIndexVisibility(viewportId, { segmentationId, type: toolEnums.SegmentationRepresentations.Contour }, i);
                const viewportSegmentStyle = segmentation.config.style.getStyle({ viewportId, segmentationId, segmentIndex: i, type: toolEnums.SegmentationRepresentations.Contour });
                console.log(viewportSegmentColor);

                if (currSegment.label !== newSegment.label) currSegment.label = newSegment.label;
                if (currSegment.active !== newSegment.active) currSegment.active = newSegment.active;
                if (currSegment.locked !== newSegment.locked) currSegment.locked = newSegment.locked;

                let currViewportSegmentColor = currSegment.colors[viewportId];
                let currViewportSegmentVisibility = currSegment.visibility[viewportId];
                let currViewportSegmentStyle = currSegment.styles[viewportId];
                // Really dumb fix imho, viewportSegmentColor points directly to cornerstones internal config, avoid assigning to it.
                if (viewportSegmentColor.some((v, k) => v !== currViewportSegmentColor?.[k])) currSegment.colors[viewportId] = [...viewportSegmentColor];
                if (currViewportSegmentVisibility !== viewportSegmentVisibility) currSegment.visibility[viewportId] = viewportSegmentVisibility;
                if (!Object.keys(viewportSegmentStyle).every((key) => {
                    const k = key as keyof typeof viewportSegmentStyle;
                    return currViewportSegmentStyle?.[k] === viewportSegmentStyle[k];
                })) {
                    currSegment.styles[viewportId] = viewportSegmentStyle;
                }
            }
        }),
    }))
);