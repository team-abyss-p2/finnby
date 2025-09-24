import { useEffect } from "react";

export function usePanelEvent(
    name: string,
    panel: Panel,
    handler: (...args: any[]) => void,
    deps: any[],
): void {
    useEffect(() => {
        $.RegisterEventHandler(name, panel, handler);
        return () => {
            $.UnregisterEventHandler(name, panel, handler);
        };
    }, deps);
}
