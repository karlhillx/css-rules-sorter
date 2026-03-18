const cssRulesSorter = require('../index');
const postcss = require('postcss');

async function run(input, opts = {}) {
  const result = await postcss([cssRulesSorter(opts)]).process(input, { from: undefined });
  return result.css;
}

describe('css-rules-sorter', () => {
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

  test('organizes media queries (desktop-first)', async () => {
    const input = `
      @media (max-width: 1024px) { .large { color: blue; } }
      @media (max-width: 768px) { .medium { color: green; } }
    `;
    const output = await run(input, { sort: 'desktop-first' });
    const mediumIndex = output.indexOf('max-width: 768px');
    const largeIndex = output.indexOf('max-width: 1024px');
    expect(largeIndex).toBeLessThan(mediumIndex);
  });

  test('works with standalone process method', async () => {
    const input = `.z { color: 0; } .a { color: 1; }`;
    const sorter = cssRulesSorter();
    const output = await sorter.process(input);
    expect(output).toMatch(/\.a[\s\S]*\.z/);
  });
});
