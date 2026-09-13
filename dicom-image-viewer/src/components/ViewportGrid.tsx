import { useEffect } from 'react';
import useCornerstoneStore from '../stores/cornerstoneStore';
import StackViewport from './StackViewport';
import VolumeViewport from './VolumeViewport';
import './ViewportGrid.css';

interface ViewportGridProps {
    layout: 'single' | 'double' | 'triple' | 'quad';
}

const layouts = {
    'single': 1,
    'double': 2,
    'triple': 3,
    'quad': 4
};


export default function ViewportGrid({ layout }: ViewportGridProps) {
    const cellCount = layouts[layout];

    useEffect(() => {
        const renderingEngine = useCornerstoneStore.getState().renderingEngine;
        if (!renderingEngine) return;

        const viewports = renderingEngine.getViewports();
        viewports.forEach(viewport => {
             console.log(viewport);
             viewport.resize();
        });
    }, [layout]);

    return (
        <div className={`viewport-grid ${layout}`}>
            {[...Array(cellCount).keys()].map(idx => (
                <div className={`viewport-grid-item-${idx+1}`} key={idx}>
                    <VolumeViewport index={idx}/>
                </div>
            ))}
        </div>
    )
}