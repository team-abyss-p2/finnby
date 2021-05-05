import { join } from "path";
import { cosmiconfig } from "cosmiconfig";
import { RollupConfig } from "./rollup";
import { AcceptedPlugin } from "postcss";

export interface Config {
    // Base directory used to search for panel files
    componentsDir: string;
    // Output directory for the compiled panels
    outDir: string;
    // Customization hook to modify the list of
    // PostCSS plugins used to build the stylesheet files
    postcss(config: AcceptedPlugin[]): AcceptedPlugin[];
    // Customization hook to modify the Rollup configuration
    // used internally to build the panels
    rollup(config: RollupConfig): RollupConfig;
}

async function load(): Promise<Partial<Config>> {
    const explorer = cosmiconfig("finnby");

    try {
        const result = await explorer.search();
        if (result == null) {
            return {};
        }

        return typeof result.config === "object" ? result.config : {};
    } catch (err) {
        console.warn(err);
        return {};
    }
}

export async function loadConfig(): Promise<Config> {
    const config = await load();

    return {
        componentsDir: join(process.cwd(), "components"),
        outDir: join(process.cwd(), "code/panorama"),
        postcss: (plugins) => plugins,
        rollup: (config) => config,
        ...config,
    };
}
