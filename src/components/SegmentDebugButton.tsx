import { segmentation } from '@cornerstonejs/tools';
import { cache } from '@cornerstonejs/core';

window.segmentation = segmentation;
window.cache = cache;

export default function SegmentDebugButton() {
    return (
        <div className="w-fit h-fit pl-0.5 pr-0.5 border">
            <button
                onClick={() => {
                    console.log('Segmentations: ', segmentation.state.getSegmentations());
                    console.log('Representations (v1): ', segmentation.state.getSegmentationRepresentations('v1'));
                }}
            >
                Log segmentation module
            </button>
        </div>
    )
}