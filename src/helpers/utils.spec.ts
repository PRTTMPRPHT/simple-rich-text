import {
    assertConfigIsValid,
    buildIndexMap,
    buildReplacementRegex,
    collectRegexIndices,
    collectSymmetricalRegexIndices,
    evenArrayToRegions
} from "./utils";

describe("Utils", () => {
    describe("collectRegexIndices", () => {
        it("should collect all the indices where a regex is present in a string", () => {
            const TEST_STRING = "Hello ..World.. this. is. a. test.."
            const indices = collectRegexIndices(/\.\./g, TEST_STRING);
            expect(indices).not.toBeFalsy();
            expect(indices.length).toBe(3);
            expect(indices[0]).toBe(6);
            expect(indices[1]).toBe(13);
            expect(indices[2]).toBe(33);
        });

        it("should return an empty array when there are no matches present", () => {
            const TEST_STRING = "Hello World, this is a test."
            const indices = collectRegexIndices(/\.\./g, TEST_STRING);
            expect(indices).not.toBeFalsy();
            expect(indices.length).toBe(0);
        })
    });

    describe("collectSymmetricalRegexIndices", () => {
        it("should collect all the indices where a regex is present in a string when it is perfectly pairable", () => {
            const TEST_STRING = "Hello ..World.. this. is. a. test."
            const indices = collectSymmetricalRegexIndices(/\.\./g, TEST_STRING);
            expect(indices).not.toBeFalsy();
            expect(indices.length).toBe(2);
            expect(indices[0]).toBe(6);
            expect(indices[1]).toBe(13);
        });

        it("should collect all the indices where a regex is present in a string, where it can be paired up", () => {
            const TEST_STRING = "Hello ..World.. this. is. a. test.."
            const indices = collectSymmetricalRegexIndices(/\.\./g, TEST_STRING);
            expect(indices).not.toBeFalsy();
            expect(indices.length).toBe(2);
            expect(indices[0]).toBe(6);
            expect(indices[1]).toBe(13);
        });

        it("should collect multiple pairs", () => {
            const TEST_STRING = "......,.."
            const indices = collectSymmetricalRegexIndices(/\.\./g, TEST_STRING);
            expect(indices).not.toBeFalsy();
            expect(indices.length).toBe(4);
            expect(indices[0]).toBe(0);
            expect(indices[1]).toBe(2);
            expect(indices[2]).toBe(4);
            expect(indices[3]).toBe(7);
        });

        it("should return an empty array when there are no matches present", () => {
            const TEST_STRING = "Hello World, this is a test."
            const indices = collectSymmetricalRegexIndices(/\.\./g, TEST_STRING);
            expect(indices).not.toBeFalsy();
            expect(indices.length).toBe(0);
        });
    });

    describe("evenArrayToRegions", () => {
        it("should throw an error if the array is of odd length", () => {
            expect(() => evenArrayToRegions<number>([1])).toThrow();
            expect(() => evenArrayToRegions<number>([1, 2, 3])).toThrow();
        });

        it("should not throw an error if the array length is 0", () => {
            expect(() => evenArrayToRegions<number>([])).not.toThrow();
        });

        it("should split the array evenly into regions", () => {
            const TEST_ARR = [0, 1337, 2, 3, 4, 5];
            const result = evenArrayToRegions(TEST_ARR);
            expect(result).not.toBeFalsy();
            expect(result.length).toBe(3);
            expect(result[0]).not.toBeFalsy();
            expect(result[0].start).toBe(0);
            expect(result[0].end).toBe(1337);
            expect(result[1]).not.toBeFalsy();
            expect(result[1].start).toBe(2);
            expect(result[1].end).toBe(3);
            expect(result[2]).not.toBeFalsy();
            expect(result[2].start).toBe(4);
            expect(result[2].end).toBe(5);
        });
    });

    describe("assertConfigIsValid", () => {
        it("should throw if the configuration is not present", () => {
            expect(() => assertConfigIsValid(null)).toThrow();
            expect(() => assertConfigIsValid(undefined)).toThrow();
        });

        it("should throw if the tokens are not provided as an array", () => {
            expect(() => assertConfigIsValid({} as any)).toThrow();
            expect(() => assertConfigIsValid({tokens: {}} as any)).toThrow();
        });

        it("should throw if there are no tokens", () => {
            expect(() => assertConfigIsValid({tokens: []})).toThrow();
        });

        it("should throw if the token has no expression", () => {
            expect(() => assertConfigIsValid({tokens: [{flagName: "bold"} as any]})).toThrow();
        });

        it("should throw if the token has no flag name", () => {
            expect(() => assertConfigIsValid({tokens: [{expression: /\*\*/g} as any]})).toThrow();
        });

        it("should throw if the token expression doesn't have the global flag", () => {
            expect(() => assertConfigIsValid({tokens: [{expression: /\*\*/, flagName: "bold"}]})).toThrow();
        });

        it("should throw if the token expression has wrong flags", () => {
            expect(() => assertConfigIsValid({tokens: [{expression: /\*\*/gi, flagName: "bold"}]})).toThrow();
        });

        it("should not throw if the configuration is valid", () => {
            expect(() => assertConfigIsValid({tokens: [{expression: /\*\*/g, flagName: "bold"}]})).not.toThrow();
        });
    });

    describe("buildIndexMap", () => {
        it("should generate a basic index map for a string", () => {
            const TEST_STRING = "Hello ..World.. this. is. a. test..";
            const TEST_TOKENS = [{
                expression: /\.\./g,
                flagName: "bold"
            }];

            const indexMap = buildIndexMap(TEST_STRING, TEST_TOKENS);

            expect(indexMap).not.toBeFalsy();

            const {segmentBarriers, flags} = indexMap;

            expect(segmentBarriers).not.toBeFalsy();
            expect(segmentBarriers.length).toBe(4);
            expect(segmentBarriers[0]).toBe(0);
            expect(segmentBarriers[1]).toBe(6);
            expect(segmentBarriers[2]).toBe(13);
            expect(segmentBarriers[3]).toBe(TEST_STRING.length);

            expect(flags).not.toBeFalsy();
            expect(flags.bold).not.toBeFalsy();
            expect(flags.bold.length).toBe(1);
            expect(flags.bold[0]).not.toBeFalsy();
            expect(flags.bold[0].start).toBe(6);
            expect(flags.bold[0].end).toBe(13);
        });

        it("should generate a index map for a string with multiple patterns", () => {
            const TEST_STRING = "Hello ..Wor__ld.. this__. is. __a__. test..";
            const TEST_TOKENS = [{
                expression: /\.\./g,
                flagName: "bold"
            }, {
                expression: /__/g,
                flagName: "italic"
            }];

            const indexMap = buildIndexMap(TEST_STRING, TEST_TOKENS);

            expect(indexMap).not.toBeFalsy();

            const {segmentBarriers, flags} = indexMap;

            expect(segmentBarriers).not.toBeFalsy();
            expect(segmentBarriers.length).toBe(8);
            expect(segmentBarriers).toEqual([0, 6, 11, 15, 22, 30, 33, TEST_STRING.length]);

            expect(flags).not.toBeFalsy();

            expect(flags.bold).not.toBeFalsy();
            expect(flags.bold.length).toBe(1);
            expect(flags.bold[0]).not.toBeFalsy();
            expect(flags.bold[0].start).toBe(6);
            expect(flags.bold[0].end).toBe(15);

            expect(flags.italic).not.toBeFalsy();
            expect(flags.italic.length).toBe(2);
            expect(flags.italic[0]).not.toBeFalsy();
            expect(flags.italic[0].start).toBe(11);
            expect(flags.italic[0].end).toBe(22);
            expect(flags.italic[1]).not.toBeFalsy();
            expect(flags.italic[1].start).toBe(30);
            expect(flags.italic[1].end).toBe(33);
        });
    });

    describe("buildReplacementRegex", () => {
        it("should build a regex that can replace multiple regexes", () => {
            const TEST_TOKENS = [{
                expression: /\.\./g,
                flagName: "bold"
            }, {
                expression: /__/g,
                flagName: "italic"
            }];

            const regex = buildReplacementRegex(TEST_TOKENS);
            expect(regex).not.toBeFalsy();
            expect(regex.global).toBe(true);
            expect(regex.source).toBe("(\\.\\.)|(__)");

            const TEST_STRING = "HE__LL__..O";
            expect(TEST_STRING.replace(regex, "")).toBe("HELLO");
        });
    });
});
