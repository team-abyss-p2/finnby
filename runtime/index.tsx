/// <reference path="./panorama.d.ts" />

import "./refresh";

import * as React from "react";

import styled, { css, keyframes } from "./styled";
import * as Components from "./components";
import * as Hooks from "./hooks";
import { Renderer, lookupNodeProps } from "./reconciler";
import { Inspector } from "./inspector";

function mount(Component: React.ComponentType, root: Panel) {
	const node = React.createElement(
		React.Fragment,
		undefined,
		React.createElement(Component),
		React.createElement(Inspector, { lookupNodeProps }),
	);

	// @ts-expect-error createContainer signature is mismatched
	const container = Renderer.createContainer(
		root, // containerInfo
		1, // tag = BlockingRoot
		true, // hydrate
	);

	Renderer.updateContainer(node, container, null);
}

Object.assign(UiToolkitAPI.GetGlobalObject(), {
	React,
	FinnbyRuntime: {
		styled,
		css,
		keyframes,
		...Components,
		...Hooks,
		_mount: mount,
	},
});

export { styled, css, keyframes };
export * from "./components";
export * from "./hooks";
