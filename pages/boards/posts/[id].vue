<template>
  <div class="space-y-6">
    <!-- 헤더 영역 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
          <NuxtLink to="/boards" class="hover:text-gray-700">게시글 관리</NuxtLink>
          <span>/</span>
          <span class="text-gray-900 font-medium">{{ post?.isNotice ? '공지사항' : '게시글' }} 상세</span>
        </nav>
        <h2 class="text-3xl font-bold text-gray-900">
          {{ post?.isNotice ? '공지사항' : '게시글' }} 상세
        </h2>
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
                  :class="post.isNotice ? 'badge-warning' : 'badge-info'"
              >
                {{ post.isNotice ? '공지사항' : '일반 게시글' }}
              </span>
              <span
                  v-if="post.isNotice && !post.isActive"
                  class="badge badge-danger"
              >
                비활성
              </span>
              <span
                  v-if="post.isPinned"
                  class="badge badge-warning"
              >
                중요공지
              </span>
              <Badge
                  v-if="post.isNotice && isExpired"
                  variant="danger"
                  text="만료됨"
              />
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
                @click="editPost"
                class="btn-secondary"
                :disabled="boardsStore.loading"
            >
              <Icon name="edit" size="sm" class="mr-2" />
              수정
            </button>

            <button
                v-if="post.isNotice"
                @click="toggleStatus"
                :class="post.isActive ? 'btn-warning' : 'btn-success'"
                :disabled="boardsStore.loading"
            >
              <Icon :name="post.isActive ? 'close' : 'plus'" size="sm" class="mr-2" />
              {{ post.isActive ? '비활성화' : '활성화' }}
            </button>

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

        <!-- 공지사항 추가 정보 -->
        <div v-if="post.isNotice" class="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">공지사항 정보</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="text-gray-500">상태:</span>
              <span :class="post.isActive ? 'text-green-600' : 'text-red-600'" class="ml-1 font-medium">
                {{ post.isActive ? '활성' : '비활성' }}
              </span>
            </div>
            <div>
              <span class="text-gray-500">중요도:</span>
              <span :class="post.isPinned ? 'text-yellow-600' : 'text-gray-600'" class="ml-1 font-medium">
                {{ post.isPinned ? '중요공지' : '일반공지' }}
              </span>
            </div>
            <div v-if="post.expiryDate">
              <span class="text-gray-500">만료일:</span>
              <span :class="isExpired ? 'text-red-600' : 'text-gray-600'" class="ml-1 font-medium">
                {{ formatDateTime(post.expiryDate) }}
              </span>
            </div>
            <div>
              <span class="text-gray-500">알림발송:</span>
              <span class="ml-1 font-medium" :class="post.sendNotification ? 'text-blue-600' : 'text-gray-600'">
                {{ post.sendNotification ? '발송함' : '미발송' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 통계 정보 -->
        <div class="grid grid-cols-3 gap-6 py-4 border-t border-gray-200">
          <div class="text-center">
            <div class="flex items-center justify-center mb-1">
              <Icon name="eye" size="sm" class="mr-1 text-gray-400" />
            </div>
            <div class="text-2xl font-bold text-gray-900">{{ formatNumber(post.viewCount || 0) }}</div>
            <div class="text-sm text-gray-500">조회수</div>
          </div>
          <div class="text-center">
            <div class="flex items-center justify-center mb-1">
              <Icon name="comment" size="sm" class="mr-1 text-gray-400" />
            </div>
            <div class="text-2xl font-bold text-gray-900">{{ commentsCount }}</div>
            <div class="text-sm text-gray-500">댓글</div>
          </div>
          <div class="text-center">
            <div class="flex items-center justify-center mb-1">
              <Icon name="upload" size="sm" class="mr-1 text-gray-400" />
            </div>
            <div class="text-2xl font-bold text-gray-900">{{ filesCount }}</div>
            <div class="text-sm text-gray-500">첨부파일</div>
          </div>
        </div>
      </div>

      <!-- 게시글 내용 -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">내용</h3>
        <div class="prose max-w-none">
          <div class="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {{ post.content }}
          </div>
        </div>
      </div>

      <!-- 첨부파일 -->
      <div v-if="files && files.length > 0" class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">첨부파일 ({{ files.length }}개)</h3>
        <div class="space-y-3">
          <div
              v-for="file in files"
              :key="file.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
          >
            <div class="flex items-center space-x-3">
              <Icon
                  :name="file.isImage ? 'eye' : 'download'"
                  size="sm"
                  :color="file.isImage ? 'blue' : 'gray'"
              />
              <div>
                <div class="font-medium text-gray-900">{{ file.originalName }}</div>
                <div class="text-sm text-gray-500">
                  {{ file.formattedFileSize || formatFileSize(file.fileSize) }} ·
                  {{ formatDate(file.createdAt) }}
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <a
                  :href="getFileDownloadUrl(file.storedName)"
                  target="_blank"
                  class="btn-secondary btn-sm"
              >
                <Icon name="download" size="sm" class="mr-1" />
                다운로드
              </a>
              <button
                  @click="deleteFile(file.id)"
                  class="btn-danger btn-sm"
                  title="파일 삭제"
              >
                <Icon name="delete" size="sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 댓글 섹션 -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">댓글 ({{ commentsCount }})</h3>
          <button
              @click="showCommentForm = !showCommentForm"
              class="btn-primary btn-sm"
          >
            <Icon name="plus" size="sm" class="mr-1" />
            댓글 작성
          </button>
        </div>

        <!-- 댓글 작성 폼 -->
        <div v-if="showCommentForm" class="mb-6 p-4 bg-gray-50 rounded-lg">
          <form @submit.prevent="submitComment">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">작성자</label>
              <input
                  v-model="commentForm.author"
                  type="text"
                  class="form-input w-full sm:w-64"
                  placeholder="작성자명"
                  required
              >
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">댓글 내용</label>
              <textarea
                  v-model="commentForm.content"
                  class="form-textarea"
                  rows="3"
                  placeholder="댓글을 입력하세요"
                  required
              ></textarea>
            </div>
            <div class="flex items-center space-x-3">
              <button
                  type="submit"
                  class="btn-success btn-sm"
                  :disabled="!commentForm.content.trim() || !commentForm.author.trim()"
              >
                댓글 등록
              </button>
              <button
                  type="button"
                  @click="cancelComment"
                  class="btn-secondary btn-sm"
              >
                취소
              </button>
            </div>
          </form>
        </div>

        <!-- 댓글 목록 -->
        <div v-if="comments && comments.length > 0" class="space-y-4">
          <div
              v-for="comment in comments"
              :key="comment.id"
              class="border-l-4 border-gray-200 pl-4 py-2"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <span class="font-medium text-gray-900">{{ comment.author }}</span>
                <span class="text-sm text-gray-500">{{ formatDateTime(comment.createdAt) }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <button
                    @click="editComment(comment)"
                    class="text-blue-600 hover:text-blue-700 text-sm"
                >
                  수정
                </button>
                <button
                    @click="deleteComment(comment.id)"
                    class="text-red-600 hover:text-red-700 text-sm"
                >
                  삭제
                </button>
              </div>
            </div>
            <p class="text-gray-700 whitespace-pre-wrap">{{ comment.content }}</p>
          </div>
        </div>

        <!-- 댓글 없음 -->
        <div v-else-if="!showCommentForm" class="text-center py-8 text-gray-500">
          <Icon name="comment" size="xl" color="gray" class="mx-auto mb-2" />
          <p>첫 번째 댓글을 작성해보세요.</p>
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
                <span class="text-gray-500">ID:</span>
                <span class="font-mono text-gray-900">{{ post.id }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">타입:</span>
                <span class="text-gray-900">{{ post.isNotice ? '공지사항' : '일반 게시글' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">작성자:</span>
                <span class="text-gray-900">{{ post.author }}</span>
              </div>
              <div v-if="post.isNotice" class="flex justify-between">
                <span class="text-gray-500">상태:</span>
                <span
                    class="font-medium"
                    :class="post.isActive ? 'text-green-600' : 'text-red-600'"
                >
                  {{ post.isActive ? '활성' : '비활성' }}
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
              <div v-if="post.expiryDate" class="flex justify-between">
                <span class="text-gray-500">만료일:</span>
                <span class="text-gray-900" :class="isExpired ? 'text-red-600' : ''">
                  {{ formatDateTime(post.expiryDate) }}
                </span>
              </div>
            </div>
          </div>
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

    <!-- 게시글 수정 모달 -->
    <PostModal
        v-if="showEditModal"
        :post="post"
        :is-notice="post?.isNotice"
        @close="showEditModal = false"
        @submit="handlePostUpdate"
    />

    <!-- 삭제 확인 모달 -->
    <DeleteConfirmModal
        v-if="showDeleteModal"
        :title="post?.isNotice ? '공지사항 삭제' : '게시글 삭제'"
        :message="`'${post?.title}' ${post?.isNotice ? '공지사항을' : '게시글을'} 삭제하시겠습니까?`"
        :show-warning="true"
        :warning-message="post?.isNotice ? '공지사항과 모든 댓글, 첨부파일이 함께 삭제됩니다.' : '게시글과 모든 댓글, 첨부파일이 함께 삭제됩니다.'"
        @confirm="handleDelete"
        @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup>
const boardsStore = useBoardsStore()
const route = useRoute()
const router = useRouter()

// 반응형 데이터
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showCommentForm = ref(false)

// 댓글 폼 데이터
const commentForm = ref({
  content: '',
  author: ''
})

// 데이터 가져오기
const { data: postData } = await boardsStore.fetchPost(route.params.id)

// 계산된 속성
const post = computed(() => boardsStore.currentPost)
const comments = computed(() => boardsStore.comments)
const files = computed(() => boardsStore.files)

const commentsCount = computed(() => comments.value?.length || 0)
const filesCount = computed(() => files.value?.length || 0)

const isExpired = computed(() => {
  if (!post.value?.expiryDate) return false
  return new Date() > new Date(post.value.expiryDate)
})

// 유틸리티 함수들
const formatNumber = (num) => {
  return new Intl.NumberFormat('ko-KR').format(num || 0)
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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR')
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 액션 함수들
const goBack = () => {
  router.push('/boards')
}

const editPost = () => {
  showEditModal.value = true
}

const toggleStatus = async () => {
  try {
    await boardsStore.toggleNoticeStatus(post.value.id)
  } catch (error) {
    console.error('상태 토글 실패:', error)
  }
}

const confirmDelete = () => {
  showDeleteModal.value = true
}

const handleDelete = async () => {
  try {
    await boardsStore.deletePost(post.value.id, post.value.isNotice)
    showDeleteModal.value = false
    goBack()
  } catch (error) {
    console.error('삭제 실패:', error)
  }
}

const handlePostUpdate = async () => {
  showEditModal.value = false
  // 게시글 정보 새로고침
  await boardsStore.fetchPost(route.params.id, post.value.isNotice)
}

// 댓글 관련 함수들
const submitComment = async () => {
  try {
    await boardsStore.createComment({
      postId: post.value.id,
      content: commentForm.value.content.trim(),
      author: commentForm.value.author.trim()
    })

    // 폼 초기화
    commentForm.value = { content: '', author: '' }
    showCommentForm.value = false
  } catch (error) {
    console.error('댓글 작성 실패:', error)
  }
}

const cancelComment = () => {
  commentForm.value = { content: '', author: '' }
  showCommentForm.value = false
}

// 임시로 간단한 댓글 수정/삭제 (실제로는 모달로 구현할 수 있음)
const editComment = (comment) => {
  const newContent = prompt('댓글을 수정하세요:', comment.content)
  if (newContent && newContent !== comment.content) {
    boardsStore.updateComment(comment.id, newContent)
  }
}

const deleteComment = async (commentId) => {
  if (confirm('댓글을 삭제하시겠습니까?')) {
    try {
      await boardsStore.deleteComment(commentId)
    } catch (error) {
      console.error('댓글 삭제 실패:', error)
    }
  }
}

// 파일 관련 함수들
const getFileDownloadUrl = (storedName) => {
  return boardsStore.getFileDownloadUrl(storedName)
}

const deleteFile = async (fileId) => {
  if (confirm('파일을 삭제하시겠습니까?')) {
    try {
      await boardsStore.deleteFile(fileId)
    } catch (error) {
      console.error('파일 삭제 실패:', error)
    }
  }
}

// SEO 메타데이터
useHead({
  title: computed(() => `${post.value?.title || '게시글'} - Shop BackOffice`),
  meta: [
    {
      name: 'description',
      content: computed(() => post.value?.content?.substring(0, 150) + '...' || '게시글 상세 페이지')
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

.btn-sm {
  @apply px-2 py-1 text-xs;
}
</style>