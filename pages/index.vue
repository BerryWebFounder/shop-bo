<template>
  <div class="space-y-8">
    <!-- 환영 메시지 -->
    <div class="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg text-white">
      <div class="px-6 py-8">
        <h2 class="text-2xl font-bold mb-2">
          안녕하세요, {{ authStore.user?.fullName || '사용자' }}님!
        </h2>
        <p class="text-primary-100">
          {{ getRoleGreeting() }} 오늘도 효율적인 상점 관리를 시작해보세요.
        </p>
        <div class="mt-4 flex items-center space-x-4 text-sm">
          <div class="flex items-center">
            <Icon name="calendar" size="sm" class="mr-1" />
            <span>마지막 로그인: {{ formatLastLogin() }}</span>
          </div>
          <div class="flex items-center">
            <Badge
                :variant="getRoleVariant(authStore.user?.role)"
                :text="authStore.user?.roleDisplayName"
                size="sm"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 주요 통계 카드 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- 사용자 수 -->
      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">총 사용자</p>
            <p class="text-3xl font-bold text-gray-900">
              {{ formatNumber(mainStore.dashboardStats.totalUsers) }}
            </p>
            <div class="flex items-center mt-2">
              <Icon
                  :name="mainStore.dashboardStats.growthRate.users >= 0 ? 'arrow-up' : 'arrow-down'"
                  size="sm"
                  :class="mainStore.dashboardStats.growthRate.users >= 0 ? 'text-green-500' : 'text-red-500'"
              />
              <span
                  class="text-sm font-medium ml-1"
                  :class="mainStore.dashboardStats.growthRate.users >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ Math.abs(mainStore.dashboardStats.growthRate.users) }}%
              </span>
              <span class="text-sm text-gray-500 ml-1">전월 대비</span>
            </div>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon name="users" size="lg" color="blue" />
          </div>
        </div>
      </div>

      <!-- 주문 수 -->
      <div class="card p-6" v-if="authStore.isModerator">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">총 주문</p>
            <p class="text-3xl font-bold text-gray-900">
              {{ formatNumber(mainStore.dashboardStats.totalOrders) }}
            </p>
            <div class="flex items-center mt-2">
              <Icon
                  :name="mainStore.dashboardStats.growthRate.orders >= 0 ? 'arrow-up' : 'arrow-down'"
                  size="sm"
                  :class="mainStore.dashboardStats.growthRate.orders >= 0 ? 'text-green-500' : 'text-red-500'"
              />
              <span
                  class="text-sm font-medium ml-1"
                  :class="mainStore.dashboardStats.growthRate.orders >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ Math.abs(mainStore.dashboardStats.growthRate.orders) }}%
              </span>
              <span class="text-sm text-gray-500 ml-1">전월 대비</span>
            </div>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Icon name="orders" size="lg" color="green" />
          </div>
        </div>
      </div>

      <!-- 상품 수 -->
      <div class="card p-6" v-if="authStore.isModerator">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">총 상품</p>
            <p class="text-3xl font-bold text-gray-900">
              {{ formatNumber(mainStore.dashboardStats.totalProducts) }}
            </p>
            <div class="flex items-center mt-2">
              <Icon
                  :name="mainStore.dashboardStats.growthRate.products >= 0 ? 'arrow-up' : 'arrow-down'"
                  size="sm"
                  :class="mainStore.dashboardStats.growthRate.products >= 0 ? 'text-green-500' : 'text-red-500'"
              />
              <span
                  class="text-sm font-medium ml-1"
                  :class="mainStore.dashboardStats.growthRate.products >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ Math.abs(mainStore.dashboardStats.growthRate.products) }}%
              </span>
              <span class="text-sm text-gray-500 ml-1">전월 대비</span>
            </div>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Icon name="products" size="lg" color="purple" />
          </div>
        </div>
      </div>

      <!-- 매출 -->
      <div class="card p-6" v-if="authStore.isAdmin">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">총 매출</p>
            <p class="text-3xl font-bold text-gray-900">
              {{ formatCurrency(mainStore.dashboardStats.totalRevenue) }}
            </p>
            <div class="flex items-center mt-2">
              <Icon
                  :name="mainStore.dashboardStats.growthRate.revenue >= 0 ? 'arrow-up' : 'arrow-down'"
                  size="sm"
                  :class="mainStore.dashboardStats.growthRate.revenue >= 0 ? 'text-green-500' : 'text-red-500'"
              />
              <span
                  class="text-sm font-medium ml-1"
                  :class="mainStore.dashboardStats.growthRate.revenue >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ Math.abs(mainStore.dashboardStats.growthRate.revenue) }}%
              </span>
              <span class="text-sm text-gray-500 ml-1">전월 대비</span>
            </div>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Icon name="analytics" size="lg" color="yellow" />
          </div>
        </div>
      </div>

      <!-- 내 활동 통계 (모든 사용자) -->
      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">내 게시글</p>
            <p class="text-3xl font-bold text-gray-900">
              {{ formatNumber(userStats.postCount) }}
            </p>
            <p class="text-sm text-gray-500 mt-1">댓글: {{ formatNumber(userStats.commentCount) }}</p>
          </div>
          <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Icon name="post" size="lg" color="indigo" />
          </div>
        </div>
      </div>
    </div>

    <!-- 게시판 통계 카드 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- 활성 공지사항 -->
      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">활성 공지사항</p>
            <p class="text-3xl font-bold text-gray-900">
              {{ formatNumber(mainStore.boardStats.activeNotices) }}
            </p>
            <p class="text-sm text-gray-500 mt-1">중요: {{ formatNumber(mainStore.boardStats.pinnedNotices) }}</p>
          </div>
          <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Icon name="notification" size="lg" color="indigo" />
          </div>
        </div>
      </div>

      <!-- 총 게시글 -->
      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">총 게시글</p>
            <p class="text-3xl font-bold text-gray-900">
              {{ formatNumber(mainStore.boardStats.totalPosts) }}
            </p>
            <p class="text-sm text-gray-500 mt-1">일반: {{ formatNumber(mainStore.boardStats.regularPosts) }}</p>
          </div>
          <div class="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
            <Icon name="post" size="lg" color="blue" />
          </div>
        </div>
      </div>

      <!-- 만료된 공지사항 -->
      <div class="card p-6" v-if="authStore.isModerator">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">만료된 공지</p>
            <p class="text-3xl font-bold text-red-600">
              {{ formatNumber(mainStore.boardStats.expiredNotices) }}
            </p>
            <p class="text-sm text-gray-500 mt-1">비활성화된 공지사항</p>
          </div>
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <Icon name="close" size="lg" color="red" />
          </div>
        </div>
      </div>
    </div>

    <!-- 차트 및 활동 영역 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- 차트 영역 (2/3) -->
      <div class="lg:col-span-2">
        <div class="card p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">활동 추이</h3>
            <select class="form-select text-sm w-auto">
              <option>최근 7일</option>
              <option>최근 30일</option>
              <option>최근 3개월</option>
            </select>
          </div>

          <!-- 간단한 차트 영역 -->
          <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div class="text-center">
              <Icon name="analytics" size="xl" color="gray" class="mx-auto mb-2" />
              <p class="text-gray-500">활동 차트</p>
              <p class="text-sm text-gray-400">Chart.js나 다른 차트 라이브러리 연동</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 최근 활동 (1/3) -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">최근 활동</h3>
          <button class="text-sm text-primary-600 hover:text-primary-700">
            모두 보기
          </button>
        </div>

        <div class="space-y-4">
          <div
              v-for="activity in visibleActivities"
              :key="activity.id"
              class="flex items-start space-x-3"
          >
            <div
                class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                :class="getActivityColor(activity.status)"
            >
              <Icon
                  :name="getActivityIcon(activity.type)"
                  size="sm"
                  class="text-white"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-900">{{ activity.message }}</p>
              <p class="text-xs text-gray-500">{{ activity.user }}</p>
              <p class="text-xs text-gray-400">{{ activity.timestamp }}</p>
            </div>
          </div>
        </div>

        <div v-if="mainStore.recentActivities.length === 0" class="text-center py-8">
          <Icon name="notification" size="xl" color="gray" class="mx-auto mb-2" />
          <p class="text-gray-500">최근 활동이 없습니다</p>
        </div>
      </div>
    </div>

    <!-- 빠른 액션 -->
    <div class="card p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-6">빠른 액션</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <NuxtLink
            v-if="authStore.isModerator"
            to="/products"
            class="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Icon name="plus" size="lg" color="primary" class="mb-2" />
          <span class="text-sm font-medium text-gray-700">상품 추가</span>
        </NuxtLink>

        <NuxtLink
            v-if="authStore.isModerator"
            to="/orders"
            class="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Icon name="orders" size="lg" color="primary" class="mb-2" />
          <span class="text-sm font-medium text-gray-700">주문 관리</span>
        </NuxtLink>

        <NuxtLink
            v-if="authStore.isAdmin"
            to="/admin/users"
            class="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Icon name="users" size="lg" color="primary" class="mb-2" />
          <span class="text-sm font-medium text-gray-700">사용자 관리</span>
        </NuxtLink>

        <NuxtLink
            to="/boards"
            class="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Icon name="boards" size="lg" color="primary" class="mb-2" />
          <span class="text-sm font-medium text-gray-700">게시판 관리</span>
        </NuxtLink>

        <NuxtLink
            v-if="authStore.isModerator"
            to="/analytics"
            class="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Icon name="analytics" size="lg" color="primary" class="mb-2" />
          <span class="text-sm font-medium text-gray-700">분석 보기</span>
        </NuxtLink>

        <NuxtLink
            to="/profile"
            class="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Icon name="settings" size="lg" color="primary" class="mb-2" />
          <span class="text-sm font-medium text-gray-700">내 설정</span>
        </NuxtLink>
      </div>
    </div>

    <!-- 알림 메시지 (처리 대기가 있을 때만 표시) -->
    <div v-if="mainStore.boardStats.expiredNotices > 0 && authStore.isModerator" class="card border-l-4 border-l-red-500">
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <Icon name="notification" size="md" color="red" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">만료된 공지사항이 있습니다</h3>
              <p class="text-sm text-gray-600">
                {{ mainStore.boardStats.expiredNotices }}개의 공지사항이 만료되어 비활성화되었습니다
              </p>
            </div>
          </div>
          <NuxtLink to="/boards" class="btn-primary">
            <Icon name="boards" size="sm" class="mr-2" />
            게시판 관리로 이동
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- 데이터 새로고침 버튼 -->
    <div class="flex justify-center">
      <button
          @click="refreshData"
          class="btn-primary"
          :disabled="refreshing"
      >
        <Icon
            name="analytics"
            size="sm"
            class="mr-2"
            :class="{ 'animate-spin': refreshing }"
        />
        {{ refreshing ? '새로고침 중...' : '데이터 새로고침' }}
      </button>
    </div>
  </div>
