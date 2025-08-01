<template>
  <div class="space-y-6">
    <!-- 헤더 영역 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
          <NuxtLink to="/boards" class="hover:text-gray-700">게시판 관리</NuxtLink>
          <span>/</span>
          <NuxtLink :to="`/boards/${route.params.id}/posts`" class="hover:text-gray-700">
            {{ currentBoard?.name || '게시글 관리' }}
          </NuxtLink>
          <span>/</span>
          <span class="text-gray-900 font-medium">게시글 상세</span>
        </nav>
        <h2 class="text-3xl font-bold text-gray-900">게시글 상세</h2>
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
    <div v-if="boardsStore.loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- 게시글 내용 -->
    <div v-else-if="post" class="space-y-6">
      <!-- 게시글 정보 카드 -->
      <div class="card p-6">
        <div class="flex items-start justify-between mb-6">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <span
                  class="badge"
                  :class="getStatusColor(post.status)"
              >
                {{ getStatusText(post.status) }}
              </span>
              <span
                  v-if="post.isPinned"
                  class="badge badge-warning"
              >
                고정됨
              </span>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 mb-3">{{ post.title }}</h1>
            <div class="flex items-center space-x-6 text-sm text-gray-500">
              <div class="flex items-center space-x-2">
                <Icon name="users" size="sm" />
                <span>{{ post.author }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <Icon name="calendar" size="sm" />
                <span>{{ formatDateTime(post.createdAt) }}</span>
              </div>
              <div v-if="post.updatedAt !== post.createdAt" class="flex items-center space-x-2">
                <Icon name="edit" size="sm" />
                <span>{{ formatDateTime(post.updatedAt) }} 수정됨</span>
              </div>
            </div>
          </div>

          <!-- 액션 버튼들 -->
          <div class="flex items-center space-x-2">
            <button
                @click="togglePin"
                :class="post.isPinned ? 'btn-warning' : 'btn-secondary'"
                :disabled="boardsStore.loading"
            >
              <Icon name="notification" size="sm" class="mr-2" />
              {{ post.isPinned ? '고정 해제' : '고정하기' }}
            </button>

            <select
                :value="post.status"
                @change="updateStatus($event.target.value)"
                class="form-select"
                :disabled="boardsStore.loading"
            >
              <option value="published">게시됨</option>
              <option value="pending_delete">삭제 대기</option>
            </select>

            <button
                @click="confirmDelete"
                class="btn-danger"
                :disabled="boardsStore.loading"
            >
              <Icon name="delete" size="sm" class="mr-2" />
              삭제
            </button>
          </div>
        </div>

        <!-- 통계 정보 -->
        <div class="grid grid-cols-3 gap-6 py-4 border-t border-gray-200">
          <div class="text-center">
            <div class="flex items-center justify-center mb-1">
              <Icon name="eye" size="sm" class="mr-1 text-gray-400" />
            </div>
            <div class="text-2xl font-bold text-gray-900">{{ formatNumber(post.viewCount) }}</div>
            <div class="text-sm text-gray-500">조회수</div>
          </div>
          <div class="text-center">
            <div class="flex items-center justify-center mb-1">
              <Icon name="comment" size="sm" class="mr-1 text-gray-400" />
            </div>
            <div class="text-2xl font-bold text-gray-900">{{ post.commentCount }}</div>
            <div class="text-sm text-gray-500">댓글</div>
          </div>
          <div class="text-center">
            <div class="flex items-center justify-center mb-1">
              <span class="text-sm mr-1">❤️</span>
            </div>
            <div class="text-2xl font-bold text-gray-900">{{ post.likeCount }}</div>
            <div class="text-sm text-gray-500">좋아요</div>
          </div>
        </div>
      </div>

      <!-- 게시글 내용 -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">게시글 내용</h3>
        <div class="prose max-w-none">
          <div class="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {{ post.content }}
          </div>
        </div>
      </div>

      <!-- 메타데이터 -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">메타 정보</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2">기본 정보</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">게시글 ID:</span>
                <span class="font-mono text-gray-900">{{ post.id }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">작성자 ID:</span>
                <span class="font-mono text-gray-900">{{ post.authorId }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">게시판:</span>
                <span class="text-gray-900">{{ post.boardName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">상태:</span>
                <span
                    class="badge"
                    :class="getStatusColor(post.status)"
                >
                  {{ getStatusText(post.status) }}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2">타임스탬프</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">생성일:</span>
                <span class="text-gray-900">{{ formatDateTime(post.createdAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">수정일:</span>
                <span class="text-gray-900">{{ formatDateTime(post.updatedAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">게시일:</span>
                <span class="text-gray-900">{{ formatDateTime(post.publishedAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 관리 액션 -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">관리 액션</h3>
        <div class="flex flex-wrap gap-3">
          <button
              @click="togglePin"
              :class="post.isPinned ? 'btn-warning' : 'btn-secondary'"
              :disabled="boardsStore.loading"
          >
            {{ post.isPinned ? '고정 해제' : '게시글 고정' }}
          </button>

          <button
              v-if="post.status === 'published'"
              @click="updateStatus('pending_delete')"
              class="btn-danger"
              :disabled="boardsStore.loading"
          >
            삭제 대기로 변경
          </button>

          <button
              v-if="post.status === 'pending_delete'"
              @click="updateStatus('published')"
              class="btn-success"
              :disabled="boardsStore.loading"
          >
            다시 게시하기
          </button>

          <button
              @click="refreshPost"
              class="btn-secondary"
              :disabled="boardsStore.loading"
          >
            <Icon
                name="analytics"
                size="sm"
                class="mr-2"
                :class="{ 'animate-spin': boardsStore.loading }"
            />
            새로고침
          </button>
        </div>
      </div>
    </div>

    <!-- 게시글을 찾을 수 없는 경우 -->
    <div v-else class="text-center py-12">
      <Icon name="post" size="xl" color="gray" class="mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">게시글을 찾을 수 없습니다</h3>
      <p class="text-gray-500 mb-4">삭제되었거나 존재하지 않는 게시글입니다.</p>
      <button @click="goBack" class="btn-primary">
        돌아가기
      </button>
    </div>

    <!-- 삭제 확인 모달 -->
    <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="showDeleteModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <Icon name="delete" size="md" color="red" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">게시글 완전 삭제</h3>
              <p class="text-sm text-gray-500">이 작업은 되돌릴 수 없습니다</p>
            </div>
          </div>

          <p class="text-gray-600 mb-6">
            "<strong>{{ post?.title }}</strong>" 게시글을 완전히 삭제하시겠습니까?<br>
            <span class="text-sm text-red-600">모든 댓글과 첨부파일도 함께 삭제됩니다.</span>
          </p>

          <div class="flex justify-end space-x-3">
            <button
                type="button"
                @click="showDeleteModal = false"
                class="btn-secondary"
            >
              취소
            </button>
            <button
                @click="deletePost"
                class="btn-danger"
                :disabled="boardsStore.loading"
            >
              완전 삭제
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
const router = useRouter()

// 반응형 데이터
const post = ref(null)
const showDeleteModal = ref(false)

// 현재 게시판 정보
const currentBoard = computed(() => {
  const boardId = parseInt(route.params.id)
  return boardsStore.boards.find(board => board.id === boardId)
})

// 페이지 로드 시 게시글 가져오기
onMounted(async () => {
  const postId = route.params.postId
  try {
    post.value = await boardsStore.getPost(postId)
  } catch (error) {
    console.error('게시글 조회 실패:', error)
  }
})

// 유틸리티 함수들
const formatNumber = (num) => {
  return new Intl.NumberFormat('ko-KR').format(num)
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
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

// 액션 함수들
const goBack = () => {
  router.push(`/boards/${route.params.id}/posts`)
}

const togglePin = async () => {
  try {
    await boardsStore.togglePinPost(post.value.id)
    post.value.isPinned = !post.value.isPinned
  } catch (error) {
    console.error('고정 상태 변경 실패:', error)
  }
}

const updateStatus = async (newStatus) => {
  try {
    await boardsStore.updatePostStatus(post.value.id, newStatus)
    post.value.status = newStatus
  } catch (error) {
    console.error('상태 변경 실패:', error)
  }
}

const confirmDelete = () => {
  showDeleteModal.value = true
}

const deletePost = async () => {
  try {
    await boardsStore.deletePost(post.value.id)
    showDeleteModal.value = false
    goBack()
  } catch (error) {
    console.error('게시글 삭제 실패:', error)
  }
}

const refreshPost = async () => {
  try {
    const postId = route.params.postId
    post.value = await boardsStore.getPost(postId)
  } catch (error) {
    console.error('게시글 새로고침 실패:', error)
  }
}

// SEO 메타데이터
useHead({
  title: computed(() => `${post.value?.title || '게시글'} - ${currentBoard.value?.name || ''} - Shop BackOffice`),
  meta: [
    { name: 'description', content: computed(() => post.value?.content?.substring(0, 150) + '...' || '게시글 상세 페이지') }
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

.prose {
  max-width: none;
}

.prose p {
  margin-bottom: 1rem;
}

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.prose ul, .prose ol {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.prose li {
  margin-bottom: 0.25rem;
}

.prose a {
  color: #3b82f6;
  text-decoration: underline;
}

.prose blockquote {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  color: #6b7280;
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.875em;
}

.prose pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.prose pre code {
  background-color: transparent;
  padding: 0;
  color: inherit;
}
</style>