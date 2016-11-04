[![NPM Version](https://img.shields.io/npm/v/delta-detect-links.svg?style=flat)](https://www.npmjs.org/package/delta-detect-links)
[![Build Status](https://img.shields.io/travis/holidaycheck/delta-detect-links/master.svg?style=flat)](https://travis-ci.org/holidaycheck/delta-detect-links)
[![Dependencies](http://img.shields.io/david/holidaycheck/delta-detect-links.svg?style=flat)](https://david-dm.org/holidaycheck/delta-detect-links)

# delta-detect-links

> Detect links in a delta object.

This small library is based on [`linkify-it`](https://github.com/markdown-it/linkify-it) to detect links in a rich text [`Delta`](https://github.com/ottypes/rich-text) object.
The main purpose for this library is to automatically detect links in [Quill](http://quilljs.com/) documents.

## API

### `detectLinks`

This function detects all links in the given `insert`-only delta object.

```js
const detectLinks = require('delta-detect-links');

detectLinks((new Delta()).insert('Visit www.example.com\n'));
// → [ { insert: 'Visit ' }, { insert: 'www.example.com', attributes: { link: 'http://www.example.com' } }, { insert: '\n' } ]
```

Already existing links in the given delta object will be skipped and not highlighted a second time.

#### Options

`detectLinks` supports an optional second parameter to set the following options:

* `skipTrailingMatch` (default: `false`): This is useful when you want to detect links in real-time while the user types. In order to prevent detection of partial links the link will only be detected after another stop word has been encountered.
* `lastIndex`: This option is only used in combination with `skipTrailingMatch`. This value is used to determine the trailing match. It is useful in scenarios where the current cursor is not at the same position as the end of the document.

### `detectLinksDelta`

Similar to `detectLinks` but only contains the changes delta object.

```js
const detectLinksDelta = require('delta-detect-links').detectLinksDelta;

detectLinksDelta((new Delta()).insert('Visit www.example.com\n'));
// → [ { retain: 6 }, { retain: 15, attributes: { link: 'http://www.example.com' } } ]
```
