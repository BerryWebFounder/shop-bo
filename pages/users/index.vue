<template>
  <div class="space-y-8">
    <!-- 헤더 영역 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-3xl font-bold text-gray-900">사용자 관리</h2>
        <p class="mt-2 text-gray-600">시스템 사용자를 관리하고 권한을 설정할 수 있습니다</p>
      </div>
      <div class="mt-4 sm:mt-0 flex items-center space-x-3">
        <button
            @click="showCreateModal = true"
            class="btn-primary"
        >
          <Icon name="plus" size="sm" class="mr-2" />
          새 사용자 추가
        </button>
      </div>
    </div>

    <!-- 연결 상태 표시 -->
    <div v-if="connectionError" class="card border-l-4 border-l-red-500">
      <div class="p-4">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <Icon name="close" size="md" color="red" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">사용자 API 서버 연결 실패</h3>
            <p class="text-sm text-gray-600">{{ connectionError }}</p>
          </div>
        </div>
        <div class="mt-4">
          <button @click="retryConnection" class="btn-primary btn-sm">
            <Icon name="analytics" size="sm" class="mr-2" />
            다시 시도
          </button>
        </div>
      </div>
    </div>

    <!-- 통계 카드 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- 전체 사용자 -->
      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">전체 사용자</p>
            <p class="text-3xl font-bold text-gray-900">
              {{ formatNumber(usersStore.totalUsers) }}
            </p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon name="users" size="lg" color="blue" />
          </div>
        </div>
      </div>

      <!-- 활성 사용자 -->
      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">활성 사용자</p>
            <p class="text-3xl font-bold text-green-600">
              {{ formatNumber(usersStore.activeUsersCount) }}
            </p>
            <p class="text-sm text-gray-500 mt-1">
              비활성: {{ formatNumber(usersStore.inactiveUsersCount) }}
            </p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Icon name="users" size="lg" color="green" />
          </div>
        </div>
      </div>

      <!-- 관리자 -->
      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">관리자</p>
            <p class="text-3xl font-bold text-red-600">
              {{ formatNumber(usersStore.adminUsersCount) }}
            </p>
            <p class="text-sm text-gray-500 mt-1">
              운영자: {{ formatNumber(usersStore.moderatorUsersCount) }}
            </p>
          </div>
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <Icon name="settings" size="lg" color="red" />
          </div>
        </div>
      </div>

      <!-- 일반 사용자 -->
      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">일반 사용자</p>
            <p class="text-3xl font-bold text-gray-900">
              {{ formatNumber(usersStore.regularUsersCount) }}
            </p>
          </div>
          <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <Icon name="users" size="lg" color="gray" />
          </div>
        </div>
      </div>
    </div>

    <!-- 필터 및 검색 영역 -->
    <div class="card p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <!-- 역할 필터 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">역할</label>
          <select v-model="filters.role" class="form-select" @change="applyFilters">
            <option value="all">전체</option>
            <option value="ADMIN">관리자</option>
            <option value="SYSOP">운영자</option>
            <option value="USER">일반 사용자</option>
          </select>
        </div>

        <!-- 상태 필터 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">상태</label>
          <select v-model="filters.status" class="form-select" @change="applyFilters">
            <option value="all">전체</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
        </div>

        <!-- 정렬 기준 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">정렬</label>
          <select v-model="filters.sortBy" class="form-select" @change="applyFilters">
            <option value="createdAt">가입일</option>
            <option value="fullName">이름</option>
            <option value="email">이메일</option>
            <option value="lastLoginAt">마지막 로그인</option>
          </select>
        </div>

        <!-- 정렬 순서 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">순서</label>
          <select v-model="filters.sortOrder" class="form-select" @change="applyFilters">
            <option value="desc">내림차순</option>
            <option value="asc">올림차순</option>
          </select>
        </div>
      </div>

      <!-- 키워드 검색 -->
      <div class="flex items-center space-x-4">
        <div class="relative flex-1">
          <input
              v-model="searchQuery"
              type="text"
              placeholder="이름, 이메일, 사용자명으로 검색..."
              class="form-input pl-10"
              @keyup.enter="handleSearch"
              @input="debounceSearch"
          >
          <Icon name="search" size="sm" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <button
            @click="resetFilters"
            class="btn-secondary"
        >
          필터 초기화
        </button>

        <button
            @click="refreshData"
            class="btn-secondary"
            :disabled="usersStore.loading"
        >
          <Icon
              name="analytics"
              size="sm"
              :class="{ 'animate-spin': usersStore.loading }"
          />
        </button>
      </div>
    </div>

    <!-- 사용자 목록 -->
    <div class="card">
      <div class="overflow-x-auto">
        <table class="table">
          <thead class="table-header">
          <tr>
            <th class="table-header-cell w-12">
              <input
                  type="checkbox"
                  :checked="selectedUserIds.length === usersStore.users.length && usersStore.users.length > 0"
                  @change="toggleAllUsers"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              >
            </th>
            <th class="table-header-cell">사용자</th>
            <th class="table-header-cell">역할</th>
            <th class="table-header-cell">상태</th>
            <th class="table-header-cell">가입일</th>
            <th class="table-header-cell">마지막 로그인</th>
            <th class="table-header-cell">관리</th>
          </tr>
          </thead>
          <tbody class="table-body">
          <tr
              v-for="user in usersStore.users"
              :key="user.id"
              class="hover:bg-gray-50"
              :class="{ 'bg-blue-50': selectedUserIds.includes(user.id) }"
          >
            <!-- 선택 체크박스 -->
            <td class="table-cell">
              <input
                  type="checkbox"
                  :value="user.id"
                  v-model="selectedUserIds"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              >
            </td>

            <!-- 사용자 정보 -->
            <td class="table-cell">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                  {{ getUserInitials(user) }}
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ user.fullName }}</div>
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                  <div class="text-xs text-gray-400">@{{ user.username }}</div>
                </div>
              </div>
            </td>

            <!-- 역할 -->
            <td class="table-cell">
              <Badge
                  :variant="getRoleVariant(user.role)"
                  :text="getRoleDisplayName(user.role)"
              />
            </td>

            <!-- 상태 -->
            <td class="table-cell">
              <Badge
                  :variant="user.isActive ? 'success' : 'danger'"
                  :text="user.isActive ? '활성' : '비활성'"
              />
            </td>

            <!-- 가입일 -->
            <td class="table-cell text-gray-500">
              <div class="text-sm">{{ formatDate(user.createdAt) }}</div>
              <div class="text-xs">{{ formatTime(user.createdAt) }}</div>
            </td>

            <!-- 마지막 로그인 -->
            <td class="table-cell text-gray-500">
              <div v-if="user.lastLoginAt" class="text-sm">{{ formatDate(user.lastLoginAt) }}</div>
              <div v-else class="text-sm text-gray-400">없음</div>
            </td>

            <!-- 관리 -->
            <td class="table-cell">
              <div class="flex items-center space-x-2">
                <!-- 상세 보기 -->
                <NuxtLink
                    :to="`/users/${user.id}`"
                    class="text-blue-600 hover:text-blue-700"
                    title="상세 보기"
                >
                  <Icon name="eye" size="sm" />
                </NuxtLink>

                <!-- 수정 -->
                <button
                    @click="editUser(user)"
                    class="text-green-600 hover:text-green-700"
                    title="수정"
                >
                  <Icon name="edit" size="sm" />
                </button>

                <!-- 상태 토글 -->
                <button
                    @click="toggleUserStatus(user)"
                    :class="user.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'"
                    :title="user.isActive ? '비활성화' : '활성화'"
                >
                  <Icon :name="user.isActive ? 'close' : 'plus'" size="sm" />
                </button>

                <!-- 역할 변경 -->
                <select
                    :value="user.role"
                    @change="changeRole(user, $event.target.value)"
                    class="text-xs border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                    title="역할 변경"
                >
                  <option value="USER">일반</option>
                  <option value="SYSOP">운영자</option>
                  <option value="ADMIN">관리자</option>
                </select>

                <!-- 비밀번호 재설정 -->
                <button
                    @click="resetPassword(user)"
                    class="text-yellow-600 hover:text-yellow-700"
                    title="비밀번호 재설정"
                >
                  <Icon name="settings" size="sm" />
                </button>

                <!-- 삭제 -->
                <button
                    @click="confirmDelete(user)"
                    class="text-red-600 hover:text-red-700"
                    title="삭제"
                    :disabled="user.role === 'ADMIN' && usersStore.adminUsersCount <= 1"
                >
                  <Icon name="delete" size="sm" />
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>

        <!-- 빈 상태 -->
        <div v-if="usersStore.users.length === 0 && !usersStore.loading" class="text-center py-12">
          <Icon name="users" size="xl" color="gray" class="mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">사용자가 없습니다</h3>
          <p class="text-gray-500 mb-4">첫 번째 사용자를 추가해보세요.</p>
          <button
              @click="showCreateModal = true"
              class="btn-primary"
          >
            <Icon name="plus" size="sm" class="mr-2" />
            사용자 추가
          </button>
        </div>

        <!-- 로딩 상태 -->
        <div v-if="usersStore.loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p class="text-gray-500">데이터를 불러오는 중...</p>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <Pagination
          v-if="usersStore.pagination.totalPages > 1"
          :current-page="usersStore.pagination.page + 1"
          :page-size="usersStore.pagination.size"
          :total="usersStore.pagination.totalElements"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
      />
    </div>

    <!-- 사용자 생성/수정 모달 -->
    <UserModal
        v-if="showCreateModal || editingUser"
        :user="editingUser"
        @close="closeModal"
        @submit="handleSubmit"
    />

    <!-- 일괄 관리 모달 -->
    <BulkUserModal
        v-if="showBulkModal"
        :selected-users="selectedUsers"
        @close="showBulkModal = false"
        @submit="handleBulkAction"
    />

    <!-- 삭제 확인 모달 -->
    <DeleteConfirmModal
        v-if="deletingUser"
        :title="`사용자 삭제`"
        :message="`'${deletingUser.fullName}' 사용자를 삭제하시겠습니까?`"
        :show-warning="true"
        :warning-message="deletingUser.role === 'ADMIN' ? '관리자 계정을 삭제하면 시스템 관리에 영향을 줄 수 있습니다.' : '사용자의 모든 데이터가 함께 삭제됩니다.'"
        :require-confirmation="deletingUser.role === 'ADMIN'"
        :confirm-text="deletingUser.fullName"
        @confirm="handleDelete"
        @cancel="deletingUser = null"
    />
  </div>
