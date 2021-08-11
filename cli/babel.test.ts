import pluginTester from "babel-plugin-tester";
import { styledPlugin } from "./babel";

const styles: string[] = [];

beforeEach(() => {
    styles.length = 0;
});

pluginTester({
    pluginName: "styled plugin",
    plugin: styledPlugin({
        uid: "_uid",
        styles,
    }),

    filename: __filename,
    snapshot: true,

    tests: {
        "should inline static keyframes": {
            fixture: "__fixtures__/babel/keyframes.ts",
            teardown() {
                expect(styles).toMatchSnapshot();
            },
        },
        "should inline static css": {
            fixture: "__fixtures__/babel/css.ts",
            teardown() {
                expect(styles).toMatchSnapshot();
            },
        },

        "should generate a class for static styled component templates": {
            fixture: "__fixtures__/babel/styled-template.ts",
            teardown() {
                expect(styles).toMatchSnapshot();
            },
        },
        "should generate a class for static styled component objects": {
            fixture: "__fixtures__/babel/styled-object.ts",
            teardown() {
                expect(styles).toMatchSnapshot();
            },
        },

        "should inline keyframe names in styled components": {
            fixture: "__fixtures__/babel/styled-keyframes.ts",
            teardown() {
                expect(styles).toMatchSnapshot();
            },
        },
        "should inline css class names in styled components": {
            fixture: "__fixtures__/babel/styled-css.ts",
            teardown() {
                expect(styles).toMatchSnapshot();
            },
        },

        "should deopt on non-static styled component template strings": {
            fixture: "__fixtures__/babel/styled-template-deopt.ts",
            teardown() {
                expect(styles).toMatchSnapshot();
            },
        },
        "should deopt on non-static styled component objects": {
            fixture: "__fixtures__/babel/styled-object-deopt.ts",
            teardown() {
                expect(styles).toMatchSnapshot();
            },
        },

        "should handle styled components being used in selectors": {
            fixture: "__fixtures__/babel/styled-selector.ts",
            teardown() {
                expect(styles).toMatchSnapshot();
            },
        },
    },
});
