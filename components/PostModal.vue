<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
      <!-- 헤더 -->
      <div class="modal-header">
        <h3 class="modal-title">
          {{ isEdit ? (isNotice ? '공지사항 수정' : '게시글 수정') : (isNotice ? '공지사항 작성' : '게시글 작성') }}
        </h3>
        <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
        >
          <Icon name="close" size="md" />
        </button>
      </div>

      <!-- 본문 -->
      <div class="modal-body overflow-y-auto max-h-[70vh]">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- 게시글 타입 선택 (새 작성 시에만) -->
          <div v-if="!isEdit" class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <label class="flex items-center">
              <input
                  type="radio"
                  :value="false"
                  v-model="form.isNotice"
                  class="form-radio"
              >
              <span class="ml-2 text-sm font-medium text-gray-700">일반 게시글</span>
            </label>
            <label class="flex items-center">
              <input
                  type="radio"
                  :value="true"
                  v-model="form.isNotice"
                  class="form-radio"
              >
              <span class="ml-2 text-sm font-medium text-gray-700">공지사항</span>
            </label>
          </div>

          <!-- 제목 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              제목 *
            </label>
            <input
                v-model="form.title"
                type="text"
                class="form-input"
                placeholder="제목을 입력하세요"
                required
                maxlength="255"
            >
          </div>

          <!-- 작성자 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              작성자 *
            </label>
            <input
                v-model="form.author"
                type="text"
                class="form-input"
                placeholder="작성자명을 입력하세요"
                required
                maxlength="100"
            >
          </div>

          <!-- 내용 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              내용 *
            </label>
            <textarea
                v-model="form.content"
                class="form-textarea"
                rows="12"
                placeholder="내용을 입력하세요"
                required
            ></textarea>
          </div>

          <!-- 공지사항 전용 옵션 -->
          <div v-if="form.isNotice" class="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 class="text-sm font-semibold text-gray-700 flex items-center">
              <Icon name="notification" size="sm" class="mr-2 text-yellow-600" />
              공지사항 설정
            </h4>

            <!-- 중요 공지사항 -->
            <div class="flex items-center">
              <input
                  v-model="form.isPinned"
                  type="checkbox"
                  class="form-checkbox"
                  id="isPinned"
              >
              <label for="isPinned" class="ml-2 text-sm text-gray-700">
                중요 공지사항 (상단 고정)
              </label>
            </div>

            <!-- 활성 상태 -->
            <div class="flex items-center">
              <input
                  v-model="form.isActive"
                  type="checkbox"
                  class="form-checkbox"
                  id="isActive"
              >
              <label for="isActive" class="ml-2 text-sm text-gray-700">
                즉시 게시 (비활성화 시 임시저장)
              </label>
            </div>

            <!-- 만료일 설정 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                만료일 (선택사항)
              </label>
              <input
                  v-model="form.expiryDate"
                  type="datetime-local"
                  class="form-input"
              >
              <p class="text-xs text-gray-500 mt-1">
                만료일이 지나면 자동으로 비활성화됩니다
              </p>
            </div>

            <!-- 알림 발송 -->
            <div class="flex items-center">
              <input
                  v-model="form.sendNotification"
                  type="checkbox"
                  class="form-checkbox"
                  id="sendNotification"
              >
              <label for="sendNotification" class="ml-2 text-sm text-gray-700">
                사용자에게 알림 발송
              </label>
            </div>
          </div>

          <!-- 파일 업로드 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              첨부파일
            </label>
            <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
              <div class="space-y-1 text-center">
                <Icon name="upload" size="xl" color="gray" class="mx-auto" />
                <div class="flex text-sm text-gray-600">
                  <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                    <span>파일 선택</span>
                    <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        class="sr-only"
                        multiple
                        @change="handleFileSelect"
                    >
                  </label>
                  <p class="pl-1">또는 드래그 앤 드롭</p>
                </div>
                <p class="text-xs text-gray-500">
                  PNG, JPG, PDF, DOC 등 (최대 10MB)
                </p>
              </div>
            </div>

            <!-- 선택된 파일 목록 -->
            <div v-if="selectedFiles.length > 0" class="mt-4">
              <h5 class="text-sm font-medium text-gray-700 mb-2">선택된 파일 ({{ selectedFiles.length }}개)</h5>
              <div class="space-y-2">
                <div
                    v-for="(file, index) in selectedFiles"
                    :key="index"
                    class="flex items-center justify-between p-2 bg-gray-50 rounded border"
                >
                  <div class="flex items-center space-x-2">
                    <Icon name="upload" size="sm" color="gray" />
                    <span class="text-sm text-gray-700">{{ file.name }}</span>
                    <span class="text-xs text-gray-500">({{ formatFileSize(file.size) }})</span>
                  </div>
                  <button
                      type="button"
                      @click="removeFile(index)"
                      class="text-red-500 hover:text-red-700"
                  >
                    <Icon name="close" size="sm" />
                  </button>
                </div>
              </div>
            </div>

            <!-- 기존 파일 목록 (수정 시) -->
            <div v-if="isEdit && existingFiles.length > 0" class="mt-4">
              <h5 class="text-sm font-medium text-gray-700 mb-2">기존 파일 ({{ existingFiles.length }}개)</h5>
              <div class="space-y-2">
                <div
                    v-for="file in existingFiles"
                    :key="file.id"
                    class="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200"
                >
                  <div class="flex items-center space-x-2">
                    <Icon name="download" size="sm" color="blue" />
                    <span class="text-sm text-gray-700">{{ file.originalName }}</span>
                    <span class="text-xs text-gray-500">({{ file.formattedFileSize || formatFileSize(file.fileSize) }})</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <a
                        :href="getFileDownloadUrl(file.storedName)"
                        target="_blank"
                        class="text-blue-500 hover:text-blue-700"
                        title="다운로드"
                    >
                      <Icon name="download" size="sm" />
                    </a>
                    <button
                        type="button"
                        @click="deleteExistingFile(file.id)"
                        class="text-red-500 hover:text-red-700"
                        title="삭제"
                    >
                      <Icon name="delete" size="sm" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- 푸터 -->
      <div class="modal-footer">
        <button
            type="button"
            @click="$emit('close')"
            class="btn-secondary"
        >
          취소
        </button>
        <button
            @click="handleSubmit"
            class="btn-primary"
            :disabled="!isFormValid || submitting"
        >
          <Icon
              v-if="submitting"
              name="analytics"
              size="sm"
              class="mr-2 animate-spin"
          />
          {{ isEdit ? '수정' : '작성' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  post: {
    type: Object,
    default: null
  },
  isNotice: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const boardsStore = useBoardsStore()

// 반응형 데이터
const submitting = ref(false)
const selectedFiles = ref([])
const existingFiles = ref([])

// 폼 데이터
const form = ref({
  title: '',
  content: '',
  author: '',
  isNotice: props.isNotice,
  isPinned: false,
  isActive: true,
  expiryDate: '',
  sendNotification: false
})

// 계산된 속성
const isEdit = computed(() => !!props.post)

const isFormValid = computed(() => {
  return form.value.title.trim() &&
      form.value.content.trim() &&
      form.value.author.trim()
})

// 초기화
onMounted(async () => {
  if (props.post) {
    // 수정 모드: 기존 데이터 로드
    form.value = {
      title: props.post.title || '',
      content: props.post.content || '',
      author: props.post.author || '',
      isNotice: props.post.isNotice || false,
      isPinned: props.post.isPinned || false,
      isActive: props.post.isActive !== undefined ? props.post.isActive : true,
      expiryDate: props.post.expiryDate ? new Date(props.post.expiryDate).toISOString().slice(0, 16) : '',
      sendNotification: props.post.sendNotification || false
    }

    // 기존 파일 로드
    try {
      const files = await boardsStore.fetchFiles(props.post.id, props.post.isNotice)
      existingFiles.value = files || []
    } catch (error) {
      console.error('기존 파일 로드 실패:', error)
    }
  } else {
    // 새 작성 모드: 기본값 설정
    form.value.isNotice = props.isNotice
  }
})

// 파일 관련 함수들
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  selectedFiles.value.push(...files)
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const deleteExistingFile = async (fileId) => {
  try {
    await boardsStore.deleteFile(fileId)
    existingFiles.value = existingFiles.value.filter(f => f.id !== fileId)
  } catch (error) {
    console.error('파일 삭제 실패:', error)
  }
}

const getFileDownloadUrl = (storedName) => {
  return boardsStore.getFileDownloadUrl(storedName)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 폼 제출
const handleSubmit = async () => {
  if (!isFormValid.value || submitting.value) return

  submitting.value = true
  try {
    // 게시글 데이터 준비
    const postData = {
      title: form.value.title.trim(),
      content: form.value.content.trim(),
      author: form.value.author.trim(),
      isNotice: form.value.isNotice,
      isPinned: form.value.isPinned,
      isActive: form.value.isActive,
      expiryDate: form.value.expiryDate ? new Date(form.value.expiryDate).toISOString() : null,
      sendNotification: form.value.sendNotification
    }

    // 게시글 생성/수정
    let savedPost
    if (isEdit.value) {
      savedPost = await boardsStore.updatePost(props.post.id, postData, props.post.isNotice)
    } else {
      savedPost = await boardsStore.createPost(postData)
    }

    // 파일 업로드 (새로 선택된 파일이 있는 경우)
    if (selectedFiles.value.length > 0 && savedPost) {
      try {
        await boardsStore.uploadFiles(
            savedPost.id || props.post?.id,
            selectedFiles.value,
            postData.isNotice
        )
      } catch (error) {
        console.error('파일 업로드 실패:', error)
        // 파일 업로드 실패해도 게시글은 저장됨을 알림
      }
    }

    emit('submit', postData)
    emit('close')
  } catch (error) {
    console.error('게시글 저장 실패:', error)
  } finally {
    submitting.value = false
  }
}

// 드래그 앤 드롭 지원
const handleDragOver = (event) => {
  event.preventDefault()
}

const handleDrop = (event) => {
  event.preventDefault()
  const files = Array.from(event.dataTransfer.files)
  selectedFiles.value.push(...files)
}

onMounted(() => {
  const uploadArea = document.querySelector('#file-upload').closest('.border-dashed')
  if (uploadArea) {
    uploadArea.addEventListener('dragover', handleDragOver)
    uploadArea.addEventListener('drop', handleDrop)
  }
})

onUnmounted(() => {
  const uploadArea = document.querySelector('#file-upload')?.closest('.border-dashed')
  if (uploadArea) {
    uploadArea.removeEventListener('dragover', handleDragOver)
    uploadArea.removeEventListener('drop', handleDrop)
  }
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

/* 파일 업로드 영역 호버 효과 */
.border-dashed:hover {
  border-color: #9ca3af;
  background-color: #f9fafb;
}

/* 체크박스 커스텀 스타일 */
.form-checkbox:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* 라디오 버튼 커스텀 스타일 */
.form-radio:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}
</style>