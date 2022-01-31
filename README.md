# simple-rich-text

A super simple and lightweight JavaScript library for parsing a markdown-like formatting used for example by modern instant messengers, enabling custom rendering for these types of text input.

## Usage

Let's say you want to parse a text message that is formatted in markdown-like-style and you want to display bold, italic and strikethrough text.

```
import {simpleRichText} from "simple-rich-text";

const config = {
    tokens: [{
        expression: /\*\*/g,
        flagName: "bold"
    }, {
        expression: /__/g,
        flagName: "italic"
    }, {
        expression: /~~/g,
        flagName: "strikethrough"
    }]
};

const YOUR_MESSAGE = "**Hello, world!** This __is a ~~test~~ message.__"

simpleRichText(YOUR_MESSAGE, config);
```

This yields the following result:
```
[
  { text: 'Hello, world!', flags: { bold: true } },
  { text: ' This ', flags: {} },
  { text: 'is a ', flags: { italic: true } },
  { text: 'test', flags: { italic: true, strikethrough: true } },
  { text: ' message.', flags: { italic: true } }
]
```

This function can be used with any regular expression and any flag name, as long as it carries the "global" flag.

## Installing

`npm install simple-rich-text`

## License

By contributing, you agree that your contributions will be licensed under its [The Unlicense](http://unlicense.org/).