</template>

<script setup>
// 인증 미들웨어 적용
definePageMeta({
  middleware: 'auth'
})

const mainStore = useMainStore()
const authStore = useAuthStore()
const refreshing = ref(false)

// 사용자별 통계
const userStats = ref({
  postCount: 0,
  commentCount: 0,
  totalViews: 0
})

// 페이지 로드 시 데이터 가져오기
onMounted(async () => {
  await Promise.all([
    mainStore.initialize(),
    loadUserStats()
  ])
})

// 사용자 통계 로드
const loadUserStats = async () => {
  try {
    // TODO: 실제 API 호출로 사용자 활동 통계 가져오기
    // const stats = await api.getUserActivityStats(authStore.user.id)

    // 임시 데이터
    userStats.value = {
      postCount: Math.floor(Math.random() * 50) + 5,
      commentCount: Math.floor(Math.random() * 100) + 10,
      totalViews: Math.floor(Math.random() * 1000) + 50
    }
  } catch (error) {
    console.error('Failed to load user stats:', error)
  }
}

// 데이터 새로고침
const refreshData = async () => {
  refreshing.value = true
  await Promise.all([
    mainStore.fetchDashboardData(),
    loadUserStats()
  ])
  refreshing.value = false
}

// 역할별 인사말
const getRoleGreeting = () => {
  if (!authStore.user) return ''

  switch (authStore.user.role) {
    case 'ADMIN':
      return '시스템 관리자님,'
    case 'SYSOP':
      return '운영자님,'
    default:
      return '사용자님,'
  }
}

