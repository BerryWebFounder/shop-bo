export const useMainStore = defineStore('main', () => {
    const api = useApi()

    // 사이드바 상태
    const sidebarOpen = ref(false)

    // 로딩 상태
    const loading = ref(false)

    // 사용자 정보 (임시)
    const user = ref({
        name: '관리자',
        email: 'admin@shop.com',
        role: 'admin',
        avatar: ''
    })

    // 대시보드 통계 데이터
    const dashboardStats = ref({
        totalUsers: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalRevenue: 0,
        growthRate: {
            users: 0,
            orders: 0,
            products: 0,
            revenue: 0
        }
    })

    // 게시판 통계 데이터
    const boardStats = ref({
        totalPosts: 0,
        regularPosts: 0,
        totalNotices: 0,
        activeNotices: 0,
        pinnedNotices: 0,
        expiredNotices: 0,
        totalFileSize: '0 B'
    })

    // 최근 활동 데이터
    const recentActivities = ref([])

    // Actions
    const toggleSidebar = () => {
        sidebarOpen.value = !sidebarOpen.value
    }

    const closeSidebar = () => {
        sidebarOpen.value = false
    }

    const openSidebar = () => {
        sidebarOpen.value = true
    }

    const setLoading = (state) => {
        loading.value = state
    }

    const updateDashboardStats = (newStats) => {
        dashboardStats.value = { ...dashboardStats.value, ...newStats }
    }

    const updateBoardStats = (newStats) => {
        boardStats.value = { ...boardStats.value, ...newStats }
    }

    const addRecentActivity = (activity) => {
        recentActivities.value.unshift({
            ...activity,
            id: Date.now(),
            timestamp: '방금 전'
        })

        // 최대 10개까지만 유지
        if (recentActivities.value.length > 10) {
            recentActivities.value = recentActivities.value.slice(0, 10)
        }
    }

    // 게시판 관련 활동 추가 헬퍼 함수들
    const addBoardActivity = (type, boardName, userName, message) => {
        const activityTypes = {
            'post_created': { message: `새로운 게시글이 등록되었습니다`, status: 'new' },
            'post_updated': { message: `게시글이 수정되었습니다`, status: 'success' },
            'post_deleted': { message: `게시글이 삭제되었습니다`, status: 'warning' },
            'notice_created': { message: `새로운 공지사항이 등록되었습니다`, status: 'new' },
            'notice_updated': { message: `공지사항이 수정되었습니다`, status: 'success' },
            'notice_deleted': { message: `공지사항이 삭제되었습니다`, status: 'warning' },
            'notice_activated': { message: `공지사항이 활성화되었습니다`, status: 'success' },
            'notice_deactivated': { message: `공지사항이 비활성화되었습니다`, status: 'warning' },
            'comment_created': { message: `새로운 댓글이 작성되었습니다`, status: 'new' },
            'file_uploaded': { message: `파일이 업로드되었습니다`, status: 'success' }
        }

        const activityConfig = activityTypes[type] || { message: message || '게시판 활동', status: 'new' }

        addRecentActivity({
            type: 'board',
            message: message || activityConfig.message,
            user: boardName ? `${userName} - ${boardName}` : userName,
            status: activityConfig.status
        })
    }

    // API 호출 함수들
    const fetchDashboardData = async () => {
        setLoading(true)

        try {
            console.log('[MainStore] 대시보드 데이터 조회 시작')

            // 기본 대시보드 통계 (임시 데이터 - 실제로는 별도 API에서 가져올 것)
            const mockStats = {
                totalUsers: Math.floor(Math.random() * 1000) + 1000,
                totalOrders: Math.floor(Math.random() * 500) + 500,
                totalProducts: Math.floor(Math.random() * 200) + 400,
                totalRevenue: Math.floor(Math.random() * 50000) + 100000,
                growthRate: {
                    users: parseFloat((Math.random() * 20 - 5).toFixed(1)),
                    orders: parseFloat((Math.random() * 20 - 5).toFixed(1)),
                    products: parseFloat((Math.random() * 20 - 5).toFixed(1)),
                    revenue: parseFloat((Math.random() * 20 - 5).toFixed(1))
                }
            }

            updateDashboardStats(mockStats)

            // 게시판 통계 가져오기
            await fetchBoardStats()

            // 가끔 새로운 활동 추가 (시뮬레이션)
            if (Math.random() > 0.7) {
                const randomActivities = [
                    {
                        type: 'board',
                        message: '새로운 게시글이 등록되었습니다',
                        user: '사용자' + Math.floor(Math.random() * 100) + ' - 자유게시판',
                        status: 'new'
                    },
                    {
                        type: 'board',
                        message: '새로운 공지사항이 게시되었습니다',
                        user: '관리자 - 공지사항',
                        status: 'new'
                    },
                    {
                        type: 'order',
                        message: '새로운 주문이 접수되었습니다',
                        user: '고객' + Math.floor(Math.random() * 100),
                        status: 'new'
                    },
                    {
                        type: 'user',
                        message: '새로운 사용자가 가입했습니다',
                        user: '신규회원' + Math.floor(Math.random() * 100),
                        status: 'success'
                    }
                ]

                const randomActivity = randomActivities[Math.floor(Math.random() * randomActivities.length)]
                addRecentActivity(randomActivity)
            }

            console.log('[MainStore] 대시보드 데이터 조회 완료')

        } catch (error) {
            console.error('[MainStore] 대시보드 데이터 조회 실패:', error)
        } finally {
            setLoading(false)
        }
    }

    // 게시판 통계 가져오기
    const fetchBoardStats = async () => {
        try {
            console.log('[MainStore] 게시판 통계 조회 시작')

            const [postStats, noticeStats] = await Promise.all([
                api.posts.getStats().catch(error => {
                    console.warn('[MainStore] 게시글 통계 조회 실패:', error)
                    return {
                        totalPosts: 0,
                        regularPosts: 0,
                        totalFileSize: '0 B'
                    }
                }),
                api.notices.getStats().catch(error => {
                    console.warn('[MainStore] 공지사항 통계 조회 실패:', error)
                    return {
                        total: 0,
                        active: 0,
                        pinned: 0,
                        expired: 0
                    }
                })
            ])

            console.log('[MainStore] 통계 응답:', { postStats, noticeStats })

            const combinedStats = {
                totalPosts: (postStats.totalPosts || 0) + (noticeStats.total || 0),
                regularPosts: postStats.regularPosts || 0,
                totalNotices: noticeStats.total || 0,
                activeNotices: noticeStats.active || 0,
                pinnedNotices: noticeStats.pinned || 0,
                expiredNotices: noticeStats.expired || 0,
                totalFileSize: postStats.totalFileSize || '0 B'
            }

            updateBoardStats(combinedStats)
            console.log('[MainStore] 게시판 통계 업데이트 완료:', combinedStats)

        } catch (error) {
            console.error('[MainStore] 게시판 통계 조회 실패:', error)
            // 에러 발생 시 기본값 유지
        }
    }

    // 최근 활동 가져오기 (실제로는 API에서 가져올 것)
    const fetchRecentActivities = async () => {
        try {
            console.log('[MainStore] 최근 활동 조회 시작')

            // 임시로 기본 활동들을 설정
            const defaultActivities = [
                {
                    id: 1,
                    type: 'board',
                    message: '새로운 공지사항이 게시되었습니다',
                    user: '관리자 - 공지사항',
                    timestamp: '10분 전',
                    status: 'new'
                },
                {
                    id: 2,
                    type: 'board',
                    message: '게시글에 새로운 댓글이 작성되었습니다',
                    user: '김철수 - 자유게시판',
                    timestamp: '25분 전',
                    status: 'success'
                },
                {
                    id: 3,
                    type: 'order',
                    message: '새로운 주문이 접수되었습니다',
                    user: '이영희',
                    timestamp: '1시간 전',
                    status: 'new'
                },
                {
                    id: 4,
                    type: 'user',
                    message: '새로운 사용자가 가입했습니다',
                    user: '박민수',
                    timestamp: '2시간 전',
                    status: 'success'
                },
                {
                    id: 5,
                    type: 'system',
                    message: '시스템 백업이 완료되었습니다',
                    user: '시스템',
                    timestamp: '3시간 전',
                    status: 'success'
                }
            ]

            // 기존 활동이 없을 때만 기본 활동 설정
            if (recentActivities.value.length === 0) {
                recentActivities.value = defaultActivities
            }

            console.log('[MainStore] 최근 활동 조회 완료')

        } catch (error) {
            console.error('[MainStore] 최근 활동 조회 실패:', error)
        }
    }

    // 전체 초기화
    const initialize = async () => {
        try {
            console.log('[MainStore] 메인 스토어 초기화 시작')

            await Promise.all([
                fetchDashboardData(),
                fetchRecentActivities()
            ])

            console.log('[MainStore] 메인 스토어 초기화 완료')
        } catch (error) {
            console.error('[MainStore] 메인 스토어 초기화 실패:', error)
        }
    }

    // 계산된 속성
    const userInitials = computed(() => {
        return user.value.name
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase()
    })

    const recentActivitiesByType = computed(() => {
        return recentActivities.value.reduce((acc, activity) => {
            if (!acc[activity.type]) {
                acc[activity.type] = []
            }
            acc[activity.type].push(activity)
            return acc
        }, {})
    })

    const boardActivitiesCount = computed(() => {
        return recentActivities.value.filter(activity => activity.type === 'board').length
    })

    const pendingBoardActivitiesCount = computed(() => {
        return recentActivities.value.filter(activity =>
            activity.type === 'board' && activity.status === 'warning'
        ).length
    })

    // 게시판 관련 통계 (computed)
    const activeBoardsCount = computed(() => {
        return boardStats.value.activeNotices
    })

    const totalPostsCount = computed(() => {
        return boardStats.value.totalPosts
    })

    const publishedPostsCount = computed(() => {
        return boardStats.value.regularPosts + boardStats.value.activeNotices
    })

    const pendingPostsCount = computed(() => {
        return boardStats.value.expiredNotices
    })

    const pinnedPostsCount = computed(() => {
        return boardStats.value.pinnedNotices
    })

    return {
        // State
        sidebarOpen: readonly(sidebarOpen),
        loading: readonly(loading),
        user: readonly(user),
        dashboardStats: readonly(dashboardStats),
        boardStats: readonly(boardStats),
        recentActivities: readonly(recentActivities),

        // Getters
        userInitials,
        recentActivitiesByType,
        boardActivitiesCount,
        pendingBoardActivitiesCount,
        activeBoardsCount,
        totalPostsCount,
        publishedPostsCount,
        pendingPostsCount,
        pinnedPostsCount,

        // Actions
        toggleSidebar,
        closeSidebar,
        openSidebar,
        setLoading,
        updateDashboardStats,
        updateBoardStats,
        addRecentActivity,
        addBoardActivity,
        fetchDashboardData,
        fetchBoardStats,
        fetchRecentActivities,
        initialize
    }
})