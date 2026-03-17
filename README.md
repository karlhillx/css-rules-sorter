# CSS Rules Sorter

[![CI](https://github.com/karlhillx/css-rules-sorter/actions/workflows/ci.yml/badge.svg)](https://github.com/karlhillx/css-rules-sorter/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/css-rules-sorter.svg)](https://badge.fury.io/js/css-rules-sorter)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm downloads](https://img.shields.io/npm/dm/css-rules-sorter.svg)](https://www.npmjs.com/package/css-rules-sorter)

A PostCSS plugin that automatically sorts CSS rules alphabetically by selectors and organizes media queries for cleaner, more maintainable stylesheets.

## Features

- ✨ **Alphabetical Sorting**: Automatically sorts top-level selectors and rules within media queries.
- 📱 **Media Query Management**: Flexible ordering (mobile-first or desktop-first) and grouping using `postcss-sort-media-queries`.
- 🚀 **PostCSS 8+**: Fully compatible with the latest PostCSS API.
- 🛠️ **Developer Friendly**: Includes TypeScript types (planned), tests, and linting.

## Installation

```sh
npm install css-rules-sorter postcss --save-dev
```

## Usage

### As a PostCSS Plugin (Recommended)

Add it to your `postcss.config.js`:

```javascript
module.exports = {
  plugins: [
    require('css-rules-sorter')({
      sort: 'mobile-first',
    }),
  ],
};
```

### Standalone Usage

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
  sort: 'mobile-first',
});

sorter.process(css).then((result) => {
  console.log(result);
});
```

## Configuration Options

| Option             | Type      | Default          | Description                                               |
| ------------------ | --------- | ---------------- | --------------------------------------------------------- |
| `sort`             | `string`  | `'mobile-first'` | Media query order: `'mobile-first'` or `'desktop-first'`. |
| `selectorSort`     | `string`  | `'natural'`      | Method for sorting selectors.                             |
| `groupByMediaType` | `boolean` | `true`           | Whether to group media queries by type.                   |

## Development

```bash
# Install dependencies
make install

# Run tests
make test

# Lint code
make lint

# Format code
make format
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
