import { PluginObj, PluginPass, NodePath, types as t } from "@babel/core";

interface StyledState extends PluginPass {
    cssImport?: string;
    styledImport?: string;
}

export function styledPlugin(
    uid: string,
    styles: string[],
): PluginObj<StyledState> {
    return {
        visitor: {
            ImportDeclaration(path, state) {
                const source = path.get("source");
                if (source.node.value !== "@team-abyss-p2/finnby") {
                    return;
                }

                for (const specifier of path.get("specifiers")) {
                    if (!specifier.isImportSpecifier()) {
                        continue;
                    }

                    const imported = specifier.get("imported");
                    if (!imported.isIdentifier()) {
                        continue;
                    }

                    const local = specifier.get("local");
                    switch (imported.node.name) {
                        case "css":
                            state.cssImport = local.node.name;
                            continue;
                        case "styled":
                            state.styledImport = local.node.name;
                            continue;
                    }
                }
            },
            TaggedTemplateExpression(path, state) {
                const tag = path.get("tag");
                const quasi = path.get("quasi");

                const newNode = tryFoldConstantStyle(
                    uid,
                    styles,
                    state,
                    tag,
                    quasi,
                );

                if (!newNode) {
                    return;
                }

                path.replaceWith(newNode);
            },
            CallExpression(path, state) {
                const callee = path.get("callee");
                if (!callee.isExpression()) {
                    return;
                }

                const [style, ...args] = path.get("arguments");
                if (!style.isExpression()) {
                    return;
                }

                const newNode = tryFoldConstantStyle(
                    uid,
                    styles,
                    state,
                    callee,
                    style,
                    args.map((arg) => arg.node),
                );

                if (!newNode) {
                    return;
                }

                path.replaceWith(newNode);
            },
        },
    };
}

type Argument =
    | t.Expression
    | t.SpreadElement
    | t.JSXNamespacedName
    | t.ArgumentPlaceholder;

function tryFoldConstantStyle(
    uid: string,
    styles: string[],
    state: StyledState,
    expr: NodePath<t.Expression>,
    style: NodePath<t.Expression>,
    additionalArgs: Argument[] = [],
) {
    let styledProp: NodePath<t.Expression | t.PrivateName> | undefined;
    let styledArgs: NodePath<Argument>[] | undefined;

    if (expr.isMemberExpression()) {
        // styled.Panel() / styled.Panel``
        const object = expr.get("object");
        if (!object.isIdentifier()) {
            return;
        }
        if (object.node.name !== state.styledImport) {
            return;
        }

        styledProp = expr.get("property");
    } else if (expr.isCallExpression()) {
        // styled(Panel)() / styled(Panel)``
        const callee = expr.get("callee");
        if (!callee.isIdentifier()) {
            return;
        }
        if (callee.node.name !== state.styledImport) {
            return;
        }

        styledArgs = expr.get("arguments");
    } else if (expr.isIdentifier()) {
        // css() / css``
        if (expr.node.name !== state.cssImport) {
            return;
        }
    } else {
        return;
    }

    const code = style.evaluate();
    if (!code.confident) {
        return;
    }

    let newCallee: t.Expression;
    if (styledProp && state.styledImport) {
        newCallee = t.memberExpression(
            t.memberExpression(
                t.identifier(state.styledImport),
                t.identifier("static"),
            ),
            styledProp.node,
        );
    } else if (styledArgs && state.styledImport) {
        newCallee = t.callExpression(
            t.memberExpression(
                t.identifier(state.styledImport),
                t.identifier("static"),
            ),
            styledArgs.map((arg) => arg.node),
        );
    } else if (state.cssImport) {
        newCallee = t.memberExpression(
            t.identifier(state.cssImport),
            t.identifier("static"),
        );
    } else {
        return;
    }

    const className = `_${uid}_${styles.length}`;

    if (typeof code.value === "string") {
        styles.push(`.${className}{${code.value}}`);
    } else {
        throw new Error("Not implemented");
    }

    return t.callExpression(newCallee, [
        t.stringLiteral(className),
        ...additionalArgs,
    ]);
}
