import { handleInterpolations, interleave } from "./interpolation";

function createTemplateString(strings: string[]): TemplateStringsArray {
    return Object.assign(strings, { raw: strings });
}

describe("handleInterpolations", () => {
    it("should return undefined on an empty style", () => {
        expect(handleInterpolations({}, [""])).toBeUndefined();
        expect(handleInterpolations({}, ["s"])).toBeUndefined();
        expect(handleInterpolations({}, ["\n"])).toBeUndefined();
        expect(handleInterpolations({}, ["\r\n"])).toBeUndefined();
        expect(handleInterpolations({}, ["\t"])).toBeUndefined();
    });

    it("should cache equivalent styles", () => {
        const styleA = handleInterpolations({}, [
            `
                // style A
                color: white;
            `,
        ]);

        const styleB = handleInterpolations({}, [
            `
                // style B
                color: white;
            `,
        ]);

        expect(styleA).toBe(styleB);
    });

    it("should transform css property names", () => {
        const style = handleInterpolations({}, [
            `
                padding-top: 20px;
                background-color: white;
            `,
        ]);

        expect(style).toMatchObject({
            paddingTop: "20px",
            backgroundColor: "white",
        });
    });
});

describe("interleave", () => {
    it("should interleave the parameters of a template string", () => {
        const result = interleave([
            createTemplateString(["a", "c", "e"]),
            "b",
            4,
        ]);

        expect(result).toEqual(["a", "b", "c", 4, "e"]);
    });

    it("should interleave the parameters of a template string with no tail", () => {
        const result = interleave([createTemplateString(["a", "c"]), "b", 4]);

        expect(result).toEqual(["a", "b", "c", 4]);
    });
});
