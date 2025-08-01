<template>
  <div class="space-y-6">
    <!-- 헤더 영역 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
          <NuxtLink to="/boards" class="hover:text-gray-700">게시판 관리</NuxtLink>
          <span>/</span>
          <span class="text-gray-900 font-medium">{{ currentBoard?.name || '게시글 관리' }}</span>
        </nav>
        <h2 class="text-3xl font-bold text-gray-900">게시글 관리</h2>
        <p class="mt-1 text-gray-600">{{ currentBoard?.description }}</p>
      </div>
      <div class="mt-4 sm:mt-0 flex items-center space-x-3">
        <button
            @click="showFilters = !showFilters"
            class="btn-secondary"
        >
          <Icon name="filter" size="sm" class="mr-2" />
          필터
        </button>
      </div>
    </div>

    <!-- 통계 카드 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="card p-4">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm text-gray-600">전체 게시글</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatNumber(filteredPosts.length) }}</p>
          </div>
          <Icon name="post" size="lg" color="blue" />
        </div>
      </div>

      <div class="card p-4">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm text-gray-600">게시된 글</p>
            <p class="text-2xl font-bold text-green-600">{{ publishedCount }}</p>
          </div>
          <Icon name="eye" size="lg" color="green" />
        </div>
      </div>

      <div class="card p-4">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm text-gray-600">고정된 글</p>
            <p class="text-2xl font-bold text-yellow-600">{{ pinnedCount }}</p>
          </div>
          <Icon name="notification" size="lg" color="yellow" />
        </div>
      </div>

      <div class="card p-4">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm text-gray-600">처리 대기</p>
            <p class="text-2xl font-bold text-red-600">{{ pendingCount }}</p>
          </div>
          <Icon name="delete" size="lg" color="red" />
        </div>
      </div>
    </div>

    <!-- 필터 영역 -->
    <div v-if="showFilters" class="card p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">상태</label>
          <select v-model="filters.status" class="form-select" @change="applyFilters">
            <option value="all">전체</option>
            <option value="published">게시됨</option>
            <option value="pending_delete">삭제 대기</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">작성자</label>
          <input
              v-model="filters.author"
              type="text"
              class="form-input"
              placeholder="작성자명"
              @input="applyFilters"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">정렬</label>
          <select v-model="filters.sortBy" class="form-select" @change="applyFilters">
            <option value="createdAt">생성일</option>
            <option value="updatedAt">수정일</option>
            <option value="viewCount">조회수</option>
            <option value="commentCount">댓글수</option>
            <option value="likeCount">좋아요</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">순서</label>
          <select v-model="filters.sortOrder" class="form-select" @change="applyFilters">
            <option value="desc">내림차순</option>
            <option value="asc">올림차순</option>
          </select>
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <button @click="resetFilters" class="btn-secondary">
          필터 초기화
        </button>
      </div>
    </div>

    <!-- 검색 및 액션 영역 -->
    <div class="card p-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <input
              v-model="searchQuery"
              type="text"
              placeholder="제목, 내용, 작성자로 검색..."
              class="form-input pl-10"
              @input="applyFilters"
          >
          <Icon name="search" size="sm" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <div class="flex items-center space-x-2">
          <!-- 선택된 항목 액션 -->
          <div v-if="selectedPosts.length > 0" class="flex items-center space-x-2">
            <span class="text-sm text-gray-600">{{ selectedPosts.length }}개 선택</span>
            <button
                @click="bulkAction('publish')"
                class="btn-success btn-sm"
            >
              게시
            </button>
            <button
                @click="bulkAction('pending_delete')"
                class="btn-danger btn-sm"
            >
              삭제 대기
            </button>
          </div>

          <button
              @click="refreshPosts"
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
    </div>

    <!-- 게시글 목록 -->
    <div class="card">
      <div class="overflow-x-auto">
        <table class="table">
          <thead class="table-header">
          <tr>
            <th class="table-header-cell w-12">
              <input
                  type="checkbox"
                  :checked="selectedPosts.length === filteredPosts.length && filteredPosts.length > 0"
                  @change="toggleAllPosts"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              >
            </th>
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
              v-for="post in paginatedPosts"
              :key="post.id"
              class="hover:bg-gray-50"
          >
            <td class="table-cell">
              <input
                  type="checkbox"
                  :value="post.id"
                  v-model="selectedPosts"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              >
            </td>
            <td class="table-cell">
              <div class="flex items-start space-x-3">
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <h4 class="font-medium text-gray-900 hover:text-primary-600 cursor-pointer">
                      {{ post.title }}
                    </h4>
                    <Icon
                        v-if="post.isPinned"
                        name="notification"
                        size="sm"
                        color="yellow"
                        title="고정된 게시글"
                    />
                  </div>
                  <p class="text-sm text-gray-500 mt-1 truncate max-w-md">
                    {{ post.content }}
                  </p>
                </div>
              </div>
            </td>
            <td class="table-cell">
              <div class="text-sm text-gray-900">{{ post.author }}</div>
              <div class="text-xs text-gray-500">ID: {{ post.authorId }}</div>
            </td>
            <td class="table-cell">
                <span
                    class="badge"
                    :class="getStatusColor(post.status)"
                >
                  {{ getStatusText(post.status) }}
                </span>
            </td>
            <td class="table-cell">
              <div class="text-sm space-y-1">
                <div class="flex items-center space-x-4 text-gray-500">
                    <span class="flex items-center">
                      <Icon name="eye" size="xs" class="mr-1" />
                      {{ formatNumber(post.viewCount) }}
                    </span>
                  <span class="flex items-center">
                      <Icon name="comment" size="xs" class="mr-1" />
                      {{ post.commentCount }}
                    </span>
                  <span class="flex items-center">
                      ❤️ {{ post.likeCount }}
                    </span>
                </div>
              </div>
            </td>
            <td class="table-cell text-gray-500">
              <div class="text-sm">{{ formatDate(post.createdAt) }}</div>
              <div class="text-xs">{{ formatTime(post.createdAt) }}</div>
            </td>
            <td class="table-cell">
              <div class="flex items-center space-x-2">
                <!-- 고정 토글 -->
                <button
                    @click="togglePin(post)"
                    :class="post.isPinned ? 'text-yellow-600 hover:text-yellow-700' : 'text-gray-400 hover:text-yellow-600'"
                    title="고정 토글"
                >
                  <Icon name="notification" size="sm" />
                </button>

                <!-- 상태 변경 -->
                <select
                    :value="post.status"
                    @change="updateStatus(post, $event.target.value)"
                    class="text-xs border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="published">게시</option>
                  <option value="pending_delete">삭제대기</option>
                </select>

                <!-- 삭제 -->
                <button
                    @click="confirmDelete(post)"
                    class="text-red-600 hover:text-red-700"
                    title="완전 삭제"
                >
                  <Icon name="delete" size="sm" />
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>

        <!-- 빈 상태 -->
        <div v-if="filteredPosts.length === 0" class="text-center py-12">
          <Icon name="post" size="xl" color="gray" class="mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">게시글이 없습니다</h3>
          <p class="text-gray-500">검색 조건을 변경하거나 필터를 초기화해보세요.</p>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            총 {{ formatNumber(filteredPosts.length) }}개 중
            {{ (currentPage - 1) * postsPerPage + 1 }}-{{ Math.min(currentPage * postsPerPage, filteredPosts.length) }}개 표시
          </div>

          <div class="flex items-center space-x-2">
            <button
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="btn-secondary btn-sm"
            >
              <Icon name="arrow-up" size="sm" class="rotate-[-90deg]" />
            </button>

            <span class="text-sm text-gray-700">
              {{ currentPage }} / {{ totalPages }}
            </span>

            <button
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="btn-secondary btn-sm"
            >
              <Icon name="arrow-up" size="sm" class="rotate-90" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <div
        v-if="deletingPost"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="deletingPost = null"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <Icon name="delete" size="md" color="red" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">게시글 삭제</h3>
              <p class="text-sm text-gray-500">이 작업은 되돌릴 수 없습니다</p>
            </div>
          </div>

          <p class="text-gray-600 mb-6">
            "<strong>{{ deletingPost.title }}</strong>" 게시글을 완전히 삭제하시겠습니까?
          </p>

          <div class="flex justify-end space-x-3">
            <button
                type="button"
                @click="deletingPost = null"
                class="btn-secondary"
            >
              취소
            </button>
            <button
                @click="deletePost"
                class="btn-danger"
                :disabled="boardsStore.loading"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const boardsStore = useBoardsStore()
