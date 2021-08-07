declare class Panel {
    readonly paneltype: string;
    visible: boolean;
    style: Record<string, string>;

    AddClass(image: string): void;
    RemoveClass(image: string): void;
    HasClass(className: string): boolean;

    GetParent(): Panel;
    SetParent(parent: Panel): void;
    DeleteAsync(delay: number): void;
    RemoveAndDeleteChildren(): void;
    GetChildIndex(child: Panel): number;
    GetChildCount(): number;
    GetChild(index: number): Panel;
    MoveChildBefore(child: Panel, before: Panel): void;

    GetAttributeInt(key: string, deflt: number): number;
    GetAttributeString(key: string, deflt: string): string;
    SetDialogVariable(key: string, value: any): void;
}

declare class LabelPanel extends Panel {
    text: string;
}

declare class ImagePanel extends Panel {
    SetImage(image: string): void;
    SetScaling(image: string): void;
}

declare class ProgressBarPanel extends Panel {
    progress: number;
}

declare class $ {
    static Msg(...args: any[]): void;
    static DispatchEvent(event: string, ...args: any[]): void;
    static RegisterForUnhandledEvent(
        eventName: string,
        functionHandle: (...args: any[]) => void,
    ): void;
    static RegisterEventHandler(
        eventName: string,
        panel: Panel,
        functionHandle: (...args: any[]) => void,
    ): void;
    static UnregisterEventHandler(
        eventName: string,
        panel: Panel,
        functionHandle: (...args: any[]) => void,
    ): void;
    static UnregisterForUnhandledEvent(
        eventName: string,
        functionHandle: (...args: any[]) => void,
    ): void;
    static GetContextPanel(): Panel;
    static CreatePanel(type: string, parent: Panel, id: string): Panel;
    static Schedule(delay: number, func: () => void): void;
    static CancelScheduled(func: () => void): void;
    static DefineEvent(
        event: string,
        argsCount: number,
        argsDoc: string,
        eventDoc: string,
    ): void;
    static FindChildInContext(query: string): Panel;
    static Localize(key: string): string;
    static RegisterKeyBind(panel: Panel, keys: string, cb: () => void): void;
    static UrlEncode(input: string): string;
    static UrlDecode(input: string): string;
    static HTMLEscape(input: string): string;

    static DefinePanelEvent(): any;
    static DispatchEventAsync(): any;
    static AsyncWebRequest(): any;
    static Language(): any;
    static Each(): any;
    static DbgIsReloadingScript(): any;
}

declare class GameInterfaceAPI {
    static GetSettingString(settingName: string): string;
    static SetSettingString(settingName: string, value: string): void;
    static ConsoleCommand(command: string): void;
}

declare class UiToolkitAPI {
    static ShowCustomLayoutPopup(popupId: string, layoutFile: string): void;
    static ShowGenericPopupTwoOptionsBgStyle(
        title: string,
        message: string,
        style: string,
        option1Name: string,
        option1Function: () => void,
        option2Name: string,
        option2Function: () => void,
        bgStyle: string,
    ): void;
    static AddDenyAllInputToGame(
        panel: Panel,
        debugContextName: string,
        whatInput: string,
    ): number;
    static ReleaseDenyAllInputToGame(handle: number): void;
    static AddDenyMouseInputToGame(
        panel: Panel,
        debugContextName: string,
        whatInput: string,
    ): number;
    static ReleaseDenyMouseInputToGame(handle: number): void;
    static ShowGenericPopup(
        title: string,
        message: string,
        style: string,
    ): void;
    static ShowGlobalCustomLayoutPopup(id: string, layout: string): void;
    static CloseAllVisiblePopups(): void;
    static RegisterJSCallback(cb: (...args: any[]) => any): number;
    static InvokeJSCallback(cb: number, ...args: any[]): any;
    static UnregisterJSCallback(cb: number): void;
    static ShowGenericPopupOk(
        title: string,
        message: string,
        style: string,
        ok: () => void,
        cancel: () => void,
    ): void;
    static ShowGenericPopupCancel(
        title: string,
        message: string,
        style: string,
        cancel: () => void,
    ): void;
    static GetGlobalObject(): any;
    static RegisterPanel2d(panel: string, layout: string): void;
    static ProfilingScopeBegin(scope: string): void;
    static ProfilingScopeEnd(): number;
    static MakeStringSafe(input: string): string;
    static IsPanoramaInECOMode(): bool;

    static ShowGenericPopupYesNo(): any;
    static ShowGenericPopupOkCancel(): any;
    static ShowGenericPopupYesNoCancel(): any;
    static ShowGenericPopupOneOption(): any;
    static ShowGenericPopupTwoOptions(): any;
    static ShowGenericPopupThreeOptions(): any;
    static ShowGenericPopupBgStyle(): any;
    static ShowGenericPopupOkBgStyle(): any;
    static ShowGenericPopupCancelBgStyle(): any;
    static ShowGenericPopupYesNoBgStyle(): any;
    static ShowGenericPopupOkCancelBgStyle(): any;
    static ShowGenericPopupYesNoCancelBgStyle(): any;
    static ShowGenericPopupOneOptionBgStyle(): any;
    static ShowGenericPopupThreeOptionsBgStyle(): any;
    static ShowCustomLayoutPopupParameters(): any;
    static ShowGlobalCustomLayoutPopupParameters(): any;
    static ShowTextTooltip(): any;
    static ShowTextTooltipOnPanel(): any;
    static ShowTextTooltipStyled(): any;
    static ShowTextTooltipOnPanelStyled(): any;
    static HideTextTooltip(): any;
    static ShowTitleTextTooltip(): any;
    static ShowTitleTextTooltipStyled(): any;
    static HideTitleTextTooltip(): any;
    static ShowTitleImageTextTooltip(): any;
    static ShowTitleImageTextTooltipStyled(): any;
    static HideTitleImageTextTooltip(): any;
    static ShowCustomLayoutParametersTooltip(): any;
    static ShowCustomLayoutParametersTooltipStyled(): any;
    static ShowCustomLayoutTooltip(): any;
    static ShowCustomLayoutTooltipStyled(): any;
    static HideCustomLayoutTooltip(): any;
    static ShowSimpleContextMenu(): any;
    static ShowSimpleContextMenuWithDismissEvent(): any;
    static ShowCustomLayoutContextMenu(): any;
    static ShowCustomLayoutContextMenuParameters(): any;
    static ShowCustomLayoutContextMenuParametersDismissEvent(): any;
}
