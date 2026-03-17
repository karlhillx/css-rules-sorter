const cssRulesSorter = require('../index');

describe('cssRulesSorter', () => {
  test('should sort top-level selectors alphabetically', async () => {
    const css = `
            .zebra { color: black; }
            .apple { color: red; }
            .banana { color: yellow; }
        `;
    const sorter = cssRulesSorter();
    const result = await sorter.process(css);

    const expected = `
            .apple { color: red; }
            .banana { color: yellow; }
            .zebra { color: black; }
        `;
    expect(result.trim()).toBe(expected.trim());
  });

  test('should sort selectors within media queries', async () => {
    const css = `@media (min-width: 768px) { .zebra { color: black; } .apple { color: red; } }`;
    const sorter = cssRulesSorter();
    const result = await sorter.process(css);

    expect(result).toContain('.apple { color: red; }');
    expect(result).toContain('.zebra { color: black; }');

    const posApple = result.indexOf('.apple');
    const posZebra = result.indexOf('.zebra');
    expect(posApple).toBeLessThan(posZebra);
  });

  test('should sort media queries (mobile-first by default)', async () => {
    const css = `
            @media (min-width: 1024px) { .large { width: 100%; } }
            @media (min-width: 768px) { .medium { width: 100%; } }
        `;
    const sorter = cssRulesSorter();
    const result = await sorter.process(css);

    expect(result).toContain('min-width: 768px');
    const pos768 = result.indexOf('min-width: 768px');
    const pos1024 = result.indexOf('min-width: 1024px');
    expect(pos768).toBeLessThan(pos1024);
  });
});
