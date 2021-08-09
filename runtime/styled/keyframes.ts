type Keyframes = (
    strings: TemplateStringsArray,
    ...args: ReadonlyArray<number | string>
) => string;

export const keyframes: Keyframes = Object.assign(
    () => {
        throw new Error("Non-static keyframes are not supported by Panorama");
    },
    { static: (name: string) => name },
);
