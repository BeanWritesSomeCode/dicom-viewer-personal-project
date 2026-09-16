import { useRef, useEffect } from 'react';
import { Enums, type Types } from '@cornerstonejs/core';
import useCornerstoneStore from '../stores/cornerstoneStore';
import viewportManager from '../lib/managers/viewportManager';
import './Viewport.css';

interface CornerstoneViewportProps {
    viewportId: string;
    viewportType: Enums.ViewportType;
    viewportOrientation: Enums.OrientationAxis;
    viewportBackgroundColor?: number[];
}

export default function CornerstoneViewport(
    { 
        viewportId,
        viewportType,
        viewportOrientation,
        viewportBackgroundColor
    }: CornerstoneViewportProps) {
    const el = useRef<HTMLDivElement>(null);
    const initialized = useCornerstoneStore((s) => s.isInitialized);

    const viewportInput = {
        viewportId: viewportId,
        type: viewportType,
        element: el.current as HTMLDivElement,
        defaultOptions: {
            orientation: viewportOrientation,
            background: viewportBackgroundColor as Types.RGB,
        }
    }

    useEffect(() => {
        if (!initialized || !el) return;

        viewportManager.addViewport(viewportInput);

        return () => {
            viewportManager.removeViewport(viewportId);
        }
    }, [initialized]);

   return (
        <div className="viewport volume-viewport">
            <div className="viewport-element" ref={el}>
            </div>
        </div>
    )
}