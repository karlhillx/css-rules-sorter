import { PluginCreator, Plugin } from 'postcss';

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
    selectorSort?: 'natural' | ((a: string, b: string) => number);
    
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
