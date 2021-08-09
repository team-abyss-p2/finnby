declare class Panel {
    activationenabled: boolean;
    readonly actuallayoutheight: number;
    readonly actuallayoutwidth: number;
    readonly actualuiscale_x: number;
    readonly actualuiscale_y: number;
    readonly actualxoffset: number;
    readonly actualyoffset: number;
    checked: boolean;
    readonly contentheight: number;
    readonly contentwidth: number;
    defaultfocus: string;
    readonly desiredlayoutheight: number;
    readonly desiredlayoutwidth: number;
    enabled: boolean;
    hittest: boolean;
    hittestchildren: boolean;
    readonly id: string;
    inputnamespace: string;
    readonly layoutfile: string;
    readonly paneltype: string;
    rememberchildfocus: boolean;
    readonly scrolloffset_x: number;
    readonly scrolloffset_y: number;
    selectionpos_x: number;
    selectionpos_y: number;
    readonly style: Record<string, string | number>;
    tabindex: number;
    visible: boolean;

    AddClass(className: string): void;
    ApplyStyles(_: boolean): void;
    AcceptsFocus(): boolean;
    AcceptsInput(): boolean;
    AscendantHasClass(className: string): boolean;
    CanSeeInParentScroll(): boolean;
    CreateChildren(_: string): boolean;
    HasClass(className: string): boolean;
    HasDescendantKeyFocus(): boolean;
    HasHoverStyle(): boolean;
    HasKeyFocus(): boolean;
    HasLayoutSnippet(_: string): boolean;
    IsTransparent(): boolean;
    LoadLayout(_: string, _: boolean, _: boolean): boolean;
    LoadLayoutFromString(...args: any[]): void;
    LoadLayoutSnippet(_: string): boolean;
    ReadyForDisplay(): boolean;
    ScrollParentToFitWhenFocused(): boolean;
    Children(): unknown;
    ClearPanelEvent(_: string): void;
    ClearPropertyFromCode(_: unknown): void;
    CreateCopyOfCSSKeyframes(_: string): unknown;
    Data(...args: any[]): void;
    DeleteAsync(delay: number): void;
    DeleteKeyframes(_: unknown): void;
    FindChild(_: string): Panel;
    FindChildInLayoutFile(_: string): Panel;
    FindChildrenWithClassTraverse(className: string): unknown;
    FindChildTraverse(_: string): Panel;
    GetAttributeInt(attribute: string, defaultValue: number): number;
    GetAttributeString(attribute: string, defaultValue: string): string;
    GetAttributeUInt32(attribute: string, defaultValue: number): number;
    GetChild(index: number): Panel;
    GetChildCount(): number;
    GetChildIndex(child: Panel): number;
    GetLayoutFileDefine(_: string): string;
    GetParent(): Panel;
    GetPositionWithinWindow(): unknown;
    IsDraggable(): boolean;
    IsSelected(): boolean;
    IsSizeValid(): boolean;
    LoadLayoutAsync(_: string, _: boolean, _: boolean): void;
    LoadLayoutFromStringAsync(_: string, _: boolean, _: boolean): void;
    MoveChildAfter(child: Panel, after: Panel): void;
    MoveChildBefore(child: Panel, before: Panel): void;

    RegisterForReadyEvents(_: boolean): void;
    RemoveAndDeleteChildren(): void;
    RemoveClass(className: string): void;
    ScrollParentToMakePanelFit(child: Panel, _: boolean): void;
    ScrollToBottom(): void;
    ScrollToFitRegion(
        _: number,
        _: number,
        _: number,
        _: number,
        _: unknown,
        _: boolean,
        _: boolean,
    ): void;
    ScrollToLeftEdge(): void;
    ScrollToRightEdge(): void;
    ScrollToTop(): void;
    SetAcceptsFocus(acceptsFocus: boolean): void;
    SetAttributeInt(attribute: string, value: number): void;
    SetAttributeString(attribute: string, value: string): void;
    SetAttributeUInt32(attribute: string, value: number): void;
    SetDialogVariable(variable: string, value: any): void;
    SetDialogVariableInt(variable: string, value: number): void;
    SetDialogVariableTime(variable: string, value: number): void;
    SetDisableFocusOnMouseDown(_: boolean): void;
    SetDraggable(draggable: boolean): void;
    SetFocus(): boolean;
    SetHasClass(className: string, hasClass: boolean): void;
    SetInputNamespace(inputNamespace: string): void;
    SetPanelEvent(...args: any[]): void;
    SetParent(parent: Panel): void;
    SetReadyForDisplay(readyForDisplay: boolean): void;
    SetScrollParentToFitWhenFocused(
        scrollParentToFitWhenFocused: boolean,
    ): void;
    SetTopOfInputContext(topOfInputContext: boolean): void;
    SwitchClass(oldClass: string, newClass: string): void;
    ToggleClass(className: string): void;
    TriggerClass(className: string): void;
    UpdateCurrentAnimationKeyframes(_: unknown): void;
    UpdateFocusInContext(): boolean;
}

declare class LabelPanel extends Panel {
    html: boolean;
    text: string;

    SetLocalizationString(loc: string): void;
    SetProceduralTextThatIPromiseIsLocalizedAndEscaped(
        text: string,
        _: boolean,
    ): void;
}

type ImageScaling =
    | "none"
    | "stretch"
    | "stretchx"
    | "stretchy"
    | "stretch-to-fit-preserve-aspect"
    | "stretch-to-fit-x-preserve-aspect"
    | "stretch-to-fit-y-preserve-aspect"
    | "stretch-to-cover-preserve-aspect";

declare class ImagePanel extends Panel {
    SetImage(image: string): void;
    SetScaling(image: Panorama.ImageScaling): void;
}

