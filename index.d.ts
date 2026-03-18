import { Plugin } from 'postcss';

declare namespace cssRulesSorter {
  interface Options {
    /**
     * Media query order: 'mobile-first' or 'desktop-first'
     * @default 'mobile-first'
     */
    sort?: 'mobile-first' | 'desktop-first';
    
    /**
     * Method for sorting selectors
     * @default 'natural'
     */
    selectorSort?: 'natural' | 'specificity' | 'bem' | ((a: any, b: any) => number);

    /**
     * Method for sorting properties within rules
     * @default 'none'
     */
    propertySort?: 'none' | 'alphabetical';

    /**
     * Manage shorthand properties by expanding or collapsing them
     * @default 'none'
     */
    propertyShorthand?: 'none' | 'expand' | 'collapse';

    /**
     * Sort CSS cascade layers based on the first @layer definition
     * @default true
     */
    sortLayers?: boolean;
    
    /**
     * Whether to group media queries by type
     * @default true
     */
    groupByMediaType?: boolean;
  }

  interface StandalonePlugin extends Plugin {
    /**
     * Convenience method for standalone usage
     */
    process(css: string): Promise<string>;
  }
}

declare const cssRulesSorter: (opts?: cssRulesSorter.Options) => cssRulesSorter.StandalonePlugin;

export = cssRulesSorter;
