import { runInNewContext } from "vm";
import { sep } from "path";

import * as React from "react";
import type { OutputChunk } from "rollup";

import styled, { css, keyframes } from "./styled";
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
    panorama["Msg"] = (...args: any[]) => {
        console.log(...args);
    };

    return {
        __finnby_ssr: true,

        panorama,
        $: panorama,

        UiToolkitAPI: {
            GetGlobalObject: () => ({
                React,
                FinnbyRuntime: {
                    css,
                    keyframes,
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

const SEPARATOR = new RegExp(sep.replace("\\", "\\\\"), "g");
const normalize = (path: string) => path.replace(SEPARATOR, "/");

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
        (fileName) => `file://{resources}/styles/${normalize(fileName)}`,
    );
    if (Component.stylesheets) {
        styles.push(...Component.stylesheets.map(normalize));
    }

    const scripts = [`file://{resources}/${normalize(file.fileName)}`];
    if (Component.scripts) {
        scripts.push(...Component.scripts.map(normalize));
    }

    return server.renderToStaticMarkup(
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
