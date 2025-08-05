export const useUsersStore = defineStore('users', async () => {
    const {$fetch} = useNuxtApp()
    const toast = useGlobalToast()

    // 상태
    const loading = ref(false)
    const users = ref([])
    const currentUser = ref(null)
    const stats = ref({
        totalUsers: 0,
        adminUsers: 0,
        moderatorUsers: 0,
        regularUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        recentSignups: 0
    })

    // 페이지네이션
    const pagination = ref({
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true
    })

    // 필터
    const filters = ref({
        search: '',
        role: 'all',
        status: 'all',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    })

    // API 호출 헬퍼
    const apiCall = async (endpoint, options = {}) => {
        try {
            return await $fetch(endpoint, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            })
        } catch (error) {
            console.error(`[UsersStore] API Error for ${endpoint}:`, error)
            throw error
        }
    }

    // 사용자 목록 조회
    const fetchUsers = async (params = {}) => {
        loading.value = true
        try {
            console.log('[UsersStore] 사용자 목록 조회:', params)

            const queryParams = {
                page: params.page || pagination.value.page,
                size: params.size || pagination.value.size,
                search: params.search || filters.value.search,
                role: filters.value.role !== 'all' ? filters.value.role : undefined,
                status: filters.value.status !== 'all' ? filters.value.status : undefined,
                sortBy: filters.value.sortBy,
                sortDirection: filters.value.sortOrder,
                ...params
            }

            // 빈 값 제거
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === undefined || queryParams[key] === '') {
                    delete queryParams[key]
                }
            })

            const response = await apiCall('/api/users', {
                method: 'GET',
                query: queryParams
            })

            console.log('[UsersStore] 사용자 목록 응답:', response)

            if (response.success) {
                if (response.data.content) {
                    // 페이지 응답
                    users.value = response.data.content
                    updatePagination(response.data)
                } else if (Array.isArray(response.data)) {
                    // 배열 응답
                    users.value = response.data
                    pagination.value.totalElements = response.data.length
                } else {
                    users.value = []
                }
            } else {
                throw new Error(response.message || '사용자 목록을 불러올 수 없습니다.')
            }

            return response.data
        } catch (error) {
            console.error('[UsersStore] 사용자 목록 조회 실패:', error)
            users.value = []
            toast.handleApiError(error, '사용자 목록을 불러올 수 없습니다.')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 사용자 상세 조회
    const fetchUser = async (id) => {
        loading.value = true
        try {
            console.log('[UsersStore] 사용자 상세 조회:', id)

            const response = await apiCall(`/api/users/${id}`, {
                method: 'GET'
            })

            if (response.success) {
                currentUser.value = response.data
                return response.data
            } else {
                throw new Error(response.message || '사용자 정보를 불러올 수 없습니다.')
            }
        } catch (error) {
            console.error('[UsersStore] 사용자 상세 조회 실패:', error)
            currentUser.value = null
            toast.handleApiError(error, '사용자 정보를 불러올 수 없습니다.')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 사용자 생성
    const createUser = async (userData) => {
        loading.value = true
        try {
            console.log('[UsersStore] 사용자 생성:', userData)

            const response = await apiCall('/api/users', {
                method: 'POST',
                body: userData
            })

            if (response.success) {
                toast.success('사용자가 생성되었습니다.')

                // 목록 새로고침
                await Promise.all([
                    fetchUsers(),
                    fetchStats()
                ])

                return response.data
            } else {
                throw new Error(response.message || '사용자 생성에 실패했습니다.')
            }
        } catch (error) {
            console.error('[UsersStore] 사용자 생성 실패:', error)
            toast.handleApiError(error, '사용자 생성에 실패했습니다.')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 사용자 수정
    const updateUser = async (id, userData) => {
        loading.value = true
        try {
            console.log('[UsersStore] 사용자 수정:', id, userData)

            const response = await apiCall(`/api/users/${id}`, {
                method: 'PUT',
                body: userData
            })

            if (response.success) {
                toast.success('사용자 정보가 수정되었습니다.')

                // 현재 사용자 정보 업데이트
                if (currentUser.value && currentUser.value.id === id) {
                    currentUser.value = response.data
                }

                // 목록에서도 업데이트
                const index = users.value.findIndex(u => u.id === id)
                if (index !== -1) {
                    users.value[index] = response.data
                }

                return response.data
            } else {
                throw new Error(response.message || '사용자 수정에 실패했습니다.')
            }
        } catch (error) {
            console.error('[UsersStore] 사용자 수정 실패:', error)
            toast.handleApiError(error, '사용자 수정에 실패했습니다.')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 사용자 삭제
    const deleteUser = async (id) => {
        loading.value = true
        try {
            console.log('[UsersStore] 사용자 삭제:', id)

            const response = await apiCall(`/api/users/${id}`, {
                method: 'DELETE'
            })

            if (response.success) {
                toast.success('사용자가 삭제되었습니다.')

                // 목록에서 제거
                users.value = users.value.filter(u => u.id !== id)

                // 현재 사용자가 삭제된 사용자면 초기화
                if (currentUser.value && currentUser.value.id === id) {
                    currentUser.value = null
                }

                await fetchStats()
                return response
            } else {
                throw new Error(response.message || '사용자 삭제에 실패했습니다.')
            }
        } catch (error) {
            console.error('[UsersStore] 사용자 삭제 실패:', error)
            toast.handleApiError(error, '사용자 삭제에 실패했습니다.')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 사용자 상태 토글 (활성화/비활성화)
    const toggleUserStatus = async (id) => {
        loading.value = true
        try {
            console.log('[UsersStore] 사용자 상태 토글:', id)

            const response = await apiCall(`/api/users/${id}/toggle-status`, {
                method: 'PATCH'
            })

            if (response.success) {
                const statusText = response.data.isActive ? '활성화' : '비활성화'
                toast.success(`사용자가 ${statusText}되었습니다.`)

                // 현재 사용자 정보 업데이트
                if (currentUser.value && currentUser.value.id === id) {
                    currentUser.value = response.data
                }

                // 목록에서도 업데이트
                const index = users.value.findIndex(u => u.id === id)
                if (index !== -1) {
                    users.value[index] = response.data
                }

                return response.data
            } else {
                throw new Error(response.message || '사용자 상태 변경에 실패했습니다.')
            }
        } catch (error) {
            console.error('[UsersStore] 사용자 상태 토글 실패:', error)
            toast.handleApiError(error, '사용자 상태 변경에 실패했습니다.')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 사용자 역할 변경
    const changeUserRole = async (id, role) => {
        loading.value = true
        try {
            console.log('[UsersStore] 사용자 역할 변경:', id, role)

            const response = await apiCall(`/api/users/${id}/role`, {
                method: 'PATCH',
                body: {role}
            })

            if (response.success) {
                toast.success('사용자 역할이 변경되었습니다.')

                // 현재 사용자 정보 업데이트
                if (currentUser.value && currentUser.value.id === id) {
                    currentUser.value = response.data
                }

                // 목록에서도 업데이트
                const index = users.value.findIndex(u => u.id === id)
                if (index !== -1) {
                    users.value[index] = response.data
                }

                return response.data
            } else {
                throw new Error(response.message || '역할 변경에 실패했습니다.')
            }
        } catch (error) {
            console.error('[UsersStore] 사용자 역할 변경 실패:', error)
            toast.handleApiError(error, '역할 변경에 실패했습니다.')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 비밀번호 재설정
    const resetUserPassword = async (id) => {
        loading.value = true
        try {
            console.log('[UsersStore] 비밀번호 재설정:', id)

            const response = await apiCall(`/api/users/${id}/reset-password`, {
                method: 'POST'
            })

            if (response.success) {
                toast.success('비밀번호 재설정 이메일이 발송되었습니다.')
                return response.data
            } else {
                throw new Error(response.message || '비밀번호 재설정에 실패했습니다.')
            }
        } catch (error) {
            console.error('[UsersStore] 비밀번호 재설정 실패:', error)
            toast.handleApiError(error, '비밀번호 재설정에 실패했습니다.')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 사용자 검색
    const searchUsers = async (searchParams) => {
        loading.value = true
        try {
            console.log('[UsersStore] 사용자 검색:', searchParams)

            const queryParams = {
                page: 0,
                size: pagination.value.size,
                ...searchParams
            }

            const response = await apiCall('/api/users/search', {
                method: 'GET',
                query: queryParams
            })

            if (response.success) {
                if (response.data.content) {
                    users.value = response.data.content
                    updatePagination(response.data)
                } else {
                    users.value = Array.isArray(response.data) ? response.data : []
                }
                return response.data
            } else {
                throw new Error(response.message || '검색에 실패했습니다.')
            }
        } catch (error) {
            console.error('[UsersStore] 사용자 검색 실패:', error)
            users.value = []
            toast.handleApiError(error, '검색에 실패했습니다.')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 통계 조회
    const fetchStats = async () => {
        try {
            console.log('[UsersStore] 통계 조회')

            const response = await apiCall('/api/users/stats', {
                method: 'GET'
            })

            if (response.success) {
                stats.value = {
                    totalUsers: response.data.totalUsers || 0,
                    adminUsers: response.data.adminUsers || 0,
                    moderatorUsers: response.data.moderatorUsers || 0,
                    regularUsers: response.data.regularUsers || 0,
                    activeUsers: response.data.activeUsers || 0,
                    inactiveUsers: response.data.inactiveUsers || 0,
                    recentSignups: response.data.recentSignups || 0
                }
                console.log('[UsersStore] 통계 업데이트:', stats.value)
                return stats.value
            } else {
                throw new Error(response.message || '통계 조회에 실패했습니다.')
            }
        } catch (error) {
            console.error('[UsersStore] 통계 조회 실패:', error)
            // 통계 조회 실패해도 에러를 던지지 않음
            return stats.value
        }
    }

    // 페이지네이션 업데이트
    const updatePagination = (pageData) => {
        if (pageData) {
            pagination.value = {
                page: pageData.number || 0,
                size: pageData.size || 20,
                totalElements: pageData.totalElements || 0,
                totalPages: pageData.totalPages || 0,
                first: pageData.first !== undefined ? pageData.first : true,
                last: pageData.last !== undefined ? pageData.last : true
            }
        }
    }

    // 필터 업데이트
    const updateFilters = (newFilters) => {
        filters.value = {...filters.value, ...newFilters}
        console.log('[UsersStore] 필터 업데이트:', filters.value)
    }

    // 필터 초기화
    const resetFilters = () => {
        filters.value = {
            search: '',
            role: 'all',
            status: 'all',
            sortBy: 'createdAt',
            sortOrder: 'desc'
        }
        pagination.value.page = 0
        console.log('[UsersStore] 필터 초기화')
    }

    // 페이지 변경
    const changePage = (page) => {
        pagination.value.page = page
        return fetchUsers({page})
    }

    // 페이지 크기 변경
    const changePageSize = (size) => {
        pagination.value.size = size
        pagination.value.page = 0
        return fetchUsers({page: 0, size})
    }

    // 계산된 속성
    const totalUsers = computed(() => stats.value.totalUsers)
    const activeUsersCount = computed(() => stats.value.activeUsers)
    const inactiveUsersCount = computed(() => stats.value.inactiveUsers)
    const adminUsersCount = computed(() => stats.value.adminUsers)
    const moderatorUsersCount = computed(() => stats.value.moderatorUsers)
    const regularUsersCount = computed(() => stats.value.regularUsers)

    // 역할별 사용자 필터링
    const usersByRole = computed(() => {
        return {
            admin: users.value.filter(u => u.role === 'ADMIN'),
            moderator: users.value.filter(u => u.role === 'SYSOP'),
            user: users.value.filter(u => u.role === 'USER')
        }
    })

    // 상태별 사용자 필터링
    const usersByStatus = computed(() => {
        return {
            active: users.value.filter(u => u.isActive),
            inactive: users.value.filter(u => !u.isActive)
        }
    })

    // 일괄 상태 변경
    const bulkToggleStatus = async (userIds, isActive) => {
        loading.value = true
        try {
            console.log('[UsersStore] 일괄 상태 변경:', userIds, isActive)

            const response = await apiCall('/api/users/bulk-toggle-status', {
                method: 'PATCH',
                body: {userIds, isActive}
            })

            if (response.success) {
                const statusText = isActive ? '활성화' : '비활성화'
                toast.success(`${userIds.length}명의 사용자가 ${statusText}되었습니다.`)

                // 목록 새로고침
                await Promise.all([
                    fetchUsers(),
                    fetchStats()
                ])

                return response
            } else {
                throw new Error(response.message || '일괄 상태 변경에 실패했습니다.')
            }
        } catch (error) {
            console.error('[UsersStore] 일괄 상태 변경 실패:', error)
            toast.handleApiError(error, '일괄 상태 변경에 실패했습니다.')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 일괄 업데이트
    const bulkUpdate = async (userIds, updateData) => {
        loading.value = true
        try {
            console.log('[UsersStore] 일괄 업데이트:', userIds, updateData)

            const response = await apiCall('/api/users/bulk-update', {
                method: 'PATCH',
                body: {userIds, ...updateData}
            })

            if (response.success) {
                toast.success(`${userIds.length}명의 사용자 정보가 업데이트되었습니다.`)

                // 목록 새로고침
                await Promise.all([
                    fetchUsers(),
                    fetchStats()
                ])

                return response
            } else {
                throw new Error(response.message || '일괄 업데이트에 실패했습니다.')
            }
        } catch (error) {
            console.error('[UsersStore] 일괄 업데이트 실패:', error)
            toast.handleApiError(error, '일괄 업데이트에 실패했습니다.')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 일괄 삭제
    const bulkDelete = async (userIds) => {
        loading.value = true
        try {
            console.log('[UsersStore] 일괄 삭제:', userIds)

            const response = await apiCall('/api/users/bulk-delete', {
                method: 'DELETE',
                body: {userIds}
            })

            if (response.success) {
                toast.success(`${userIds.length}명의 사용자가 삭제되었습니다.`)

                // 목록에서 제거
                users.value = users.value.filter(u => !userIds.includes(u.id))

                await fetchStats()
                return response
            } else {
                throw new Error(response.message || '일괄 삭제에 실패했습니다.')
            }
        } catch (error) {
            console.error('[UsersStore] 일괄 삭제 실패:', error)
            toast.handleApiError(error, '일괄 삭제에 실패했습니다.')
            throw error
        } finally {
            loading.value = false
        }
    }
    try {
        console.log('[UsersStore] 스토어 초기화')
        await Promise.all([
            fetchUsers(),
            fetchStats()
        ])
        console.log('[UsersStore] 스토어 초기화 완료')
    } catch (error) {
        console.error('[UsersStore] 스토어 초기화 실패:', error)
    }

    return {
        // State
        loading: readonly(loading),
        users: readonly(users),
        currentUser: readonly(currentUser),
        stats: readonly(stats),
        pagination: readonly(pagination),
        filters: readonly(filters),

        // Getters
        totalUsers,
        activeUsersCount,
        inactiveUsersCount,
        adminUsersCount,
        moderatorUsersCount,
        regularUsersCount,
        usersByRole,
        usersByStatus,

        // Actions
        fetchUsers,
        fetchUser,
        createUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        changeUserRole,
        resetUserPassword,
        searchUsers,
        fetchStats,
        updateFilters,
        resetFilters,
        changePage,
        changePageSize,
        bulkToggleStatus,
        bulkUpdate,
        bulkDelete,
        initialize
    }
})