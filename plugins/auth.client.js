// plugins/auth.client.js
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

    // ✅ Users API 클라이언트 생성 (별도 분리)
    const usersApi = $fetch.create({
        baseURL: config.public.usersApiBaseUrl, // 직접 백엔드 URL 사용

        onRequest({ request, options }) {
            // 개발 환경에서는 프록시 사용
            if (process.dev) {
                // baseURL을 '/api'로 변경하여 프록시 사용
                options.baseURL = '/api'
            }

            // 토큰이 있으면 Authorization 헤더 추가
            if (accessToken.value) {
                options.headers = {
                    ...options.headers,
                    Authorization: `Bearer ${accessToken.value}`
                }
            }

            // Content-Type 설정
            if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
                options.headers = {
                    ...options.headers,
                    'Content-Type': 'application/json'
                }
            }

            // 요청 로깅
            console.log(`[Users API] ${options.method || 'GET'} ${request}`)
        },

        onResponse({ response }) {
            console.log(`[Users API Response] ${response.status} ${response.url}`)
        },

        async onResponseError({ response, request, options }) {
            console.error(`[Users API Error] ${response.status} ${request}`, response._data)

            // 401 에러 시 토큰 갱신 시도
            if (response.status === 401 && refreshToken.value) {
                // refresh 엔드포인트 호출이 아닌 경우에만 토큰 갱신 시도
                if (!request.toString().includes('/auth/refresh')) {
                    try {
                        console.log('[Users API] Attempting token refresh...')

                        // 프록시를 통한 갱신 요청
                        const refreshResponse = await $fetch('/api/auth/refresh', {
                            method: 'POST',
                            body: {
                                refreshToken: refreshToken.value
                            }
                        })

                        if (refreshResponse.success) {
                            // 새 토큰 저장
                            accessToken.value = refreshResponse.data.accessToken
                            refreshToken.value = refreshResponse.data.refreshToken

                            console.log('[Users API] Token refresh successful')

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
                        console.error('[Users API] Token refresh failed:', refreshError)
                        await handleAuthFailure()
                    }
                } else {
                    // refresh 요청 자체가 실패한 경우
                    console.error('[Users API] Refresh token is invalid')
                    await handleAuthFailure()
                }
            }

            // 403 에러 시 권한 없음 처리
            if (response.status === 403) {
                console.warn('[Users API] Access forbidden')
                if (process.client) {
                    // CORS 에러인지 확인
                    if (response._data?.message?.includes('CORS') ||
                        response.statusText?.includes('CORS')) {
                        console.error('[Users API] CORS Error detected')
                        throw new Error('CORS 정책으로 인해 요청이 차단되었습니다. 서버 설정을 확인해주세요.')
                    }
                    await navigateTo('/unauthorized')
                }
            }
        }
    })

    // 인증 실패 처리
    const handleAuthFailure = async () => {
        console.log('[Users API] Handling authentication failure')
        accessToken.value = null
        refreshToken.value = null

        // 로그인 페이지로 리다이렉트 (현재 페이지가 로그인 페이지가 아닌 경우)
        if (process.client && window.location.pathname !== '/login') {
            await navigateTo('/login')
        }
    }

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

        getRefreshToken: () => {
            return refreshToken.value
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
                console.error('[Auth] Failed to decode token:', error)
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
        },

        // 토큰 갱신 필요 여부 확인 (만료 10분 전)
        needsRefresh: () => {
            const expiration = authHelpers.getTokenExpiration()
            if (!expiration) return false

            const now = new Date()
            const timeDiff = expiration.getTime() - now.getTime()
            const tenMinutes = 10 * 60 * 1000

            return timeDiff <= tenMinutes && timeDiff > 0
        },

        // 수동 토큰 갱신
        refreshTokens: async () => {
            if (!refreshToken.value) {
                throw new Error('No refresh token available')
            }

            try {
                const response = await usersApi('/auth/refresh', {
                    method: 'POST',
                    body: {
                        refreshToken: refreshToken.value
                    }
                })

                if (response.success) {
                    authHelpers.setTokens(response.data.accessToken, response.data.refreshToken)
                    return response.data
                } else {
                    throw new Error(response.message || 'Token refresh failed')
                }
            } catch (error) {
                await handleAuthFailure()
                throw error
            }
        },

        // 로그인
        login: async (credentials) => {
            try {
                const response = await usersApi('/auth/login', {
                    method: 'POST',
                    body: credentials
                })

                if (response.success) {
                    authHelpers.setTokens(response.data.accessToken, response.data.refreshToken)
                    return response.data
                } else {
                    throw new Error(response.message || 'Login failed')
                }
            } catch (error) {
                console.error('[Auth] Login failed:', error)
                throw error
            }
        },

        // 로그아웃
        logout: async () => {
            try {
                // 서버에 로그아웃 요청
                if (accessToken.value) {
                    await usersApi('/auth/logout', {
                        method: 'POST'
                    })
                }
            } catch (error) {
                console.warn('[Auth] Logout request failed:', error)
            } finally {
                // 토큰 정리
                authHelpers.clearTokens()
            }
        },

        // 현재 사용자 정보 조회
        getCurrentUser: async () => {
            try {
                const response = await usersApi('/auth/me', {
                    method: 'GET'
                })

                if (response.success) {
                    return response.data
                } else {
                    throw new Error(response.message || 'Failed to get user info')
                }
            } catch (error) {
                console.error('[Auth] Failed to get current user:', error)
                throw error
            }
        },

        // 토큰 유효성 검사
        validateToken: async () => {
            try {
                const response = await usersApi('/auth/validate-token', {
                    method: 'POST'
                })

                return response.success && response.valid
            } catch (error) {
                console.error('[Auth] Token validation failed:', error)
                return false
            }
        }
    }

    // 자동 토큰 갱신 설정 (5분마다 확인)
    if (process.client) {
        setInterval(() => {
            if (authHelpers.isLoggedIn() && authHelpers.needsRefresh()) {
                console.log('[Auth] Auto-refreshing token...')
                authHelpers.refreshTokens().catch(error => {
                    console.error('[Auth] Auto-refresh failed:', error)
                })
            }
        }, 5 * 60 * 1000) // 5분
    }

    return {
        provide: {
            usersApi, // ✅ usersApi 추가
            auth: authHelpers
        }
    }
})