import Reconciler from "react-reconciler";

type Type = string;
type Props = Record<string, any> | typeof HYDRATION;
type Container = Panel;
type Instance = Panel;
type TextInstance = never;
type SuspenseInstance = never;
type HydratableInstance = Panel;
type PublicInstance = Panel;
type HostContext = unknown;
type UpdatePayload = [string, any][];
type ChildSet = never;
type TimeoutHandle = () => void;
type NoTimeout = null;

type Config = Reconciler.HostConfig<
    Type,
    Props,
    Container,
    Instance,
    TextInstance,
    SuspenseInstance,
    HydratableInstance,
    PublicInstance,
    HostContext,
    UpdatePayload,
    ChildSet,
    TimeoutHandle,
    NoTimeout
>;

function applyPropList(instance: Instance, props: UpdatePayload) {
    for (const [key, value] of props) {
        if (key === "children") {
            continue;
        }

        if (key === "src") {
            (instance as ImagePanel).SetImage(value);
            continue;
        }
        if (key === "scaling") {
            (instance as ImagePanel).SetScaling(value);
            continue;
        }

        if (key === "style") {
            Object.assign(instance.style, value);
            continue;
        }

        if (key === "class") {
            if (typeof value === "string") {
                // Initial state
                for (const className of value.split(/\s+/)) {
                    instance.AddClass(className);
                }
            } else {
                // Diff
                for (const [name, isActive] of value) {
                    if (isActive) {
                        $.Msg(`AddClass "${name}"`);
                        instance.AddClass(name);
                    } else {
                        $.Msg(`RemoveClass "${name}"`);
                        instance.RemoveClass(name);
                    }
                }
            }
            continue;
        }

        if (key.startsWith("on")) {
            const event = key.substr(2);
            // Initial state
            if (typeof value === "function") {
                $.RegisterEventHandler(event, instance, value);
            } else if (Array.isArray(value)) {
                // Diff
                const [func, isActive] = value;
                if (isActive) {
                    $.RegisterEventHandler(event, instance, func);
                } else {
                    $.UnregisterEventHandler(event, instance, func);
                }
            } else {
                $.Msg("Invalid value for event " + event + ": " + typeof value);
            }
            continue;
        }

        // @ts-expect-error shorthand
        instance[key] = value;
    }
}

const HYDRATION = Symbol("hydration");

function computeStyleDiff(oldStyle: any, newStyle: any) {
    const activeStyles = new Set();

    for (const [key, inner] of Object.entries(newStyle)) {
        activeStyles.add(key);
        if (oldStyle[key] !== inner) {
            return true;
        }
    }

    for (const key of Object.keys(oldStyle)) {
        if (!activeStyles.has(key)) {
            return true;
        }
    }

    return false;
}

function computeClassDiff(oldClass: string, newClass: string) {
    const prevList = new Set(oldClass ? oldClass.split(/\s+/) : []);
    const nextList = new Set(newClass ? newClass.split(/\s+/) : []);

    const classes = [];

    for (const entry of nextList) {
        if (!prevList.has(entry)) {
            classes.push([entry, true]);
        }
    }

    for (const entry of prevList) {
        if (!nextList.has(entry)) {
            classes.push([entry, false]);
        }
    }

    return classes;
}

