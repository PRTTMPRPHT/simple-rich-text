import {RichTextConfiguration} from "./interfaces";
import simpleRichText from "./lib";
// @ts-ignore
import dedent from "dedent";

const TEST_CONFIG: RichTextConfiguration = {
    tokens: [{
        expression: /\*\*/g,
        flagName: "bold"
    }, {
        expression: /~~/g,
        flagName: "italic"
    }]
};

describe("Exposed library functions", () => {
    describe("simpleRichText", () => {
        it("should error when no string is provided", () => {
            expect(() => simpleRichText(null, TEST_CONFIG)).toThrow();
        });

        it("should return unformatted text", () => {
            const TEST_STRING = "Hello world, this is a test.";

            const result = simpleRichText(TEST_STRING, TEST_CONFIG);

            expect(result).not.toBeFalsy();
            expect(result.length).toBe(1);

            const [textSegment] = result;

            expect(textSegment).not.toBeFalsy();
            expect(textSegment.text).toBe(TEST_STRING);
            expect(textSegment.flags).not.toBeFalsy();
            expect(Object.keys(textSegment.flags).length).toBe(0);
        });

        it("should format text in the middle of the string", () => {
            const TEST_STRING = "Hello **world, this **is a test.";

            const result = simpleRichText(TEST_STRING, TEST_CONFIG);

            expect(result).not.toBeFalsy();
            expect(result.length).toBe(3);

            const [front, middle, back] = result;

            expect(front).not.toBeFalsy();
            expect(front.text).toBe("Hello ");
            expect(front.flags).not.toBeFalsy();
            expect(Object.keys(front.flags).length).toBe(0);

            expect(middle).not.toBeFalsy();
            expect(middle.text).toBe("world, this ");
            expect(middle.flags).not.toBeFalsy();
            expect(Object.keys(middle.flags).length).toBe(1);
            expect(middle.flags.bold).toBe(true);

            expect(back).not.toBeFalsy();
            expect(back.text).toBe("is a test.");
            expect(back.flags).not.toBeFalsy();
            expect(Object.keys(back.flags).length).toBe(0);
        });

        it("should format text in the beginning of the string", () => {
            const TEST_STRING = "**Hello **world, this is a test.";

            const result = simpleRichText(TEST_STRING, TEST_CONFIG);

            expect(result).not.toBeFalsy();
            expect(result.length).toBe(2);

            const [front, back] = result;

            expect(front).not.toBeFalsy();
            expect(front.text).toBe("Hello ");
            expect(front.flags).not.toBeFalsy();
            expect(Object.keys(front.flags).length).toBe(1);
            expect(front.flags.bold).toBe(true);

            expect(back).not.toBeFalsy();
            expect(back.text).toBe("world, this is a test.");
            expect(back.flags).not.toBeFalsy();
            expect(Object.keys(back.flags).length).toBe(0);
        });

        it("should format text in the end of the string", () => {
            const TEST_STRING = "Hello world, this i**s a test.**";

            const result = simpleRichText(TEST_STRING, TEST_CONFIG);

            expect(result).not.toBeFalsy();
            expect(result.length).toBe(2);

            const [front, back] = result;

            expect(front).not.toBeFalsy();
            expect(front.text).toBe("Hello world, this i");
            expect(front.flags).not.toBeFalsy();
            expect(Object.keys(front.flags).length).toBe(0);

            expect(back).not.toBeFalsy();
            expect(back.text).toBe("s a test.");
            expect(back.flags).not.toBeFalsy();
            expect(Object.keys(back.flags).length).toBe(1);
            expect(back.flags.bold).toBe(true);
        });

        it("should handle nested formatting", () => {
            const TEST_STRING = "This is a **~~formatting test.~~**";

            const result = simpleRichText(TEST_STRING, TEST_CONFIG);

            expect(result).not.toBeFalsy();
            expect(result.length).toBe(2);

            const [front, back] = result;

            expect(front).not.toBeFalsy();
            expect(front.text).toBe("This is a ");
            expect(front.flags).not.toBeFalsy();
            expect(Object.keys(front.flags).length).toBe(0);

            expect(back).not.toBeFalsy();
            expect(back.text).toBe("formatting test.");
            expect(back.flags).not.toBeFalsy();
            expect(Object.keys(back.flags).length).toBe(2);
            expect(back.flags.bold).toBe(true);
            expect(back.flags.italic).toBe(true);
        });

        it("should handle crossed formatting", () => {
            const TEST_STRING = "This is a **~~formatting** test.~~";

            const result = simpleRichText(TEST_STRING, TEST_CONFIG);

            expect(result).not.toBeFalsy();
            expect(result.length).toBe(3);

            const [front, middle, back] = result;

            expect(front).not.toBeFalsy();
            expect(front.text).toBe("This is a ");
            expect(front.flags).not.toBeFalsy();
            expect(Object.keys(front.flags).length).toBe(0);

            expect(middle).not.toBeFalsy();
            expect(middle.text).toBe("formatting");
            expect(middle.flags).not.toBeFalsy();
            expect(Object.keys(middle.flags).length).toBe(2);
            expect(middle.flags.bold).toBe(true);
            expect(middle.flags.italic).toBe(true);

            expect(back).not.toBeFalsy();
            expect(back.text).toBe(" test.");
            expect(back.flags).not.toBeFalsy();
            expect(Object.keys(back.flags).length).toBe(1);
            expect(back.flags.italic).toBe(true);
        });

        it("should handle separated formatting", () => {
            const TEST_STRING = "This **is** a ~~formatting~~ test.";

            const result = simpleRichText(TEST_STRING, TEST_CONFIG);

            expect(result).not.toBeFalsy();
            expect(result.length).toBe(5);

            const [s0, s1, s2, s3, s4] = result;

            expect(s0).not.toBeFalsy();
            expect(s0.text).toBe("This ");
            expect(s0.flags).not.toBeFalsy();
            expect(Object.keys(s0.flags).length).toBe(0);

            expect(s1).not.toBeFalsy();
            expect(s1.text).toBe("is");
            expect(s1.flags).not.toBeFalsy();
            expect(Object.keys(s1.flags).length).toBe(1);
            expect(s1.flags.bold).toBe(true);

            expect(s2).not.toBeFalsy();
            expect(s2.text).toBe(" a ");
            expect(s2.flags).not.toBeFalsy();
            expect(Object.keys(s2.flags).length).toBe(0);

            expect(s3).not.toBeFalsy();
            expect(s3.text).toBe("formatting");
            expect(s3.flags).not.toBeFalsy();
            expect(Object.keys(s3.flags).length).toBe(1);
            expect(s3.flags.italic).toBe(true);

            expect(s4).not.toBeFalsy();
            expect(s4.text).toBe(" test.");
            expect(s4.flags).not.toBeFalsy();
            expect(Object.keys(s4.flags).length).toBe(0);
        });

        it("should handle adjacent formatting", () => {
            const TEST_STRING = "This **is**~~ a formatting~~ test.";

            const result = simpleRichText(TEST_STRING, TEST_CONFIG);

            expect(result).not.toBeFalsy();
            expect(result.length).toBe(4);

            const [s0, s1, s2, s3] = result;

            expect(s0).not.toBeFalsy();
            expect(s0.text).toBe("This ");
            expect(s0.flags).not.toBeFalsy();
            expect(Object.keys(s0.flags).length).toBe(0);

            expect(s1).not.toBeFalsy();
            expect(s1.text).toBe("is");
            expect(s1.flags).not.toBeFalsy();
            expect(Object.keys(s1.flags).length).toBe(1);
            expect(s1.flags.bold).toBe(true);

            expect(s2).not.toBeFalsy();
            expect(s2.text).toBe(" a formatting");
            expect(s2.flags).not.toBeFalsy();
            expect(Object.keys(s2.flags).length).toBe(1);
            expect(s2.flags.italic).toBe(true);

            expect(s3).not.toBeFalsy();
            expect(s3.text).toBe(" test.");
            expect(s3.flags).not.toBeFalsy();
            expect(Object.keys(s3.flags).length).toBe(0);
        });

        it("should handle multiline text", () => {
            const TEST_STRING = dedent`
            This **is**~~ a
            formatting~~ test.`;

            const result = simpleRichText(TEST_STRING, TEST_CONFIG);

            expect(result).not.toBeFalsy();
            expect(result.length).toBe(4);

            const [s0, s1, s2, s3] = result;

            expect(s0).not.toBeFalsy();
            expect(s0.text).toBe("This ");
            expect(s0.flags).not.toBeFalsy();
            expect(Object.keys(s0.flags).length).toBe(0);

            expect(s1).not.toBeFalsy();
            expect(s1.text).toBe("is");
            expect(s1.flags).not.toBeFalsy();
            expect(Object.keys(s1.flags).length).toBe(1);
            expect(s1.flags.bold).toBe(true);

            expect(s2).not.toBeFalsy();
            expect(s2.text).toBe(" a\nformatting");
            expect(s2.flags).not.toBeFalsy();
            expect(Object.keys(s2.flags).length).toBe(1);
            expect(s2.flags.italic).toBe(true);

            expect(s3).not.toBeFalsy();
            expect(s3.text).toBe(" test.");
            expect(s3.flags).not.toBeFalsy();
            expect(Object.keys(s3.flags).length).toBe(0);
        });
    })
});
