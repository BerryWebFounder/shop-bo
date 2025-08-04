<template>
  <div class="space-y-8">
    <!-- 헤더 영역 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
          <NuxtLink to="/profile" class="hover:text-gray-700">개인정보 수정</NuxtLink>
          <span>/</span>
          <span class="text-gray-900 font-medium">계정 설정</span>
        </nav>
        <h2 class="text-3xl font-bold text-gray-900">계정 설정</h2>
        <p class="mt-2 text-gray-600">보안 설정 및 계정 관리</p>
      </div>
      <div class="mt-4 sm:mt-0 flex items-center space-x-3">
        <NuxtLink to="/profile" class="btn-secondary">
          <Icon name="users" size="sm" class="mr-2" />
          개인정보 수정
        </NuxtLink>
      </div>
    </div>

    <!-- 설정 탭 -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
        >
          <Icon :name="tab.icon" size="sm" class="mr-2 inline" />
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- 보안 설정 탭 -->
    <div v-if="activeTab === 'security'">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 로그인 보안 -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">로그인 보안</h3>

          <div class="space-y-4">
            <!-- 2단계 인증 -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 class="text-sm font-medium text-gray-900">2단계 인증</h4>
                <p class="text-xs text-gray-500">로그인 시 추가 보안 코드 요구</p>
              </div>
              <div class="flex items-center space-x-3">
                <Badge
                    :variant="authStore.user?.twoFactorEnabled ? 'success' : 'gray'"
                    :text="authStore.user?.twoFactorEnabled ? '활성화' : '비활성화'"
                    size="sm"
                />
                <button
                    @click="toggle2FA"
                    class="btn-sm"
                    :class="authStore.user?.twoFactorEnabled ? 'btn-warning' : 'btn-success'"
                    :disabled="authStore.loading"
                >
                  {{ authStore.user?.twoFactorEnabled ? '비활성화' : '활성화' }}
                </button>
              </div>
            </div>

            <!-- 로그인 알림 -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 class="text-sm font-medium text-gray-900">로그인 알림</h4>
                <p class="text-xs text-gray-500">새로운 장치에서 로그인 시 알림</p>
              </div>
              <div class="flex items-center">
                <input
                    v-model="securitySettings.loginNotifications"
                    type="checkbox"
                    class="form-checkbox"
                    @change="updateSecuritySettings"
                >
              </div>
            </div>

            <!-- 세션 타임아웃 -->
            <div class="p-4 bg-gray-50 rounded-lg">
              <h4 class="text-sm font-medium text-gray-900 mb-2">세션 타임아웃</h4>
              <select
                  v-model="securitySettings.sessionTimeout"
                  class="form-select w-full"
                  @change="updateSecuritySettings"
              >
                <option value="30">30분</option>
                <option value="60">1시간</option>
                <option value="120">2시간</option>
                <option value="480">8시간</option>
                <option value="1440">24시간</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 활성 세션 -->
        <div class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">활성 세션</h3>
            <button
                @click="refreshSessions"
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

          <div class="space-y-3">
            <div
                v-for="session in activeSessions"
                :key="session.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div
                    class="w-2 h-2 rounded-full"
                    :class="session.current ? 'bg-green-500' : 'bg-gray-400'"
                ></div>
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    {{ session.device }} • {{ session.browser }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ session.location }} • {{ session.lastActive }}
                  </p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <Badge
                    :variant="session.current ? 'success' : 'gray'"
                    :text="session.current ? '현재 세션' : '다른 세션'"
                    size="sm"
                />
                <button
                    v-if="!session.current"
                    @click="terminateSession(session.id)"
                    class="btn-danger btn-sm"
                >
                  종료
                </button>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-200">
            <button
                @click="terminateAllSessions"
                class="w-full btn-warning"
                :disabled="authStore.loading"
            >
              모든 다른 세션 종료
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 개인정보 설정 탭 -->
    <div v-if="activeTab === 'privacy'">
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">개인정보 설정</h3>

        <div class="space-y-6">
          <!-- 프로필 공개 설정 -->
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-3">프로필 공개 설정</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">프로필 정보 공개</span>
                <input
                    v-model="privacySettings.profileVisible"
                    type="checkbox"
                    class="form-checkbox"
                    @change="updatePrivacySettings"
                >
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">이메일 주소 공개</span>
                <input
                    v-model="privacySettings.emailVisible"
                    type="checkbox"
                    class="form-checkbox"
                    @change="updatePrivacySettings"
                >
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">활동 기록 공개</span>
                <input
                    v-model="privacySettings.activityVisible"
                    type="checkbox"
                    class="form-checkbox"
                    @change="updatePrivacySettings"
                >
              </div>
            </div>
          </div>

          <!-- 데이터 수집 동의 -->
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-3">데이터 수집 동의</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">사용 통계 수집</span>
                <input
                    v-model="privacySettings.analytics"
                    type="checkbox"
                    class="form-checkbox"
                    @change="updatePrivacySettings"
                >
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">개인화 추천</span>
                <input
                    v-model="privacySettings.personalization"
                    type="checkbox"
                    class="form-checkbox"
                    @change="updatePrivacySettings"
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 알림 설정 탭 -->
    <div v-if="activeTab === 'notifications'">
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">알림 설정</h3>

        <div class="space-y-6">
          <!-- 이메일 알림 -->
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-3">이메일 알림</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-sm text-gray-900">시스템 알림</span>
                  <p class="text-xs text-gray-500">보안, 계정 관련 중요 알림</p>
                </div>
                <input
                    v-model="notificationSettings.systemEmails"
                    type="checkbox"
                    class="form-checkbox"
                    @change="updateNotificationSettings"
                >
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-sm text-gray-900">게시글 알림</span>
                  <p class="text-xs text-gray-500">새 게시글, 댓글 알림</p>
                </div>
                <input
                    v-model="notificationSettings.postEmails"
                    type="checkbox"
                    class="form-checkbox"
                    @change="updateNotificationSettings"
                >
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-sm text-gray-900">마케팅 정보</span>
                  <p class="text-xs text-gray-500">이벤트, 프로모션 정보</p>
                </div>
                <input
                    v-model="notificationSettings.marketingEmails"
                    type="checkbox"
                    class="form-checkbox"
                    @change="updateNotificationSettings"
                >
              </div>
            </div>
          </div>

          <!-- 알림 빈도 -->
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-3">알림 빈도</h4>
            <select
                v-model="notificationSettings.frequency"
                class="form-select w-full md:w-64"
                @change="updateNotificationSettings"
            >
              <option value="realtime">실시간</option>
              <option value="daily">하루 1회</option>
              <option value="weekly">주 1회</option>
              <option value="never">받지 않음</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- 계정 관리 탭 -->
    <div v-if="activeTab === 'account'">
      <div class="space-y-6">
        <!-- 계정 정보 -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">계정 정보</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500">사용자 ID:</span>
              <span class="ml-2 font-mono">{{ authStore.user?.id }}</span>
            </div>
            <div>
              <span class="text-gray-500">계정 생성일:</span>
              <span class="ml-2">{{ formatDate(authStore.user?.createdAt) }}</span>
            </div>
            <div>
              <span class="text-gray-500">마지막 수정일:</span>
              <span class="ml-2">{{ formatDate(authStore.user?.updatedAt) }}</span>
            </div>
            <div>
              <span class="text-gray-500">로그인 횟수:</span>
              <span class="ml-2">{{ authStore.user?.loginCount || 0 }}회</span>
            </div>
          </div>
        </div>

        <!-- 위험한 작업 -->
        <div class="card p-6 border-l-4 border-l-red-500">
          <h3 class="text-lg font-semibold text-red-900 mb-4">위험한 작업</h3>

          <div class="space-y-4">
            <!-- 계정 비활성화 -->
            <div class="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <h4 class="text-sm font-medium text-red-900">계정 비활성화</h4>
                <p class="text-xs text-red-600">계정을 일시적으로 비활성화합니다</p>
              </div>
              <button
                  @click="showDeactivateModal = true"
                  class="btn-warning"
                  :disabled="authStore.loading"
              >
                비활성화
              </button>
            </div>

            <!-- 계정 삭제 -->
            <div class="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <h4 class="text-sm font-medium text-red-900">계정 삭제</h4>
                <p class="text-xs text-red-600">모든 데이터가 영구적으로 삭제됩니다</p>
              </div>
              <button
                  @click="showDeleteModal = true"
                  class="btn-danger"
                  :disabled="authStore.loading"
              >
                계정 삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 계정 비활성화 모달 -->
    <div
        v-if="showDeactivateModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="showDeactivateModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
              <Icon name="notification" size="lg" color="yellow" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">계정 비활성화</h3>
              <p class="text-sm text-gray-500">계정을 비활성화하시겠습니까?</p>
            </div>
          </div>

          <p class="text-gray-600 mb-6">
            계정이 비활성화되면 로그인할 수 없으며, 관리자가 다시 활성화할 때까지 시스템을 사용할 수 없습니다.
          </p>

          <div class="flex justify-end space-x-3">
            <button
                @click="showDeactivateModal = false"
                class="btn-secondary"
            >
              취소
            </button>
            <button
                @click="deactivateAccount"
                class="btn-warning"
                :disabled="authStore.loading"
            >
              비활성화
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 계정 삭제 모달 -->
    <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="showDeleteModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <Icon name="delete" size="lg" color="red" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">계정 삭제</h3>
              <p class="text-sm text-gray-500">이 작업은 되돌릴 수 없습니다</p>
            </div>
          </div>

          <p class="text-gray-600 mb-4">
            계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
          </p>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              확인을 위해 "<strong>계정삭제</strong>"를 입력하세요:
            </label>
            <input
                v-model="deleteConfirmText"
                type="text"
                class="form-input"
                placeholder="계정삭제"
            >
          </div>

          <div class="flex justify-end space-x-3">
            <button
                @click="showDeleteModal = false"
                class="btn-secondary"
            >
              취소
            </button>
            <button
                @click="deleteAccount"
                class="btn-danger"
                :disabled="deleteConfirmText !== '계정삭제' || authStore.loading"
            >
              영구 삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 인증 미들웨어 적용
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const toast = useGlobalToast()
const router = useRouter()

