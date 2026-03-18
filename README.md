# @karlhillx/css-rules-sorter

✨ **The Professional CSS Management Engine for PostCSS.**

`@karlhillx/css-rules-sorter` is a high-performance PostCSS plugin designed to bring rigorous architectural discipline to your stylesheets. Moving beyond simple alphabetical sorting, it provides a comprehensive suite of tools for managing selectors, properties, media queries, and cascade layers with surgical precision.

[![npm version](https://badge.fury.io/js/%40karlhillx%2Fcss-rules-sorter.svg)](https://badge.fury.io/js/@karlhillx/css-rules-sorter)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PostCSS 8+](https://img.shields.io/badge/PostCSS-8%2B-787CB5)](https://github.com/postcss/postcss)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)
[![GitHub Actions CI](https://github.com/karlhillx/css-rules-sorter/actions/workflows/ci.yml/badge.svg)](https://github.com/karlhillx/css-rules-sorter/actions/workflows/ci.yml)

## Why Choose This Sorter?

- **Architectural Awareness**: Built-in support for **BEM (Block Element Modifier)** methodology, ensuring your component structures remain logically grouped and readable.
- **Shorthand Intelligence**: Sophisticated property management that can **expand** shorthands into longhands for granular control or **collapse** them for cleaner production code.
- **Cascade Layer Sovereignty**: Automatically reorders `@layer` blocks to strictly adhere to your defined architectural priority, preventing specificity leaks.
- **Media Query Orchestration**: Flexible mobile-first or desktop-first ordering with intelligent grouping via `postcss-sort-media-queries`.
- **Native TypeScript**: Completely rewritten in TypeScript with first-class type definitions for a robust developer experience.
- **Modern Build Pipeline**: Optimized CJS and ESM outputs for maximum compatibility across modern toolchains.

## Installation

```bash
npm install @karlhillx/css-rules-sorter postcss --save-dev
```

## Usage

Add `@karlhillx/css-rules-sorter` to your PostCSS configuration:

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('@karlhillx/css-rules-sorter')({
      sort: 'mobile-first',        // 'mobile-first' | 'desktop-first'
      selectorSort: 'bem',         // 'natural' | 'specificity' | 'bem'
      propertyShorthand: 'expand', // 'none' | 'expand' | 'collapse'
      sortLayers: true,            // Reorder @layer blocks
    }),
  ],
};
```

## Configuration Options

| Option              | Type      | Default          | Description                                                                     |
| ------------------- | --------- | ---------------- | ------------------------------------------------------------------------------- |
| `sort`              | `string`  | `'mobile-first'` | Sets the media query order: `'mobile-first'` or `'desktop-first'`.              |
| `selectorSort`      | `string`  | `'natural'`      | Method for sorting selectors: `'natural'`, `'specificity'`, or `'bem'`.          |
| `propertySort`      | `string`  | `'none'`         | Sorts properties within each rule: `'none'` or `'alphabetical'`.                |
| `propertyShorthand` | `string`  | `'none'`         | Manages shorthands: `'none'`, `'expand'` (split), or `'collapse'` (combine).    |
| `sortLayers`        | `boolean` | `true`           | Sorts CSS cascade layers based on the priority in the first `@layer` definition. |
| `groupByMediaType`  | `boolean` | `true`           | Groups media queries by their type (e.g., `screen`, `print`).                   |

## Advanced Features

### BEM Selector Sorting

Setting `selectorSort: 'bem'` ensures your CSS follows the logical structure of your components. It intelligently groups base blocks, followed by their modifiers, then elements, and finally element modifiers.

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

### Shorthand & Longhand Management

- **`'expand'`**: Transforms `margin: 10px 20px;` into `margin-top`, `margin-right`, etc. Highly recommended during development to prevent accidental property overrides.
- **`'collapse'`**: Intelligently combines related longhand properties back into a single shorthand when all sides are defined.

### Cascade Layer Sorting

With `sortLayers: true`, the plugin finds your layer priority definition (e.g., `@layer reset, base, components;`) and reorders all subsequent `@layer` blocks to match that exact sequence.

## Development & Contributing

The project uses a modern TypeScript-based workflow:

```bash
npm install    # Install dependencies
npm run build  # Generate dist/ (CJS, ESM, and .d.ts)
npm test       # Run the Jest test suite with coverage
npm run lint   # Run ESLint for code quality
```

Contributions welcome! Fork, branch, commit, and open a Pull Request.

## License

MIT License. See [LICENSE](LICENSE) for details.
