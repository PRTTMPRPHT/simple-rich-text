/**
 * Generic region data type.
 */
export interface Region<T> {
    start: T;
    end: T;
}

/**
 * Represents an intermediate result of where certain flags come into and out of effect.
 */
export interface RichTextIndexMap {
    flags: {
        [flag: string]: Region<number>[];
    };
    segmentBarriers: number[];
}

/**
 * Represents the final outputs of the rich text generation.
 * These are segments of text which have the exact same styling throughout.
 */
export interface RichTextSegment {
    text: string;
    flags: {
        [presentFlag: string]: true;
    };
}
