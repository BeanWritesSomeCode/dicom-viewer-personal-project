import { useRef, useEffect } from 'react';
import { type Types, Enums } from '@cornerstonejs/core';
import useCornerstoneStore from '../stores/cornerstoneStore';
import './Viewport.css';

interface VolumeViewportProps {
    index: number;
    volumeId?: string;
}

export default function StackViewport({index, volumeId}: VolumeViewportProps) {
    const viewportElementRef = useRef<HTMLDivElement>(null);
    const renderingEngine = useCornerstoneStore((s) => s.renderingEngine);

    useEffect(() => {
        if (!renderingEngine || !viewportElementRef.current) return;

        const viewportInput: Types.PublicViewportInput = {
            viewportId: `volume-viewport:${index}`,
            type: Enums.ViewportType.ORTHOGRAPHIC,
            element: viewportElementRef.current as HTMLDivElement
        };

        renderingEngine.enableElement(viewportInput);
        useCornerstoneStore.getState().addViewport(viewportInput);

        return () => {
            if (renderingEngine) {
                renderingEngine.disableElement(viewportInput.viewportId);
                useCornerstoneStore.getState().removeViewport(viewportInput.viewportId);
            }
        }

    }, [renderingEngine]);

    return (
        <div className="viewport volume-viewport">
            <div className="viewport-element" ref={viewportElementRef}>
            </div>
        </div>
    )
}