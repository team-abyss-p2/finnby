import { join, extname } from "path";
import { promises as fs } from "fs";
import { watch, rollup } from "rollup";

import { makeRollupConfig, RollupConfig } from "./config";

const SUPPORTED = [".tsx", ".ts", ".jsx", ".js"];

async function traverseComponents(
    configs: RollupConfig[],
    root: string,
    dir: string,
) {
    const list = await fs.readdir(join(root, dir), { withFileTypes: true });

    for (const entry of list) {
        if (entry.isDirectory()) {
            await traverseComponents(configs, root, join(dir, entry.name));
        }

        if (entry.isFile()) {
            if (!SUPPORTED.includes(extname(entry.name))) {
                continue;
            }

            configs.push(makeRollupConfig(root, join(dir, entry.name)));
        }
    }
}

async function copyRuntime() {
    const common = join(process.cwd(), "code/panorama/scripts/common");
    await fs.mkdir(common, {
        recursive: true,
    });
    await fs.copyFile(
        join(__dirname, "runtime.js"),
        join(common, "circlevision.js"),
    );
}

async function main() {
    const dir = process.cwd();

    const configs: RollupConfig[] = [];
    await traverseComponents(configs, join(dir, "components"), ".");

    await copyRuntime();

    const [, , command] = process.argv;
    switch (command) {
        case "watch":
            watch(configs);
            break;

        case "build":
            await Promise.all(
                configs.map(async (config) => {
                    const build = await rollup(config);
                    await build.write(config.output);
                }),
            );
            break;

        default:
            throw new Error(`Unknown command "${command}"`);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
