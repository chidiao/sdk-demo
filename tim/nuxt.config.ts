// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: false,
  modules: ['@unocss/nuxt'],
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }
    },
    optimizeDeps: {
      include: [
        '@tencentcloud/chat-uikit-engine-lite',
        '@tencentcloud/tui-core-lite',
        '@tencentcloud/tui-emoji-plugin',
        '@tencentcloud/universal-api',
        '@tiptap/core',
        '@tiptap/extension-document',
        '@tiptap/extension-hard-break',
        '@tiptap/extension-image',
        '@tiptap/extension-mention',
        '@tiptap/extension-paragraph',
        '@tiptap/extension-placeholder',
        '@tiptap/extension-text',
        '@vue/composition-api',
        'dayjs', // CJS
        'dayjs/locale/zh-cn', // CJS
        'dayjs/plugin/isSameOrAfter.js', // CJS
        'dayjs/plugin/isSameOrBefore.js', // CJS
        'dayjs/plugin/localeData.js', // CJS
        'dompurify',
        'highlight.js',
        'i18next',
        'marked',
        'marked-highlight'
      ]
    }
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        verbatimModuleSyntax: false
      }
    }
  }
})
