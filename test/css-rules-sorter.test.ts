/* eslint-disable @typescript-eslint/no-require-imports */
const cssRulesSorter = require('../src/index');
/* eslint-enable @typescript-eslint/no-require-imports */
import postcss from 'postcss';

async function run(input: string, opts: any = {}) {
  const result = await postcss([cssRulesSorter(opts)]).process(input, { from: undefined });
  return result.css;
}

describe('css-rules-sorter', () => {
  test('works with standalone process method', async () => {
    const input = `.z { color: 0; } .a { color: 1; }`;
    const sorter = cssRulesSorter();
    const output = await sorter.process(input);
    expect(output).toMatch(/\.a[\s\S]*\.z/);
  });

  describe('Basic Sorting', () => {
    test('sorts top-level selectors alphabetically', async () => {
      const input = `
        .zebra { color: black; }
        .apple { color: red; }
        .banana { color: yellow; }
      `;
      const output = await run(input);
      expect(output).toMatch(/\.apple[\s\S]*\.banana[\s\S]*\.zebra/);
    });

    test('sorts selectors within media queries alphabetically', async () => {
      const input = `
        @media (min-width: 768px) {
          .zebra { color: black; }
          .apple { color: red; }
        }
      `;
      const output = await run(input);
      expect(output).toMatch(/@media[\s\S]*\.apple[\s\S]*\.zebra/);
    });

    test('organizes media queries (mobile-first by default)', async () => {
      const input = `
        @media (min-width: 1024px) { .large { color: blue; } }
        @media (min-width: 768px) { .medium { color: green; } }
        .top { color: red; }
      `;
      const output = await run(input);
      const mediumIndex = output.indexOf('min-width: 768px');
      const largeIndex = output.indexOf('min-width: 1024px');
      expect(mediumIndex).toBeLessThan(largeIndex);
    });
  });

  describe('Architectural Features', () => {
    test('BEM sorting groups modifiers and elements correctly', async () => {
      const input = `
        .card__header { color: grey; }
        .card--featured { color: gold; }
        .card { color: black; }
      `;
      const output = await run(input, { selectorSort: 'bem' });
      const card = output.indexOf('.card {');
      const featured = output.indexOf('.card--featured');
      const header = output.indexOf('.card__header');
      expect(card).toBeLessThan(featured);
      expect(featured).toBeLessThan(header);
    });

    test('Specificity sorting orders low to high', async () => {
      const input = `
        #id { color: red; }
        .class { color: blue; }
        element { color: green; }
      `;
      const output = await run(input, { selectorSort: 'specificity' });
      const el = output.indexOf('element {');
      const cl = output.indexOf('.class {');
      const id = output.indexOf('#id {');
      expect(el).toBeLessThan(cl);
      expect(cl).toBeLessThan(id);
    });

    test('Shorthand expansion (expand)', async () => {
      const input = `.box { margin: 10px 20px; }`;
      const output = await run(input, { propertyShorthand: 'expand' });
      expect(output).toContain('margin-top: 10px');
      expect(output).toContain('margin-right: 20px');
      expect(output).toContain('margin-bottom: 10px');
      expect(output).toContain('margin-left: 20px');
    });

    test('Shorthand collapsing (collapse)', async () => {
      const input = `.box { margin-top: 10px; margin-right: 20px; margin-bottom: 10px; margin-left: 20px; }`;
      const output = await run(input, { propertyShorthand: 'collapse' });
      expect(output).toContain('margin: 10px 20px');
    });

    test('Cascade Layer reordering', async () => {
      const input = `
        @layer components, reset, base;
        @layer base { body { margin: 0; } }
        @layer reset { * { box-sizing: border-box; } }
        @layer components { .card { padding: 1rem; } }
      `;
      const output = await run(input, { sortLayers: true });
      const comp = output.indexOf('@layer components {');
      const reset = output.indexOf('@layer reset {');
      const base = output.indexOf('@layer base {');
      expect(comp).toBeLessThan(reset);
      expect(reset).toBeLessThan(base);
    });

    test('Property sorting alphabetically by default', async () => {
      const input = `.box { z-index: 10; color: red; background: blue; }`;
      const output = await run(input);
      const background = output.indexOf('background: blue');
      const color = output.indexOf('color: red');
      const zIndex = output.indexOf('z-index: 10');

      expect(background).toBeLessThan(color);
      expect(color).toBeLessThan(zIndex);
    });
  });
});
