import { useEffect } from 'react';
import { eventTarget, Enums as coreEnums } from '@cornerstonejs/core';
import { Enums as toolEnums } from '@cornerstonejs/tools';



type CornerstoneCoreEvent = keyof typeof coreEnums.Events;
type CornerstoneToolsEvent = keyof typeof toolEnums.Events;

type EventType = CornerstoneCoreEvent | CornerstoneToolsEvent;


/**
 * Subscribe to a CornerstoneJS event inside a React component
 * @param eventType The name of the Cornerstone event to subscribe to
 * @param callback The callback to run
 */
export function useCornerstoneEvent(
    eventType: EventType,
    callback: (evt: CustomEvent) => void
) {
    useEffect(() => {
        const eventHandler = (evt: Event) => {
            callback(evt as CustomEvent);
        };

        eventTarget.addEventListener(eventType, eventHandler);

        return () => {
            eventTarget.removeEventListener(eventType, eventHandler);
        };

    }, [eventType, callback]);
}