</template>

<script setup>
// 인증 미들웨어 적용 (관리자만)
definePageMeta({
  middleware: ['auth', 'admin-auth']
})

const usersStore = useUsersStore()

// 반응형 데이터
const searchQuery = ref('')
const showCreateModal = ref(false)
const showBulkModal = ref(false)
const editingUser = ref(null)
const deletingUser = ref(null)
const selectedUserIds = ref([])
const connectionError = ref('')

// 필터 상태
const filters = ref({
  role: 'all',
  status: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc'
})

// 디바운스 타이머
let searchTimeout = null

// 계산된 속성
const selectedUsers = computed(() => {
  return usersStore.users.filter(user => selectedUserIds.value.includes(user.id))
})

// 페이지 로드 시 데이터 초기화
onMounted(async () => {
  console.log('사용자 관리 페이지 마운트됨')
  await initializeData()
})

// 데이터 초기화
const initializeData = async () => {
  try {
    console.log('사용자 데이터 초기화 시작')
    connectionError.value = ''
    await usersStore.initialize()
    console.log('사용자 데이터 초기화 완료')
  } catch (error) {
    console.error('사용자 데이터 초기화 실패:', error)
    connectionError.value = getErrorMessage(error)
  }
}

// 연결 재시도
const retryConnection = async () => {
  console.log('연결 재시도')
  await initializeData()
}

