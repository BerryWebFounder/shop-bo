// plugins/api.client.js
export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()

    const api = $fetch.create({
        baseURL: config.public.apiBase,
        onRequest({ request, options }) {
            // 요청 인터셉터
            const token = useCookie('auth-token').value
            if (token) {
                options.headers = {
                    ...options.headers,
                    Authorization: `Bearer ${token}`
                }
            }
        },
        onResponseError({ response }) {
            // 에러 핸들링
            if (response.status === 401) {
                navigateTo('/login')
            }
        }
    })

    return {
        provide: {
            api
        }
    }
})