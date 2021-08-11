/* eslint-disable */
// @ts-nocheck

import { css, styled } from "@team-abyss-p2/finnby";

const bgBlue = css`
    background-color: blue;
`;

const Component = styled.Panel`
    @extend ${bgBlue};
    color: red;
`;
