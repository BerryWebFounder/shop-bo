export const useMainStore = defineStore('main', () => {
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
        totalUsers: 1250,
        totalOrders: 892,
        totalProducts: 543,
        totalRevenue: 125000,
        growthRate: {
            users: 12.5,
            orders: 8.3,
            products: -2.1,
            revenue: 15.7
        }
    })

    // 최근 활동 데이터
    const recentActivities = ref([
        {
            id: 1,
            type: 'order',
            message: '새로운 주문이 접수되었습니다',
            user: '김철수',
            timestamp: '2분 전',
            status: 'new'
        },
        {
            id: 2,
            type: 'user',
            message: '새로운 사용자가 가입했습니다',
            user: '이영희',
            timestamp: '15분 전',
            status: 'success'
        },
        {
            id: 3,
            type: 'product',
            message: '상품 재고가 부족합니다',
            user: '상품명: 노트북',
            timestamp: '1시간 전',
            status: 'warning'
        },
        {
            id: 4,
            type: 'system',
            message: '시스템 백업이 완료되었습니다',
            user: '시스템',
            timestamp: '3시간 전',
            status: 'success'
        }
    ])

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

    // API 호출 시뮬레이션 (실제로는 API 호출로 대체)
    const fetchDashboardData = async () => {
        setLoading(true)

        try {
            // 실제 API 호출 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 1000))

            // 랜덤 데이터 생성 (실제로는 API에서 받아올 데이터)
            const randomStats = {
                totalUsers: Math.floor(Math.random() * 1000) + 1000,
                totalOrders: Math.floor(Math.random() * 500) + 500,
                totalProducts: Math.floor(Math.random() * 200) + 400,
                totalRevenue: Math.floor(Math.random() * 50000) + 100000,
                growthRate: {
                    users: (Math.random() * 20 - 5).toFixed(1),
                    orders: (Math.random() * 20 - 5).toFixed(1),
                    products: (Math.random() * 20 - 5).toFixed(1),
                    revenue: (Math.random() * 20 - 5).toFixed(1)
                }
            }

            updateDashboardStats(randomStats)
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setLoading(false)
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

    return {
        // State
        sidebarOpen: readonly(sidebarOpen),
        loading: readonly(loading),
        user: readonly(user),
        dashboardStats: readonly(dashboardStats),
        recentActivities: readonly(recentActivities),

        // Getters
        userInitials,
        recentActivitiesByType,

        // Actions
        toggleSidebar,
        closeSidebar,
        openSidebar,
        setLoading,
        updateDashboardStats,
        addRecentActivity,
        fetchDashboardData
    }
})