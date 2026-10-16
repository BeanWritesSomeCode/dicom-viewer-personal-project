import { useState, memo } from 'react';
import segmentationService from '../services/segmentationService';
import { useSegmentationStore } from '../stores/segmentationStore';
import SegmentRow from './SegmentRow/SegmentRow';


export default function SegmentList() {
    const segmentations = useSegmentationStore((s) => s.segmentations);
    console.log('Checking for segmentations')
    
    const segs = Object.values(segmentations);;

    if (!segs || segs.length < 1) {
        return (
            <div>No Segmentation</div>
        )
    }
    
    const tempSeg = segs[0];
    return (
        <div className="w-full h-full flex flex-col">
            <ul>
                {Object.values(tempSeg.segments).map((seg) => (
                    <SegmentRow key={seg.segmentIndex} segmentationId={tempSeg.segmentationId} segmentIndex={seg.segmentIndex} />
                ))}
            </ul>
        </div>
    );
}

