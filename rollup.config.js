import { join } from "path";
import { promises as fs } from "fs";

import replace from "@rollup/plugin-replace";
import { babel, getBabelOutputPlugin } from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

const RUNTIME_CONFIG = {
    input: "runtime/index.tsx",
    plugins: [
        replace({
            "process.env.NODE_ENV": JSON.stringify("production"),
            preventAssignment: true,
        }),
        // Use the TypeScript plugin to generate declarations
        typescript({
            declaration: true,
            declarationDir: "dist",
            rootDir: "runtime",
            exclude: "cli/**",
        }),
        // Run Babel on the output to ensure compatibility with the V8
        // version embedded in P2CE (5.8.283 on 04/03/2021)
        getBabelOutputPlugin({
            allowAllFormats: true,
            plugins: ["@babel/plugin-proposal-nullish-coalescing-operator"],
            presets: [
                [
                    "@babel/preset-env",
                    {
                        modules: false,
                        targets: {
                            node: "8.0.0",
                        },
                    },
                ],
            ],
        }),
        // Resolve dependencies from node_modules, using a whitelist
        // to prevent accidentally including stuff into the runtime bundle
        nodeResolve({
            browser: false,
            resolveOnly: ["react", "react-reconciler"],
        }),
        commonjs(),
    ],

    output: {
        dir: "dist",
        entryFileNames: "runtime.js",
        // The polyfill is included as a banner so that it sits in the global
        // scope, outside of the Rollup-inserted IIFE
        banner: () => fs.readFile(join(__dirname, "runtime/polyfills.js")),
        format: "iife",
    },
};

const CLI_CONFIG = {
    input: "cli/index.ts",

    plugins: [
        // No need to run the TS compiler for the CLI, just use Babel
        babel({
            presets: [
                "@babel/preset-typescript",
                [
                    "@babel/preset-react",
                    {
                        runtime: "automatic",
                    },
                ],
                [
                    "@babel/preset-env",
                    {
                        modules: false,
                        targets: {
                            node: "current",
                        },
                    },
                ],
            ],

            babelHelpers: "bundled",
            extensions: [".ts", ".tsx", ".js", ".jsx"],
            include: ["cli/**", "runtime/components.ts", "runtime/hooks.ts"],
            exclude: /node_modules/,
        }),
        // This is only here so Rollup will resolve .ts files, the empty
        // resolveOnly makes it so we don't actually pack anything from node_modules
        nodeResolve({
            browser: false,
            extensions: [".ts", ".tsx", ".js", ".jsx"],
            resolveOnly: [],
        }),
    ],

    external: [
        "fs",
        "vm",
        "path",
        "cosmiconfig",
        "rollup",
        "@rollup/plugin-replace",
        "@rollup/plugin-babel",
        "@rollup/plugin-node-resolve",
        "@rollup/plugin-commonjs",
        "postcss",
        "postcss-modules",
        "postcss-advanced-variables",
        "postcss-atroot",
        "postcss-extend-rule",
        "postcss-nested",
        "postcss-property-lookup",
        "react",
        "react/jsx-runtime",
        "react-dom/server",
    ],

    output: {
        file: "dist/cli.js",
        // Shebang banner so the file is
        // detected as executable by NPM / Yarn
        banner: "#!/usr/bin/env node\n",
        format: "commonjs",
    },
};

export default [RUNTIME_CONFIG, CLI_CONFIG];
