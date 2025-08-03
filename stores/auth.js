export const useAuthStore = defineStore('auth', () => {
    const { $usersApi, $auth } = useNuxtApp()
    const toast = useGlobalToast()

    // 상태
    const user = ref(null)
    const loading = ref(false)
    const loginLoading = ref(false)

    // 계산된 속성
    const isLoggedIn = computed(() => !!user.value && $auth.isLoggedIn())
    const isAdmin = computed(() => user.value?.role === 'ADMIN')
    const isModerator = computed(() => user.value?.role === 'SYSOP' || user.value?.role === 'ADMIN')

    // 초기화
    const initialize = async () => {
        if ($auth.isLoggedIn() && !$auth.isTokenExpired()) {
            try {
                await getCurrentUser()
            } catch (error) {
                console.error('Failed to initialize auth:', error)
                logout()
            }
        }
    }

    // 현재 사용자 정보 조회
    const getCurrentUser = async () => {
        try {
            loading.value = true
            const response = await $usersApi('/auth/me')

            if (response.success) {
                user.value = response.data
                return response.data
            } else {
                throw new Error(response.message || '사용자 정보를 가져올 수 없습니다.')
            }
        } catch (error) {
            console.error('Get current user failed:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    // 로그인
    const login = async (credentials) => {
        try {
            loginLoading.value = true

            const response = await $usersApi('/auth/login', {
                method: 'POST',
                body: credentials
            })

            if (response.success) {
                // 토큰 저장
                $auth.setTokens(response.data.accessToken, response.data.refreshToken)

                // 사용자 정보 저장
                user.value = response.data.user

                toast.success('로그인되었습니다.')

                return response.data
            } else {
                throw new Error(response.message || '로그인에 실패했습니다.')
            }
        } catch (error) {
            console.error('Login failed:', error)

            let errorMessage = '로그인에 실패했습니다.'

            if (error.data?.message) {
                errorMessage = error.data.message
            } else if (error.message) {
                errorMessage = error.message
            }

            toast.error(errorMessage)
            throw error
        } finally {
            loginLoading.value = false
        }
    }

    // 로그아웃
    const logout = async () => {
        try {
            // 서버에 로그아웃 요청
            try {
                await $usersApi('/auth/logout', {
                    method: 'POST'
                })
            } catch (error) {
                // 로그아웃 API 실패해도 클라이언트에서는 로그아웃 처리
                console.warn('Logout API failed:', error)
            }

            // 토큰 및 사용자 정보 제거
            $auth.clearTokens()
            user.value = null

            toast.success('로그아웃되었습니다.')
        } catch (error) {
            console.error('Logout failed:', error)
            toast.error('로그아웃 중 오류가 발생했습니다.')
        }
    }

    // 회원가입
    const register = async (userData) => {
        try {
            loading.value = true

            const response = await $usersApi('/auth/register', {
                method: 'POST',
                body: userData
            })

            if (response.success) {
                toast.success('회원가입이 완료되었습니다. 이메일 인증을 진행해주세요.')
                return response
            } else {
                throw new Error(response.message || '회원가입에 실패했습니다.')
            }
        } catch (error) {
            console.error('Registration failed:', error)

            let errorMessage = '회원가입에 실패했습니다.'

            if (error.data?.message) {
                errorMessage = error.data.message
            } else if (error.message) {
                errorMessage = error.message
            }

            toast.error(errorMessage)
            throw error
        } finally {
            loading.value = false
        }
    }

    // 비밀번호 변경
    const changePassword = async (passwordData) => {
        try {
            loading.value = true

            const response = await $usersApi('/users/me/password', {
                method: 'PUT',
                body: passwordData
            })

            if (response.success) {
                toast.success('비밀번호가 변경되었습니다.')
                return response
            } else {
                throw new Error(response.message || '비밀번호 변경에 실패했습니다.')
            }
        } catch (error) {
            console.error('Password change failed:', error)
            toast.error(error.data?.message || error.message || '비밀번호 변경에 실패했습니다.')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 프로필 업데이트
    const updateProfile = async (profileData) => {
        try {
            loading.value = true

            const response = await $usersApi('/users/me', {
                method: 'PUT',
                body: profileData
            })

            if (response.success) {
                user.value = response.data
                toast.success('프로필이 업데이트되었습니다.')
                return response.data
            } else {
                throw new Error(response.message || '프로필 업데이트에 실패했습니다.')
            }
        } catch (error) {
            console.error('Profile update failed:', error)
            toast.error(error.data?.message || error.message || '프로필 업데이트에 실패했습니다.')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 비밀번호 재설정 요청
    const requestPasswordReset = async (email) => {
        try {
            loading.value = true

            const response = await $usersApi('/auth/password-reset', {
                method: 'POST',
                body: { email }
            })

            if (response.success) {
                toast.success('비밀번호 재설정 이메일이 발송되었습니다.')
                return response
            } else {
                throw new Error(response.message || '비밀번호 재설정 요청에 실패했습니다.')
            }
        } catch (error) {
            console.error('Password reset request failed:', error)
            toast.error(error.data?.message || error.message || '비밀번호 재설정 요청에 실패했습니다.')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 토큰 검증
    const validateToken = async () => {
        try {
            const response = await $usersApi('/auth/validate-token', {
                method: 'POST'
            })

            return response.success && response.valid
        } catch (error) {
            console.error('Token validation failed:', error)
            return false
        }
    }

    // 권한 확인 헬퍼
    const hasPermission = (permission) => {
        if (!user.value) return false

        switch (permission) {
            case 'MANAGE_USERS':
                return user.value.canManageUsers
            case 'MANAGE_POSTS':
                return user.value.canManagePosts
            case 'MANAGE_COMMENTS':
                return user.value.canManageComments
            case 'ACCESS_ADMIN':
                return user.value.isAdmin
            default:
                return false
        }
    }

    // 사용자명/이메일 중복 확인
    const checkAvailability = async (username, email) => {
        try {
            const params = new URLSearchParams()
            if (username) params.append('username', username)
            if (email) params.append('email', email)

            const response = await $usersApi(`/auth/check-availability?${params.toString()}`)

            if (response.success) {
                return response.data
            } else {
                throw new Error(response.message || '중복 확인에 실패했습니다.')
            }
        } catch (error) {
            console.error('Availability check failed:', error)
            throw error
        }
    }

    // 계정 활성화/비활성화
    const toggleAccountStatus = async () => {
        try {
            loading.value = true

            const endpoint = user.value.isActive ? '/users/me/deactivate' : '/users/me/activate'
            const response = await $usersApi(endpoint, {
                method: 'PUT'
            })

            if (response.success) {
                await getCurrentUser() // 사용자 정보 새로고침
                const statusText = user.value.isActive ? '활성화' : '비활성화'
                toast.success(`계정이 ${statusText}되었습니다.`)
                return response
            } else {
                throw new Error(response.message || '계정 상태 변경에 실패했습니다.')
            }
        } catch (error) {
            console.error('Account status toggle failed:', error)
            toast.error(error.data?.message || error.message || '계정 상태 변경에 실패했습니다.')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 계정 삭제
    const deleteAccount = async () => {
        try {
            loading.value = true

            const response = await $usersApi('/users/me', {
                method: 'DELETE'
            })

            if (response.success) {
                toast.success('계정이 삭제되었습니다.')
                await logout()
                return response
            } else {
                throw new Error(response.message || '계정 삭제에 실패했습니다.')
            }
        } catch (error) {
            console.error('Account deletion failed:', error)
            toast.error(error.data?.message || error.message || '계정 삭제에 실패했습니다.')
            throw error
        } finally {
            loading.value = false
        }
    }

    return {
        // 상태
        user: readonly(user),
        loading: readonly(loading),
        loginLoading: readonly(loginLoading),

        // 계산된 속성
        isLoggedIn,
        isAdmin,
        isModerator,

        // 액션
        initialize,
        getCurrentUser,
        login,
        logout,
        register,
        changePassword,
        updateProfile,
        requestPasswordReset,
        validateToken,
        hasPermission,
        checkAvailability,
        toggleAccountStatus,
        deleteAccount
    }
})