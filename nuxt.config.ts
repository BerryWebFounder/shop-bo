// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },

  // CSS 설정
  css: ['~/assets/css/main.css'],

  // PostCSS 설정
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  // 모듈 설정
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],

  // 런타임 설정
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8081/api',
      usersApiBaseUrl: process.env.USERS_API_BASE_URL || 'http://localhost:8082/api',
      apiTimeout: process.env.API_TIMEOUT || 10000,
    }
  },

  // 서버 사이드 렌더링 설정
  ssr: true,

  // 개발 서버 설정
  devServer: {
    port: 3001,
    host: '0.0.0.0'
  },

  // ✅ 수정된 Nitro 설정 (API 프록시)
  nitro: {
    devProxy: {
      // Posts 서비스 프록시 (수정됨)
      '/api/posts': {
        target: 'http://localhost:8081/api/posts',
        changeOrigin: true,
        prependPath: true, // ✅ true로 변경
      },
      '/api/notices': {
        target: 'http://localhost:8081/api/notices',
        changeOrigin: true,
        prependPath: true, // ✅ true로 변경
      },
      '/api/comments': {
        target: 'http://localhost:8081/api/comments',
        changeOrigin: true,
        prependPath: true, // ✅ true로 변경
      },
      '/api/files': {
        target: 'http://localhost:8081/api/files',
        changeOrigin: true,
        prependPath: true, // ✅ true로 변경
      },

      // Users 서비스 프록시 (수정됨)
      '/api/auth': {
        target: 'http://localhost:8082/api', // ✅ /auth 제거
        changeOrigin: true,
        prependPath: true, // ✅ true로 변경
        // ✅ CORS 헤더 추가
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true'
        }
      },
      '/api/users': {
        target: 'http://localhost:8082/api', // ✅ /users 제거
        changeOrigin: true,
        prependPath: true, // ✅ true로 변경
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true'
        }
      },
      '/api/admin': {
        target: 'http://localhost:8082/api', // ✅ /admin 제거
        changeOrigin: true,
        prependPath: true, // ✅ true로 변경
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true'
        }
      }
    }
  },

  // ✅ CORS 라우트 규칙 추가
  routeRules: {
    // API 라우트에 CORS 설정
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true'
      }
    }
  },

  // 라우터 설정
  router: {
    options: {
      linkActiveClass: 'nav-link-active',
      linkExactActiveClass: 'nav-link-active'
    }
  },

  // 앱 설정
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

  // 빌드 설정
  build: {
    transpile: []
  },

  // 타입스크립트 설정
  typescript: {
    typeCheck: false
  },

  // 컴포넌트 자동 import 설정
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  // Auto import 설정
  imports: {
    dirs: ['composables/**', 'utils/**']
  },

  // 플러그인 설정
  plugins: [
    '~/plugins/api.client.js',
    '~/plugins/auth.client.js'
  ],

  // 실험적 기능
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true
  },

  // 환경별 설정
  $development: {
    devtools: { enabled: true },
    debug: true
  },

  $production: {
    devtools: { enabled: false },
    debug: false
  }
})