import { useRef, useEffect } from 'react';
import type { MouseEvent } from 'react';
import { Enums, type Types } from '@cornerstonejs/core';
import { useViewerStore } from '../stores/viewerStore';

import useCornerstoneViewport from '../hooks/useCornerstoneViewport';
import type { ViewportProperties } from '../types/types';

import './Viewport.css';


interface NewCornerstoneViewportProps {
    viewportInput: ViewportProperties;

}

export function NewCornerstoneViewport({viewportInput}: NewCornerstoneViewportProps) {
    const { elementRef, viewport, isReady } = useCornerstoneViewport(viewportInput);
    const activeViewport = useViewerStore((s) => s.activeViewport);

    const isActive = viewport && activeViewport === viewport.id;

    const handleViewportClick = (evt: MouseEvent) => {
        console.log(viewport);
        evt.preventDefault();
        if (viewport && evt.shiftKey) {
            console.log('Viewport selected')
            evt.stopPropagation();
            useViewerStore.setState({ activeViewport: viewport.id });
        }
    };

    return (
        <div className="relative w-full h-full"
            style={{gridArea: viewportInput.viewportId}}
            onClick={handleViewportClick}
        >
            <div 
                className="border border-gray-300"
                ref={elementRef} 
                style={{width: '100%', height: '100%', gridArea: viewportInput.viewportId}}
            />
            <div className={`absolute top-0 left-0 border ${isActive ? "border-2 border-b-cyan-500" : ''}`}/>
        </div>
    )
}