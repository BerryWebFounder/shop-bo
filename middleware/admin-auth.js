// 관리자 전용 미들웨어
export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore()
    const { $auth } = useNuxtApp()

    if (process.client) {
        // 기본 인증 확인
        if (!$auth.isLoggedIn() || $auth.isTokenExpired()) {
            return navigateTo('/login')
        }

        // 사용자 정보가 없는 경우 로드 후 권한 확인
        if (!authStore.user && !authStore.loading) {
            return authStore.getCurrentUser().then(() => {
                if (!authStore.isAdmin) {
                    throw createError({
                        statusCode: 403,
                        statusMessage: '관리자만 접근할 수 있습니다.'
                    })
                }
            }).catch((error) => {
                if (error.statusCode === 403) {
                    throw error
                }
                authStore.logout()
                return navigateTo('/login')
            })
        }

        // 관리자 권한 확인
        if (authStore.user && !authStore.isAdmin) {
            throw createError({
                statusCode: 403,
                statusMessage: '관리자만 접근할 수 있습니다.'
            })
        }
    }
})