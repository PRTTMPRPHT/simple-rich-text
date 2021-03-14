import {RichTextConfiguration} from "./interfaces";
import {RichTextSegment} from "./interfaces";
import {assertConfigIsValid, buildIndexMap, buildReplacementRegex} from "./helpers/utils";

export function simpleRichText(content: string, richTextConfig: RichTextConfiguration): RichTextSegment[] {
    // This should prevent most erroneous input.
    if (typeof content !== "string") {
        throw new Error("Must provide a string for rich text conversion.");
    }

    assertConfigIsValid(richTextConfig);

    // Build the intermediate data that can be used for determining the substrings that are formatted exactly the same.
    const indexMap = buildIndexMap(content, richTextConfig.tokens);
    const replacementRegex = buildReplacementRegex(richTextConfig.tokens);

    // Iterate over the potential substrings, build individual result segments.
    const result: RichTextSegment[] = [];
    for (let i = 0; i < indexMap.segmentBarriers.length - 1; i++) {
        const start = indexMap.segmentBarriers[i];
        const end = indexMap.segmentBarriers[i + 1];

        const substring = content.substring(start, end);
        const text = substring.replace(replacementRegex, "");

        if (text.length === 0) {
            continue;
        }

        const segment: RichTextSegment = {text, flags: {}};

        // Generate flags for this segment by looking up all index regions for each token.
        for (const token of richTextConfig.tokens) {
            if (indexMap.flags[token.flagName].find(reg => reg.start <= start && reg.end >= end)) {
                segment.flags[token.flagName] = true;
            }
        }

        result.push(segment);
    }

    return result;
}

export default simpleRichText;
