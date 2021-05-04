/**
 * Extracted from react-native StyleSheet
 */

export type Styles = Record<string, string | number>;
export type StyleProp = Styles | Styles[];

export function flattenStyle(style: StyleProp): Styles | undefined {
    if (style === null || typeof style !== "object") {
        return undefined;
    }

    if (!Array.isArray(style)) {
        return style;
    }

    let isNotEmpty = false;
    const result: Styles = {};

    for (let i = 0, styleLength = style.length; i < styleLength; ++i) {
        const computedStyle = flattenStyle(style[i]);
        if (computedStyle) {
            for (const key in computedStyle) {
                isNotEmpty = true;
                result[key] = computedStyle[key];
            }
        }
    }

    return isNotEmpty ? result : undefined;
}
