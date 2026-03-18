declare module 'postcss-sort-media-queries' {
  import { Plugin } from 'postcss';
  const sortMediaQueries: (opts?: any) => Plugin;
  export = sortMediaQueries;
}
