import { runInNewContext } from "vm";

import * as React from "react";
import type { OutputChunk } from "rollup";

import styled, { css } from "./styled";
import * as Components from "../runtime/components";
import * as Hooks from "../runtime/hooks";

// Temporarily override NODE_ENV to "production" when requiring
// react-dom/server to load the production bundle for SSR
const prevEnv = process.env.NODE_ENV;
process.env.NODE_ENV = "production";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const server = require("react-dom/server") as typeof import("react-dom/server");

process.env.NODE_ENV = prevEnv;

type RootComponent = React.ComponentType & {
    document?(children: React.ReactNode): React.ReactNode;
    snippets?: React.ReactNode;
    stylesheets?: string[];
    scripts?: string[];
};

function createSandbox(roots: RootComponent[]) {
    function panorama() {
        throw new Error("Not implemented");
    }

    const CONTEXT_PANEL = Symbol("contextPanel");
    panorama["GetContextPanel"] = () => CONTEXT_PANEL;
    panorama["Msg"] = () => {
        // noop
    };

    return {
        panorama,
        $: panorama,

        UiToolkitAPI: {
            GetGlobalObject: () => ({
                React,
                FinnbyRuntime: {
                    css,
                    styled,
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

export function renderChunk(
    file: OutputChunk,
    stylesheets: Set<string>,
): string {
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

    const styles = Array.from(
        stylesheets,
        (fileName) => `file://{resources}/styles/${fileName}`,
    );
    if (Component.stylesheets) {
        styles.push(...Component.stylesheets);
    }

    const scripts = [`file://{resources}/${file.fileName}`];
    if (Component.scripts) {
        scripts.push(...Component.scripts);
    }

    return renderElement(
        <root>
            {styles.length > 0 && (
                <styles>
                    {styles.map((src) => (
                        <include key={src} src={src} />
                    ))}
                </styles>
            )}
            <scripts>
                {scripts.map((src) => (
                    <include key={src} src={src} />
                ))}
            </scripts>
            {snippets}
            {element}
        </root>,
    );
}
