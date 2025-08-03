// plugins/api.client.js
export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()

    // 기본 API 클라이언트 생성
    const api = $fetch.create({
        baseURL: config.public.apiBaseUrl,
        timeout: config.public.apiTimeout,

        onRequest({ request, options }) {
            // 요청 로깅
            console.log(`[API Request] ${options.method || 'GET'} ${request}`)

            // 인증 토큰 추가 (나중에 필요시)
            const token = useCookie('auth-token').value
            if (token) {
                options.headers = {
                    ...options.headers,
                    Authorization: `Bearer ${token}`
                }
            }

            // Content-Type 설정
            if (options.body && typeof options.body === 'object') {
                options.headers = {
                    ...options.headers,
                    'Content-Type': 'application/json'
                }
            }
        },

        onResponse({ response }) {
            // 응답 로깅
            console.log(`[API Response] ${response.status} ${response.url}`)
        },

        onResponseError({ response, request }) {
            // 에러 로깅
            console.error(`[API Error] ${response.status} ${request}`, response._data)

            // 인증 에러 처리
            if (response.status === 401) {
                // navigateTo('/login') // 로그인 페이지로 리다이렉트
                console.warn('인증이 필요합니다.')
            }
        }
    })

    // Upload 전용 클라이언트 (multipart/form-data)
    const uploadApi = $fetch.create({
        baseURL: config.public.apiBaseUrl,
        timeout: 30000, // 파일 업로드는 타임아웃을 길게

        onRequest({ request, options }) {
            console.log(`[Upload Request] ${options.method || 'POST'} ${request}`)

            const token = useCookie('auth-token').value
            if (token) {
                options.headers = {
                    ...options.headers,
                    Authorization: `Bearer ${token}`
                }
            }
            // multipart/form-data는 브라우저가 자동으로 설정하므로 Content-Type 설정하지 않음
        },

        onResponseError({ response, request }) {
            console.error(`[Upload Error] ${response.status} ${request}`, response._data)
        }
    })

    return {
        provide: {
            api,
            uploadApi
        }
    }
})