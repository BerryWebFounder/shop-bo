<template>
  <div class="space-y-8">
    <!-- 헤더 영역 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-3xl font-bold text-gray-900">게시글 관리</h2>
        <p class="mt-2 text-gray-600">게시글과 공지사항을 관리할 수 있습니다</p>
      </div>
      <div class="mt-4 sm:mt-0 flex items-center space-x-3">
        <button
            @click="showCreateModal = true"
            class="btn-primary"
        >
          <Icon name="plus" size="sm" class="mr-2" />
          새 게시글 작성
        </button>
        <button
            @click="showNoticeModal = true"
            class="btn-success"
        >
          <Icon name="notification" size="sm" class="mr-2" />
          공지사항 작성
        </button>
      </div>
    </div>

    <!-- 통계 카드 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- 전체 게시글 -->
      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">전체 게시글</p>
            <p class="text-3xl font-bold text-gray-900">
              {{ formatNumber(boardsStore.stats.totalPosts + boardsStore.stats.totalNotices) }}
            </p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon name="post" size="lg" color="blue" />
          </div>
        </div>
      </div>

      <!-- 일반 게시글 -->
      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">일반 게시글</p>
            <p class="text-3xl font-bold text-gray-900">
              {{ formatNumber(boardsStore.stats.regularPosts) }}
            </p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Icon name="post" size="lg" color="green" />
          </div>
        </div>
      </div>

      <!-- 공지사항 -->
      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">공지사항</p>
            <p class="text-3xl font-bold text-gray-900">
              {{ formatNumber(boardsStore.stats.totalNotices) }}
            </p>
            <p class="text-sm text-gray-500 mt-1">활성: {{ boardsStore.stats.activeNotices }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Icon name="notification" size="lg" color="purple" />
          </div>
        </div>
      </div>

      <!-- 중요 공지사항 -->
      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">중요 공지</p>
            <p class="text-3xl font-bold text-yellow-600">
              {{ formatNumber(boardsStore.stats.pinnedNotices) }}
            </p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Icon name="notification" size="lg" color="yellow" />
          </div>
        </div>
      </div>
    </div>

    <!-- 필터 및 검색 영역 -->
    <div class="card p-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <!-- 타입 필터 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">타입</label>
          <select v-model="filters.type" class="form-select" @change="applyFilters">
            <option value="all">전체</option>
            <option value="posts">일반 게시글</option>
            <option value="notices">공지사항</option>
          </select>
        </div>

        <!-- 상태 필터 (공지사항용) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">상태</label>
          <select v-model="filters.status" class="form-select" @change="applyFilters">
            <option value="all">전체</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
        </div>

        <!-- 작성자 검색 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">작성자</label>
          <input
              v-model="filters.author"
              type="text"
              class="form-input"
              placeholder="작성자명"
              @input="debounceSearch"
          >
        </div>

        <!-- 정렬 기준 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">정렬</label>
          <select v-model="filters.sortBy" class="form-select" @change="applyFilters">
            <option value="createdAt">생성일</option>
            <option value="updatedAt">수정일</option>
            <option value="viewCount">조회수</option>
            <option value="title">제목</option>
            <option value="author">작성자</option>
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
              placeholder="제목, 내용, 작성자로 검색..."
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
            :disabled="boardsStore.loading"
        >
          <Icon
              name="analytics"
              size="sm"
              :class="{ 'animate-spin': boardsStore.loading }"
          />
        </button>
      </div>
    </div>

    <!-- 게시글 목록 -->
    <div class="card">
      <div class="overflow-x-auto">
        <table class="table">
          <thead class="table-header">
          <tr>
            <th class="table-header-cell">타입</th>
            <th class="table-header-cell">제목</th>
            <th class="table-header-cell">작성자</th>
            <th class="table-header-cell">상태</th>
            <th class="table-header-cell">통계</th>
            <th class="table-header-cell">생성일</th>
            <th class="table-header-cell">관리</th>
          </tr>
          </thead>
          <tbody class="table-body">
          <tr
              v-for="post in boardsStore.posts"
              :key="post.id"
              class="hover:bg-gray-50"
          >
            <!-- 타입 -->
            <td class="table-cell">
              <div class="flex items-center space-x-2">
                  <span
                      class="badge"
                      :class="post.isNotice ? 'badge-warning' : 'badge-info'"
                  >
                    {{ post.isNotice ? '공지사항' : '일반글' }}
                  </span>
                <Icon
                    v-if="post.isPinned"
                    name="notification"
                    size="sm"
                    color="yellow"
                    title="중요 공지"
                />
              </div>
            </td>

            <!-- 제목 -->
            <td class="table-cell">
              <div>
                <h4 class="font-medium text-gray-900 hover:text-primary-600 cursor-pointer">
                  {{ post.title }}
                </h4>
                <p class="text-sm text-gray-500 mt-1 truncate max-w-md">
                  {{ post.content }}
                </p>
              </div>
            </td>

            <!-- 작성자 -->
            <td class="table-cell">
              <div class="text-sm text-gray-900">{{ post.author }}</div>
            </td>

            <!-- 상태 -->
            <td class="table-cell">
                <span
                    v-if="post.isNotice"
                    class="badge"
                    :class="post.isActive ? 'badge-success' : 'badge-danger'"
                >
                  {{ post.isActive ? '활성' : '비활성' }}
                </span>
              <span v-else class="badge badge-success">게시됨</span>
            </td>

            <!-- 통계 -->
            <td class="table-cell">
              <div class="text-sm space-y-1">
                <div class="flex items-center space-x-4 text-gray-500">
                    <span class="flex items-center">
                      <Icon name="eye" size="xs" class="mr-1" />
                      {{ formatNumber(post.viewCount || 0) }}
                    </span>
                  <span class="flex items-center">
                      <Icon name="comment" size="xs" class="mr-1" />
                      {{ post.commentCount || 0 }}
                    </span>
                  <span class="flex items-center">
                      <Icon name="upload" size="xs" class="mr-1" />
                      {{ post.fileCount || 0 }}
                    </span>
                </div>
              </div>
            </td>

            <!-- 생성일 -->
            <td class="table-cell text-gray-500">
              <div class="text-sm">{{ formatDate(post.createdAt) }}</div>
              <div class="text-xs">{{ formatTime(post.createdAt) }}</div>
            </td>

            <!-- 관리 -->
            <td class="table-cell">
              <div class="flex items-center space-x-2">
                <!-- 상세 보기 -->
                <NuxtLink
                    :to="`/boards/posts/${post.id}`"
                    class="text-blue-600 hover:text-blue-700"
                    title="상세 보기"
                >
                  <Icon name="eye" size="sm" />
                </NuxtLink>

                <!-- 수정 -->
                <button
                    @click="editPost(post)"
                    class="text-green-600 hover:text-green-700"
                    title="수정"
                >
                  <Icon name="edit" size="sm" />
                </button>

                <!-- 공지사항 상태 토글 -->
                <button
                    v-if="post.isNotice"
                    @click="toggleStatus(post)"
                    :class="post.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'"
                    :title="post.isActive ? '비활성화' : '활성화'"
                >
                  <Icon :name="post.isActive ? 'close' : 'plus'" size="sm" />
                </button>

                <!-- 삭제 -->
                <button
                    @click="confirmDelete(post)"
                    class="text-red-600 hover:text-red-700"
                    title="삭제"
                >
                  <Icon name="delete" size="sm" />
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>

        <!-- 빈 상태 -->
        <div v-if="boardsStore.posts.length === 0 && !boardsStore.loading" class="text-center py-12">
          <Icon name="post" size="xl" color="gray" class="mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">게시글이 없습니다</h3>
          <p class="text-gray-500 mb-4">첫 번째 게시글을 작성해보세요.</p>
          <button
              @click="showCreateModal = true"
              class="btn-primary"
          >
            <Icon name="plus" size="sm" class="mr-2" />
            게시글 작성
          </button>
        </div>

        <!-- 로딩 상태 -->
        <div v-if="boardsStore.loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p class="text-gray-500">데이터를 불러오는 중...</p>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <Pagination
          v-if="boardsStore.pagination.totalPages > 1"
          :current-page="boardsStore.pagination.page + 1"
          :page-size="boardsStore.pagination.size"
          :total="boardsStore.pagination.totalElements"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
      />
    </div>

    <!-- 게시글 생성/수정 모달 -->
    <PostModal
        v-if="showCreateModal || editingPost"
        :post="editingPost"
        :is-notice="isNoticeMode"
        @close="closeModal"
        @submit="handleSubmit"
    />

    <!-- 삭제 확인 모달 -->
    <DeleteConfirmModal
        v-if="deletingPost"
        :title="deletingPost.isNotice ? '공지사항 삭제' : '게시글 삭제'"
        :message="`'${deletingPost.title}' ${deletingPost.isNotice ? '공지사항을' : '게시글을'} 삭제하시겠습니까?`"
        @confirm="handleDelete"
        @cancel="deletingPost = null"
    />
  </div>
</template>

<script setup>
const boardsStore = useBoardsStore()

// 반응형 데이터
const searchQuery = ref('')
const showCreateModal = ref(false)
const showNoticeModal = ref(false)
const editingPost = ref(null)
const deletingPost = ref(null)
const isNoticeMode = ref(false)

// 필터 상태
const filters = ref({
  type: 'all',
  status: 'all',
  author: '',
  sortBy: 'createdAt',
  sortOrder: 'desc'
})

// 디바운스 타이머
let searchTimeout = null

// 페이지 로드 시 데이터 초기화
onMounted(async () => {
  await boardsStore.initialize()
})

// 유틸리티 함수들
const formatNumber = (num) => {
  return new Intl.NumberFormat('ko-KR').format(num || 0)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR')
}

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 검색 및 필터링
const applyFilters = () => {
  boardsStore.updateFilters(filters.value)
  boardsStore.fetchPosts()
}

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handleSearch()
  }, 500)
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    boardsStore.searchPosts({
      keyword: searchQuery.value.trim(),
      author: filters.value.author,
      ...filters.value
    })
  } else {
    boardsStore.fetchPosts()
  }
}

