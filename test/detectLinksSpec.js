import test from 'ava';
import { Delta } from 'rich-text';
import detectLinks from '../lib/detectLinks';

function detectMacro(t, input, expected) {
    const inputDelta = new Delta(input);
    const composedDelta = detectLinks(inputDelta);

    t.deepEqual(composedDelta.ops, expected);
}

function detectWithSkipOptionMacro(t, input, lastIndex, expected) {
    const inputDelta = new Delta(input);
    const composedDelta = detectLinks(inputDelta, { skipTrailingMatch: true, lastIndex });

    t.deepEqual(composedDelta.ops, expected);
}

function detectDeltaMacro(t, input, expected) {
    const inputDelta = new Delta(input);
    const composedDelta = detectLinks.detectLinksDelta(inputDelta);

    t.deepEqual(composedDelta.ops, expected);
}

test(
    'auto-detect link without protocol',
    detectMacro,
    [ { insert: 'foo example.com bar' } ],
    [
        { insert: 'foo ' },
        { insert: 'example.com', attributes: { link: 'http://example.com' } },
        { insert: ' bar' }
    ]
);

test(
    'auto-detect link with protocol',
    detectMacro,
    [ { insert: 'foo https://example.com bar' } ],
    [
        { insert: 'foo ' },
        { insert: 'https://example.com', attributes: { link: 'https://example.com' } },
        { insert: ' bar' }
    ]
);

test(
    'auto-detect links while keeping other attributes',
    detectMacro,
    [
        { insert: 'foo ex' },
        { insert: 'ample', attributes: { bold: true } },
        { insert: '.com bar' }
    ],
    [
        { insert: 'foo ' },
        { insert: 'ex', attributes: { link: 'http://example.com' } },
        { insert: 'ample', attributes: { bold: true, link: 'http://example.com' } },
        { insert: '.com', attributes: { link: 'http://example.com' } },
        { insert: ' bar' }
    ]
);

test(
    'keeps already formatted links',
    detectMacro,
    [
        { insert: 'foo ' },
        { insert: 'example.com', attributes: { link: 'https://example.com/42' } }
    ],
    [
        { insert: 'foo ' },
        { insert: 'example.com', attributes: { link: 'https://example.com/42' } }
    ]
);

test(
    'auto-detects links alongside existing formatted links',
    detectMacro,
    [
        { insert: 'foo ' },
        { insert: 'example.com', attributes: { link: 'https://example.com/42' } },
        { insert: 'bar www.google.com' }
    ],
    [
        { insert: 'foo ' },
        { insert: 'example.com', attributes: { link: 'https://example.com/42' } },
        { insert: 'bar ' },
        { insert: 'www.google.com', attributes: { link: 'http://www.google.com' } }
    ]
);

test(
    'auto-detects links correctly when they appear after embeds',
    detectMacro,
    [
        { insert: 'foo ' },
        { insert: { image: 'picture.jpg' } },
        { insert: 'bar example.com' }
    ],
    [
        { insert: 'foo ' },
        { insert: { image: 'picture.jpg' } },
        { insert: 'bar ' },
        { insert: 'example.com', attributes: { link: 'http://example.com' } }
    ]
);

test(
    'skips matched links at the end of the document when the appropriate option is set',
    detectWithSkipOptionMacro,
    [
        { insert: 'foo www.example.co' }
    ],
    18,
    [
        { insert: 'foo www.example.co' }
    ]
);

test(
    'detects non trailing links when skip option is enabled',
    detectWithSkipOptionMacro,
    [
        { insert: 'www.example.com foo www.example.co' }
    ],
    34,
    [
        { insert: 'www.example.com', attributes: { link: 'http://www.example.com' } },
        { insert: ' foo www.example.co' }
    ]
);

test(
    'skips trailing matched link if the stopword at the end is a dot',
    detectWithSkipOptionMacro,
    [
        // Note: google is a valid TLD
        { insert: 'foo www.google.' }
    ],
    15,
    [
        { insert: 'foo www.google.' }
    ]
);

test(
    'skips trailing matched links if the position of the last index is before end of the matched link',
    detectWithSkipOptionMacro,
    [
        { insert: 'foo www.example.com' }
    ],
    3,
    [
        { insert: 'foo www.example.com' }
    ]
);

test(
    'contains a delta with the changes only',
    detectDeltaMacro,
    [
        { insert: 'foo www.example.com' }
    ],
    [
        { retain: 4 },
        { retain: 15, attributes: { link: 'http://www.example.com' } }
    ]
);
