import { useEffect, useRef, useState } from 'react';
import type { Types } from '@cornerstonejs/core';
import cornerstoneService from '../services/cornerstoneService';


export function useCornerstoneViewport(viewportInput: Types.PublicViewportInput) {
    const elementRef = useRef<HTMLDivElement | null>(null);
    const [viewport, setViewport] = useState<Types.IViewport | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const setupViewport = async () => {

            // Safely try to initialize
            await cornerstoneService.initialize();

            cornerstoneService.enableViewport(viewportInput);

            const renderingEngine = cornerstoneService.getRenderingEngine();
            const csViewport = renderingEngine.getViewport(viewportInput.viewportId);

            setViewport(csViewport);
            setIsReady(true);
        };

        setupViewport();

        return () => {
            setIsReady(false);
            setViewport(null);
            cornerstoneService.disableViewport(viewportInput.viewportId);
        }
    }, [viewportInput]);

    return {
        elementRef,
        viewport,
        isReady,
    };
}
