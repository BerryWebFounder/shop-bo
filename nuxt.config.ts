export default defineNuxtConfig({
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8081/api',
      usersApiBaseUrl: process.env.USERS_API_BASE_URL || 'http://localhost:8082/api',
      apiTimeout: process.env.API_TIMEOUT || 10000,
    }
  },

  ssr: true,

  devServer: {
    port: 3001,
    host: '0.0.0.0'
  },

  // ✅ devProxy 제거 - server/api 사용
  // nitro: {
  //   devProxy: { ... }
  // },

  // CORS 라우트 규칙
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true'
      }
    }
  },

  router: {
    options: {
      linkActiveClass: 'nav-link-active',
      linkExactActiveClass: 'nav-link-active'
    }
  },

  app: {
    head: {
      title: 'Shop BackOffice',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '상점 관리 백오피스 시스템' },
        { name: 'theme-color', content: '#0ea5e9' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' }
      ]
    }
  },

  build: {
    transpile: []
  },

  typescript: {
    typeCheck: false
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  imports: {
    dirs: ['composables/**', 'utils/**']
  },

  plugins: [
    '~/plugins/api.client.js',
    '~/plugins/auth.client.js'
  ],

  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true
  },

  $development: {
    devtools: { enabled: true },
    debug: true
  },

  $production: {
    devtools: { enabled: false },
    debug: false
  }
})