import { useEffect, type CSSProperties } from 'react';
import { Enums } from '@cornerstonejs/core';
import viewportManager from '../lib/managers/viewportManager';
import CornerstoneViewport from './CornerstoneViewport';
import type { ViewportLayout } from '../types/types';
import './ViewportGrid.css';

interface ViewportGridProps {
    layout: ViewportLayout;
}

// TODO: Keep track of current images/volumes/overlays (if any) and reassign when layout changes. (destroys viewports and creates new ones each time)

export default function ViewportGrid({ layout }: ViewportGridProps) {
    
    useEffect(() => {
        viewportManager.resizeViewports();
    }, [layout]);

    return (
        <div className="viewport-grid" style={{gridTemplateAreas: layout.gridTemplateAreas}}>
            {layout.viewports.map((v, idx) => (
                <div className={`viewport-${idx+1}`}>
                    <CornerstoneViewport 
                        viewportId={`viewport-${idx}`}
                        viewportOrientation={v.viewportOrientation}
                        viewportType={v.viewportType}
                        viewportBackgroundColor={v.viewportBackgroundColor}
                    />
                </div>
            ))}
        </div>
    )
}