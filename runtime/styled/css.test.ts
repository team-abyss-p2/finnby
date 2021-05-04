import { css, interleave } from "./css";

describe("css", () => {
    it("should return undefined on an empty style", () => {
        expect(css``).toBeUndefined();
        expect(css`\s`).toBeUndefined();
        expect(css`\n`).toBeUndefined();
        expect(css`\r\n`).toBeUndefined();
        expect(css`\t`).toBeUndefined();
    });

    it("should error when a function interpolation is used", () => {
        const interpolation = jest.fn();
        const wrapper = () => {
            css`
                color: ${interpolation};
            `;
        };

        expect(wrapper).toThrow();
        expect(interpolation).not.toHaveBeenCalled();
    });

    it("should cache equivalent styles", () => {
        const styleA = css`
            // style A
            color: white;
        `;

        const styleB = css`
            // style B
            color: white;
        `;

        expect(styleA).toBe(styleB);
    });

    it("should transform css property names", () => {
        const style = css`
            padding-top: 20px;
            background-color: white;
        `;

        expect(style).toMatchObject({
            paddingTop: "20px",
            backgroundColor: "white",
        });
    });
});

describe("interleave", () => {
    it("should interleave the parameters of a template string", () => {
        const strings = Object.assign(["a", "c", "e"], {
            raw: ["a", "c", "e"],
        });

        const result = interleave([strings, "b", 4]);
        expect(result).toEqual(["a", "b", "c", 4, "e"]);
    });

    it("should interleave the parameters of a template string with no tail", () => {
        const strings = Object.assign(["a", "c"], {
            raw: ["a", "c"],
        });

        const result = interleave([strings, "b", 4]);
        expect(result).toEqual(["a", "b", "c", 4]);
    });
});