// 마지막 로그인 시간 포맷
const formatLastLogin = () => {
  if (!authStore.user?.lastLoginAt) return '처음 로그인'

  return new Date(authStore.user.lastLoginAt).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 역할에 따른 배지 색상
const getRoleVariant = (role) => {
  switch (role) {
    case 'ADMIN':
      return 'danger'
    case 'SYSOP':
      return 'warning'
    case 'USER':
    default:
      return 'info'
  }
}

// 표시할 활동 목록 (권한에 따라 필터링)
const visibleActivities = computed(() => {
  return mainStore.recentActivities
      .filter(activity => {
        // 관리자는 모든 활동 보기
        if (authStore.isAdmin) return true

        // 운영자는 시스템 관련 제외하고 보기
        if (authStore.isModerator) return activity.type !== 'system'

        // 일반 사용자는 자신의 활동만 보기
        return activity.user.includes(authStore.user?.username || '')
      })
      .slice(0, 5)
})

// 숫자 포맷팅
const formatNumber = (num) => {
  return new Intl.NumberFormat('ko-KR').format(num || 0)
}

// 통화 포맷팅
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount || 0)
}

// 활동 아이콘 가져오기
const getActivityIcon = (type) => {
  const iconMap = {
    order: 'orders',
    user: 'users',
    product: 'products',
    board: 'boards',
    system: 'settings'
  }
  return iconMap[type] || 'notification'
}

// 활동 상태별 색상
const getActivityColor = (status) => {
  const colorMap = {
    new: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  }
  return colorMap[status] || 'bg-gray-500'
}

// SEO 메타데이터
useHead({
  title: '대시보드 - Shop BackOffice',
  meta: [
    { name: 'description', content: '상점 관리 대시보드' }
  ]
})
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>