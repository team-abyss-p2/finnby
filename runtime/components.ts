export const Panel = "Panel";
export const Image = "Image";
export const Button = "Button";
export const Label = "Label";
export const TextEntry = "TextEntry";
export const DropDown = "DropDown";
export const ToggleButton = "ToggleButton";
export const RadioButton = "RadioButton";
export const ProgressBar = "ProgressBar";
export const BaseBlurTarget = "BaseBlurTarget";

export const ChaosMainMenu = "ChaosMainMenu";
export const ChaosPopupManager = "ChaosPopupManager";
export const ContextMenuManager = "ContextMenuManager";
export const ChaosTooltipManager = "ChaosTooltipManager";

declare namespace Panorama {
    export interface BaseProps {
        key?: string;
        children?: React.ReactNode;
    }

    export interface PanelProps<T = Panel> extends BaseProps {
        key?: string;
        ref?: React.Ref<T>;
        children?: React.ReactNode;

        id?: string;
        class?: string;
        hittest?: boolean;
        hittestchildren?: boolean;
        style?: Record<string, string | number>;
    }

    export type ImageScaling =
        | "none"
        | "stretch"
        | "stretchx"
        | "stretchy"
        | "stretch-to-fit-preserve-aspect"
        | "stretch-to-fit-x-preserve-aspect"
        | "stretch-to-fit-y-preserve-aspect"
        | "stretch-to-cover-preserve-aspect";

    export interface ImageProps extends PanelProps<ImagePanel> {
        src?: string;
        defaultsrc?: string;
        scaling?: ImageScaling;
    }

    export interface ButtonProps extends PanelProps {
        onActivated?(): void;
    }

    export interface LabelProps extends PanelProps<LabelPanel> {
        html?: boolean;
        text?: string;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface ProgressBarProps extends PanelProps<ProgressBarPanel> {}

    export interface ChaosMainMenuProps extends PanelProps {
        useglobalcontext?: boolean;
    }
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            Panel: Panorama.PanelProps;
            Image: Panorama.ImageProps;
            Button: Panorama.ButtonProps;
            Label: Panorama.LabelProps;
            TextEntry: Panorama.PanelProps;
            DropDown: Panorama.PanelProps;
            ToggleButton: Panorama.PanelProps;
            RadioButton: Panorama.PanelProps;
            ProgressBar: Panorama.ProgressBarProps;
            BaseBlurTarget: Panorama.PanelProps;

            ChaosMainMenu: Panorama.ChaosMainMenuProps;
            ChaosPopupManager: Panorama.PanelProps;
            ContextMenuManager: Panorama.PanelProps;
            ChaosTooltipManager: Panorama.PanelProps;

            root: Panorama.BaseProps;
            styles: Panorama.BaseProps;
            scripts: Panorama.BaseProps;
            include: {
                key?: string;
                src: string;
            };
            snippets: Panorama.BaseProps;
            snippet: Panorama.BaseProps & {
                name: string;
            };
        }
    }
}
