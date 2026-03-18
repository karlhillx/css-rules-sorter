const sortMediaQueries = require('postcss-sort-media-queries');

/**
 * Parses a BEM selector into its parts.
 * .block__element--modifier
 */
function parseBEM(selector) {
  // Support both .block__element and .block--modifier and .block__element--modifier
  // and simple .block
  const match = selector.match(/^\.([a-zA-Z0-9-]+?)(?:__([a-zA-Z0-9-]+?))?(?:--([a-zA-Z0-9-]+?))?$/);
  if (!match) return { block: selector, element: '', modifier: '', original: selector };
  return {
    block: match[1],
    element: match[2] || '',
    modifier: match[3] || '',
    original: selector
  };
}

/**
 * Compare two BEM selectors.
 */
function compareBEM(a, b) {
  const bemA = parseBEM(a);
  const bemB = parseBEM(b);

  if (bemA.block !== bemB.block) {
    return bemA.block.localeCompare(bemB.block);
  }

  // Same block.
  // Desired order: 
  // 1. Block itself (.card)
  // 2. Block modifiers (.card--featured)
  // 3. Elements (.card__header)
  // 4. Element modifiers (.card__header--active)

  // Case 1: Both are the base block
  if (!bemA.element && !bemA.modifier && !bemB.element && !bemB.modifier) return 0;

  // Case 2: One is base block
  if (!bemA.element && !bemA.modifier) return -1;
  if (!bemB.element && !bemB.modifier) return 1;

  // Case 3: Both are block modifiers (no element)
  if (bemA.modifier && !bemA.element && bemB.modifier && !bemB.element) {
    return bemA.modifier.localeCompare(bemB.modifier);
  }

  // Case 4: One is block modifier, other is element (or element modifier)
  if (bemA.modifier && !bemA.element && bemB.element) return -1;
  if (bemB.modifier && !bemB.element && bemA.element) return 1;

  // Case 5: Both are elements
  if (bemA.element && bemB.element) {
    if (bemA.element !== bemB.element) {
      return bemA.element.localeCompare(bemB.element);
    }
    // Same element, check modifiers
    if (!bemA.modifier && bemB.modifier) return -1;
    if (bemA.modifier && !bemB.modifier) return 1;
    return (bemA.modifier || '').localeCompare(bemB.modifier || '');
  }

  return a.localeCompare(b);
}

/**
 * Expand shorthand properties.
 */
function expandShorthand(decl) {
  if (decl.prop === 'border') {
    const values = decl.value.split(/\s+/);
    const width = values.find(v => v.match(/^\d|thin|medium|thick/)) || 'medium';
    const style = values.find(v => v.match(/none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset/)) || 'none';
    const color = values.find(v => !v.match(/^\d|thin|medium|thick|none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset/)) || 'black';

    decl.cloneBefore({ prop: 'border-width', value: width });
    decl.cloneBefore({ prop: 'border-style', value: style });
    decl.cloneBefore({ prop: 'border-color', value: color });
    decl.remove();
  } else if (decl.prop === 'margin' || decl.prop === 'padding') {
    const values = decl.value.split(/\s+/);
    let top, right, bottom, left;

    if (values.length === 1) {
      top = right = bottom = left = values[0];
    } else if (values.length === 2) {
      top = bottom = values[0];
      right = left = values[1];
    } else if (values.length === 3) {
      top = values[0];
      right = left = values[1];
      bottom = values[2];
    } else {
      top = values[0];
      right = values[1];
      bottom = values[2];
      left = values[3];
    }

    decl.cloneBefore({ prop: `${decl.prop}-top`, value: top });
    decl.cloneBefore({ prop: `${decl.prop}-right`, value: right });
    decl.cloneBefore({ prop: `${decl.prop}-bottom`, value: bottom });
    decl.cloneBefore({ prop: `${decl.prop}-left`, value: left });
    decl.remove();
  }
}

/**
 * Collapse longhand properties.
 */
