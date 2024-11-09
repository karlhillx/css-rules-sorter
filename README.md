# CSS Rules Sorter

[![npm version](https://badge.fury.io/js/css-rules-sorter.svg)](https://badge.fury.io/js/css-rules-sorter)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm downloads](https://img.shields.io/npm/dm/css-rules-sorter.svg)](https://www.npmjs.com/package/css-rules-sorter)
[![Maintenance](https://img.shields.io/maintenance/yes/2024)](https://github.com/karlhillx/css-rules-sorter)

A powerful PostCSS plugin that automatically sorts CSS rules by alphabetically organizing selectors and media queries, making your stylesheets clean and maintainable.

## Features

✨ **Smart Sorting**
- Alphabetical CSS selector sorting
- Flexible media query ordering (mobile-first or desktop-first)
- Media query grouping by type
- Built on PostCSS for optimal performance

## Installation

```sh
npm install css-rules-sorter
```

## Usage

```javascript
const cssRulesSorter = require('css-rules-sorter');

const css = `
    .zebra { color: black; }
    .apple { color: red; }
    @media (min-width: 768px) {
        .banana { color: yellow; }
        .apple { color: green; }
    }
`;

const sorter = cssRulesSorter({
    sort: 'mobile-first',      // 'mobile-first' or 'desktop-first'
    selectorSort: 'natural',   // Sorting method for selectors
    groupByMediaType: true     // Group media queries by type
});
sorter.process(css).then(result => {
    console.log(result.css);
    // Output:
    // .apple { color: red; }
    // .zebra { color: black; }
    // @media (min-width: 768px) {
    //     .apple { color: green; }
    //     .banana { color: yellow; }
    // }
});
```

## Configuration Options

- `sort`: Determines the order of media queries ('mobile-first' or 'desktop-first')
- `selectorSort`: Specifies the sorting method for selectors ('natural' or custom function)
- `groupByMediaType`: Groups media queries by type when set to true

## Contributing

Contributions are welcome! Please read our contributing guidelines for details on how to submit pull requests, report issues, or request features.

## License

This project is licensed under the MIT License - see the LICENSE file for details.