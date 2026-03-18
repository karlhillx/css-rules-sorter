const cssRulesSorter = require('../index');
const postcss = require('postcss');

async function run(input, opts = {}) {
  const result = await postcss([cssRulesSorter(opts)]).process(input, { from: undefined });
  return result.css;
}

describe('css-rules-sorter', () => {
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
        .card__header { color: red; }
        .card--featured { color: blue; }
        .card { color: black; }
      `;
      const output = await run(input, { selectorSort: 'bem' });
      expect(output).toMatch(/\.card[\s\S]*\.card--featured[\s\S]*\.card__header/);
    });

    test('Specificity sorting orders low to high', async () => {
      const input = `
        #id { color: blue; }
        .class { color: red; }
        div { color: green; }
      `;
      const output = await run(input, { selectorSort: 'specificity' });
      expect(output).toMatch(/div[\s\S]*\.class[\s\S]*#id/);
    });

    test('Shorthand expansion (expand)', async () => {
      const input = `.box { margin: 10px 20px; }`;
      const output = await run(input, { propertyShorthand: 'expand' });
      expect(output).toContain('margin-top: 10px;');
      expect(output).toContain('margin-right: 20px;');
      expect(output).toContain('margin-bottom: 10px;');
      expect(output).toContain('margin-left: 20px;');
    });

    test('Shorthand collapsing (collapse)', async () => {
      const input = `
        .box {
          margin-top: 10px;
          margin-right: 20px;
          margin-bottom: 10px;
          margin-left: 20px;
        }
      `;
      const output = await run(input, { propertyShorthand: 'collapse' });
      expect(output).toContain('margin: 10px 20px;');
    });

    test('Cascade Layer reordering', async () => {
      const input = `
        @layer components, base;
        @layer base { body { color: red; } }
        @layer components { .btn { color: blue; } }
      `;
      const output = await run(input, { sortLayers: true });
      const baseIndex = output.indexOf('@layer base');
      const componentsIndex = output.indexOf('@layer components');
      expect(componentsIndex).toBeLessThan(baseIndex);
    });
  });

  test('works with standalone process method', async () => {
    const input = `.z { color: 0; } .a { color: 1; }`;
    const sorter = cssRulesSorter();
    const output = await sorter.process(input);
    expect(output).toMatch(/\.a[\s\S]*\.z/);
  });
});
