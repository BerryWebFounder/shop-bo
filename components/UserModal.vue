<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
      <!-- 헤더 -->
      <div class="modal-header">
        <h3 class="modal-title">
          {{ isEdit ? '사용자 수정' : '새 사용자 추가' }}
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
          <!-- 기본 정보 -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold text-gray-900">기본 정보</h4>

            <!-- 이름 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                이름 *
              </label>
              <input
                  v-model="form.fullName"
                  type="text"
                  class="form-input"
                  placeholder="이름을 입력하세요"
                  required
                  maxlength="100"
              >
            </div>

            <!-- 사용자명 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                사용자명 *
              </label>
              <input
                  v-model="form.username"
                  type="text"
                  class="form-input"
                  placeholder="사용자명을 입력하세요"
                  required
                  maxlength="50"
                  :disabled="isEdit"
              >
              <p class="text-xs text-gray-500 mt-1">
                {{ isEdit ? '사용자명은 수정할 수 없습니다' : '로그인 시 사용되며 변경할 수 없습니다' }}
              </p>
            </div>

            <!-- 이메일 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                이메일 주소 *
              </label>
              <input
                  v-model="form.email"
                  type="email"
                  class="form-input"
                  placeholder="이메일을 입력하세요"
                  required
              >
            </div>

            <!-- 전화번호 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                전화번호
              </label>
              <input
                  v-model="form.phoneNumber"
                  type="tel"
                  class="form-input"
                  placeholder="전화번호를 입력하세요"
                  maxlength="20"
              >
            </div>
          </div>

          <!-- 비밀번호 (새 사용자만) -->
          <div v-if="!isEdit" class="space-y-4">
            <h4 class="text-lg font-semibold text-gray-900">비밀번호 설정</h4>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 *
              </label>
              <input
                  v-model="form.password"
                  type="password"
                  class="form-input"
                  placeholder="비밀번호를 입력하세요"
                  required
                  minlength="8"
              >
              <p class="text-xs text-gray-500 mt-1">
                최소 8자 이상, 영문/숫자/특수문자 조합 권장
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인 *
              </label>
              <input
                  v-model="form.confirmPassword"
                  type="password"
                  class="form-input"
                  placeholder="비밀번호를 다시 입력하세요"
                  required
              >
              <p v-if="form.confirmPassword && form.password !== form.confirmPassword" class="text-xs text-red-600 mt-1">
                비밀번호가 일치하지 않습니다
              </p>
            </div>
          </div>

          <!-- 권한 및 상태 -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold text-gray-900">권한 및 상태</h4>

            <!-- 역할 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                역할 *
              </label>
              <select v-model="form.role" class="form-select" required>
                <option value="USER">일반 사용자</option>
                <option value="SYSOP">운영자</option>
                <option value="ADMIN">관리자</option>
              </select>
              <p class="text-xs text-gray-500 mt-1">
                {{ getRoleDescription(form.role) }}
              </p>
            </div>

            <!-- 계정 상태 -->
            <div class="flex items-center space-x-6">
              <div class="flex items-center">
                <input
                    v-model="form.isActive"
                    type="checkbox"
                    class="form-checkbox"
                    id="isActive"
                >
                <label for="isActive" class="ml-2 text-sm text-gray-700">
                  계정 활성화
                </label>
              </div>

              <div class="flex items-center">
                <input
                    v-model="form.emailVerified"
                    type="checkbox"
                    class="form-checkbox"
                    id="emailVerified"
                >
                <label for="emailVerified" class="ml-2 text-sm text-gray-700">
                  이메일 인증됨
                </label>
              </div>
            </div>
          </div>

          <!-- 추가 정보 -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold text-gray-900">추가 정보</h4>

            <!-- 부서/직책 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  부서
                </label>
                <input
                    v-model="form.department"
                    type="text"
                    class="form-input"
                    placeholder="부서명을 입력하세요"
                    maxlength="100"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  직책
                </label>
                <input
                    v-model="form.position"
                    type="text"
                    class="form-input"
                    placeholder="직책을 입력하세요"
                    maxlength="100"
                >
              </div>
            </div>

            <!-- 자기소개 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                자기소개
              </label>
              <textarea
                  v-model="form.bio"
                  class="form-textarea"
                  rows="3"
                  placeholder="간단한 자기소개를 입력하세요"
                  maxlength="500"
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">
                {{ form.bio?.length || 0 }}/500자
              </p>
            </div>
          </div>

          <!-- 알림 설정 -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold text-gray-900">알림 설정</h4>

            <div class="space-y-3">
              <div class="flex items-center">
                <input
                    v-model="form.emailNotifications"
                    type="checkbox"
                    class="form-checkbox"
                    id="emailNotifications"
                >
                <label for="emailNotifications" class="ml-2 text-sm text-gray-700">
                  이메일 알림 받기
                </label>
              </div>

              <div class="flex items-center">
                <input
                    v-model="form.pushNotifications"
                    type="checkbox"
                    class="form-checkbox"
                    id="pushNotifications"
                >
                <label for="pushNotifications" class="ml-2 text-sm text-gray-700">
                  푸시 알림 받기
                </label>
              </div>

              <div class="flex items-center">
                <input
                    v-model="form.marketingEmails"
                    type="checkbox"
                    class="form-checkbox"
                    id="marketingEmails"
                >
                <label for="marketingEmails" class="ml-2 text-sm text-gray-700">
                  마케팅 이메일 받기
                </label>
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
          {{ isEdit ? '수정' : '생성' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  user: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'submit'])

