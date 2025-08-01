<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal-content">
      <div class="p-6">
        <!-- 아이콘 및 제목 -->
        <div class="flex items-center mb-4">
          <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <Icon name="delete" size="md" color="red" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ title || '삭제 확인' }}</h3>
            <p class="text-sm text-gray-500">이 작업은 되돌릴 수 없습니다</p>
          </div>
        </div>

        <!-- 메시지 -->
        <p class="text-gray-600 mb-6">
          {{ message || '정말로 삭제하시겠습니까?' }}
          <span v-if="showWarning" class="block text-sm text-red-600 mt-2">
            {{ warningMessage || '관련된 모든 데이터도 함께 삭제됩니다.' }}
          </span>
        </p>

        <!-- 확인 입력 (위험한 작업의 경우) -->
        <div v-if="requireConfirmation" class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            확인을 위해 "<strong>{{ confirmText || '삭제' }}</strong>"를 입력하세요:
          </label>
          <input
              v-model="confirmInput"
              type="text"
              class="form-input"
              :placeholder="confirmText || '삭제'"
          >
        </div>

        <!-- 버튼 영역 -->
        <div class="flex justify-end space-x-3">
          <button
              type="button"
              @click="$emit('cancel')"
              class="btn-secondary"
          >
            취소
          </button>
          <button
              @click="handleConfirm"
              class="btn-danger"
              :disabled="requireConfirmation && !isConfirmValid"
          >
            <Icon
                v-if="deleting"
                name="analytics"
                size="sm"
                class="mr-2 animate-spin"
            />
            {{ confirmButtonText || '삭제' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '삭제 확인'
  },
  message: {
    type: String,
    default: '정말로 삭제하시겠습니까?'
  },
  showWarning: {
    type: Boolean,
    default: true
  },
  warningMessage: {
    type: String,
    default: '관련된 모든 데이터도 함께 삭제됩니다.'
  },
  requireConfirmation: {
    type: Boolean,
    default: false
  },
  confirmText: {
    type: String,
    default: '삭제'
  },
  confirmButtonText: {
    type: String,
    default: '삭제'
  },
  deleting: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel'])

// 반응형 데이터
const confirmInput = ref('')

// 계산된 속성
const isConfirmValid = computed(() => {
  if (!props.requireConfirmation) return true
  return confirmInput.value === props.confirmText
})

// 메서드
const handleConfirm = () => {
  if (props.requireConfirmation && !isConfirmValid.value) {
    return
  }
  emit('confirm')
}

// ESC 키로 모달 닫기
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    emit('cancel')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
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

/* 비활성화된 버튼 스타일 */
.btn-danger:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.btn-danger:disabled:hover {
  @apply bg-red-600;
}
</style>