function collapseLonghands(rule) {
  const properties = {};
  rule.walkDecls(decl => {
    properties[decl.prop] = decl;
  });

  // Border collapse
  if (properties['border-width'] && properties['border-style'] && properties['border-color']) {
    properties['border-width'].cloneBefore({
      prop: 'border',
      value: `${properties['border-width'].value} ${properties['border-style'].value} ${properties['border-color'].value}`
    });
    properties['border-width'].remove();
    properties['border-style'].remove();
    properties['border-color'].remove();
  }

  // Margin/Padding collapse
  ['margin', 'padding'].forEach(type => {
    const top = properties[`${type}-top`];
    const right = properties[`${type}-right`];
    const bottom = properties[`${type}-bottom`];
    const left = properties[`${type}-left`];

    if (top && right && bottom && left) {
      let value;
      if (top.value === right.value && top.value === bottom.value && top.value === left.value) {
        value = top.value;
      } else if (top.value === bottom.value && right.value === left.value) {
        value = `${top.value} ${right.value}`;
      } else if (right.value === left.value) {
        value = `${top.value} ${right.value} ${bottom.value}`;
      } else {
        value = `${top.value} ${right.value} ${bottom.value} ${left.value}`;
      }

      top.cloneBefore({ prop: type, value });
      top.remove();
      right.remove();
      bottom.remove();
      left.remove();
    }
  });
}

const specificity = (selector) => {
  const selectorWithoutPseudoElements = selector.replace(/::?[a-zA-Z-]+/g, '');
  const ids = (selectorWithoutPseudoElements.match(/#/g) || []).length;
  const classesAndAttributes = (selectorWithoutPseudoElements.match(/\.|\[/g) || []).length;
  const elements = (selectorWithoutPseudoElements.match(/[a-zA-Z-]+\b(?!#|\.)/g) || []).length;
  return ids * 100 + classesAndAttributes * 10 + elements;
};

/**
 * PostCSS plugin to sort CSS rules
 * @param {Object} opts
 * @returns {import('postcss').Plugin}
 */
const cssRulesSorterPlugin = (opts = {}) => {
  const defaultOptions = {
    sort: 'mobile-first',
    selectorSort: 'natural',
    propertySort: 'natural',
    propertyShorthand: 'none',
    sortLayers: false,
    groupByMediaType: true,
  };

  const config = { ...defaultOptions, ...opts };

  return {
    postcssPlugin: 'css-rules-sorter',
    Once(root) {
      // 0. Layer sorting
      if (config.sortLayers) {
        const layerOrderAtRule = root.nodes.find(node => node.type === 'atrule' && node.name === 'layer' && node.params.includes(','));
        if (layerOrderAtRule) {
          const order = layerOrderAtRule.params.split(',').map(s => s.trim());
          const layerBlocks = root.nodes.filter(node => node.type === 'atrule' && node.name === 'layer' && !node.params.includes(','));

          const sortedLayers = [...layerBlocks].sort((a, b) => {
            return order.indexOf(a.params.trim()) - order.indexOf(b.params.trim());
          });

          // Re-insert in order after the definition
          let lastNode = layerOrderAtRule;
          sortedLayers.forEach(layer => {
            const clone = layer.clone();
            layer.remove();
            lastNode.after(clone);
            lastNode = clone;
          });
        }
      }

      // 1. Property Management
      root.walkRules(rule => {
        if (config.propertyShorthand === 'expand') {
          rule.walkDecls(expandShorthand);
        } else if (config.propertyShorthand === 'collapse') {
          collapseLonghands(rule);
        }

        // Property Sorting
        if (config.propertySort === 'natural') {
          const decls = rule.nodes.filter(node => node.type === 'decl');
          if (decls.length > 1) {
            const sorted = [...decls].sort((a, b) => a.prop.localeCompare(b.prop));
            decls.forEach((decl, idx) => {
              decl.replaceWith(sorted[idx].clone());
            });
          }
        }
      });

      const sortSelectors = (a, b) => {
        if (config.selectorSort === 'bem') {
          return compareBEM(a.selector, b.selector);
        }
        if (config.selectorSort === 'specificity') {
          return specificity(a.selector) - specificity(b.selector);
        }
        return a.selector.toLowerCase().localeCompare(b.selector.toLowerCase());
      };

      // 2. Sort rules within media queries
      root.walkAtRules('media', (atRule) => {
        const rules = atRule.nodes.filter((node) => node.type === 'rule');
        if (rules.length === 0) return;

        const sorted = [...rules].sort(sortSelectors);

        // Replace rules in place
        rules.forEach((rule, idx) => {
          rule.replaceWith(sorted[idx].clone());
        });
      });

      // 3. Sort top-level rules
      const topRules = root.nodes.filter((node) => node.type === 'rule');

      if (topRules.length > 0) {
        const sortedTopRules = [...topRules].sort(sortSelectors);

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
