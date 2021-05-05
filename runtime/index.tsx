// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./panorama.d.ts" />

import * as React from "react";

import * as Components from "./components";
import * as Hooks from "./hooks";
import { Renderer } from "./reconciler";

function noop() {
    // noop
}

Object.assign(UiToolkitAPI.GetGlobalObject(), {
    React,
    FinnbyRuntime: {
        ...Components,
        ...Hooks,
        _mount(Component: React.ComponentType, root: Panel) {
            Renderer.updateContainer(
                React.createElement(Component),
                Renderer.createContainer(root, 1, true, null),
                null,
                noop,
            );
        },
    },
});

export * from "./components";
export * from "./hooks";
