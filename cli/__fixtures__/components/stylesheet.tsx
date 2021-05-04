import React from "react";
// @ts-expect-error self-import is not resolved
import { Panel } from "@team-abyss-p2/finnby";

// @ts-expect-error css import
import styles from "./stylesheet.css";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function UserComponent() {
    return <Panel class={styles.userClass} />;
}
