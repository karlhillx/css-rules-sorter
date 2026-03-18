const cssRulesSorter = require('../index');
const postcss = require('postcss');
console.log('Test file loaded');

async function run(input, opts) {
  return postcss([cssRulesSorter(opts)]).process(input, { from: undefined });
}

describe('cssRulesSorter', () => {
  test('should sort top-level selectors alphabetically', async () => {
    const css = `
            .zebra { color: black; }
            .apple { color: red; }
            .banana { color: yellow; }
        `;
    const result = await run(css);

    const expected = `
            .apple { color: red; }
            .banana { color: yellow; }
            .zebra { color: black; }
        `;
    expect(result.css.trim()).toBe(expected.trim());
  });

  test('should sort selectors within media queries', async () => {
    const css = `@media (min-width: 768px) { .zebra { color: black; } .apple { color: red; } }`;
    const result = await run(css);

    expect(result.css).toContain('.apple { color: red; }');
    expect(result.css).toContain('.zebra { color: black; }');

    const posApple = result.css.indexOf('.apple');
    const posZebra = result.css.indexOf('.zebra');
    expect(posApple).toBeLessThan(posZebra);
  });

  test('should sort media queries (mobile-first by default)', async () => {
    const css = `
            @media (min-width: 1024px) { .large { width: 100%; } }
            @media (min-width: 768px) { .medium { width: 100%; } }
        `;
    const result = await run(css);

    expect(result.css).toContain('min-width: 768px');
    const pos768 = result.css.indexOf('min-width: 768px');
    const pos1024 = result.css.indexOf('min-width: 1024px');
    expect(pos768).toBeLessThan(pos1024);
  });

  test('should sort selectors by specificity', async () => {
    const css = `
      #id { color: blue; }
      .class { color: red; }
      div { color: green; }
    `;
    const result = await run(css, { selectorSort: 'specificity' });
    const expected = `
      div { color: green; }
      .class { color: red; }
      #id { color: blue; }
    `;
    expect(result.css.trim()).toBe(expected.trim());
  });
});
