import { getPropertyName } from "css-to-react-native";
import { flattenStyle, Styles } from "./stylesheet";

export type MaybeFactory<P, T> = T | ((props: P) => T);

export type StylesheetTemplate<P> = [
    TemplateStringsArray,
    ...MaybeFactory<P, string | number>[]
];

export function interleave<P>([
    strings,
    ...rest
]: StylesheetTemplate<P>): MaybeFactory<P, string | number>[] {
    const finalArray: MaybeFactory<P, string | number>[] = [strings[0]];
    for (let i = 0, len = rest.length; i < len; i++) {
        finalArray.push(rest[i]);
        if (strings[i + 1] !== undefined) {
            finalArray.push(strings[i + 1]);
        }
    }
    return finalArray;
}

let styles: Styles[];
const generated: Record<string, Styles | undefined> = {};
let buffer = "";

export type StylesheetObject<P> = MaybeFactory<P, Styles>;

export type Interpolation<P> =
    | MaybeFactory<P, string | number>
    | StylesheetObject<P>;

function handleInterpolation<P>(
    this: P,
    interpolation: Interpolation<P>,
    i: number,
    arr: Array<any>,
) {
    if (typeof interpolation === "function") {
        handleInterpolation.call(this, interpolation(this), i, arr);
        return;
    }

    if (typeof interpolation === "string") {
        // strip comments
        interpolation = interpolation.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
    }

    if (
        typeof interpolation === "string" ||
        typeof interpolation === "number"
    ) {
        buffer += interpolation;

        if (arr.length - 1 === i) {
            const converted = convertStyles(buffer);
            if (converted !== undefined) {
                styles.push(converted);
            }
            buffer = "";
        }
    }

    if (typeof interpolation === "object") {
        styles.push(interpolation);
    }
}

export function handleInterpolations<P>(
    props: P,
    vals: Interpolation<P>[],
): Styles | undefined {
    const prevBuffer = buffer;

    // these are declared earlier
    // this is done so we don't create a new
    // handleInterpolation function on every css call
    styles = [];
    buffer = "";

    try {
        vals.forEach(handleInterpolation, props);
    } finally {
        buffer = prevBuffer;
    }

    const hash = JSON.stringify(styles);

    if (!generated[hash]) {
        generated[hash] = flattenStyle(styles);
    }

    return generated[hash];
}

const propertyValuePattern = /\s*([^\s]+)\s*:\s*(.+?)\s*$/;

function convertPropertyValue(this: Styles, style: string) {
    // Get prop name and prop value
    const match = propertyValuePattern.exec(style);
    // match[2] will be " " in cases where there is no value
    // but there is whitespace, e.g. "color: "
    if (match !== null && match[2] !== " ") {
        this[getPropertyName(match[1])] = match[2];
    }
}

function convertStyles(str: string): Styles | undefined {
    if (str.trim() === "") return;
    const result: Styles = {};
    str.split(";").forEach(convertPropertyValue, result);
    return result;
}
