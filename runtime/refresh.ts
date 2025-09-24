// @ts-expect-error missing types
import { connectToDevTools } from "react-devtools-core";

if (typeof WebSocket !== "undefined") {
    connectToDevTools();
}

/*
// @ts-expect-error missing types
import ReactRefreshRuntime from "react-refresh/runtime";

// This needs to run before the renderer initializes.
ReactRefreshRuntime.injectIntoGlobalHook(global);

const Refresh = {
    performFullRefresh(reason: string): void {
        console.warn("Reload: " + reason);
    },

    createSignatureFunctionForTransform:
        ReactRefreshRuntime.createSignatureFunctionForTransform,

    isLikelyComponentType: ReactRefreshRuntime.isLikelyComponentType,

    getFamilyByType: ReactRefreshRuntime.getFamilyByType,

    register: ReactRefreshRuntime.register,

    performReactRefresh(): void {
        if (ReactRefreshRuntime.hasUnrecoverableErrors()) {
            console.warn("Reload: Fast Refresh - Unrecoverable");
            return;
        }

        ReactRefreshRuntime.performReactRefresh();
        console.debug("performReactRefresh");
    },
};

// @ts-expect-error missing types
global["__ReactRefresh"] = Refresh;
*/
