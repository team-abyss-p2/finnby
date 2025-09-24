import Reconciler, { Fiber } from "react-reconciler";

type Type = string;
export type Props = Record<string, any>;
type Container = Panel;
type Instance = Panel;
type TextInstance = never;
type SuspenseInstance = never;
type HydratableInstance = Panel;
type PublicInstance = Panel;
type HostContext = unknown;
type UpdatePayload = [string, any][];
type ChildSet = never;
type TimeoutHandle = number;
type NoTimeout = -1;

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
                        instance.AddClass(name);
                    } else {
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
                console.error(
                    `Invalid value for event ${event}: ${typeof value}`,
                );
            }
            continue;
        }

        // @ts-expect-error shorthand
        instance[key] = value;
    }
}

/**
 * Special flag used as "previous props" when computing the updates to be applied to an hydrating instance
 */
const HYDRATION = Symbol("hydration");

/**
 * Checks whether the styles object has changed between the previous and the next version
 * @param oldStyle the previous version of the styles object
 * @param newStyle the next version of the styles
 * @returns true if the styles differ, false otherwise
 */
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

type ClassDiff = [string, boolean][];

/**
 * Compute the difference between two class strings, tokenized on white spaces
 * @param oldClass the previous class string
 * @param newClass the next class string
 * @returns a list of classes to be added or removed
 */
function computeClassDiff(oldClass: string, newClass: string) {
    const prevList = new Set(oldClass ? oldClass.split(/\s+/) : []);
    const nextList = new Set(newClass ? newClass.split(/\s+/) : []);

    const classes: ClassDiff = [];

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

type PrevProps = Props | typeof HYDRATION;

function computeDiff(oldProps: PrevProps, newProps: Props): UpdatePayload {
    const result: UpdatePayload = [];
    const active = new Set();

    for (const [key, value] of Object.entries(newProps)) {
        active.add(key);

        // When hydrating we're only interested in attaching event handlers, at the
        // moment no consistency check is performed between the hydrating instance
        // and the initial props, and all non-event handler props are simply skipped
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
                console.error("Changing a panel's id is not supported");
                continue;
            }

            // When the event handler function has changed, two diff
            // event are emitted: the first to detach the previous handler
            // and the second to attach the next one
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

    // If the instance is not being hydrated, handle removal of props
    // that are not longer present in newProps
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
    "ColorPicker",
    "GlobalPopups",
    "IntroMovie",
    "HudAutoDisconnect",
    "HudChat",
    "HudDamageIndicator",
    "HudDeathNotice",
    "HudDemoPlayback",
    "HudHealthArmor",
    "HudHintText",
    "HudRadio",
    "CSGOHudSpecPlayer",
    "CSGOHudSpectator",
    "HudStaticMenu",
    "HudVote",
    "PerfTestsCppItem",
    "PerfTestsCpp",
    "PanelTest1",
    "PanelTest2",
    "SettingsEnum",
    "SettingsEnumDropDown",
    "SettingsKeyBinder",
    "SettingsSlider",
    "SettingsToggle",
    "ColorDisplay",
    "DebugTextTooltip",
    "DebugLayout",
    "ProgressBar",
    "CircularProgressBar",
    "Slider",
    "ToggleButton",
    "RadioButton",
    "DelayLoadList",
    "DragZoom",
    "DropDown",
    "Label",
    "ScrollBar",
    "TextEntryIMEControls",
    "DebugLayout",
    "DebugPanelComputed",
    "PopupManager",
    "ContextMenuManager",
    "TooltipManager",
];

type OpaqueHandle = Fiber;

const FIBER_CACHE = new Map<Panel, OpaqueHandle>();
const PROPS_CACHE = new Map<Panel, Props>();

const CONFIG: Config = {
    supportsMutation: true,
    supportsPersistence: false,

    createInstance(type, props, rootContainer, hostContext, internalHandle) {
        const instance = $.CreatePanel(
            type,
            $.GetContextPanel(),
            (typeof props === "object" && props.id) || `react-${uniqueId++}`,
        );

        FIBER_CACHE.set(instance, internalHandle);
        PROPS_CACHE.set(instance, props);

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
    scheduleTimeout: setTimeout,
    cancelTimeout: clearTimeout,
    noTimeout: -1,

    isPrimaryRenderer: true,

    appendChild(parentInstance, child) {
        child.SetParent(parentInstance);
    },

    appendChildToContainer(container, child) {
        child.SetParent(container);
    },

    insertBefore(parentInstance, child, beforeChild) {
        child.SetParent(parentInstance);
        parentInstance.MoveChildBefore(child, beforeChild);
    },

    insertInContainerBefore(container, child, beforeChild) {
        child.SetParent(container);
        container.MoveChildBefore(child, beforeChild);
    },

    removeChild(parentInstance, child) {
        child.DeleteAsync(0); // SetParent(null);
    },

    removeChildFromContainer(container, child) {
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

    commitUpdate(instance, updatePayload, type, prevPros, nextProps) {
        if (Array.isArray(updatePayload)) {
            PROPS_CACHE.set(instance, nextProps);
            applyPropList(instance, updatePayload);
        } else {
            console.error(`Unexpected ${typeof updatePayload} in commitUpdate`);
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
        }

        return null;
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
        // console.log("commitHydratedContainer");
    },

    commitHydratedSuspenseInstance() {
        throw new Error("Not implemented commitHydratedSuspenseInstance");
    },

    didNotMatchHydratedContainerTextInstance() {
        console.error("didNotMatchHydratedContainerTextInstance");
    },

    didNotMatchHydratedTextInstance() {
        console.error("didNotMatchHydratedTextInstance");
    },

    didNotHydrateContainerInstance() {
        console.error("didNotHydrateContainerInstance");
    },

    didNotHydrateInstance(parentType, parentProps, parentInstance, instance) {
        console.error(`Unexpected ${instance.paneltype} in ${parentType}`);
    },

    didNotFindHydratableContainerInstance() {
        console.error("didNotFindHydratableContainerInstance");
    },

    didNotFindHydratableContainerTextInstance() {
        console.error("didNotFindHydratableContainerTextInstance");
    },

    didNotFindHydratableContainerSuspenseInstance() {
        console.error("didNotFindHydratableContainerSuspenseInstance");
    },

    didNotFindHydratableInstance() {
        console.error("didNotFindHydratableInstance");
    },

    didNotFindHydratableTextInstance() {
        console.error("didNotFindHydratableTextInstance");
    },

    didNotFindHydratableSuspenseInstance() {
        console.error("didNotFindHydratableSuspenseInstance");
    },
};

export const Renderer = Reconciler(CONFIG);

export function lookupNodeProps(instance: Instance): Props | undefined {
    return PROPS_CACHE.get(instance);
}

Renderer.injectIntoDevTools({
    // Always a production bundle
    bundleType: (process.env.NODE_ENV === 'production') ? 0 : 1,
    // Must be set to the same version as react to
    // enabled the correct features in the devtools
    version: "17.0.1",
    rendererPackageName: "finnby",
    findFiberByHostInstance(node) {
        return FIBER_CACHE.get(node) ?? null;
    },
});