// 반응형 데이터
const submitting = ref(false)

// 폼 데이터
const form = ref({
  fullName: '',
  username: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  role: 'USER',
  isActive: true,
  emailVerified: false,
  department: '',
  position: '',
  bio: '',
  emailNotifications: true,
  pushNotifications: true,
  marketingEmails: false
})

// 계산된 속성
const isEdit = computed(() => !!props.user)

const isFormValid = computed(() => {
  const basicValid = form.value.fullName.trim() &&
      form.value.username.trim() &&
      form.value.email.trim()

  if (isEdit.value) {
    return basicValid
  } else {
    return basicValid &&
        form.value.password.trim() &&
        form.value.confirmPassword.trim() &&
        form.value.password === form.value.confirmPassword &&
        form.value.password.length >= 8
  }
})

// 초기화
onMounted(() => {
  if (props.user) {
    // 수정 모드: 기존 데이터 로드
    form.value = {
      fullName: props.user.fullName || '',
      username: props.user.username || '',
      email: props.user.email || '',
      phoneNumber: props.user.phoneNumber || '',
      password: '', // 수정 시에는 비밀번호 필드 사용 안함
      confirmPassword: '',
      role: props.user.role || 'USER',
      isActive: props.user.isActive !== undefined ? props.user.isActive : true,
      emailVerified: props.user.emailVerified !== undefined ? props.user.emailVerified : false,
      department: props.user.department || '',
      position: props.user.position || '',
      bio: props.user.bio || '',
      emailNotifications: props.user.emailNotifications !== undefined ? props.user.emailNotifications : true,
      pushNotifications: props.user.pushNotifications !== undefined ? props.user.pushNotifications : true,
      marketingEmails: props.user.marketingEmails !== undefined ? props.user.marketingEmails : false
    }
  }
})

// 역할 설명 반환
const getRoleDescription = (role) => {
  switch (role) {
    case 'ADMIN':
      return '시스템의 모든 기능에 접근할 수 있습니다'
    case 'SYSOP':
      return '사용자 관리를 제외한 대부분의 기능에 접근할 수 있습니다'
    case 'USER':
    default:
      return '기본적인 기능만 사용할 수 있습니다'
  }
}

// 폼 제출
const handleSubmit = async () => {
  if (!isFormValid.value || submitting.value) return

  submitting.value = true
  try {
    // 제출할 데이터 준비
    const submitData = {
      fullName: form.value.fullName.trim(),
      username: form.value.username.trim(),
      email: form.value.email.trim(),
      phoneNumber: form.value.phoneNumber?.trim() || null,
      role: form.value.role,
      isActive: form.value.isActive,
      emailVerified: form.value.emailVerified,
      department: form.value.department?.trim() || null,
      position: form.value.position?.trim() || null,
      bio: form.value.bio?.trim() || null,
      emailNotifications: form.value.emailNotifications,
      pushNotifications: form.value.pushNotifications,
      marketingEmails: form.value.marketingEmails
    }

    // 새 사용자 생성 시에만 비밀번호 포함
    if (!isEdit.value) {
      submitData.password = form.value.password
      submitData.confirmPassword = form.value.confirmPassword
    }

    console.log('[UserModal] 제출 데이터:', submitData)

    emit('submit', submitData)
  } catch (error) {
    console.error('[UserModal] 폼 제출 실패:', error)
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

/* 체크박스 커스텀 스타일 */
.form-checkbox:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* 비활성화된 입력 필드 스타일 */
input:disabled {
  @apply bg-gray-100 text-gray-500 cursor-not-allowed;
}
</style>