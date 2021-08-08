/**
 * Extracted from @emotion/primitives-core,
 * with Finnby-specific styles handling
 */

import {
    ComponentType,
    createElement,
    ElementType,
    forwardRef,
    Ref,
} from "react";

import { flattenStyle } from "./stylesheet";
import {
    handleInterpolations,
    interleave,
    Interpolation,
    StylesheetObject,
    StylesheetTemplate,
} from "./css";

import * as Components from "../components";

interface StyledOptions {
    shouldForwardProp?(prop: string): boolean;
}

const defaultShouldForwardProp = (prop: string) => prop !== "as";

const getDisplayName = <P>(primitive: ElementType<P>) =>
    typeof primitive === "string"
        ? primitive
        : primitive.displayName || primitive.name || "Styled";

type Style<P> = StylesheetTemplate<P> | [StylesheetObject<P>];

function isTemplate<P>(styles: Style<P>): styles is StylesheetTemplate<P> {
    return styles[0] != null && "raw" in styles[0];
}

type Empty = Record<string, unknown>;

function isStyled<P>(
    component: ElementType<P>,
): component is StyledComponent<P> {
    if (typeof component === "string") {
        return false;
    }

    return "isStyled" in component && component["isStyled"] === true;
}

function createStyled<C = Empty>(
    component: ElementType<C>,
    options?: StyledOptions,
) {
    const shouldForwardProp =
        options?.shouldForwardProp ?? defaultShouldForwardProp;

    const shouldUseAs = !isStyled(component) && !shouldForwardProp("as");

    return function createStyledComponent<P = Empty>(...rawStyles: Style<P>) {
        let styles: Interpolation<P>[];
        if (isTemplate(rawStyles)) {
            styles = interleave(rawStyles);
        } else {
            styles = rawStyles;
        }

        type ExtractRef<T> = T extends { ref?: Ref<infer R> } ? R : never;
        const Styled = forwardRef<ExtractRef<C & P>, C & P>(
            (props: any, ref) => {
                const finalTag =
                    shouldUseAs && "as" in props ? props.as : component;

                const newProps: any = {};

                for (const key in props) {
                    if (key === "as" ? !shouldUseAs : shouldForwardProp(key)) {
                        newProps[key] = props[key];
                    }
                }

                newProps.ref = ref;
                newProps.style = flattenStyle([
                    handleInterpolations(props, styles),
                    props.style,
                ]);

                return createElement(finalTag, newProps);
            },
        );

        return Object.assign(Styled, {
            isStyled: true,
            displayName: `styled(${getDisplayName(component)})`,
            withComponent: (newComponent: ElementType<C>) =>
                createStyled(
                    isStyled(component)
                        ? component.withComponent(newComponent)
                        : newComponent,
                )(...rawStyles),
        });
    };
}

function createStatic<C = Empty>(
    component: ElementType<C>,
    options?: StyledOptions,
) {
    const shouldForwardProp =
        options?.shouldForwardProp ?? defaultShouldForwardProp;

    const shouldUseAs = !isStyled(component) && !shouldForwardProp("as");

    return function createStaticStyledComponent(className: string) {
        type ExtractRef<T> = T extends { ref?: Ref<infer R> } ? R : never;
        const Styled = forwardRef<ExtractRef<C>, C>((props: any, ref) => {
            const finalTag =
                shouldUseAs && "as" in props ? props.as : component;

            const newProps: any = {};

            for (const key in props) {
                if (key === "as" ? !shouldUseAs : shouldForwardProp(key)) {
                    newProps[key] = props[key];
                }
            }

            newProps.ref = ref;
            newProps.class = props.class
                ? `${props.class} ${className}`
                : className;

            return createElement(finalTag, newProps);
        });

        return Object.assign(Styled, {
            isStyled: true,
            displayName: `styled(${getDisplayName(component)})`,
            withComponent: (newComponent: ElementType<C>) =>
                createStatic(
                    isStyled(component)
                        ? component.withComponent(newComponent)
                        : newComponent,
                )(className),
        });
    };
}

const styledStatic = Object.entries(Components).reduce(
    (styledStatic: any, [name, component]) =>
        Object.defineProperty(styledStatic, name, {
            enumerable: true,
            configurable: true,
            get: () => styledStatic(component),
        }),
    createStatic,
);

type StyledComponent<P> = ComponentType<P & { as?: string }> & {
    withComponent: <C = Empty>(component: ElementType<C>) => StyledComponent<C>;
};

type StyledFactory<C> = <P = Empty>(
    ...styles: Style<P>
) => StyledComponent<C & P>;

type StyledBinds = {
    [K in keyof typeof Components]: StyledFactory<JSX.IntrinsicElements[K]>;
};

type Styled = typeof createStyled & StyledBinds;

const styled: Styled = Object.entries(Components).reduce(
    (styled: any, [name, component]) =>
        Object.defineProperty(styled, name, {
            enumerable: true,
            configurable: true,
            get: () => styled(component),
        }),
    Object.defineProperty(createStyled, "static", {
        enumerable: true,
        configurable: true,
        get: () => styledStatic,
    }),
);

export { css } from "./css";
export default styled;
