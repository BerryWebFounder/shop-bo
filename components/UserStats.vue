<template>
  <div class="space-y-6">
    <!-- 제목 -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">사용자 통계</h3>
      <button
          @click="refreshStats"
          class="btn-secondary btn-sm"
          :disabled="loading"
      >
        <Icon
            name="analytics"
            size="sm"
            :class="{ 'animate-spin': loading }"
        />
      </button>
    </div>

    <!-- 전체 통계 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 전체 사용자 -->
      <div class="card p-4">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm text-gray-600">전체 사용자</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatNumber(stats.totalUsers) }}</p>
            <div class="flex items-center mt-1">
              <Icon
                  :name="userGrowth >= 0 ? 'arrow-up' : 'arrow-down'"
                  size="xs"
                  :class="userGrowth >= 0 ? 'text-green-500' : 'text-red-500'"
              />
              <span
                  class="text-xs ml-1"
                  :class="userGrowth >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ userGrowth >= 0 ? '+' : '' }}{{ userGrowth }}%
              </span>
              <span class="text-xs text-gray-500 ml-1">전월 대비</span>
            </div>
          </div>
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon name="users" size="md" color="blue" />
          </div>
        </div>
      </div>

      <!-- 활성 사용자 -->
      <div class="card p-4">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm text-gray-600">활성 사용자</p>
            <p class="text-2xl font-bold text-green-600">{{ formatNumber(stats.activeUsers) }}</p>
            <p class="text-xs text-gray-500 mt-1">
              {{ activeUserPercentage }}% 활성화
            </p>
          </div>
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Icon name="users" size="md" color="green" />
          </div>
        </div>
      </div>

      <!-- 신규 가입자 -->
      <div class="card p-4">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm text-gray-600">이번 달 신규</p>
            <p class="text-2xl font-bold text-purple-600">{{ formatNumber(stats.recentSignups) }}</p>
            <p class="text-xs text-gray-500 mt-1">최근 30일</p>
          </div>
          <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Icon name="plus" size="md" color="purple" />
          </div>
        </div>
      </div>

      <!-- 관리자 수 -->
      <div class="card p-4">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm text-gray-600">관리자</p>
            <p class="text-2xl font-bold text-red-600">{{ formatNumber(stats.adminUsers) }}</p>
            <p class="text-xs text-gray-500 mt-1">
              운영자: {{ formatNumber(stats.moderatorUsers) }}명
            </p>
          </div>
          <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Icon name="settings" size="md" color="red" />
          </div>
        </div>
      </div>
    </div>

    <!-- 역할별 분포 -->
    <div class="card p-6">
      <h4 class="text-lg font-semibold text-gray-900 mb-4">역할별 분포</h4>

      <div class="space-y-4">
        <!-- 관리자 -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-4 h-4 bg-red-500 rounded"></div>
            <span class="text-sm font-medium text-gray-700">관리자</span>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-32 bg-gray-200 rounded-full h-2">
              <div
                  class="bg-red-500 h-2 rounded-full"
                  :style="{ width: `${adminPercentage}%` }"
              ></div>
            </div>
            <span class="text-sm text-gray-600 w-12">{{ adminPercentage }}%</span>
          </div>
        </div>

        <!-- 운영자 -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-4 h-4 bg-yellow-500 rounded"></div>
            <span class="text-sm font-medium text-gray-700">운영자</span>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-32 bg-gray-200 rounded-full h-2">
              <div
                  class="bg-yellow-500 h-2 rounded-full"
                  :style="{ width: `${moderatorPercentage}%` }"
              ></div>
            </div>
            <span class="text-sm text-gray-600 w-12">{{ moderatorPercentage }}%</span>
          </div>
        </div>

        <!-- 일반 사용자 -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-4 h-4 bg-blue-500 rounded"></div>
            <span class="text-sm font-medium text-gray-700">일반 사용자</span>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-32 bg-gray-200 rounded-full h-2">
              <div
                  class="bg-blue-500 h-2 rounded-full"
                  :style="{ width: `${userPercentage}%` }"
              ></div>
            </div>
            <span class="text-sm text-gray-600 w-12">{{ userPercentage }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 월별 가입 현황 -->
    <div class="card p-6">
      <h4 class="text-lg font-semibold text-gray-900 mb-4">월별 가입 현황</h4>

      <!-- 간단한 차트 영역 -->
      <div class="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
        <div class="text-center">
          <Icon name="analytics" size="xl" color="gray" class="mx-auto mb-2" />
          <p class="text-gray-500">월별 가입 현황 차트</p>
          <p class="text-sm text-gray-400">Chart.js 등 차트 라이브러리 연동 필요</p>
        </div>
      </div>
    </div>

    <!-- 최근 활동 -->
    <div class="card p-6">
      <h4 class="text-lg font-semibold text-gray-900 mb-4">최근 사용자 활동</h4>

      <div class="space-y-3">
        <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
        >
          <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {{ getUserInitials(activity.user) }}
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">{{ activity.user.fullName }}</p>
            <p class="text-xs text-gray-500">{{ activity.description }}</p>
          </div>
          <div class="text-xs text-gray-400">
            {{ activity.timestamp }}
          </div>
        </div>
      </div>

      <div v-if="recentActivities.length === 0" class="text-center py-8 text-gray-500">
        <Icon name="users" size="xl" color="gray" class="mx-auto mb-2" />
        <p>최근 활동이 없습니다</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  stats: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['refresh'])

// 반응형 데이터
const loading = ref(false)

// 임시 활동 데이터
const recentActivities = ref([
  {
    id: 1,
    user: { fullName: '김철수', username: 'kimcs' },
    description: '새로운 게시글을 작성했습니다',
    timestamp: '5분 전'
  },
  {
    id: 2,
    user: { fullName: '이영희', username: 'leeyh' },
    description: '프로필을 업데이트했습니다',
    timestamp: '15분 전'
  },
  {
    id: 3,
    user: { fullName: '박민수', username: 'parkms' },
    description: '댓글을 작성했습니다',
    timestamp: '30분 전'
  }
])

// 계산된 속성
const userGrowth = computed(() => {
  // 임시 성장률 (실제로는 props나 API에서 가져올 것)
  return parseFloat((Math.random() * 20 - 5).toFixed(1))
})

const activeUserPercentage = computed(() => {
  if (props.stats.totalUsers === 0) return 0
  return Math.round((props.stats.activeUsers / props.stats.totalUsers) * 100)
})

const adminPercentage = computed(() => {
  if (props.stats.totalUsers === 0) return 0
  return Math.round((props.stats.adminUsers / props.stats.totalUsers) * 100)
})

const moderatorPercentage = computed(() => {
  if (props.stats.totalUsers === 0) return 0
  return Math.round((props.stats.moderatorUsers / props.stats.totalUsers) * 100)
})

const userPercentage = computed(() => {
  if (props.stats.totalUsers === 0) return 0
  return Math.round((props.stats.regularUsers / props.stats.totalUsers) * 100)
})

// 메서드
const formatNumber = (num) => {
  return new Intl.NumberFormat('ko-KR').format(num || 0)
}

const getUserInitials = (user) => {
  if (!user?.fullName) return '?'
  return user.fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
}

const refreshStats = async () => {
  loading.value = true
  try {
    emit('refresh')
    // 임시 지연
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    loading.value = false
  }
}
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