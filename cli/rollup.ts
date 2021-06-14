import { join, relative } from "path";

import type { InputOptions, OutputOptions } from "rollup";
import replace from "@rollup/plugin-replace";
import { babel } from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

import postcss from "postcss";
import modules from "postcss-modules";
// @ts-expect-error missing types
import advancedVariables from "postcss-advanced-variables";
// @ts-expect-error missing types
import atroot from "postcss-atroot";
// @ts-expect-error missing types
import extendRule from "postcss-extend-rule";
import nested from "postcss-nested";
// @ts-expect-error missing types
import propertyLookup from "postcss-property-lookup";

import { renderChunk } from "./ssr";
import { Config } from "./config";

export type RollupConfig = InputOptions & {
    output: OutputOptions;
};

export function makeRollupConfig(config: Config, path: string): RollupConfig {
    const stylesheets = new Set<string>();
    const uid = "_" + path.replace(/[^a-z0-9]+/g, "_");

    return config.rollup({
        input: join(config.componentsDir, path),

        plugins: [
            replace({
                "process.env.NODE_ENV": JSON.stringify(
                    process.env.NODE_ENV || "development",
                ),
                preventAssignment: true,
            }),
            babel({
                babelHelpers: "bundled",
                extensions: [".js", ".jsx", ".ts", ".tsx"],
                exclude: /node_modules/,

                plugins: [
                    "@babel/plugin-proposal-class-properties",
                    "@babel/plugin-proposal-nullish-coalescing-operator",
                ],
                presets: [
                    "@babel/preset-typescript",
                    [
                        "@babel/preset-react",
                        {
                            // Force the classic runtime since react
                            // cannot be auto-required from JS files
                            runtime: "classic",
                        },
                    ],
                    [
                        "@babel/preset-env",
                        {
                            modules: false,
                            targets: {
                                node: "8.0.0", // P2CE V8 Version: 5.8.283
                            },
                        },
                    ],
                ],
            }),
            nodeResolve({
                resolveOnly: ["classnames"],
                browser: false,
            }),
            commonjs(),
            {
                name: "finnby-postcss",
                async transform(code, id) {
                    if (!id.endsWith(".css")) {
                        return null;
                    }

                    let result: any;

                    const processor = postcss(
                        config.postcss([
                            modules({
                                getJSON: (_: any, json: any) => {
                                    result = json;
                                },
                            }),
                            advancedVariables(),
                            atroot(),
                            extendRule(),
                            nested(),
                            propertyLookup(),
                        ]),
                    );

                    const { css } = await processor.process(code, { from: id });

                    const fileName = relative(config.componentsDir, id);
                    stylesheets.add(fileName);

                    this.emitFile({
                        type: "asset",
                        name: `styles/${fileName}`,
                        source: css,
                    });

                    return {
                        code: `export default ${JSON.stringify(result)};`,
                    };
                },
            },
            {
                name: "finnby-output",
                generateBundle(options, bundle) {
                    for (const file of Object.values(bundle)) {
                        if (file.type === "chunk" && file.isEntry) {
                            this.emitFile({
                                type: "asset",
                                name: `layout/${file.name}.xml`,
                                source: renderChunk(file, stylesheets),
                            });
                        }
                    }
                },
            },
        ],

        external: ["react", "@team-abyss-p2/finnby"],

        output: {
            dir: config.outDir,
            assetFileNames: "[name][extname]",
            entryFileNames: "scripts/components/[name].js",
            format: "iife",

            name: uid,
            footer: `UiToolkitAPI.GetGlobalObject().FinnbyRuntime._mount(${uid}, $.GetContextPanel())`,

            globals: {
                react: "UiToolkitAPI.GetGlobalObject().React",
                "@team-abyss-p2/finnby":
                    "UiToolkitAPI.GetGlobalObject().FinnbyRuntime",
            },
        },
    });
}