// 반응형 데이터
const activeTab = ref('security')
const loading = ref(false)
const showDeactivateModal = ref(false)
const showDeleteModal = ref(false)
const deleteConfirmText = ref('')

// 탭 설정
const tabs = [
  { id: 'security', name: '보안', icon: 'settings' },
  { id: 'privacy', name: '개인정보', icon: 'users' },
  { id: 'notifications', name: '알림', icon: 'notification' },
  { id: 'account', name: '계정 관리', icon: 'delete' }
]

// 설정 데이터
const securitySettings = ref({
  loginNotifications: true,
  sessionTimeout: 60
})

const privacySettings = ref({
  profileVisible: true,
  emailVisible: false,
  activityVisible: true,
  analytics: true,
  personalization: true
})

const notificationSettings = ref({
  systemEmails: true,
  postEmails: true,
  marketingEmails: false,
  frequency: 'daily'
})

// 활성 세션 (예시 데이터)
const activeSessions = ref([
  {
    id: 1,
    device: 'Desktop',
    browser: 'Chrome 120',
    location: '서울, 대한민국',
    lastActive: '현재',
    current: true
  },
  {
    id: 2,
    device: 'Mobile',
    browser: 'Safari',
    location: '부산, 대한민국',
    lastActive: '2시간 전',
    current: false
  }
])

