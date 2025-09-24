import { dirname, join, relative } from "path";

import type { InputOptions, OutputOptions } from "rollup";
import replace from "@rollup/plugin-replace";
import { babel } from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

import postcss from "postcss";
import modules from "postcss-modules";

import { renderChunk } from "./ssr";
import { Config } from "./config";
import { styledPlugin } from "./babel";
import { defaultPostCssPlugins } from "./postcss";

export type RollupConfig = InputOptions & {
    output: OutputOptions;
};

export function makeRollupConfig(config: Config, path: string): RollupConfig {
    const extractedStyles: string[] = [];
    const stylesheets = new Set<string>();
    const uid = `_${path.replace(/[^a-z0-9]+/g, "_")}`;

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
                    "@babel/plugin-transform-class-properties",
                    "@babel/plugin-transform-nullish-coalescing-operator",
                    styledPlugin({ uid, styles: extractedStyles }),
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
                                node: "17.0.0", // P2CE V8 Version: 9.5.172.19
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
                            ...defaultPostCssPlugins(),
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
                async generateBundle(options, bundle) {
                    for (const file of Object.values(bundle)) {
                        if (file.type === "chunk" && file.isEntry) {
                            if (extractedStyles.length > 0) {
                                const processor = postcss(
                                    config.postcss(defaultPostCssPlugins()),
                                );

                                const code = extractedStyles.join("\n");
                                const { css } = await processor.process(code, {
                                    from: file.fileName,
                                });

                                this.emitFile({
                                    type: "asset",
                                    name: join(
                                        "styles",
                                        dirname(path),
                                        `finnby/${file.name}.css`,
                                    ),
                                    source: css,
                                });

                                stylesheets.add(
                                    join(
                                        dirname(path),
                                        `finnby/${file.name}.css`,
                                    ),
                                );
                            }

                            this.emitFile({
                                type: "asset",
                                name: join(
                                    "layout",
                                    dirname(path),
                                    `${file.name}.xml`,
                                ),
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
            entryFileNames: join(
                "scripts/components",
                dirname(path),
                "[name].js",
            ),
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
