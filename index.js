const sortMediaQueries = require('postcss-sort-media-queries');

/**
 * PostCSS plugin to sort CSS rules
 * @param {Object} opts
 * @returns {import('postcss').Plugin}
 */
const cssRulesSorterPlugin = (opts = {}) => {
  const defaultOptions = {
    sort: 'mobile-first',
    selectorSort: 'natural',
    groupByMediaType: true,
  };

  const config = { ...defaultOptions, ...opts };

  return {
    postcssPlugin: 'css-rules-sorter',
    Once(root) {
      // 1. Sort rules within media queries
      root.walkAtRules('media', (atRule) => {
        const rules = atRule.nodes.filter((node) => node.type === 'rule');
        if (rules.length === 0) return;

        const sorted = [...rules].sort((a, b) =>
          a.selector.toLowerCase().localeCompare(b.selector.toLowerCase())
        );

        // Replace rules in place
        rules.forEach((rule, idx) => {
          rule.replaceWith(sorted[idx].clone());
        });
      });

      // 2. Sort top-level rules
      const topRules = root.nodes.filter((node) => node.type === 'rule');

      if (topRules.length > 0) {
        const sortedTopRules = [...topRules].sort((a, b) =>
          a.selector.toLowerCase().localeCompare(b.selector.toLowerCase())
        );

        topRules.forEach((rule, idx) => {
          rule.replaceWith(sortedTopRules[idx].clone());
        });
      }
    },
    async OnceExit(root, { postcss }) {
      await postcss([sortMediaQueries(config)]).process(root, { from: undefined });
    },
  };
};

cssRulesSorterPlugin.postcss = true;

/**
 * Main export as a function that can also be used as a standalone processor
 */
function main(opts = {}) {
  const plugin = cssRulesSorterPlugin(opts);

  // Attach process method for standalone usage (backward compatibility)
  plugin.process = async (css) => {
    const postcss = require('postcss');
    const result = await postcss([plugin]).process(css, { from: undefined });
    return result.css;
  };

  return plugin;
}

module.exports = main;