const resetFilters = () => {
  filters.value = {
    type: 'all',
    status: 'all',
    author: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
  searchQuery.value = ''
  boardsStore.resetFilters()
  boardsStore.fetchPosts()
}

const refreshData = async () => {
  await Promise.all([
    boardsStore.fetchPosts(),
    boardsStore.fetchStats()
  ])
}

// 페이지네이션
const handlePageChange = (page) => {
  boardsStore.changePage(page - 1)
}

const handlePageSizeChange = (size) => {
  boardsStore.changePageSize(size)
}

// 모달 관리
const closeModal = () => {
  showCreateModal.value = false
  showNoticeModal.value = false
  editingPost.value = null
  isNoticeMode.value = false
}

const editPost = (post) => {
  editingPost.value = post
  isNoticeMode.value = post.isNotice
}

// 게시글 생성/수정
const handleSubmit = async (postData) => {
  try {
    if (editingPost.value) {
      await boardsStore.updatePost(editingPost.value.id, postData, editingPost.value.isNotice)
    } else {
      await boardsStore.createPost(postData)
    }
    closeModal()
  } catch (error) {
    console.error('게시글 저장 실패:', error)
  }
}

// 공지사항 상태 토글
const toggleStatus = async (post) => {
  try {
    await boardsStore.toggleNoticeStatus(post.id)
  } catch (error) {
    console.error('상태 변경 실패:', error)
  }
}

// 삭제 관리
const confirmDelete = (post) => {
  deletingPost.value = post
}

const handleDelete = async () => {
  try {
    await boardsStore.deletePost(deletingPost.value.id, deletingPost.value.isNotice)
    deletingPost.value = null
  } catch (error) {
    console.error('삭제 실패:', error)
  }
}

// 공지사항 모달 처리
watch(showNoticeModal, (value) => {
  if (value) {
    isNoticeMode.value = true
    showCreateModal.value = true
    showNoticeModal.value = false
  }
})

// SEO 메타데이터
useHead({
  title: '게시글 관리 - Shop BackOffice',
  meta: [
    { name: 'description', content: '게시글과 공지사항을 관리할 수 있습니다' }
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