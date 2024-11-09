const postcss = require('postcss');
const sortMediaQueries = require('postcss-sort-media-queries');

function cssRulesSorter(options = {}) {
    const defaultOptions = {
        sort: 'mobile-first',
        selectorSort: 'natural',
        groupByMediaType: true
    };

    const config = { ...defaultOptions, ...options };

    const sortSelectors = () => ({
        postcssPlugin: 'sort-selectors',
        Once(root) {
            // First, sort rules within each media query
            root.walkAtRules('media', atRule => {
                const rules = atRule.nodes.filter(node => node.type === 'rule');
                const sorted = rules.sort((a, b) =>
                    a.selector.toLowerCase().localeCompare(b.selector.toLowerCase())
                );

                // Preserve other nodes that aren't rules
                const otherNodes = atRule.nodes.filter(node => node.type !== 'rule');

                atRule.removeAll();
                sorted.forEach(rule => atRule.append(rule.clone()));
                otherNodes.forEach(node => atRule.append(node.clone()));
            });

            // Sort top-level rules separately
            const topRules = root.nodes.filter(node =>
                node.type === 'rule' && node.parent.type === 'root'
            );

            // Store media queries and other at-rules
            const atRules = root.nodes.filter(node =>
                node.type === 'atrule'
            );

            // Sort top-level rules
            const sortedTopRules = topRules.sort((a, b) =>
                a.selector.toLowerCase().localeCompare(b.selector.toLowerCase())
            );

            // Rebuild the root with correct order
            root.removeAll();

            // Add sorted top-level rules
            sortedTopRules.forEach(rule => root.append(rule.clone()));

            // Add media queries and other at-rules back in their original order
            atRules.forEach(rule => root.append(rule.clone()));
        }
    });

    return {
        process: async (css) => {
            const result = await postcss([
                sortSelectors(),
                sortMediaQueries(config)
            ]).process(css, { from: undefined });

            return result.css;
        }
    };
}

module.exports = cssRulesSorter;