<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden">
      <!-- 헤더 -->
      <div class="modal-header">
        <h3 class="modal-title">
          일괄 사용자 관리 ({{ selectedUsers.length }}명 선택)
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
        <!-- 선택된 사용자 목록 -->
        <div class="mb-6">
          <h4 class="text-sm font-medium text-gray-700 mb-3">선택된 사용자</h4>
          <div class="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
            <div
                v-for="user in selectedUsers"
                :key="user.id"
                class="flex items-center space-x-3 p-2 border-b border-gray-100 last:border-b-0"
            >
              <div class="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {{ getUserInitials(user) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ user.fullName }}</p>
                <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
              </div>
              <Badge
                  :variant="getRoleVariant(user.role)"
                  :text="getRoleDisplayName(user.role)"
                  size="sm"
              />
            </div>
          </div>
        </div>

        <!-- 작업 선택 -->
        <div class="space-y-4">
          <h4 class="text-sm font-medium text-gray-700">수행할 작업</h4>

          <!-- 상태 변경 -->
          <div class="p-4 border border-gray-200 rounded-lg">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                  v-model="selectedAction"
                  type="radio"
                  value="status"
                  class="form-radio"
              >
              <div class="flex-1">
                <span class="text-sm font-medium text-gray-900">상태 변경</span>
                <p class="text-xs text-gray-500">사용자 계정 활성화/비활성화</p>
              </div>
            </label>

            <div v-if="selectedAction === 'status'" class="mt-3 ml-6">
              <select v-model="bulkData.status" class="form-select w-full">
                <option value="true">활성화</option>
                <option value="false">비활성화</option>
              </select>
            </div>
          </div>

          <!-- 역할 변경 -->
          <div class="p-4 border border-gray-200 rounded-lg">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                  v-model="selectedAction"
                  type="radio"
                  value="role"
                  class="form-radio"
              >
              <div class="flex-1">
                <span class="text-sm font-medium text-gray-900">역할 변경</span>
                <p class="text-xs text-gray-500">사용자 권한 레벨 변경</p>
              </div>
            </label>

            <div v-if="selectedAction === 'role'" class="mt-3 ml-6">
              <select v-model="bulkData.role" class="form-select w-full">
                <option value="USER">일반 사용자</option>
                <option value="SYSOP">운영자</option>
                <option value="ADMIN">관리자</option>
              </select>
              <p class="text-xs text-red-600 mt-1" v-if="bulkData.role === 'ADMIN'">
                ⚠️ 관리자 권한 부여 시 주의하세요
              </p>
            </div>
          </div>

          <!-- 부서 변경 -->
          <div class="p-4 border border-gray-200 rounded-lg">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                  v-model="selectedAction"
                  type="radio"
                  value="department"
                  class="form-radio"
              >
              <div class="flex-1">
                <span class="text-sm font-medium text-gray-900">부서 변경</span>
                <p class="text-xs text-gray-500">사용자 부서 정보 업데이트</p>
              </div>
            </label>

            <div v-if="selectedAction === 'department'" class="mt-3 ml-6 space-y-2">
              <input
                  v-model="bulkData.department"
                  type="text"
                  class="form-input"
                  placeholder="부서명을 입력하세요"
                  maxlength="100"
              >
              <input
                  v-model="bulkData.position"
                  type="text"
                  class="form-input"
                  placeholder="직책을 입력하세요 (선택사항)"
                  maxlength="100"
              >
            </div>
          </div>

          <!-- 알림 설정 -->
          <div class="p-4 border border-gray-200 rounded-lg">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                  v-model="selectedAction"
                  type="radio"
                  value="notifications"
                  class="form-radio"
              >
              <div class="flex-1">
                <span class="text-sm font-medium text-gray-900">알림 설정</span>
                <p class="text-xs text-gray-500">사용자 알림 수신 설정</p>
              </div>
            </label>

            <div v-if="selectedAction === 'notifications'" class="mt-3 ml-6 space-y-2">
              <div class="flex items-center space-x-3">
                <input
                    v-model="bulkData.emailNotifications"
                    type="checkbox"
                    class="form-checkbox"
                    id="bulkEmailNotifications"
                >
                <label for="bulkEmailNotifications" class="text-sm text-gray-700">
                  이메일 알림 활성화
                </label>
              </div>
              <div class="flex items-center space-x-3">
                <input
                    v-model="bulkData.pushNotifications"
                    type="checkbox"
                    class="form-checkbox"
                    id="bulkPushNotifications"
                >
                <label for="bulkPushNotifications" class="text-sm text-gray-700">
                  푸시 알림 활성화
                </label>
              </div>
              <div class="flex items-center space-x-3">
                <input
                    v-model="bulkData.marketingEmails"
                    type="checkbox"
                    class="form-checkbox"
                    id="bulkMarketingEmails"
                >
                <label for="bulkMarketingEmails" class="text-sm text-gray-700">
                  마케팅 이메일 수신
                </label>
              </div>
            </div>
          </div>

          <!-- 삭제 -->
          <div class="p-4 border border-red-200 rounded-lg bg-red-50">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                  v-model="selectedAction"
                  type="radio"
                  value="delete"
                  class="form-radio text-red-600"
              >
              <div class="flex-1">
                <span class="text-sm font-medium text-red-900">사용자 삭제</span>
                <p class="text-xs text-red-600">⚠️ 선택된 사용자들을 영구 삭제합니다</p>
              </div>
            </label>

            <div v-if="selectedAction === 'delete'" class="mt-3 ml-6">
              <div class="p-3 bg-red-100 rounded border border-red-200">
                <p class="text-sm text-red-800 font-medium">주의사항:</p>
                <ul class="text-xs text-red-700 mt-1 space-y-1">
                  <li>• 삭제된 사용자 데이터는 복구할 수 없습니다</li>
                  <li>• 관리자가 1명뿐인 경우 삭제할 수 없습니다</li>
                  <li>• 연관된 게시글, 댓글도 함께 삭제됩니다</li>
                </ul>
              </div>

              <div class="mt-3">
                <label class="block text-sm font-medium text-red-700 mb-1">
                  확인을 위해 "삭제"를 입력하세요:
                </label>
                <input
                    v-model="deleteConfirmText"
                    type="text"
                    class="form-input border-red-300 focus:ring-red-500 focus:border-red-500"
                    placeholder="삭제"
                >
              </div>
            </div>
          </div>
        </div>
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
            :class="selectedAction === 'delete' ? 'btn-danger' : 'btn-primary'"
            :disabled="!selectedAction || (selectedAction === 'delete' && deleteConfirmText !== '삭제') || submitting"
        >
          <Icon
              v-if="submitting"
              name="analytics"
              size="sm"
              class="mr-2 animate-spin"
          />
          {{ getActionButtonText() }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  selectedUsers: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close', 'submit'])

// 반응형 데이터
const submitting = ref(false)
const selectedAction = ref('')
const deleteConfirmText = ref('')

// 일괄 작업 데이터
const bulkData = ref({
  status: 'true',
  role: 'USER',
  department: '',
  position: '',
  emailNotifications: true,
  pushNotifications: true,
  marketingEmails: false
})

// 유틸리티 함수 import
const { getUserInitials, getRoleDisplayName, getRoleVariant } = await import('~/utils/userUtils.js')

// 메서드
const getActionButtonText = () => {
  switch (selectedAction.value) {
    case 'status':
      return bulkData.value.status === 'true' ? '활성화' : '비활성화'
    case 'role':
      return '역할 변경'
    case 'department':
      return '부서 변경'
    case 'notifications':
      return '알림 설정 변경'
    case 'delete':
      return '삭제'
    default:
      return '적용'
  }
}

const handleSubmit = async () => {
  if (!selectedAction.value) return
  if (selectedAction.value === 'delete' && deleteConfirmText.value !== '삭제') return

  submitting.value = true
  try {
    const actionData = {
      action: selectedAction.value,
      userIds: props.selectedUsers.map(u => u.id),
      data: {}
    }

    switch (selectedAction.value) {
      case 'status':
        actionData.data.isActive = bulkData.value.status === 'true'
        break
      case 'role':
        actionData.data.role = bulkData.value.role
        break
      case 'department':
        actionData.data.department = bulkData.value.department
        actionData.data.position = bulkData.value.position || null
        break
      case 'notifications':
        actionData.data.emailNotifications = bulkData.value.emailNotifications
        actionData.data.pushNotifications = bulkData.value.pushNotifications
        actionData.data.marketingEmails = bulkData.value.marketingEmails
        break
      case 'delete':
        // 삭제는 별도 처리
        break
    }

    console.log('[BulkUserModal] 일괄 작업 데이터:', actionData)

    emit('submit', actionData)
    emit('close')
  } catch (error) {
    console.error('[BulkUserModal] 일괄 작업 실패:', error)
  } finally {
    submitting.value = false
  }
}

// ESC 키로 모달 닫기
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    emit('close')
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

/* 라디오 버튼 커스텀 스타일 */
.form-radio:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.form-radio.text-red-600:checked {
  background-color: #dc2626;
  border-color: #dc2626;
}

/* 체크박스 커스텀 스타일 */
.form-checkbox:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}
</style>