import { useEffect, useRef, useState } from 'react';
import type { Types, Viewport } from '@cornerstonejs/core';
import cornerstoneService from '../services/cornerstoneService';
import type { ViewportProperties } from '../types/types';

// Flow: 
//      elementRef = null
//      consumer component uses elementRef in <div ref={elementRef}>
//      component renders
//      effect runs -> cornerstone viewport mounts
//
//      On unmount: 
//          cornerstone viewport unmounts
//      
export default function useCornerstoneViewport(viewportInput: ViewportProperties) {
    const elementRef = useRef<HTMLDivElement | null>(null);
    const [viewport, setViewport] = useState<Types.IViewport | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const setupViewport = async () => {

            if (!elementRef.current) {
                console.log('Div not yet mounted');
            } else {
                console.log('Div mounted');
            }

            // Safely try to initialize
            await cornerstoneService.initialize();

            console.log(viewportInput);
            cornerstoneService.enableViewport({
                element: elementRef.current as HTMLDivElement,
                ...viewportInput
            });

            const renderingEngine = cornerstoneService.getRenderingEngine();
            const csViewport = renderingEngine.getViewport(viewportInput.viewportId);

            console.log(csViewport);

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
