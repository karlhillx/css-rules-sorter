# CSS Rules Sorter

✨ A PostCSS plugin to automatically sort CSS selectors and media queries for cleaner, more maintainable stylesheets.

[![npm version](https://badge.fury.io/js/@karlhillx/css-rules-sorter.svg)](https://badge.fury.io/js/@karlhillx/css-rules-sorter)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PostCSS 8+](https://img.shields.io/badge/PostCSS-8%2B-787CB5)](https://github.com/postcss/postcss)
[![GitHub Actions CI](https://github.com/karlhillx/@karlhillx/css-rules-sorter/actions/workflows/ci.yml/badge.svg)](https://github.com/karlhillx/@karlhillx/css-rules-sorter/actions/workflows/ci.yml)
[![Jest Tests](https://img.shields.io/badge/Tests-Jest-8854d6)](https://github.com/karlhillx/@karlhillx/css-rules-sorter/tree/main/test)

## Key Features

- **Alphabetical Selector Sorting**: Automatically sorts top-level selectors and rules within media queries for consistent code.
- **Intelligent Media Query Management**: Flexible ordering (mobile-first or desktop-first) and grouping using `postcss-sort-media-queries`.
- **Advanced Methodologies**: Built-in support for BEM-aware sorting.
- **Cascade Layer Support**: Automatically reorders `@layer` blocks to match your defined priority.
- **Modern PostCSS Support**: Fully compatible with the latest PostCSS 8+ API.
- **Developer-Focused**: Includes TypeScript definitions, comprehensive tests, and linting.

## Installation

```bash
npm install @karlhillx/css-rules-sorter postcss --save-dev
```

## Usage

Add `@karlhillx/css-rules-sorter` to your PostCSS configuration (e.g., `postcss.config.js`):

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('@karlhillx/css-rules-sorter')({
      sort: 'mobile-first', // or 'desktop-first'
      selectorSort: 'natural', // or 'bem' or 'specificity'
      propertyShorthand: 'expand', // or 'collapse'
    }),
  ],
};
```

## Configuration Options

| Option             | Type      | Default          | Description                                                                    |
| ------------------ | --------- | ---------------- | ------------------------------------------------------------------------------ |
| `sort`             | `string`  | `'mobile-first'` | Sets the media query order: `'mobile-first'` or `'desktop-first'`.             |
| `selectorSort`     | `string`  | `'natural'`      | Defines the method for sorting selectors: `'natural'`, `'specificity'`, or `'bem'`. |
| `propertySort`     | `string`  | `'none'`         | Sorts properties within each rule: `'none'` or `'alphabetical'`.               |
| `propertyShorthand`| `string`  | `'none'`         | Manages shorthand properties: `'none'`, `'expand'`, or `'collapse'`.           |
| `sortLayers`       | `boolean` | `true`           | Sorts CSS cascade layers based on the first `@layer` definition.                 |
| `groupByMediaType` | `boolean` | `true`           | Groups media queries by their type (e.g., `screen`, `print`).                  |

## Advanced Features

### BEM Selector Sorting

Set `selectorSort: 'bem'` to sort selectors based on the Block, Element, Modifier (BEM) methodology. This ensures your component structures stay logically grouped.

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

Use `propertyShorthand` to enforce a specific style for `margin` and `padding`.

- **`'expand'`**: Breaks down shorthands like `margin: 10px 20px;` into four longhand properties. Excellent for preventing accidental overrides.
- **`'collapse'`**: Combines longhand properties into a single shorthand when all four sides are present.

### Cascade Layer Sorting

Set `sortLayers: true` to automatically reorder your `@layer` blocks to match the priority defined in your first `@layer` rule.

**Before:**
```css
@layer components, base, reset;

@layer base { body { color: red; } }
@layer reset { * { margin: 0; } }
@layer components { .btn { padding: 1em; } }
```

**After:**
```css
@layer reset { * { margin: 0; } }
@layer base { body { color: red; } }
@layer components { .btn { padding: 1em; } }
```

## Development

```bash
# Install all dependencies
npm install

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Contributing

1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/your-feature`).
3.  Commit your changes (`git commit -m 'Add your feature'`).
4.  Push to the branch (`git push origin feature/your-feature`).
5.  Create a Pull Request.

## License

MIT License. See [LICENSE](LICENSE) for details.
