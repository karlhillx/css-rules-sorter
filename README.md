# CSS Rules Sorter

[![npm version](https://img.shields.io/npm/v/css-rules-sorter.svg)](https://www.npmjs.com/package/css-rules-sorter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PostCSS](https://img.shields.io/badge/postcss-8+-DD3A0A.svg?logo=postcss&logoColor=white)](https://postcss.org/)
[![Jest](https://img.shields.io/badge/tested_with-jest-99424f.svg?logo=jest&logoColor=white)](https://jestjs.io/)

A PostCSS plugin that automatically sorts CSS rules alphabetically by selectors and organizes media queries for cleaner, more maintainable stylesheets.

## Features

- ✨ **Alphabetical Sorting**: Automatically sorts top-level selectors and rules within media queries alphabetically.
- 📱 **Media Query Management**: Organizes and groups media queries using `postcss-sort-media-queries`.
- 🚀 **PostCSS 8+**: Fully compatible with the latest PostCSS API.
- 🛠️ **Developer Friendly**: Includes TypeScript types, comprehensive Jest tests, and linting.

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

| Option             | Type      | Default          | Description                                                                    |
| ------------------ | --------- | ---------------- | ------------------------------------------------------------------------------ |
| `sort`             | `string`  | `'mobile-first'` | Sets the media query order: `'mobile-first'` or `'desktop-first'`.             |
| `selectorSort`     | `string`  | `'natural'`      | Defines the method for sorting selectors. Can be `'natural'`, `'specificity'`, or `'bem'`. |
| `propertySort`     | `string`  | `'none'`         | Sorts properties within each rule. Can be `'none'` or `'alphabetical'`.          |
| `propertyShorthand`| `string`  | `'none'`         | Manages shorthand properties. Can be `'none'`, `'expand'`, or `'collapse'`.      |
| `sortLayers`       | `boolean` | `true`           | Sorts CSS cascade layers based on the first `@layer` definition.                 |
| `groupByMediaType` | `boolean` | `true`           | Groups media queries by their type (e.g., `screen`, `print`).                  |

## Advanced Features

### BEM Selector Sorting

Set `selectorSort: 'bem'` to sort selectors based on the Block, Element, Modifier (BEM) methodology. The sorting order is:
1. Base block (`.card`)
2. Block modifiers (`.card--featured`)
3. Block elements (`.card__header`)
4. Element modifiers (`.card__header--small`)

**Before:**
```css
.card__header--small { font-size: 0.8em; }
.card--featured { border: 1px solid blue; }
.card { color: black; }
.card__header { font-weight: bold; }
```

**After:**
```css
.card { color: black; }
.card--featured { border: 1px solid blue; }
.card__header { font-weight: bold; }
.card__header--small { font-size: 0.8em; }
```

### Shorthand Property Management

The `propertyShorthand` option allows you to expand or collapse shorthand CSS properties.

#### Expand Shorthand Properties

Set `propertyShorthand: 'expand'` to break down shorthand properties into their longhand equivalents.

**Before:**
```css
.box {
  border: 1px solid black;
  margin: 10px 20px;
}
```

**After:**
```css
.box {
  border-width: 1px;
  border-style: solid;
  border-color: black;
  margin-top: 10px;
  margin-right: 20px;
  margin-bottom: 10px;
  margin-left: 20px;
}
```
*Note: The current implementation of `expand` only supports `margin` and `padding`.*

#### Collapse Shorthand Properties

*This feature is not yet implemented.*

### Cascade Layer Sorting

Set `sortLayers: true` (the default) to automatically sort `@layer` blocks based on the order defined in the first `@layer` rule.

**Before:**
```css
@layer components, base, reset;

@layer base {
  body { font-family: sans-serif; }
}

@layer reset {
  * { margin: 0; padding: 0; }
}

@layer components {
  .button { padding: 1em; }
}
```

**After:**
```css
@layer reset {
  * { margin: 0; padding: 0; }
}

@layer base {
  body { font-family: sans-serif; }
}

@layer components {
  .button { padding: 1em; }
}
```

## New Capabilities

### Property Sorting

Set `propertySort: 'alphabetical'` to sort CSS properties within each rule alphabetically. This helps maintain a consistent and predictable order for declarations.

### Specificity-Based Selector Sorting

Set `selectorSort: 'specificity'` to sort selectors from low to high specificity. This can help prevent specificity conflicts and make your CSS more predictable.

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
