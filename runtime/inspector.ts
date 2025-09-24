import React, { useEffect, useState } from "react";
import type { Props } from "./reconciler";

interface InspectorProps {
    lookupNodeProps(node: Panel): Props | undefined;
}

interface OverlayState {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function Inspector({ lookupNodeProps }: InspectorProps) {
    const [overlay, setOverlay] = useState<OverlayState | null>(null);

    useEffect(() => {
        function attachToDevtools(agent: any) {
            function onAgentShowNativeHighlight(node: Panel) {
                const props = lookupNodeProps(node);
                if (
                    props &&
                    typeof props["x"] === "number" &&
                    typeof props["y"] === "number" &&
                    typeof props["width"] === "number" &&
                    typeof props["height"] === "number"
                ) {
                    setOverlay({
                        x: props["x"],
                        y: props["y"],
                        width: props["width"],
                        height: props["height"],
                    });
                } else {
                    setOverlay(null);
                }
            }
            function onAgentHideNativeHighlight() {
                setOverlay(null);
            }

            function onAgentShutdown() {
                agent.removeListener("shutdown", onAgentShutdown);

                agent.removeListener(
                    "showNativeHighlight",
                    onAgentShowNativeHighlight,
                );
                agent.removeListener(
                    "hideNativeHighlight",
                    onAgentHideNativeHighlight,
                );
            }

            agent.addListener(
                "showNativeHighlight",
                onAgentShowNativeHighlight,
            );
            agent.addListener(
                "hideNativeHighlight",
                onAgentHideNativeHighlight,
            );

            agent.addListener("shutdown", onAgentShutdown);
        }

        __REACT_DEVTOOLS_GLOBAL_HOOK__.on("react-devtools", attachToDevtools);

        if (__REACT_DEVTOOLS_GLOBAL_HOOK__.reactDevtoolsAgent) {
            attachToDevtools(__REACT_DEVTOOLS_GLOBAL_HOOK__.reactDevtoolsAgent);
        }

        return () => {
            __REACT_DEVTOOLS_GLOBAL_HOOK__.off(
                "react-devtools",
                attachToDevtools,
            );
        };
    }, [lookupNodeProps]);

    if (!overlay) {
        return null;
    }

    return React.createElement("panel", {
        x: overlay.x,
        y: overlay.y,
        z: 100,
        width: overlay.width,
        height: overlay.height,
        background: "rgba(200, 230, 255, 0.8)",
    });
}
