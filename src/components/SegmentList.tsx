import { useState, memo, useEffect } from 'react';
import segmentationService from '../services/segmentationService';
import { eventTarget } from '@cornerstonejs/core';
import { segmentation, Enums as toolEnums, type Types as toolTypes } from '@cornerstonejs/tools';
import { useSegmentationStore } from '../stores/segmentationStore';
import { useViewerStore } from '../stores/viewerStore';
import SegmentRow from './SegmentRow/SegmentRow';


export default function SegmentList() {
    const segmentations = useSegmentationStore((s) => s.segmentations);
    const activeViewport = useViewerStore((s) => s.activeViewport);
    console.log('Checking for segmentations');

    const segs = Object.values(segmentations);

    useEffect(() => {
        const onRepUpdate = (d: toolTypes.EventTypes.SegmentationRepresentationModifiedEventType) => {
            const detail: toolTypes.EventTypes.SegmentationRepresentationModifiedEventDetail = d.detail;
            useSegmentationStore.getState().sync(detail.segmentationId, detail.viewportId);
        };

        eventTarget.addEventListenerDebounced(toolEnums.Events.SEGMENTATION_REPRESENTATION_MODIFIED, onRepUpdate, 25);

        return () => {
            eventTarget.removeEventListenerDebounced(toolEnums.Events.SEGMENTATION_REPRESENTATION_MODIFIED, onRepUpdate);
        }
    }, []);


    if (!segs || segs.length < 1 || !segs[0].segments[1]?.colors[activeViewport ?? 'v1']) {
        return (
            <div>No Segmentation</div>
        )
    }
    
    const tempSeg = segs[0];
    return (
        <div className="w-full h-full flex flex-col">
            <ul>
                {Object.values(tempSeg.segments).map((seg) => (
                    <SegmentRow key={seg.segmentIndex} segmentationId={tempSeg.segmentationId} segmentIndex={seg.segmentIndex} viewportId={activeViewport ?? 'v1'}/>
                ))}
            </ul>
        </div>
    );
}

