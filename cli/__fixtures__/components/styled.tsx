import React from "react";
// @ts-expect-error self-import is not resolved
import { styled, Label } from "@team-abyss-p2/finnby";

const StyledPanel = styled.Panel`
    background-color: red;
`;

const StyledButton = styled.Button({
    backgroundColor: "white",
});

const StyledLabel = styled(Label, {})`
    color: blue;
`;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function UserComponent() {
    return (
        <StyledPanel class="otherClass">
            <StyledButton>
                <StyledLabel style={{ paddingTop: "12px" }} />
            </StyledButton>
        </StyledPanel>
    );
}
