import {Region, RichTextIndexMap} from "../interfaces";
import {RichTextConfiguration, RichTextToken} from "../interfaces";

/**
 * Creates a list of indices at which a given regular expression occurs in a string.
 * @param regex The regular expression that is used for the search of indices.
 * @param str The string to search.
 */
export function collectRegexIndices(regex: RegExp, str: string): number[] {
    const indices: number[] = [];

    let regexResult = null;
    while (regexResult = regex.exec(str)) {
        indices.push(regexResult.index);
    }

    return indices;
}

/**
 * Creates a list of indices at which a given regular expression occurs in a string.
 * Only an even amount of indices is returned, omitting any outliers.
 * @param regex The regular expression that is used for the search of indices.
 * @param str The string to search.
 */
export function collectSymmetricalRegexIndices(regex: RegExp, str: string): number[] {
    const indices = collectRegexIndices(regex, str);

    // In this case, we don't have enough tokens for a symmetrical match.
    if (indices.length < 2) {
        return [];
    }

    // In this case, there is one token too many, and we omit the last one.
    if (indices.length % 2 !== 0) {
        indices.pop();
    }

    return indices;
}

/**
 * Converts an array of even length into a set of start/end regions.
 * Used to convert a list of "relevant indices" in a string to regions in the string.
 * @param arr The array to process.
 */
export function evenArrayToRegions<T>(arr: T[]): Region<T>[] {
    if (arr.length % 2 !== 0) {
        throw new Error("Can only process even arrays in evenArrayToRegions.");
    }

    const result: { start: T; end: T }[] = [];
    let current = null;
    for (let i = 0; i < arr.length; i++) {
        if (i % 2 === 0) {
            current = {start: arr[i], end: undefined};
        } else {
            current.end = arr[i];
            result.push(current);
        }
    }

    return result;
}

/**
 * This ensures that we obtain a valid configuration for the processing of the string.
 * @param richTextConfig The configuration to validate.
 */
export function assertConfigIsValid(richTextConfig: RichTextConfiguration) {
    if (richTextConfig == null) {
        throw new Error("Configuration for simple-rich-text must be defined.");
    }

    if (!Array.isArray(richTextConfig.tokens) || richTextConfig.tokens.length === 0) {
        throw new Error("Must provide at least one token definition.");
    }

    for (const token of richTextConfig.tokens) {
        if (token.expression == null) {
            throw new Error("Expression may not be null.");
        }

        if (token.expression.flags !== "g") {
            throw new Error("Token expressions must have (only) the global flag.");
        }

        if (token.flagName == null) {
            throw new Error("Flag name may not be null.");
        }
    }
}

/**
 * Builds a list of regions within the string, where certain tokens come into effect, as well as a list
 * of where boundaries of similarly-styled text occur.
 * @param content The string to scan for regions.
 * @param tokens The tokens to build the regions for.
 */
export function buildIndexMap(content: string, tokens: RichTextToken[]): RichTextIndexMap {
    const indexMap: RichTextIndexMap = {flags: {}, segmentBarriers: [0, content.length]};

    for (const token of tokens) {
        const indices = collectSymmetricalRegexIndices(token.expression, content);
        indexMap.flags[token.flagName] = evenArrayToRegions<number>(indices);
        indexMap.segmentBarriers.push(...indices);
    }

    // Ensure there are no duplicates.
    indexMap.segmentBarriers = indexMap.segmentBarriers.filter(
        (item, index) => indexMap.segmentBarriers.indexOf(item) === index
    );

    // Ensure barriers are sorted in ascending manner.
    indexMap.segmentBarriers.sort((a, b) => a - b);

    return indexMap;
}

/**
 * This combines all tokens into a regex that can be used for replacing them out of the string.
 * @param tokens The tokens to build the regex out of.
 */
export function buildReplacementRegex(tokens: RichTextToken[]): RegExp {
    const sources = tokens.map(t => `(${t.expression.source})`);
    return new RegExp(sources.join("|"), "g");
}
