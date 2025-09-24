import { AcceptedPlugin } from "postcss";

// @ts-expect-error missing types
import advancedVariables from "postcss-advanced-variables";
// @ts-expect-error missing types
import atroot from "postcss-atroot";
// @ts-expect-error missing types
import extendRule from "postcss-extend-rule";
import nested from "postcss-nested";
import propertyLookup from "postcss-property-lookup";

export function defaultPostCssPlugins(): AcceptedPlugin[] {
    return [
        advancedVariables(),
        atroot(),
        extendRule(),
        nested(),
        propertyLookup(),
    ];
}
