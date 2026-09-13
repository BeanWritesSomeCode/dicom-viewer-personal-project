import { useRef, useEffect } from 'react';
import { type Types, Enums} from '@cornerstonejs/core';
import useCornerstoneStore from '../stores/cornerstoneStore';
import './Viewport.css';

interface StackViewportProps {
    index: number;
}

export default function StackViewport(props: StackViewportProps) {
    const viewportElementRef = useRef<HTMLDivElement>(null);
    const renderingEngine = useCornerstoneStore((s) => s.renderingEngine);

    useEffect(() => {
        if (!renderingEngine || !viewportElementRef.current) return;

        const viewportInput: Types.PublicViewportInput = {
            viewportId:`stack-viewport:${props.index}`,
            type: Enums.ViewportType.STACK,
            element: viewportElementRef.current as HTMLDivElement,
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
        <div className="viewport stack-viewport">
            <div className="viewport-element" ref={viewportElementRef}>
            </div>
        </div>
    )
}