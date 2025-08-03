export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore()
    const { $auth } = useNuxtApp()

    // 클라이언트 사이드에서만 실행
    if (process.client) {
        // 토큰이 없거나 만료된 경우
        if (!$auth.isLoggedIn() || $auth.isTokenExpired()) {
            // 로그인 페이지가 아닌 경우에만 리다이렉트
            if (to.path !== '/login') {
                return navigateTo('/login')
            }
        }

        // 사용자 정보가 없는 경우 로드 시도
        if ($auth.isLoggedIn() && !authStore.user && !authStore.loading) {
            authStore.getCurrentUser().catch(() => {
                // 사용자 정보 로드 실패 시 로그아웃
                authStore.logout()
                return navigateTo('/login')
            })
        }
    }
})

// 관리자 전용 미들웨어
export const adminAuth = defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore()
    const { $auth } = useNuxtApp()

    if (process.client) {
        // 기본 인증 확인
        if (!$auth.isLoggedIn() || $auth.isTokenExpired()) {
            return navigateTo('/login')
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

// 운영자 이상 권한 미들웨어
export const moderatorAuth = defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore()
    const { $auth } = useNuxtApp()

    if (process.client) {
        // 기본 인증 확인
        if (!$auth.isLoggedIn() || $auth.isTokenExpired()) {
            return navigateTo('/login')
        }

        // 운영자 이상 권한 확인
        if (authStore.user && !authStore.isModerator) {
            throw createError({
                statusCode: 403,
                statusMessage: '운영자 이상의 권한이 필요합니다.'
            })
        }
    }
})

// 게스트 전용 미들웨어 (로그인한 사용자는 접근 불가)
export const guestOnly = defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore()
    const { $auth } = useNuxtApp()

    if (process.client) {
        // 이미 로그인된 경우 대시보드로 리다이렉트
        if ($auth.isLoggedIn() && !$auth.isTokenExpired()) {
            return navigateTo('/')
        }
    }
})