declare class ProgressBarPanel extends Panel {
    progress: number;
}

declare function panorama(query: string): Panel;

declare namespace panorama {
    function Msg(...args: any[]): void;
    function DispatchEvent(event: string, ...args: any[]): void;
    function RegisterForUnhandledEvent(
        eventName: string,
        functionHandle: (...args: any[]) => void,
    ): void;
    function RegisterEventHandler(
        eventName: string,
        panel: Panel,
        functionHandle: (...args: any[]) => void,
    ): void;
    function UnregisterEventHandler(
        eventName: string,
        panel: Panel,
        functionHandle: (...args: any[]) => void,
    ): void;
    function UnregisterForUnhandledEvent(
        eventName: string,
        functionHandle: (...args: any[]) => void,
    ): void;
    function GetContextPanel(): Panel;
    function CreatePanel(type: string, parent: Panel, id: string): Panel;
    function Schedule(delay: number, func: () => void): void;
    function CancelScheduled(func: () => void): void;
    function DefineEvent(
        event: string,
        argsCount: number,
        argsDoc: string,
        eventDoc: string,
    ): void;
    function FindChildInContext(query: string): Panel;
    function Localize(key: string): string;
    function RegisterKeyBind(panel: Panel, keys: string, cb: () => void): void;
    function UrlEncode(input: string): string;
    function UrlDecode(input: string): string;
    function HTMLEscape(input: string): string;

    function DefinePanelEvent(): any;
    function DispatchEventAsync(): any;
    function AsyncWebRequest(): any;
    function Language(): any;
    function Each(): any;
    function DbgIsReloadingScript(): any;
}

declare const $: typeof panorama;

declare namespace GameInterfaceAPI {
    function GetSettingString(settingName: string): string;
    function SetSettingString(settingName: string, value: string): void;
    function ConsoleCommand(command: string): void;
}

declare namespace UiToolkitAPI {
    function ShowCustomLayoutPopup(popupId: string, layoutFile: string): void;
    function ShowGenericPopupTwoOptionsBgStyle(
        title: string,
        message: string,
        style: string,
        option1Name: string,
        option1Function: () => void,
        option2Name: string,
        option2Function: () => void,
        bgStyle: string,
    ): void;
    function AddDenyAllInputToGame(
        panel: Panel,
        debugContextName: string,
        whatInput: string,
    ): number;
    function ReleaseDenyAllInputToGame(handle: number): void;
    function AddDenyMouseInputToGame(
        panel: Panel,
        debugContextName: string,
        whatInput: string,
    ): number;
    function ReleaseDenyMouseInputToGame(handle: number): void;
    function ShowGenericPopup(
        title: string,
        message: string,
        style: string,
    ): void;
    function ShowGlobalCustomLayoutPopup(id: string, layout: string): void;
    function CloseAllVisiblePopups(): void;
    function RegisterJSCallback(cb: (...args: any[]) => any): number;
    function InvokeJSCallback(cb: number, ...args: any[]): any;
    function UnregisterJSCallback(cb: number): void;
    function ShowGenericPopupOk(
        title: string,
        message: string,
        style: string,
        ok: () => void,
        cancel: () => void,
    ): void;
    function ShowGenericPopupCancel(
        title: string,
        message: string,
        style: string,
        cancel: () => void,
    ): void;
    function GetGlobalObject(): any;
    function RegisterPanel2d(panel: string, layout: string): void;
    function ProfilingScopeBegin(scope: string): void;
    function ProfilingScopeEnd(): number;
    function MakeStringSafe(input: string): string;
    function IsPanoramaInECOMode(): bool;
    function ShowGlobalCustomLayoutPopupParameters(
        name: string,
        layout: string,
        args: string,
    ): void;

    function ShowGenericPopupYesNo(): any;
    function ShowGenericPopupOkCancel(): any;
    function ShowGenericPopupYesNoCancel(): any;
    function ShowGenericPopupOneOption(): any;
    function ShowGenericPopupTwoOptions(): any;
    function ShowGenericPopupThreeOptions(): any;
    function ShowGenericPopupBgStyle(): any;
    function ShowGenericPopupOkBgStyle(): any;
    function ShowGenericPopupCancelBgStyle(): any;
    function ShowGenericPopupYesNoBgStyle(): any;
    function ShowGenericPopupOkCancelBgStyle(): any;
    function ShowGenericPopupYesNoCancelBgStyle(): any;
    function ShowGenericPopupOneOptionBgStyle(): any;
    function ShowGenericPopupThreeOptionsBgStyle(): any;
    function ShowCustomLayoutPopupParameters(): any;
    function ShowTextTooltip(): any;
    function ShowTextTooltipOnPanel(): any;
    function ShowTextTooltipStyled(): any;
    function ShowTextTooltipOnPanelStyled(): any;
    function HideTextTooltip(): any;
    function ShowTitleTextTooltip(): any;
    function ShowTitleTextTooltipStyled(): any;
    function HideTitleTextTooltip(): any;
    function ShowTitleImageTextTooltip(): any;
    function ShowTitleImageTextTooltipStyled(): any;
    function HideTitleImageTextTooltip(): any;
    function ShowCustomLayoutParametersTooltip(): any;
    function ShowCustomLayoutParametersTooltipStyled(): any;
    function ShowCustomLayoutTooltip(): any;
    function ShowCustomLayoutTooltipStyled(): any;
    function HideCustomLayoutTooltip(): any;
    function ShowSimpleContextMenu(): any;
    function ShowSimpleContextMenuWithDismissEvent(): any;
    function ShowCustomLayoutContextMenu(): any;
    function ShowCustomLayoutContextMenuParameters(): any;
    function ShowCustomLayoutContextMenuParametersDismissEvent(): any;
}
