import { useLayoutEffect, useRef } from 'react';
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
    const elementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
    //const pendingViewportIds = useRef<Set<string>>(new Set(layout.viewports.map(v => v.id)));
    const pendingViewportIds: Set<string> = new Set(layout.viewports.map(v => v.id));

    console.log('Pending before render:', pendingViewportIds);
    
    useLayoutEffect(() => {
        //pendingViewportIds.current = new Set(layout.viewports.map(v => v.id));
        elementsRef.current.clear();
        console.log('In layout effect:', pendingViewportIds, elementsRef.current);
    }, [layout]);

    const registerElement = (viewportId: string) => (el: HTMLDivElement | null) => {
        if (el) {
            elementsRef.current.set(viewportId, el);
            pendingViewportIds.delete(viewportId);
            console.log('In register element:', elementsRef.current, pendingViewportIds);
            if (pendingViewportIds.size === 0) {
                console.log('enabling layout with:', elementsRef.current);
                viewportManager.enableLayout(layout, elementsRef.current);
            }
        } else {
            console.log('removing viewport:', viewportId);
            viewportManager.removeViewport(viewportId);
        }
    }

    if (false )return (
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

    return (
        <div style={layout.gridLayout}>
            {layout.viewports.map(v => (
                <div key={v.id} ref={registerElement(v.id)} style={{gridArea: v.id}}/>
            ))}
        </div>
    )

}