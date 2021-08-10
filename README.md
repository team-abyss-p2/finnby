# Finnby

React-based Toolkit for writing Panorama UI in the Source engine, inspired by
Next.js

## Features

-   Start writing Panorama components using React, no configuration required
-   TypeScript compilation supported out of the box, includes definitions for
    most Panorama APIs
-   Supports styled components including automatic extraction of static styles
    into external stylesheet files
-   Includes PreCSS and CSS Modules, seamlessly import CSS files into JavaScript
-   Automatically generates static XML layouts from your components and
    rehydrates them at runtime for better startup performances

## Getting Started

In an empty directory, create a `package.json` file with this content:

```json
{
    "name": "my-finnby-project",
    "version": "1.0.0",
    "scripts": {
        "build": "finnby build",
        "watch": "finnby watch"
    },
    "dependencies": {
        "@team-abyss-p2/finnby": "0.2.0"
    }
}
```

Run `yarn install` or `npm install`, and you'll be ready to create your first
component !

Create a new directory called `components` and add a new `.js` file (or `.tsx`
if you want to use TypeScript):

```js
import * as React from "react";
import { Panel, Label } from "@team-abyss-p2/finnby";

export default function MyComponent() {
    return (
        <Panel style={{ width: "100%", height: "100%" }}>
            <Label text="Hello World" />
        </Panel>
    );
}
```

If you run `yarn run build` or `npm run build`, Finnby will create a new `code`
directory in your project containing everything Panorama needs to run your new
panel. In addition to this generated code, you will need to patch your
`base_jsregistration.xml` file to load the Finnby runtime for everything to work
correctly:

```xml
<root>
    <scripts>
        <include src="file://{resources}/scripts/common/panelregistration.js" />
        <include src="file://{resources}/scripts/common/eventdefinition.js" />
        <!-- Add this line -->
        <include src="file://{resources}/scripts/common/finnby.js" />
    </scripts>
    <Panel hittest="false" />
</root>
```

In a development process, running the build command on every change is
fastidious so you might want to use `yarn run watch` or `npm run watch` instead:
it will start the Finnby CLI in watch mode, rebuilding your code automatically
on every change.

Now what if we want our panel to fade in when it get loaded ? In Panorama
animations use CSS keyframes, but while Finnby does support importing CSS files
it's generally simpler to declare the styles alongside the components using
styled components:

```js
import * as React from "react";
import { keyframes, styled, Label } from "@team-abyss-p2/finnby";

const fadeIn = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

const AnimatedPanel = styled.Panel`
    height: 100%;
    width: 100%;

    animation-name: ${fadeIn};
    animation-duration: 750ms;
    animation-timing-function: ease-out;
`;

export default function MyComponent() {
    return (
        <AnimatedPanel>
            <Label text="Hello World" />
        </AnimatedPanel>
    );
}
```

During compilation Finnby will automatically analyze your JavaScript source
files and pull all these styles into a CSS file that gets automatically imported
into your layout

## Configuration

If you need more control on how the Finnby toolchain is configured, you can
create a `finnby.config.js` file at the root of your workspace that supports the
following options:

```js
module.exports = {
    // Directory used to search for panel files
    componentsDir: path.join(process.pwd(), "components"),
    // Output directory for the compiled panels
    outDir: path.join(process.pwd(), "code/panorama"),
    // This function is passed the list of PostCSS plugins
    // used to build the stylesheet files and can be used
    // to add more as needed
    postcss: (plugins) => plugins,
    // This hook is passed the Rollup configuration used
    // internally to build the panel bundles, and allows
    // for fine configuration of the bundling options
    rollup: (config) => config,
};
```

## Known limitations / Planned features

-   Watch mode doesn't detect new components yet, the CLI needs to be restarted
    to pickup new files
-   More / better TypeScript declarations: right now the ones included are
    extremely barebone
-   The CLI is using Rollup as a bundler for simplicity since it's also what's
    used to package the CLI and runtime, but if the capabilities needed for hot
    reloading get unlocked in the engine this will get switched over to Metro.
-   Automatically patch the `base_jsregistration.xml` file if it exists in the
    code directory, create it otherwise
-   Setup a `@team-abyss-p2/create-finnby` package to make bootstrapping a
    project even easier with `yarn create @team-abyss-p2/finnby` or
    `npm create @team-abyss-p2/finnby`
-   Automatically create a `tsconfig.json` file in the project directory like
    create-react-app and next.js do if a `.ts` or `.tsx` file is detected to
    make moving to TypeScript easier
-   The `css` function is sort of useless right now since it's unsupported in
    the Babel plugin, meaning it cannot be statically extracted nor inlined into
    other styles
