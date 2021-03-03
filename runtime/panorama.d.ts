declare class Panel {
    readonly paneltype: string;
    visible: boolean;
    style: Record<string, string>;

    AddClass(image: string): void;
    RemoveClass(image: string): void;
    BHasClass(className: string): boolean;

    GetParent(): Panel;
    SetParent(parent: Panel): void;
    DeleteAsync(delay: number): void;
    RemoveAndDeleteChildren(): void;
    GetChildIndex(child: Panel): number;
    GetChildCount(): number;
    GetChild(index: number): Panel;
    MoveChildBefore(child: Panel, before: Panel): void;
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
    static DispatchEvent(event: string): void;
    static RegisterForUnhandledEvent(
        eventName: string,
        functionHandle: () => void,
    ): void;
    static RegisterEventHandler(
        eventName: string,
        panel: Panel,
        functionHandle: () => void,
    ): void;
    static UnregisterEventHandler(
        eventName: string,
        panel: Panel,
        functionHandle: () => void,
    ): void;
    static UnregisterForUnhandledEvent(
        eventName: string,
        functionHandle: () => void,
    ): void;
    static GetContextPanel(): Panel;
    static CreatePanel(type: string, parent: Panel, id: string): Panel;
    static Schedule(delay: number, func: () => void): void;
    static CancelScheduled(func: () => void): void;

    static DefineEvent(): any;
    static DefinePanelEvent(): any;
    static DispatchEventAsync(): any;
    static FindChildInContext(): any;
    static AsyncWebRequest(): any;
    static Localize(): any;
    static Language(): any;
    static RegisterKeyBind(): any;
    static Each(): any;
    static DbgIsReloadingScript(): any;
    static UrlEncode(): any;
    static UrlDecode(): any;
    static HTMLEscape(): any;
}

declare class GameInterfaceAPI {
    static SetSettingString(settingName: any, value: any): any;
    static ConsoleCommand(command: any): any;

    static GetSettingString(): any;
}

declare class UiToolkitAPI {
    static ShowCustomLayoutPopup(popupId: any, layoutFile: any): any;
    static ShowGenericPopupTwoOptionsBgStyle(
        title: any,
        message: any,
        style: any,
        option1Name: any,
        option1Function: any,
        option2Name: any,
        option2Function: any,
        bgStyle: any,
    ): any;

    static ShowGenericPopup(): any;
    static ShowGenericPopupOk(): any;
    static ShowGenericPopupCancel(): any;
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
    static CloseAllVisiblePopups(): any;
    static ShowGlobalCustomLayoutPopup(): any;
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
    static RegisterJSCallback(): any;
    static InvokeJSCallback(): any;
    static UnregisterJSCallback(): any;
    static GetGlobalObject(): any;
    static RegisterPanel2d(): any;
    static ProfilingScopeBegin(): any;
    static ProfilingScopeEnd(): any;
    static AddDenyAllInputToGame(): any;
    static ReleaseDenyAllInputToGame(): any;
    static AddDenyMouseInputToGame(): any;
    static ReleaseDenyMouseInputToGame(): any;
    static MakeStringSafe(): any;
    static IsPanoramaInECOMode(): any;
}
