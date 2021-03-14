/**
 * Any formatting option is represented as a token that both starts and ends a region of formatted text.
 * It is important that the regular expressions carry the global flag ("g") - and only that.
 *
 * @example
 * const boldToken: RichTextToken = {
 *   flagName: "bold",
 *   expression: new RegExp("\\*\\*", "g");
 * };
 */
export interface RichTextToken {
    expression: RegExp;
    flagName: string;
}

/**
 * Represents the configuration that needs to be passed to the simpleRichText() function.
 */
export interface RichTextConfiguration {
    tokens: RichTextToken[];
}
