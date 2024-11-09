const postcss = require('postcss');
const sortMediaQueries = require('postcss-sort-media-queries');

function cssRulesSorter(options = {}) {
    const defaultOptions = {
        sort: 'mobile-first',
        selectorSort: 'natural',
        groupByMediaType: true
    };

    const config = { ...defaultOptions, ...options };

    // Create custom sorting plugin
    const sortSelectors = () => ({
        postcssPlugin: 'sort-selectors',
        Once(root) {
            const rules = [];
            root.walkRules(rule => {
                rules.push(rule);
            });

            rules.sort((a, b) => {
                const selectorA = a.selector.toLowerCase();
                const selectorB = b.selector.toLowerCase();
                return selectorA.localeCompare(selectorB);
            });

            root.removeAll();
            rules.forEach(rule => {
                root.append(rule);
            });
        }
    });

    return {
        process: async (css) => {
            const result = await postcss([
                sortSelectors(),
                sortMediaQueries(config)
            ]).process(css, {
                from: undefined
            });

            return result.css;
        }
    };
}

module.exports = cssRulesSorter;
