import { runInNewContext } from "vm";

import * as React from "react";
import type { OutputChunk } from "rollup";

import * as Components from "../runtime/components";
import * as Hooks from "../runtime/hooks";

const prevEnv = process.env.NODE_ENV;
process.env.NODE_ENV = "production";

const server = require("react-dom/server") as typeof import("react-dom/server");

process.env.NODE_ENV = prevEnv;

type RootComponent = React.ComponentType & {
    document?(children: React.ReactNode): React.ReactNode;
    snippets?: React.ReactNode;
};

function createSandbox(roots: RootComponent[]) {
    function panorama() {
        throw new Error("Not implemented");
    }

    const CONTEXT_PANEL = Symbol("contextPanel");
    panorama["GetContextPanel"] = () => CONTEXT_PANEL;
    panorama["Msg"] = () => {};

    return {
        panorama,
        $: panorama,

        UiToolkitAPI: {
            GetGlobalObject: () => ({
                React,
                FinnbyRuntime: {
                    ...Components,
                    ...Hooks,
                    _mount(Component: RootComponent) {
                        roots.push(Component);
                    },
                },
            }),
        },
    };
}

function renderElement(elem: React.ReactElement) {
    // ugh
    return server
        .renderToStaticMarkup(elem)
        .replace(/style="([^"]+)"/g, `style="$1;"`);
}

export function renderChunk(file: OutputChunk, stylesheets: Set<string>) {
    const roots: RootComponent[] = [];

    runInNewContext(file.code, createSandbox(roots), {
        filename: file.fileName,
    });

    if (roots.length !== 1) {
        throw new Error(`mount called ${roots.length} times`);
    }

    const [Component] = roots;
    const component = <Component />;

    let element;
    if (Component.document) {
        element = Component.document(component);
    } else {
        element = <Components.Panel>{component}</Components.Panel>;
    }

    let snippets = null;
    if (Component.snippets) {
        snippets = Component.snippets;
    }

    return renderElement(
        <root>
            {stylesheets.size > 0 && (
                <styles>
                    {Array.from(stylesheets, (fileName) => (
                        <include
                            key={fileName}
                            src={`file://{resources}/styles/${fileName}`}
                        />
                    ))}
                </styles>
            )}
            <scripts>
                <include src={`file://{resources}/${file.fileName}`} />
            </scripts>
            {snippets}
            {element}
        </root>,
    );
}
