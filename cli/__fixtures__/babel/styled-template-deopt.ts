// @ts-expect-error unresolved self import
import { styled } from "@team-abyss-p2/finnby";

const Component = styled.Panel`
    color: ${
        // @ts-expect-error missing proptype
        (props) => props.color
    };
`;
