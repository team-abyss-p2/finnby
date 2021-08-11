import { keyframes } from "./keyframes";

describe("keyframes", () => {
    it("should throw when called directly", () => {
        const wrapper = () => {
            keyframes`template`;
        };

        expect(wrapper).toThrow();
    });

    it("should return a class name when using the internal static method", () => {
        // @ts-expect-error internal API
        const result = keyframes.static("name");
        expect(result).toBe("name");
    });
});