function computeDiff(oldProps: Props, newProps: Props): UpdatePayload {
    const result: UpdatePayload = [];
    const active = new Set();

    for (const [key, value] of Object.entries(newProps)) {
        active.add(key);

        if (oldProps === HYDRATION) {
            if (key.startsWith("on")) {
                result.push([key, [value, true]]);
            }
            continue;
        }

        const prevValue = oldProps[key];

        // For style, diff the inner object
        if (key === "style") {
            if (computeStyleDiff(prevValue, value)) {
                result.push([key, value]);
            }
            continue;
        }

        if (prevValue !== value) {
            if (key === "id") {
                $.Msg("Changing a panel's id is not supported");
                continue;
            }

            if (key.startsWith("on")) {
                result.push([key, [prevValue, false]]);
                result.push([key, [value, true]]);
                continue;
            }

            // For classes, diff per-token
            if (key === "class") {
                const classDiff = computeClassDiff(prevValue, value);
                if (classDiff.length > 0) {
                    result.push([key, classDiff]);
                }
                continue;
            }

            result.push([key, value]);
        }
    }

    if (oldProps !== HYDRATION) {
        for (const [key, value] of Object.entries(oldProps)) {
            if (!active.has(key)) {
                if (key.startsWith("on")) {
                    result.push([key, [value, false]]);
                    continue;
                }

                result.push([key, null]);
            }
        }
    }

    return result;
}

let uniqueId = 0;

// Those panels are treated as conceptual shadow roots,
// hydration behaves as if they have no children
const BLOCK_HYDRATION = [
    "ProgressBar",
    "ChaosPopupManager",
    "ContextMenuManager",
    "ChaosTooltipManager",
];