const route = useRoute()

// 반응형 데이터
const showFilters = ref(false)
const searchQuery = ref('')
const selectedPosts = ref([])
const deletingPost = ref(null)
const currentPage = ref(1)
const postsPerPage = 20

// 필터 상태
const filters = ref({
  status: 'all',
  author: '',
  sortBy: 'createdAt',
  sortOrder: 'desc'
})

// 현재 게시판 정보
const currentBoard = computed(() => {
  const boardId = parseInt(route.params.id)
  return boardsStore.boards.find(board => board.id === boardId)
})

// 게시글 목록
const allPosts = ref([])

// 필터된 게시글
const filteredPosts = computed(() => {
  let posts = [...allPosts.value]

  // 게시판 필터
  if (currentBoard.value) {
    posts = posts.filter(post => post.boardId === currentBoard.value.id)
  }

  // 상태 필터
  if (filters.value.status !== 'all') {
    posts = posts.filter(post => post.status === filters.value.status)
  }

  // 작성자 필터
  if (filters.value.author) {
    const authorQuery = filters.value.author.toLowerCase()
    posts = posts.filter(post =>
        post.author.toLowerCase().includes(authorQuery)
    )
  }

  // 검색 필터
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    posts = posts.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query)
    )
  }

  // 정렬
  posts.sort((a, b) => {
    let aValue = a[filters.value.sortBy]
    let bValue = b[filters.value.sortBy]

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    const order = filters.value.sortOrder === 'asc' ? 1 : -1

    if (aValue < bValue) return -1 * order
    if (aValue > bValue) return 1 * order
    return 0
  })

  // 고정된 게시글을 맨 위로
  return posts.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return 0
  })
})

