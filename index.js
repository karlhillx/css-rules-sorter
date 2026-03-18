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
    propertySort: 'none',
    propertyShorthand: 'none',
    sortLayers: true,
    groupByMediaType: true,
  };

  const config = { ...defaultOptions, ...opts };

  const specificity = (selector) => {
    const selectorWithoutPseudoElements = selector.replace(/::?[a-zA-Z-]+/g, '');
    const ids = (selectorWithoutPseudoElements.match(/#/g) || []).length;
    const classesAndAttributes = (selectorWithoutPseudoElements.match(/\.|\[/g) || []).length;
    const elements = (selectorWithoutPseudoElements.match(/[a-zA-Z-]+\b(?!#|\.)/g) || []).length;
    return ids * 100 + classesAndAttributes * 10 + elements;
  };

  const getBEMWeight = (selector) => {
    const blockModifier = /^\.[a-zA-Z0-9-]+--[a-zA-Z0-9-]+$/;
    const element = /^\.[a-zA-Z0-9-]+__[a-zA-Z0-9-]+$/;
    const elementModifier = /^\.[a-zA-Z0-9-]+__[a-zA-Z0-9-]+--[a-zA-Z0-9-]+$/;
    const base = /^\.[a-zA-Z0-9-]+$/;

    if (base.test(selector)) return 1;
    if (blockModifier.test(selector)) return 2;
    if (element.test(selector)) return 3;
    if (elementModifier.test(selector)) return 4;
    return 0; // Not a BEM selector or a complex one
  };

  const sortSelectors = (a, b) => {
    if (config.selectorSort === 'natural') {
      return a.selector.toLowerCase().localeCompare(b.selector.toLowerCase());
    }
    if (config.selectorSort === 'specificity') {
      return specificity(a.selector) - specificity(b.selector);
    }
    if (config.selectorSort === 'bem') {
      const weightA = getBEMWeight(a.selector);
      const weightB = getBEMWeight(b.selector);

      if (weightA !== weightB) {
        return weightA - weightB;
      }
      return a.selector.toLowerCase().localeCompare(b.selector.toLowerCase());
    }
    return 0;
  };

  const manageShorthand = (rule) => {
    if (config.propertyShorthand === 'expand') {
      rule.walkDecls(/^(margin|padding)$/, (decl) => {
        const parts = decl.value.split(/\s+/);
        const prop = decl.prop;
        let top, right, bottom, left;

        if (parts.length === 1) {
          top = right = bottom = left = parts[0];
        } else if (parts.length === 2) {
          top = bottom = parts[0];
          right = left = parts[1];
        } else if (parts.length === 3) {
          top = parts[0];
          right = left = parts[1];
          bottom = parts[2];
        } else {
          top = parts[0];
          right = parts[1];
          bottom = parts[2];
          left = parts[3];
        }

        decl.cloneBefore({ prop: `${prop}-top`, value: top });
        decl.cloneBefore({ prop: `${prop}-right`, value: right });
        decl.cloneBefore({ prop: `${prop}-bottom`, value: bottom });
        decl.cloneBefore({ prop: `${prop}-left`, value: left });
        decl.remove();
      });
    } else if (config.propertyShorthand === 'collapse') {
      ['margin', 'padding'].forEach((baseProp) => {
        const sides = ['top', 'right', 'bottom', 'left'];
        const values = {};
        let foundAll = true;

        sides.forEach((side) => {
          const decl = rule.nodes.find((n) => n.type === 'decl' && n.prop === `${baseProp}-${side}`);
          if (decl) {
            values[side] = decl.value;
          } else {
            foundAll = false;
          }
        });

        if (foundAll) {
          let finalValue;
          if (values.top === values.right && values.top === values.bottom && values.top === values.left) {
            finalValue = values.top;
          } else if (values.top === values.bottom && values.right === values.left) {
            finalValue = `${values.top} ${values.right}`;
          } else if (values.right === values.left) {
            finalValue = `${values.top} ${values.right} ${values.bottom}`;
          } else {
            finalValue = `${values.top} ${values.right} ${values.bottom} ${values.left}`;
          }

          rule.append({ prop: baseProp, value: finalValue });
          sides.forEach((side) => {
            const decl = rule.nodes.find((n) => n.type === 'decl' && n.prop === `${baseProp}-${side}`);
            if (decl) decl.remove();
          });
        }
      });
    }
  };

  const sortProperties = (rule) => {
    if (config.propertySort === 'alphabetical') {
      const declarations = rule.nodes.filter((node) => node.type === 'decl');
      const sorted = [...declarations].sort((a, b) =>
        a.prop.toLowerCase().localeCompare(b.prop.toLowerCase())
      );
      declarations.forEach((decl, idx) => {
        decl.replaceWith(sorted[idx].clone());
      });
    }
  };

  return {
    postcssPlugin: 'css-rules-sorter',
    Once(root) {
      if (config.sortLayers) {
        let layerOrder;
        root.walkAtRules('layer', (rule) => {
          if (!rule.nodes) {
            layerOrder = rule.params.split(',').map(name => name.trim());
            rule.remove(); // remove the declaration rule
            return false; // stop walking
          }
        });

        if (layerOrder) {
          const layers = {};
          root.walkAtRules('layer', (rule) => {
            if (rule.nodes) {
              const layerName = rule.params.trim();
              if (!layers[layerName]) {
                layers[layerName] = [];
              }
              layers[layerName].push(rule);
              rule.remove();
            }
          });

          layerOrder.forEach(layerName => {
            if (layers[layerName]) {
              layers[layerName].forEach(layerRule => {
                root.append(layerRule);
              });
            }
          });
        }
      }

      // 1. Sort rules within media queries
      root.walkAtRules('media', (atRule) => {
        const rules = atRule.nodes.filter((node) => node.type === 'rule');
        if (rules.length === 0) return;

        const sorted = [...rules].sort(sortSelectors);

        // Replace rules in place
        rules.forEach((rule, idx) => {
          const newRule = sorted[idx].clone();
          manageShorthand(newRule);
          sortProperties(newRule);
          rule.replaceWith(newRule);
        });
      });

      // 2. Sort top-level rules
      const topRules = root.nodes.filter((node) => node.type === 'rule');

      if (topRules.length > 0) {
        const sortedTopRules = [...topRules].sort(sortSelectors);

        topRules.forEach((rule, idx) => {
          const newRule = sortedTopRules[idx].clone();
          manageShorthand(newRule);
          sortProperties(newRule);
          rule.replaceWith(newRule);
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