const CONFIG: Config = {
    supportsMutation: true,
    supportsPersistence: false,

    createInstance(type, props) {
        const instance = $.CreatePanel(
            type,
            $.GetContextPanel(),
            (typeof props === "object" && props.id) || `react-${uniqueId++}`,
        );

        applyPropList(instance, Object.entries(props));
        return instance;
    },

    createTextInstance() {
        throw new Error("Text nodes are not supported");
    },

    appendInitialChild(parentInstance, child) {
        child.SetParent(parentInstance);
    },

    finalizeInitialChildren() {
        return false;
    },

    prepareUpdate(instance, type, oldProps, newProps) {
        const diff = computeDiff(oldProps, newProps);
        return diff.length > 0 ? diff : null;
    },

    shouldSetTextContent(type) {
        return type === "Label";
    },

    getRootHostContext() {
        return null;
    },

    getChildHostContext(parentHostContext) {
        return parentHostContext;
    },

    getPublicInstance(instance) {
        return instance;
    },

    prepareForCommit() {
        return null;
    },

    resetAfterCommit() {
        // noop
    },

    preparePortalMount() {
        // noop
    },

    now: Date.now,
    scheduleTimeout(fn, delay) {
        $.Schedule(delay ?? 0, fn);
        return fn;
    },
    cancelTimeout(fn) {
        $.CancelScheduled(fn);
    },
    noTimeout: null,

    queueMicrotask(fn) {
        $.Schedule(0, fn);
    },

    isPrimaryRenderer: true,

    appendChild(parentInstance, child) {
        child.SetParent(parentInstance);
    },

    appendChildToContainer(container, child) {
        child.SetParent(container);
    },

    insertBefore(parentInstance, child, beforeChild) {
        $.Msg("insertBefore");
        child.SetParent(parentInstance);
        parentInstance.MoveChildBefore(child, beforeChild);
    },

    insertInContainerBefore(container, child, beforeChild) {
        $.Msg("insertInContainerBefore");
        child.SetParent(container);
        container.MoveChildBefore(child, beforeChild);
    },

    removeChild(parentInstance, child) {
        $.Msg("removeChild");
        child.DeleteAsync(0); // SetParent(null);
    },

    removeChildFromContainer(container, child) {
        $.Msg("removeChildFromContainer");
        child.DeleteAsync(0); // SetParent(null);
    },

    resetTextContent(instance) {
        (instance as LabelPanel).text = "";
    },

    commitTextUpdate(textInstance, oldText, newText) {
        // @ts-expect-error textInstance is never
        textInstance.text = newText;
    },

    commitMount() {
        // noop
    },

    commitUpdate(instance, updatePayload) {
        if (Array.isArray(updatePayload)) {
            applyPropList(instance, updatePayload);
        } else {
            $.Msg("Unexpected " + typeof updatePayload + " in commitUpdate");
        }
    },

    hideInstance(instance) {
        instance.visible = false;
        // TODO: Disable hittest ?
    },

    hideTextInstance(textInstance) {
        // @ts-expect-error textInstance is never
        textInstance.visible = false;
    },

    unhideInstance(instance) {
        instance.visible = true;
    },

    unhideTextInstance(textInstance) {
        // @ts-expect-error textInstance is never
        textInstance.visible = true;
    },

    clearContainer(container) {
        $.Msg("clearContainer");
        container.RemoveAndDeleteChildren();
    },

    supportsHydration: true,

    canHydrateInstance(instance) {
        return instance;
    },

    canHydrateTextInstance() {
        throw new Error("Not implemented canHydrateTextInstance");
    },

    canHydrateSuspenseInstance() {
        throw new Error("Not implemented canHydrateSuspenseInstance");
    },

    isSuspenseInstancePending() {
        throw new Error("Not implemented isSuspenseInstancePending");
    },

    isSuspenseInstanceFallback() {
        throw new Error("Not implemented isSuspenseInstanceFallback");
    },

    registerSuspenseInstanceRetry() {
        throw new Error("Not implemented registerSuspenseInstanceRetry");
    },

    getNextHydratableSibling(instance) {
        const parent = instance.GetParent();
        if (BLOCK_HYDRATION.includes(parent.paneltype)) {
            return null;
        }

        const index = parent.GetChildIndex(instance);
        if (index < parent.GetChildCount() - 1) {
            return parent.GetChild(index + 1);
        } else {
            return null;
        }
    },

    getFirstHydratableChild(parentInstance) {
        if (BLOCK_HYDRATION.includes(parentInstance.paneltype)) {
            return null;
        }

        if (!parentInstance.GetChildCount()) {
            return null;
        }

        return parentInstance.GetChild(0);
    },

    hydrateInstance(instance, type, props) {
        const diff = computeDiff(HYDRATION, props);
        return diff.length > 0 ? diff : null;
    },

    hydrateTextInstance() {
        throw new Error("Not implemented hydrateTextInstance");
    },

    hydrateSuspenseInstance() {
        throw new Error("Not implemented hydrateSuspenseInstance");
    },

    getNextHydratableInstanceAfterSuspenseInstance() {
        throw new Error(
            "Not implemented getNextHydratableInstanceAfterSuspenseInstance",
        );
    },

    getParentSuspenseInstance() {
        throw new Error("Not implemented getParentSuspenseInstance");
    },

    commitHydratedContainer() {
        // noop
    },

    commitHydratedSuspenseInstance() {
        throw new Error("Not implemented commitHydratedSuspenseInstance");
    },

    didNotMatchHydratedContainerTextInstance() {
        $.Msg("didNotMatchHydratedContainerTextInstance");
    },

    didNotMatchHydratedTextInstance() {
        $.Msg("didNotMatchHydratedTextInstance");
    },

    didNotHydrateContainerInstance() {
        $.Msg("didNotHydrateContainerInstance");
    },

    didNotHydrateInstance(parentType, parentProps, parentInstance, instance) {
        $.Msg("Unexpected " + instance.paneltype + " in " + parentType);
    },

    didNotFindHydratableContainerInstance() {
        $.Msg("didNotFindHydratableContainerInstance");
    },

    didNotFindHydratableContainerTextInstance() {
        $.Msg("didNotFindHydratableContainerTextInstance");
    },

    didNotFindHydratableContainerSuspenseInstance() {
        $.Msg("didNotFindHydratableContainerSuspenseInstance");
    },

    didNotFindHydratableInstance() {
        $.Msg("didNotFindHydratableInstance");
    },

    didNotFindHydratableTextInstance() {
        $.Msg("didNotFindHydratableTextInstance");
    },

    didNotFindHydratableSuspenseInstance() {
        $.Msg("didNotFindHydratableSuspenseInstance");
    },
};

export const Renderer = Reconciler(CONFIG);
