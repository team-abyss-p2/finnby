import type { Styles } from "./stylesheet";

interface Css {
    (style: Styles): string;
    (strings: TemplateStringsArray, ...args: (number | string)[]): string;
}

export const css: Css = Object.assign(
    () => {
        throw new Error("Non-static css templates are not supported");
    },
    { static: (name: string) => name },
);
