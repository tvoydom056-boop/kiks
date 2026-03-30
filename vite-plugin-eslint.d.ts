declare module 'vite-plugin-eslint' {
  import type { Plugin } from 'vite'

  interface ESLintPluginOptions {
    include?: string | string[]
    exclude?: string | string[]
    cache?: boolean
    fix?: boolean
    emitWarning?: boolean
    emitError?: boolean
    failOnWarning?: boolean
    failOnError?: boolean
  }

  export default function eslintPlugin(options?: ESLintPluginOptions): Plugin
}
