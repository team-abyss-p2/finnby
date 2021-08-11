import { PluginObj, PluginPass, NodePath, types as t } from "@babel/core";
import type { Binding } from "@babel/traverse";

interface StyledConfig {
    uid: string;
    styles: string[];
}

interface StyledState extends PluginPass {
    keyframesImport?: string;
    styledImport?: string;
    cssImport?: string;
}

export function styledPlugin(config: StyledConfig): PluginObj<StyledState> {
    return {
        visitor: {
            Program: {
                exit(program, state) {
                    if (state.keyframesImport) {
                        removeUnusedImport(program, state.keyframesImport);
                    }

                    if (state.cssImport) {
                        removeUnusedImport(program, state.cssImport);
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
                        case "css":
                            state.cssImport = local.node.name;
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

function removeUnusedImport(program: NodePath<t.Program>, importName: string) {
    const binding = program.scope.getBinding(importName);
    if (!binding) {
        return;
    }

    const hasReferences = binding.referencePaths.some(isAlive);
    if (!hasReferences) {
        binding.path.remove();
    }
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
    let isCss = false;

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
        if (styledProp.isIdentifier() && styledProp.node.name === "static") {
            return;
        }
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
            // css() / css``
            case state.cssImport:
                isCss = true;
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
    let styledType: StyledType | undefined;

    if (styledProp && state.styledImport) {
        newCallee = t.memberExpression(
            t.memberExpression(
                t.identifier(state.styledImport),
                t.identifier("static"),
            ),
            styledProp.node,
        );
    } else if (styledArgs && state.styledImport) {
        if (styledArgs.length >= 1 && styledArgs[0].isExpression()) {
            styledType = findStyledType(state, styledArgs[0]);
        }

        if (styledType) {
            const [, ...rest] = styledArgs;
            newCallee = t.callExpression(
                t.memberExpression(
                    t.identifier(state.styledImport),
                    t.identifier("static"),
                ),
                [styledType[0], ...rest.map((arg) => arg.node)],
            );
        } else {
            newCallee = t.callExpression(
                t.memberExpression(
                    t.identifier(state.styledImport),
                    t.identifier("static"),
                ),
                styledArgs.map((arg) => arg.node),
            );
        }
    } else if (isKeyframes && state.keyframesImport) {
        newCallee = t.memberExpression(
            t.identifier(state.keyframesImport),
            t.identifier("static"),
        );
    } else if (isCss && state.cssImport) {
        newCallee = t.memberExpression(
            t.identifier(state.cssImport),
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
        // @ts-expect-error missing types
        binding?.setValue(className);
        return t.stringLiteral(className);
    }

    let cssCode = stringifyCss(code.value);
    if (styledType && styledType[1]) {
        cssCode = `@extend .${styledType[1]};${cssCode}`;
    }

    styles.push(`.${className}{${cssCode}}`);
    // @ts-expect-error missing types
    binding?.setValue(`.${className}`);

    if (isCss) {
        return t.stringLiteral(className);
    }

    return t.callExpression(newCallee, [
        t.stringLiteral(className),
        ...additionalArgs,
    ]);
}

type StyledType = [t.Expression, string | undefined];

function findStyledType(
    state: StyledState,
    path: NodePath<t.Expression>,
): StyledType | undefined {
    let binding: Binding | undefined;
    let panelType: t.Expression | undefined;

    if (path.isIdentifier()) {
        binding = path.scope.getBinding(path.node.name);
    } else if (path.isCallExpression()) {
        // match <identifier>.withComponent(<identifier | string>)
        const callee = path.get("callee");
        if (!callee.isMemberExpression()) {
            return;
        }

        const object = callee.get("object");
        if (!object.isIdentifier()) {
            return;
        }

        const property = callee.get("property");
        if (
            !property.isIdentifier() ||
            property.node.name !== "withComponent"
        ) {
            return;
        }

        const args = path.get("arguments");
        if (args.length !== 1) {
            return;
        }

        if (args[0].isIdentifier()) {
            const inner = findStyledType(state, args[0]);
            if (!inner) {
                return;
            }

            panelType = inner[0];
        } else if (args[0].isStringLiteral()) {
            panelType = args[0].node;
        } else {
            return;
        }

        binding = path.scope.getBinding(object.node.name);
    }

    if (!binding) {
        return;
    }

    if (binding.path.isImportSpecifier()) {
        const { parentPath } = binding.path;
        if (!parentPath || !parentPath.isImportDeclaration()) {
            return;
        }

        const source = parentPath.get("source");
        if (source.node.value !== "@team-abyss-p2/finnby") {
            return;
        }

        const local = binding.path.get("local");
        return [local.node, undefined];
    }

    if (!binding.path.isVariableDeclarator()) {
        return;
    }

    const init = binding.path.get("init");
    if (!init.isCallExpression()) {
        return;
    }

    const args = init.get("arguments");
    if (args.length !== 1) {
        return;
    }

    const [className] = args;
    if (!className.isStringLiteral()) {
        return;
    }

    const callee = init.get("callee");

    // recognize expressions matching `styled.static.<identifier>("<className>")`
    if (callee.isMemberExpression()) {
        const object = callee.get("object");
        if (!isStyledStatic(state, object)) {
            return;
        }

        const property = callee.get("property");
        if (!property.isIdentifier()) {
            return;
        }

        if (!panelType) {
            panelType = t.stringLiteral(property.node.name);
        }
    }

    // recognize expressions matching `styled.static(<expression>)("<className>")`
    if (callee.isCallExpression()) {
        const calleeInner = callee.get("callee");
        if (!isStyledStatic(state, calleeInner)) {
            return;
        }

        const argsInner = callee.get("arguments");
        if (argsInner.length === 0 || !argsInner[0].isExpression()) {
            return;
        }

        const inner = findStyledType(state, argsInner[0]);
        if (!inner) {
            return;
        }

        if (!panelType) {
            panelType = inner[0];
        }
    }

    if (!panelType) {
        return;
    }

    return [panelType, className.node.value];
}

function isStyledStatic(state: StyledState, path: NodePath<any>) {
    if (!path.isMemberExpression()) {
        return false;
    }

    const object = path.get("object");
    if (!object.isIdentifier() || object.node.name !== state.styledImport) {
        return false;
    }

    const property = path.get("property");
    if (!property.isIdentifier() || property.node.name !== "static") {
        return false;
    }

    return true;
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
