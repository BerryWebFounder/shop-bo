<template>
  <div class="space-y-6">
    <!-- 헤더 영역 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
          <NuxtLink to="/users" class="hover:text-gray-700">사용자 관리</NuxtLink>
          <span>/</span>
          <span class="text-gray-900 font-medium">사용자 상세</span>
        </nav>
        <h2 class="text-3xl font-bold text-gray-900">사용자 상세 정보</h2>
      </div>
      <div class="mt-4 sm:mt-0 flex items-center space-x-3">
        <button
            @click="goBack"
            class="btn-secondary"
        >
          <Icon name="arrow-up" size="sm" class="mr-2 rotate-[-90deg]" />
          돌아가기
        </button>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="usersStore.loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- 사용자 정보 -->
    <div v-else-if="user" class="space-y-6">
      <!-- 기본 정보 카드 -->
      <div class="card p-6">
        <div class="flex items-start justify-between mb-6">
          <div class="flex items-center space-x-6">
            <!-- 프로필 사진 -->
            <div class="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {{ getUserInitials() }}
            </div>

            <!-- 기본 정보 -->
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <h1 class="text-2xl font-bold text-gray-900">{{ user.fullName }}</h1>
                <Badge
                    :variant="getRoleVariant(user.role)"
                    :text="getRoleDisplayName(user.role)"
                />
                <Badge
                    :variant="user.isActive ? 'success' : 'danger'"
                    :text="user.isActive ? '활성' : '비활성'"
                />
              </div>

              <div class="space-y-1 text-sm text-gray-500">
                <div class="flex items-center space-x-2">
                  <Icon name="users" size="sm" />
                  <span>@{{ user.username }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <Icon name="notification" size="sm" />
                  <span>{{ user.email }}</span>
                  <Badge
                      v-if="user.emailVerified"
                      variant="success"
                      text="인증됨"
                      size="sm"
                  />
                  <Badge
                      v-else
                      variant="warning"
                      text="미인증"
                      size="sm"
                  />
                </div>
                <div v-if="user.phoneNumber" class="flex items-center space-x-2">
                  <Icon name="notification" size="sm" />
                  <span>{{ user.phoneNumber }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 액션 버튼들 -->
          <div class="flex items-center space-x-2">
            <button
                @click="editUser"
                class="btn-secondary"
                :disabled="usersStore.loading"
            >
              <Icon name="edit" size="sm" class="mr-2" />
              수정
            </button>

            <button
                @click="toggleStatus"
                :class="user.isActive ? 'btn-warning' : 'btn-success'"
                :disabled="usersStore.loading"
            >
              <Icon :name="user.isActive ? 'close' : 'plus'" size="sm" class="mr-2" />
              {{ user.isActive ? '비활성화' : '활성화' }}
            </button>

            <button
                @click="resetPassword"
                class="btn-info"
                :disabled="usersStore.loading"
            >
              <Icon name="settings" size="sm" class="mr-2" />
              비밀번호 재설정
            </button>

            <button
                @click="confirmDelete"
                class="btn-danger"
                :disabled="usersStore.loading || (user.role === 'ADMIN' && adminCount <= 1)"
            >
              <Icon name="delete" size="sm" class="mr-2" />
              삭제
            </button>
          </div>
        </div>

        <!-- 통계 정보 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 py-4 border-t border-gray-200">
          <div class="text-center">
            <div class="flex items-center justify-center mb-1">
              <Icon name="calendar" size="sm" class="mr-1 text-gray-400" />
            </div>
            <div class="text-lg font-bold text-gray-900">{{ daysSinceJoined }}</div>
            <div class="text-sm text-gray-500">가입 후 일수</div>
          </div>
          <div class="text-center">
            <div class="flex items-center justify-center mb-1">
              <Icon name="users" size="sm" class="mr-1 text-gray-400" />
            </div>
            <div class="text-lg font-bold text-gray-900">{{ user.loginCount || 0 }}</div>
            <div class="text-sm text-gray-500">로그인 횟수</div>
          </div>
          <div class="text-center">
            <div class="flex items-center justify-center mb-1">
              <Icon name="post" size="sm" class="mr-1 text-gray-400" />
            </div>
            <div class="text-lg font-bold text-gray-900">{{ user.postCount || 0 }}</div>
            <div class="text-sm text-gray-500">작성 게시글</div>
          </div>
          <div class="text-center">
            <div class="flex items-center justify-center mb-1">
              <Icon name="comment" size="sm" class="mr-1 text-gray-400" />
            </div>
            <div class="text-lg font-bold text-gray-900">{{ user.commentCount || 0 }}</div>
            <div class="text-sm text-gray-500">작성 댓글</div>
          </div>
        </div>
      </div>

      <!-- 추가 정보 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 개인 정보 -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">개인 정보</h3>

          <div class="space-y-4">
            <div v-if="user.department || user.position" class="grid grid-cols-2 gap-4">
              <div v-if="user.department">
                <label class="text-sm font-medium text-gray-500">부서</label>
                <p class="text-gray-900">{{ user.department }}</p>
              </div>
              <div v-if="user.position">
                <label class="text-sm font-medium text-gray-500">직책</label>
                <p class="text-gray-900">{{ user.position }}</p>
              </div>
            </div>

            <div v-if="user.bio">
              <label class="text-sm font-medium text-gray-500">자기소개</label>
              <p class="text-gray-900 whitespace-pre-wrap">{{ user.bio }}</p>
            </div>

            <div v-if="!user.department && !user.position && !user.bio" class="text-center py-4 text-gray-500">
              추가 개인 정보가 없습니다
            </div>
          </div>
        </div>

        <!-- 계정 설정 -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">계정 설정</h3>

          <div class="space-y-4">
            <!-- 알림 설정 -->
            <div>
              <label class="text-sm font-medium text-gray-500 mb-2 block">알림 설정</label>
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">이메일 알림</span>
                  <Badge
                      :variant="user.emailNotifications ? 'success' : 'gray'"
                      :text="user.emailNotifications ? '켜짐' : '꺼짐'"
                      size="sm"
                  />
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">푸시 알림</span>
                  <Badge
                      :variant="user.pushNotifications ? 'success' : 'gray'"
                      :text="user.pushNotifications ? '켜짐' : '꺼짐'"
                      size="sm"
                  />
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">마케팅 이메일</span>
                  <Badge
                      :variant="user.marketingEmails ? 'success' : 'gray'"
                      :text="user.marketingEmails ? '켜짐' : '꺼짐'"
                      size="sm"
                  />
                </div>
              </div>
            </div>

            <!-- 보안 설정 -->
            <div>
              <label class="text-sm font-medium text-gray-500 mb-2 block">보안</label>
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">2단계 인증</span>
                  <Badge
                      :variant="user.twoFactorEnabled ? 'success' : 'gray'"
                      :text="user.twoFactorEnabled ? '활성화' : '비활성화'"
                      size="sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 계정 정보 -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">계정 정보</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2">기본 정보</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">사용자 ID:</span>
                <span class="font-mono text-gray-900">{{ user.id }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">사용자명:</span>
                <span class="text-gray-900">{{ user.username }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">역할:</span>
                <Badge
                    :variant="getRoleVariant(user.role)"
                    :text="getRoleDisplayName(user.role)"
                    size="sm"
                />
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">계정 상태:</span>
                <Badge
                    :variant="user.isActive ? 'success' : 'danger'"
                    :text="user.isActive ? '활성' : '비활성'"
                    size="sm"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2">날짜 정보</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">가입일:</span>
                <span class="text-gray-900">{{ formatDateTime(user.createdAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">정보 수정일:</span>
                <span class="text-gray-900">{{ formatDateTime(user.updatedAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">마지막 로그인:</span>
                <span class="text-gray-900">
                  {{ user.lastLoginAt ? formatDateTime(user.lastLoginAt) : '없음' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 활동 내역 -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>

        <div class="space-y-3">
          <!-- 활동 내역이 있을 때 -->
          <div v-if="recentActivities.length > 0">
            <div
                v-for="activity in recentActivities"
                :key="activity.id"
                class="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
            >
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon :name="activity.icon" size="sm" color="blue" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
                <p class="text-xs text-gray-500">{{ activity.description }}</p>
              </div>
              <div class="text-xs text-gray-400">
                {{ activity.timestamp }}
              </div>
            </div>
          </div>

          <!-- 활동 내역이 없을 때 -->
          <div v-else class="text-center py-8 text-gray-500">
            <Icon name="analytics" size="xl" color="gray" class="mx-auto mb-2" />
            <p>최근 활동 내역이 없습니다</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 사용자를 찾을 수 없는 경우 -->
    <div v-else class="text-center py-12">
      <Icon name="users" size="xl" color="gray" class="mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">사용자를 찾을 수 없습니다</h3>
      <p class="text-gray-500 mb-4">삭제되었거나 존재하지 않는 사용자입니다.</p>
      <button @click="goBack" class="btn-primary">
        돌아가기
      </button>
    </div>

    <!-- 사용자 수정 모달 -->
    <UserModal
        v-if="showEditModal"
        :user="user"
        @close="showEditModal = false"
        @submit="handleUserUpdate"
    />

    <!-- 삭제 확인 모달 -->
    <DeleteConfirmModal
        v-if="showDeleteModal"
        :title="`사용자 삭제`"
        :message="`'${user?.fullName}' 사용자를 삭제하시겠습니까?`"
        :show-warning="true"
        :warning-message="user?.role === 'ADMIN' ? '관리자 계정을 삭제하면 시스템 관리에 영향을 줄 수 있습니다.' : '사용자의 모든 데이터가 함께 삭제됩니다.'"
        :require-confirmation="user?.role === 'ADMIN'"
        :confirm-text="user?.fullName"
        @confirm="handleDelete"
        @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup>
// 인증 미들웨어 적용 (관리자만)
definePageMeta({
  middleware: ['auth', 'admin-auth']
})

const usersStore = useUsersStore()
const route = useRoute()
const router = useRouter()

// 반응형 데이터
const showEditModal = ref(false)
const showDeleteModal = ref(false)

// 계산된 속성
const user = computed(() => usersStore.currentUser)

const adminCount = computed(() => usersStore.adminUsersCount)

const daysSinceJoined = computed(() => {
  if (!user.value?.createdAt) return 0
  const joinDate = new Date(user.value.createdAt)
  const today = new Date()
  const diffTime = Math.abs(today - joinDate)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// 임시 활동 내역 데이터
const recentActivities = computed(() => {
  return [
    {
      id: 1,
      icon: 'users',
      title: '로그인',
      description: '시스템에 로그인했습니다',
      timestamp: '2시간 전'
    },
    {
      id: 2,
      icon: 'post',
      title: '게시글 작성',
      description: '새로운 게시글을 작성했습니다',
      timestamp: '1일 전'
    },
    {
      id: 3,
      icon: 'edit',
      title: '프로필 수정',
      description: '프로필 정보를 수정했습니다',
      timestamp: '3일 전'
    }
  ]
})

// 페이지 로드 시 사용자 정보 가져오기
onMounted(async () => {
  const userId = route.params.id
  try {
    await usersStore.fetchUser(userId)
  } catch (error) {
    console.error('사용자 조회 실패:', error)
  }
})

// 유틸리티 함수들
const getUserInitials = () => {
  if (!user.value?.fullName) return '?'
  return user.value.fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
}

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

const getRoleDisplayName = (role) => {
  switch (role) {
    case 'ADMIN':
      return '관리자'
    case 'SYSOP':
      return '운영자'
    case 'USER':
    default:
      return '일반 사용자'
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return '정보 없음'
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 액션 함수들
const goBack = () => {
  router.push('/users')
}

const editUser = () => {
  showEditModal.value = true
}

const toggleStatus = async () => {
  try {
    await usersStore.toggleUserStatus(user.value.id)
  } catch (error) {
    console.error('상태 토글 실패:', error)
  }
}

const resetPassword = async () => {
  if (confirm(`${user.value.fullName} 사용자의 비밀번호를 재설정하시겠습니까?`)) {
    try {
      await usersStore.resetUserPassword(user.value.id)
    } catch (error) {
      console.error('비밀번호 재설정 실패:', error)
    }
  }
}

const confirmDelete = () => {
  showDeleteModal.value = true
}

const handleDelete = async () => {
  try {
    await usersStore.deleteUser(user.value.id)
    showDeleteModal.value = false
    goBack()
  } catch (error) {
    console.error('삭제 실패:', error)
  }
}

const handleUserUpdate = async () => {
  showEditModal.value = false
  // 사용자 정보 새로고침
  await usersStore.fetchUser(route.params.id)
}

// SEO 메타데이터
useHead({
  title: computed(() => `${user.value?.fullName || '사용자'} - 사용자 관리 - Shop BackOffice`),
  meta: [
    {
      name: 'description',
      content: computed(() => `${user.value?.fullName || '사용자'}의 상세 정보를 확인할 수 있습니다`)
    }
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

.rotate-\[-90deg\] {
  transform: rotate(-90deg);
}
</style>