// 에러 메시지 생성
const getErrorMessage = (error) => {
  if (error.message) {
    if (error.message.includes('fetch')) {
      return '사용자 API 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.'
    }
    return error.message
  }
  return '알 수 없는 오류가 발생했습니다.'
}

// 유틸리티 함수들
const formatNumber = (num) => {
  return new Intl.NumberFormat('ko-KR').format(num || 0)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('ko-KR')
}

const formatTime = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getUserInitials = (user) => {
  if (!user.fullName) return '?'
  return user.fullName
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

// 검색 및 필터링
const applyFilters = () => {
  console.log('필터 적용:', filters.value)
  usersStore.updateFilters(filters.value)
  usersStore.fetchUsers()
}

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handleSearch()
  }, 500)
}

const handleSearch = () => {
  console.log('검색 실행:', searchQuery.value)
  if (searchQuery.value.trim()) {
    usersStore.searchUsers({
      search: searchQuery.value.trim(),
      ...filters.value
    })
  } else {
    usersStore.fetchUsers()
  }
}

const resetFilters = () => {
  console.log('필터 초기화')
  filters.value = {
    role: 'all',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
  searchQuery.value = ''
  usersStore.resetFilters()
  usersStore.fetchUsers()
}

const refreshData = async () => {
  console.log('데이터 새로고침')
  try {
    connectionError.value = ''
    await Promise.all([
      usersStore.fetchUsers(),
      usersStore.fetchStats()
    ])
  } catch (error) {
    console.error('데이터 새로고침 실패:', error)
    connectionError.value = getErrorMessage(error)
  }
}

// 페이지네이션
const handlePageChange = (page) => {
  console.log('페이지 변경:', page)
  usersStore.changePage(page - 1)
}

const handlePageSizeChange = (size) => {
  console.log('페이지 크기 변경:', size)
  usersStore.changePageSize(size)
}

// 선택 관련 함수
const toggleAllUsers = (event) => {
  if (event.target.checked) {
    selectedUserIds.value = usersStore.users.map(user => user.id)
  } else {
    selectedUserIds.value = []
  }
}

// 수정이 필요한 부분 (pages/users/index.vue의 script 섹션)

// 일괄 작업 처리
const handleBulkAction = async (actionData) => {
  try {
    console.log('일괄 작업 처리:', actionData)

    switch (actionData.action) {
      case 'status':
        await usersStore.bulkToggleStatus(actionData.userIds, actionData.data.isActive)
        break
      case 'role':
        await usersStore.bulkUpdate(actionData.userIds, { role: actionData.data.role })
        break
      case 'department':
        await usersStore.bulkUpdate(actionData.userIds, {
          department: actionData.data.department,
          position: actionData.data.position
        })
        break
      case 'notifications':
        await usersStore.bulkUpdate(actionData.userIds, {
          emailNotifications: actionData.data.emailNotifications,
          pushNotifications: actionData.data.pushNotifications,
          marketingEmails: actionData.data.marketingEmails
        })
        break
      case 'delete':
        await usersStore.bulkDelete(actionData.userIds)
        break
    }

    // 선택 해제
    selectedUserIds.value = []
    showBulkModal.value = false
  } catch (error) {
    console.error('일괄 작업 실패:', error)
  }
}

// 모달 관리 (올바른 위치)
const closeModal = () => {
  showCreateModal.value = false
  editingUser.value = null
}

const editUser = (user) => {
  console.log('사용자 수정:', user.id)
  editingUser.value = user
}

// 사용자 생성/수정
const handleSubmit = async (userData) => {
  try {
    console.log('사용자 저장:', userData)

    if (editingUser.value) {
      await usersStore.updateUser(editingUser.value.id, userData)
    } else {
      await usersStore.createUser(userData)
    }
    closeModal()
  } catch (error) {
    console.error('사용자 저장 실패:', error)
  }
}

// 사용자 상태 토글
const toggleUserStatus = async (user) => {
  try {
    console.log('사용자 상태 토글:', user.id)
    await usersStore.toggleUserStatus(user.id)
  } catch (error) {
    console.error('상태 변경 실패:', error)
  }
}

// 역할 변경
const changeRole = async (user, newRole) => {
  if (user.role === newRole) return

  try {
    console.log('역할 변경:', user.id, newRole)
    await usersStore.changeUserRole(user.id, newRole)
  } catch (error) {
    console.error('역할 변경 실패:', error)
  }
}

// 비밀번호 재설정
const resetPassword = async (user) => {
  if (confirm(`${user.fullName} 사용자의 비밀번호를 재설정하시겠습니까?`)) {
    try {
      console.log('비밀번호 재설정:', user.id)
      await usersStore.resetUserPassword(user.id)
    } catch (error) {
      console.error('비밀번호 재설정 실패:', error)
    }
  }
}

// 삭제 관리
const confirmDelete = (user) => {
  console.log('삭제 확인:', user.id)
  deletingUser.value = user
}

const handleDelete = async () => {
  try {
    console.log('사용자 삭제:', deletingUser.value.id)
    await usersStore.deleteUser(deletingUser.value.id)
    deletingUser.value = null
  } catch (error) {
    console.error('삭제 실패:', error)
  }
}

// SEO 메타데이터
useHead({
  title: '사용자 관리 - Shop BackOffice',
  meta: [
    { name: 'description', content: '시스템 사용자를 관리하고 권한을 설정할 수 있습니다' }
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