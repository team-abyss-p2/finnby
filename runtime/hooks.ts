import { useEffect } from "react";

export function useUnhandledEvent(
    name: string,
    handler: () => void,
    deps: any[],
) {
    useEffect(() => {
        $.RegisterForUnhandledEvent(name, handler);
        return () => {
            $.UnregisterForUnhandledEvent(name, handler);
        };
    }, deps);
}

export function usePanelEvent(
    name: string,
    panel: Panel,
    handler: () => void,
    deps: any[],
) {
    useEffect(() => {
        $.RegisterEventHandler(name, panel, handler);
        return () => {
            $.UnregisterEventHandler(name, panel, handler);
        };
    }, deps);
}
