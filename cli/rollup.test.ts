import { normalize } from "path";
import { OutputAsset, OutputChunk, rollup } from "rollup";

import { makeRollupConfig } from "./rollup";

interface RollupConfig<T> {
    input: string;
    hasRollup: boolean;
    hasPostCSS: boolean;
    chunks: T;
}

type RollupResult<T> = {
    [K in keyof T]?: OutputChunk | OutputAsset;
};

async function runRollup<T>(test: RollupConfig<T>): Promise<RollupResult<T>> {
    const componentsDir = "cli/__fixtures__/components";
    const outDir = "cli/__fixtures__/output";
    const postcss = jest.fn((config) => config);
    const rollupWrapper = jest.fn((config) => config);
    const path = test.input;

    const config = makeRollupConfig(
        {
            componentsDir,
            outDir,
            postcss,
            rollup: rollupWrapper,
        },
        path,
    );

    const build = await rollup(config);

    if (test.hasRollup) {
        expect(rollupWrapper).toHaveBeenCalled();
    } else {
        expect(rollupWrapper).not.toHaveBeenCalled();
    }

    if (test.hasPostCSS) {
        expect(postcss).toHaveBeenCalled();
    } else {
        expect(postcss).not.toHaveBeenCalled();
    }

    const { output } = await build.generate(config.output);

    const result: any = {};

    for (const [key, path] of Object.entries(test.chunks)) {
        result[key] = output.find(
            (chunk) => chunk.name && normalize(chunk.name) === normalize(path),
        );
    }

    return result;
}

describe("rollup", () => {
    /* eslint-disable @typescript-eslint/no-non-null-assertion*/

    it("should build simple components", async () => {
        const chunks = await runRollup({
            input: "component.tsx",
            hasRollup: true,
            hasPostCSS: false,
            chunks: {
                component: "component",
                layout: "layout/component.xml",
                stylesheet: "styles/finnby/component.css",
            },
        });

        expect(chunks.component).not.toBeUndefined();
        expect(chunks.layout).not.toBeUndefined();
        expect(chunks.stylesheet).toBeUndefined();

        expect(chunks.component!.type).toBe("chunk");
        expect(chunks.layout!.type).toBe("asset");

        expect((chunks.component as OutputChunk).code).toMatchSnapshot();
        expect((chunks.layout as OutputAsset).source).toMatchSnapshot();
    });

    it("should process stylesheet imports", async () => {
        const chunks = await runRollup({
            input: "stylesheet.tsx",
            hasRollup: true,
            hasPostCSS: true,
            chunks: {
                component: "stylesheet",
                layout: "layout/stylesheet.xml",
                stylesheet: "styles/finnby/stylesheet.css",
                userStyles: "styles/stylesheet.css",
            },
        });

        expect(chunks.component).not.toBeUndefined();
        expect(chunks.layout).not.toBeUndefined();
        expect(chunks.stylesheet).toBeUndefined();
        expect(chunks.userStyles).not.toBeUndefined();

        expect(chunks.component!.type).toBe("chunk");
        expect(chunks.layout!.type).toBe("asset");
        expect(chunks.userStyles!.type).toBe("asset");

        expect((chunks.component as OutputChunk).code).toMatchSnapshot();
        expect((chunks.layout as OutputAsset).source).toMatchSnapshot();
        expect((chunks.userStyles as OutputAsset).source).toMatchSnapshot();
    });

    it("should extract classes from styled components", async () => {
        const chunks = await runRollup({
            input: "styled.tsx",
            hasRollup: true,
            hasPostCSS: false,
            chunks: {
                component: "styled",
                layout: "layout/styled.xml",
                stylesheet: "styles/finnby/styled.css",
            },
        });

        expect(chunks.component).not.toBeUndefined();
        expect(chunks.layout).not.toBeUndefined();
        expect(chunks.stylesheet).not.toBeUndefined();

        expect(chunks.component!.type).toBe("chunk");
        expect(chunks.layout!.type).toBe("asset");
        expect(chunks.stylesheet!.type).toBe("asset");

        expect((chunks.component as OutputChunk).code).toMatchSnapshot();
        expect((chunks.layout as OutputAsset).source).toMatchSnapshot();
        expect((chunks.stylesheet as OutputAsset).source).toMatchSnapshot();
    });
});