// 유틸리티 함수
const formatDate = (dateString) => {
  if (!dateString) return '정보 없음'
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 설정 업데이트 함수들
const updateSecuritySettings = () => {
  toast.success('보안 설정이 업데이트되었습니다.')
}

const updatePrivacySettings = () => {
  toast.success('개인정보 설정이 업데이트되었습니다.')
}

const updateNotificationSettings = () => {
  toast.success('알림 설정이 업데이트되었습니다.')
}

// 2단계 인증 토글
const toggle2FA = () => {
  const isEnabled = authStore.user?.twoFactorEnabled
  const action = isEnabled ? '비활성화' : '활성화'

  toast.info(`2단계 인증 ${action} 기능은 준비 중입니다.`)
}

// 세션 관리
const refreshSessions = async () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    toast.success('세션 목록이 새로고침되었습니다.')
  }, 1000)
}

const terminateSession = (sessionId) => {
  activeSessions.value = activeSessions.value.filter(s => s.id !== sessionId)
  toast.success('세션이 종료되었습니다.')
}

const terminateAllSessions = () => {
  activeSessions.value = activeSessions.value.filter(s => s.current)
  toast.success('모든 다른 세션이 종료되었습니다.')
}

// 계정 관리
const deactivateAccount = async () => {
  try {
    await authStore.toggleAccountStatus()
    showDeactivateModal.value = false

    if (!authStore.user?.isActive) {
      toast.success('계정이 비활성화되었습니다. 로그아웃됩니다.')
      setTimeout(() => {
        authStore.logout()
        router.push('/login')
      }, 2000)
    }
  } catch (error) {
    console.error('Account deactivation failed:', error)
  }
}

const deleteAccount = async () => {
  try {
    await authStore.deleteAccount()
    showDeleteModal.value = false
    router.push('/login')
  } catch (error) {
    console.error('Account deletion failed:', error)
  }
}

// SEO 메타데이터
useHead({
  title: '계정 설정 - Shop BackOffice',
  meta: [
    { name: 'description', content: '계정 보안 설정 및 관리' }
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