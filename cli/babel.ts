import { PluginObj, PluginPass, NodePath, types as t } from "@babel/core";
import type { Binding } from "@babel/traverse";

interface StyledConfig {
    uid: string;
    styles: string[];
}

interface StyledState extends PluginPass {
    keyframesImport?: string;
    styledImport?: string;
}

function isAlive(path: NodePath): boolean {
    if (path.removed) {
        return false;
    }

    const { parentPath } = path;
    if (!parentPath) {
        return path.isProgram();
    }

    if (parentPath.node !== path.parent) {
        return false;
    }

    return isAlive(parentPath);
}

export function styledPlugin(config: StyledConfig): PluginObj<StyledState> {
    return {
        visitor: {
            Program: {
                exit(program, state) {
                    if (!state.keyframesImport) {
                        return;
                    }

                    const binding = program.scope.getBinding(
                        state.keyframesImport,
                    );

                    if (!binding) {
                        return;
                    }

                    const hasReferences = binding.referencePaths.some(isAlive);
                    if (!hasReferences) {
                        binding.path.remove();
                    }
                },
            },
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
                        case "keyframes":
                            state.keyframesImport = local.node.name;
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

                const binding = Object.values(path.scope.bindings).find(
                    (binding) => binding.path.isAncestor(path),
                );

                const newNode = tryFoldConstantStyle(config, state, {
                    binding,
                    expr: tag,
                    style: quasi,
                });

                if (!newNode) {
                    return;
                }

                path.replaceWith(newNode);
                path.addComment("leading", "#__PURE__");
            },
            CallExpression(path, state) {
                const callee = path.get("callee");
                if (!callee.isExpression()) {
                    return;
                }

                const [style, ...args] = path.get("arguments");
                if (!style || !style.isExpression()) {
                    return;
                }

                const binding = Object.values(path.scope.bindings).find(
                    (binding) => binding.path.isAncestor(path),
                );

                const newNode = tryFoldConstantStyle(config, state, {
                    binding,
                    expr: callee,
                    style,
                    additionalArgs: args.map((arg) => arg.node),
                });

                if (!newNode) {
                    return;
                }

                path.replaceWith(newNode);
                path.addComment("leading", "#__PURE__");
            },
        },
    };
}

type Argument =
    | t.Expression
    | t.SpreadElement
    | t.JSXNamespacedName
    | t.ArgumentPlaceholder;

interface StyledArgs {
    binding: Binding | undefined;
    expr: NodePath<t.Expression>;
    style: NodePath<t.Expression>;
    additionalArgs?: Argument[];
}

function tryFoldConstantStyle(
    config: StyledConfig,
    state: StyledState,
    args: StyledArgs,
) {
    const { uid, styles } = config;
    const { binding, expr, style, additionalArgs = [] } = args;

    let styledProp: NodePath<t.Expression | t.PrivateName> | undefined;
    let styledArgs: NodePath<Argument>[] | undefined;
    let isKeyframes = false;

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
        switch (expr.node.name) {
            // keyframes() / keyframes``
            case state.keyframesImport:
                isKeyframes = true;
                break;
            default:
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
    } else if (isKeyframes && state.keyframesImport) {
        newCallee = t.memberExpression(
            t.identifier(state.keyframesImport),
            t.identifier("static"),
        );
    } else {
        return;
    }

    const position = styles.length;
    let className = `${uid}_${position}`;

    if (binding) {
        const name = binding.identifier.name;
        className = `${className}_${name}`;
    }

    if (isKeyframes) {
        styles.push(`@keyframes ${className}{${stringifyCss(code.value)}}`);
        return t.stringLiteral(className);
    }

    styles.push(`.${className}{${stringifyCss(code.value)}}`);

    return t.callExpression(newCallee, [
        t.stringLiteral(className),
        ...additionalArgs,
    ]);
}

function stringifyCss(input: any) {
    if (typeof input == "string") {
        return input;
    }

    if (typeof input === "object" && input !== null) {
        let result = "";

        for (const [key, value] of Object.entries(input)) {
            result += `${kebabCase(key)}: ${value};`;
        }

        return result;
    }

    throw new Error("Not implemented");
}

function kebabCase(input: string) {
    let result = "";

    for (const char of input) {
        if (char.toUpperCase() === char) {
            result += `-${char.toLowerCase()}`;
        } else {
            result += char;
        }
    }

    return result;
}
