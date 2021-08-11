/* eslint-disable */
// @ts-nocheck

import { keyframes, styled } from "@team-abyss-p2/finnby";

const fadeIn = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

const Component = styled.Panel`
    animation: ${fadeIn} 500ms;
`;
