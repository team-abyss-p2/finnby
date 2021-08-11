// @ts-expect-error unresolved self import
import { css, styled } from "@team-abyss-p2/finnby";

const bgBlue = css`
    background-color: blue;
`;

const Component = styled.Panel`
    @extend ${bgBlue};
    color: red;
`;
