// nuxt.config.ts
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

  // ✅ 올바른 Nitro 프록시 설정
  nitro: {
    devProxy: {
      // ✅ 방법 1: 경로별로 각각 설정 (권장)
      '/api/auth/**': {
        target: 'http://localhost:8082/api/auth',
        changeOrigin: true,
        pathRewrite: {
          '^/api/auth': ''
        }
      },
      '/api/users/**': {
        target: 'http://localhost:8082/api/users',
        changeOrigin: true,
        pathRewrite: {
          '^/api/users': ''
        }
      },
      '/api/admin/**': {
        target: 'http://localhost:8082/api/admin',
        changeOrigin: true,
        pathRewrite: {
          '^/api/admin': ''
        }
      },

      // Posts 서비스 (8081 포트)
      '/api/posts/**': {
        target: 'http://localhost:8081/api/posts',
        changeOrigin: true,
        pathRewrite: {
          '^/api/posts': ''
        }
      },
      '/api/notices/**': {
        target: 'http://localhost:8081/api/notices',
        changeOrigin: true,
        pathRewrite: {
          '^/api/notices': ''
        }
      },
      '/api/comments/**': {
        target: 'http://localhost:8081/api/comments',
        changeOrigin: true,
        pathRewrite: {
          '^/api/comments': ''
        }
      },
      '/api/files/**': {
        target: 'http://localhost:8081/api/files',
        changeOrigin: true,
        pathRewrite: {
          '^/api/files': ''
        }
      }
    }
  },

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