// @ts-expect-error unresolved self import
import { styled } from "@team-abyss-p2/finnby";

const ComponentA = styled.Panel`
    color: red;
`;

const ComponentB = styled.Panel`
    color: red;

    ${ComponentA} {
        color: blue;
    }
`;
