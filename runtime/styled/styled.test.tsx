import { styled } from "./styled";
import Renderer from "react-test-renderer";
import { Component, createRef } from "react";

describe("styled", () => {
    it("should render string styles", () => {
        const StyledPanel = styled.Panel`
            background-color: red;
        `;

        const renderer = Renderer.create(<StyledPanel />);

        expect(renderer.toJSON()).toMatchObject({
            type: "Panel",
            children: null,
            props: {
                style: {
                    backgroundColor: "red",
                },
            },
        });
    });

    it("should render object styles", () => {
        const StyledPanel = styled.Panel({
            backgroundColor: "red",
        });

        const renderer = Renderer.create(<StyledPanel />);

        expect(renderer.toJSON()).toMatchObject({
            type: "Panel",
            children: null,
            props: {
                style: {
                    backgroundColor: "red",
                },
            },
        });
    });

    it("should render interpolated styles", () => {
        const paddingTop = 10;
        const StyledPanel = styled.Panel`
            padding-top: ${paddingTop}px;
        `;

        const renderer = Renderer.create(<StyledPanel />);

        expect(renderer.toJSON()).toMatchObject({
            type: "Panel",
            children: null,
            props: {
                style: {
                    paddingTop: "10px",
                },
            },
        });
    });

    it("should render props styles in templates", () => {
        const StyledPanel = styled.Panel<{ shift: number }>`
            transform: translateX(${(props) => props.shift}px);
        `;

        const renderer = Renderer.create(<StyledPanel shift={25} />);

        expect(renderer.toJSON()).toMatchObject({
            type: "Panel",
            children: null,
            props: {
                shift: 25,
                style: {
                    transform: "translateX(25px)",
                },
            },
        });
    });

    it("should render props styles in functions", () => {
        const StyledPanel = styled.Panel((props: { shift: number }) => ({
            transform: `translateX(${props.shift}px)`,
        }));

        const renderer = Renderer.create(<StyledPanel shift={25} />);

        expect(renderer.toJSON()).toMatchObject({
            type: "Panel",
            children: null,
            props: {
                shift: 25,
                style: {
                    transform: "translateX(25px)",
                },
            },
        });
    });

    it("should replace the inner component using withComponent", () => {
        const StyledPanel = styled.Panel`
            color: red;
        `;

        const StyledLabel = StyledPanel.withComponent("Label");

        const renderer = Renderer.create(<StyledLabel />);

        expect(renderer.toJSON()).toMatchObject({
            type: "Label",
            children: null,
            props: {
                style: {
                    color: "red",
                },
            },
        });
    });

    it("should replace the inner component using as", () => {
        const StyledPanel = styled.Panel`
            color: red;
        `;

        const renderer = Renderer.create(<StyledPanel as="Label" />);

        expect(renderer.toJSON()).toMatchObject({
            type: "Label",
            children: null,
            props: {
                style: {
                    color: "red",
                },
            },
        });
    });

    it("should not forward blacklisted props", () => {
        const shouldForwardProp = jest.fn((key: string) => key !== "ignored");
        const StyledPanel = styled("Panel", { shouldForwardProp })`
            color: red;
        `;

        const renderer = Renderer.create(<StyledPanel ignored="ignored" />);

        expect(shouldForwardProp).toHaveBeenCalled();
        expect(renderer.toJSON()).toMatchObject({
            type: "Panel",
            children: null,
            props: {
                style: {
                    color: "red",
                },
            },
        });
    });

    it("should forward refs to the inner component", () => {
        const StyledPanel = styled.Panel`
            background-color: red;
        `;

        const ref = createRef<Panel>();
        const renderer = Renderer.create(<StyledPanel ref={ref} />, {
            createNodeMock(element) {
                return element.type;
            },
        });

        expect(renderer.toJSON()).toMatchObject({
            type: "Panel",
            children: null,
            props: {
                style: {
                    backgroundColor: "red",
                },
            },
        });

        expect(ref.current).toBe("Panel");

        renderer.unmount();

        expect(ref.current).toBeNull();
    });

    it("should wrap the display name of host components", () => {
        const StyledPanel = styled.Panel`
            background-color: red;
        `;

        expect(StyledPanel.displayName).toBe("styled(Panel)");
    });

    it("should wrap the display name of function components", () => {
        function UserComponent() {
            return null;
        }

        const StyledPanel = styled(UserComponent)`
            background-color: red;
        `;

        expect(StyledPanel.displayName).toBe("styled(UserComponent)");
    });

    it("should wrap the display name of class components", () => {
        class UserComponent extends Component {
            render() {
                return null;
            }
        }

        const StyledPanel = styled(UserComponent)`
            background-color: red;
        `;

        expect(StyledPanel.displayName).toBe("styled(UserComponent)");
    });

    it("should use a default display name for anonymous components", () => {
        function through<T>(value: T) {
            return value;
        }

        const UserComponent = through(() => null);

        const StyledPanel = styled(UserComponent)`
            background-color: red;
        `;

        expect(StyledPanel.displayName).toBe("styled(Styled)");
    });

    it("should render static styles as classes", () => {
        // @ts-expect-error static not part of the public API
        const StyledPanel = styled.static.Panel("staticClass");

        const renderer = Renderer.create(<StyledPanel />);

        expect(renderer.toJSON()).toMatchObject({
            type: "Panel",
            children: null,
            props: {
                class: "staticClass",
            },
        });
    });

    it("should render nested static and dynamic styles", () => {
        // @ts-expect-error static not part of the public API
        const PanelA = styled.static.Panel("class-a");

        // @ts-expect-error static not part of the public API
        const PanelB = styled.static(PanelA)("class-b");

        const PanelC = styled(PanelB)`
            color: red;
        `;

        const renderer = Renderer.create(<PanelC />);

        expect(renderer.toJSON()).toMatchObject({
            type: "Panel",
            children: null,
            props: {
                class: "class-b class-a",
                style: { color: "red" },
            },
        });
    });

    it("should forward the withComponent method to other styled components", () => {
        const PanelA = styled.Panel`
            color: red;
        `;

        const PanelB = styled(PanelA)`
            background-color: blue;
        `;

        // @ts-expect-error implicit prop type
        const PanelC = PanelB.withComponent("Image");

        const renderer = Renderer.create(<PanelC />);

        expect(renderer.toJSON()).toMatchObject({
            type: "Image",
            children: null,
            props: {
                style: { color: "red", backgroundColor: "blue" },
            },
        });
    });
    it("should forward the as prop to other styled components", () => {
        const PanelA = styled.Panel`
            color: red;
        `;

        const PanelB = styled(PanelA)`
            background-color: blue;
        `;

        const renderer = Renderer.create(<PanelB as="Image" />);

        expect(renderer.toJSON()).toMatchObject({
            type: "Image",
            children: null,
            props: {
                style: { color: "red", backgroundColor: "blue" },
            },
        });
    });
});
