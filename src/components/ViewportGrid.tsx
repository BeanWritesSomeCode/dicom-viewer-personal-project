import { useEffect } from 'react';
import cornerstoneService from '../services/cornerstoneService';
import { loadCurrentStudy, displayActiveViewports } from '../services/fileLoaderService';
import { NewCornerstoneViewport } from './CornerstoneViewport';
import type { ViewportLayout } from '../types/types';
import './ViewportGrid.css';

interface ViewportGridProps {
    layout: ViewportLayout;
}

// TODO: Keep track of current images/volumes/overlays (if any) and reassign when layout changes. (destroys viewports and creates new ones each time)

export default function ViewportGrid({ layout }: ViewportGridProps) {
    
    useEffect(() => {
        cornerstoneService.getRenderingEngine().resize();
        loadCurrentStudy().then(() => { displayActiveViewports() });
    }, [layout]);

    return (
        <div 
            className="w-full h-full grid"
            style={{gridTemplateAreas: layout.gridTemplateAreas}}>
            {layout.viewports.map(viewportInput => (
                <NewCornerstoneViewport viewportInput={viewportInput} />
            ))}
        </div>
    )

}