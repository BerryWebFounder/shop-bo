export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()

    // JWT 토큰 관리를 위한 쿠키
    const accessToken = useCookie('access-token', {
        default: () => null,
        maxAge: 60 * 60 * 24, // 24시간
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    })

    const refreshToken = useCookie('refresh-token', {
        default: () => null,
        maxAge: 60 * 60 * 24 * 7, // 7일
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    })

    // Users API 클라이언트 생성
    const usersApi = $fetch.create({
        baseURL: config.public.usersApiBaseUrl,

        onRequest({ request, options }) {
            // 토큰이 있으면 Authorization 헤더 추가
            if (accessToken.value) {
                options.headers = {
                    ...options.headers,
                    Authorization: `Bearer ${accessToken.value}`
                }
            }
        },

        async onResponseError({ response, request }) {
            // 401 에러 시 토큰 갱신 시도
            if (response.status === 401 && refreshToken.value) {
                try {
                    const refreshResponse = await $fetch('/auth/refresh', {
                        baseURL: config.public.usersApiBaseUrl,
                        method: 'POST',
                        body: {
                            refreshToken: refreshToken.value
                        }
                    })

                    if (refreshResponse.success) {
                        // 새 토큰 저장
                        accessToken.value = refreshResponse.data.accessToken
                        refreshToken.value = refreshResponse.data.refreshToken

                        // 원래 요청 재시도 (Authorization 헤더 추가)
                        const retryOptions = {
                            ...options,
                            headers: {
                                ...options.headers,
                                Authorization: `Bearer ${accessToken.value}`
                            }
                        }

                        return $fetch(request, retryOptions)
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError)

                    // 리프레시 실패 시 로그아웃 처리
                    accessToken.value = null
                    refreshToken.value = null

                    // 로그인 페이지로 리다이렉트
                    if (process.client) {
                        await navigateTo('/login')
                    }
                }
            }

            // 403 에러 시 권한 없음 페이지로 리다이렉트
            if (response.status === 403) {
                if (process.client) {
                    await navigateTo('/unauthorized')
                }
            }
        }
    })

    // 인증 관련 헬퍼 함수들
    const authHelpers = {
        // 로그인 상태 확인
        isLoggedIn: () => {
            return !!accessToken.value
        },

        // 토큰 가져오기
        getAccessToken: () => {
            return accessToken.value
        },

        // 토큰 설정
        setTokens: (newAccessToken, newRefreshToken) => {
            accessToken.value = newAccessToken
            refreshToken.value = newRefreshToken
        },

        // 토큰 제거 (로그아웃)
        clearTokens: () => {
            accessToken.value = null
            refreshToken.value = null
        },

        // 토큰에서 사용자 정보 추출 (단순한 JWT 디코딩)
        getUserFromToken: () => {
            if (!accessToken.value) return null

            try {
                const payload = JSON.parse(atob(accessToken.value.split('.')[1]))
                return {
                    id: payload.userId,
                    username: payload.sub,
                    email: payload.email,
                    fullName: payload.fullName,
                    role: payload.role
                }
            } catch (error) {
                console.error('Failed to decode token:', error)
                return null
            }
        },

        // 권한 확인
        hasRole: (role) => {
            const user = authHelpers.getUserFromToken()
            return user?.role === role
        },

        // 관리자 권한 확인
        isAdmin: () => {
            return authHelpers.hasRole('ADMIN')
        },

        // 운영자 권한 확인
        isModerator: () => {
            const user = authHelpers.getUserFromToken()
            return user?.role === 'SYSOP' || user?.role === 'ADMIN'
        },

        // 토큰 만료 시간 확인
        getTokenExpiration: () => {
            if (!accessToken.value) return null

            try {
                const payload = JSON.parse(atob(accessToken.value.split('.')[1]))
                return new Date(payload.exp * 1000)
            } catch (error) {
                return null
            }
        },

        // 토큰 만료 여부 확인
        isTokenExpired: () => {
            const expiration = authHelpers.getTokenExpiration()
            return expiration ? new Date() > expiration : true
        }
    }

    return {
        provide: {
            usersApi,
            auth: authHelpers
        }
    }
})