// 페이지네이션된 게시글
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage
  const end = start + postsPerPage
  return filteredPosts.value.slice(start, end)
})

// 총 페이지 수
const totalPages = computed(() => {
  return Math.ceil(filteredPosts.value.length / postsPerPage)
})

// 통계 계산
const publishedCount = computed(() => {
  return filteredPosts.value.filter(post => post.status === 'published').length
})

const pendingCount = computed(() => {
  return filteredPosts.value.filter(post => post.status === 'pending_delete').length
})

const pinnedCount = computed(() => {
  return filteredPosts.value.filter(post => post.isPinned).length
})

// 페이지 로드 시 데이터 가져오기
onMounted(async () => {
  const posts = await boardsStore.fetchPosts()
  allPosts.value = posts || []
})

// 유틸리티 함수들
const formatNumber = (num) => {
  return new Intl.NumberFormat('ko-KR').format(num)
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

const getStatusText = (status) => {
  const statusMap = {
    published: '게시됨',
    pending_delete: '삭제 대기'
  }
  return statusMap[status] || status
}

const getStatusColor = (status) => {
  const colorMap = {
    published: 'badge-success',
    pending_delete: 'badge-danger'
  }
  return colorMap[status] || 'badge-info'
}

// 필터 관련 함수
const applyFilters = () => {
  currentPage.value = 1
  selectedPosts.value = []
}

const resetFilters = () => {
  filters.value = {
    status: 'all',
    author: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
  searchQuery.value = ''
  applyFilters()
}

// 선택 관련 함수
const toggleAllPosts = (event) => {
  if (event.target.checked) {
    selectedPosts.value = filteredPosts.value.map(post => post.id)
  } else {
    selectedPosts.value = []
  }
}

// 게시글 관리 함수들
const togglePin = async (post) => {
  try {
    await boardsStore.togglePinPost(post.id)
    refreshPosts()
  } catch (error) {
    console.error('고정 상태 변경 실패:', error)
  }
}

const updateStatus = async (post, newStatus) => {
  try {
    await boardsStore.updatePostStatus(post.id, newStatus)
    refreshPosts()
  } catch (error) {
    console.error('상태 변경 실패:', error)
  }
}

const bulkAction = async (action) => {
  try {
    for (const postId of selectedPosts.value) {
      if (action === 'publish') {
        await boardsStore.updatePostStatus(postId, 'published')
      } else if (action === 'pending_delete') {
        await boardsStore.updatePostStatus(postId, 'pending_delete')
      }
    }
    selectedPosts.value = []
    refreshPosts()
  } catch (error) {
    console.error('일괄 작업 실패:', error)
  }
}

const confirmDelete = (post) => {
  deletingPost.value = post
}

const deletePost = async () => {
  try {
    await boardsStore.deletePost(deletingPost.value.id)
    deletingPost.value = null
    refreshPosts()
  } catch (error) {
    console.error('게시글 삭제 실패:', error)
  }
}

const refreshPosts = async () => {
  const posts = await boardsStore.fetchPosts()
  allPosts.value = posts || []
}

// SEO 메타데이터
useHead({
  title: `게시글 관리 - ${currentBoard.value?.name || ''} - Shop BackOffice`,
  meta: [
    { name: 'description', content: `${currentBoard.value?.name || ''} 게시판의 게시글을 관리할 수 있습니다` }
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

.btn-sm {
  @apply px-2 py-1 text-xs;
}

.rotate-90 {
  transform: rotate(90deg);
}

.rotate-\[-90deg\] {
  transform: rotate(-90deg);
}
</style>