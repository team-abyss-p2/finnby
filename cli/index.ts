import { join, extname } from "path";
import { promises as fs } from "fs";
import { watch, rollup } from "rollup";

import { makeRollupConfig, RollupConfig } from "./rollup";
import { Config, loadConfig } from "./config";

const SUPPORTED = [".tsx", ".ts", ".jsx", ".js"];

async function traverseComponents(
    configs: RollupConfig[],
    config: Config,
    dir: string,
) {
    const list = await fs.readdir(join(config.componentsDir, dir), {
        withFileTypes: true,
    });

    for (const entry of list) {
        if (entry.isDirectory()) {
            await traverseComponents(configs, config, join(dir, entry.name));
        }

        if (entry.isFile()) {
            if (!SUPPORTED.includes(extname(entry.name))) {
                continue;
            }

            configs.push(makeRollupConfig(config, join(dir, entry.name)));
        }
    }
}

async function copyRuntime(config: Config) {
    const common = join(config.outDir, "scripts/common");
    await fs.mkdir(common, {
        recursive: true,
    });
    await fs.copyFile(join(__dirname, "runtime.js"), join(common, "finnby.js"));
}

async function main() {
    const config = await loadConfig();

    const rollupConfigs: RollupConfig[] = [];
    await traverseComponents(rollupConfigs, config, ".");

    await copyRuntime(config);

    const [, , command] = process.argv;
    switch (command) {
        case "watch":
            watch(rollupConfigs);
            break;

        case "build":
            await Promise.all(
                rollupConfigs.map(async (config) => {
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
