/* eslint-disable */
// @ts-nocheck

import { styled } from "@team-abyss-p2/finnby";

const Component = styled.Panel(
    // @ts-expect-error missing proptype
    (props) => ({
        backgroundColor: props.bg,
    }),
);
