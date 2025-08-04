<template>
  <div class="space-y-8">
    <!-- 헤더 영역 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-3xl font-bold text-gray-900">개인정보 수정</h2>
        <p class="mt-2 text-gray-600">계정 정보를 확인하고 수정할 수 있습니다</p>
      </div>
      <div class="mt-4 sm:mt-0 flex items-center space-x-3">
        <NuxtLink to="/profile/settings" class="btn-secondary">
          <Icon name="settings" size="sm" class="mr-2" />
          계정 설정
        </NuxtLink>
        <NuxtLink to="/profile/activity" class="btn-secondary">
          <Icon name="analytics" size="sm" class="mr-2" />
          내 활동
        </NuxtLink>
      </div>
    </div>

    <!-- 프로필 정보 카드 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- 프로필 사진 및 기본 정보 -->
      <div class="lg:col-span-1">
        <div class="card p-6">
          <div class="text-center">
            <!-- 프로필 사진 -->
            <div class="mx-auto w-32 h-32 bg-primary-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
              {{ getUserInitials() }}
            </div>

            <!-- 사용자 기본 정보 -->
            <h3 class="text-xl font-semibold text-gray-900">
              {{ authStore.user?.fullName || '사용자' }}
            </h3>
            <p class="text-gray-500 mt-1">{{ authStore.user?.email }}</p>

            <!-- 역할 배지 -->
            <div class="mt-3">
              <Badge
                  :variant="getRoleVariant(authStore.user?.role)"
                  :text="authStore.user?.roleDisplayName"
                  size="md"
              />
            </div>

            <!-- 가입일 -->
            <div class="mt-4 text-sm text-gray-500">
              <Icon name="calendar" size="sm" class="mr-1 inline" />
              가입일: {{ formatDate(authStore.user?.createdAt) }}
            </div>

            <!-- 마지막 로그인 -->
            <div class="mt-2 text-sm text-gray-500">
              <Icon name="users" size="sm" class="mr-1 inline" />
              마지막 로그인: {{ formatDate(authStore.user?.lastLoginAt) }}
            </div>
          </div>

          <!-- 프로필 사진 변경 버튼 (향후 구현) -->
          <div class="mt-6">
            <button
                class="w-full btn-secondary"
                disabled
                title="프로필 사진 변경 기능은 준비 중입니다"
            >
              <Icon name="upload" size="sm" class="mr-2" />
              프로필 사진 변경
            </button>
          </div>
        </div>

        <!-- 계정 상태 카드 -->
        <div class="card p-6 mt-6">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">계정 상태</h4>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">계정 상태</span>
              <Badge
                  :variant="authStore.user?.isActive ? 'success' : 'danger'"
                  :text="authStore.user?.isActive ? '활성' : '비활성'"
              />
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">이메일 인증</span>
              <Badge
                  :variant="authStore.user?.emailVerified ? 'success' : 'warning'"
                  :text="authStore.user?.emailVerified ? '인증됨' : '미인증'"
              />
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">2단계 인증</span>
              <Badge
                  :variant="authStore.user?.twoFactorEnabled ? 'success' : 'gray'"
                  :text="authStore.user?.twoFactorEnabled ? '활성화' : '비활성화'"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 개인정보 수정 폼 -->
      <div class="lg:col-span-2">
        <div class="card p-6">
          <h4 class="text-lg font-semibold text-gray-900 mb-6">개인정보 수정</h4>

          <form @submit.prevent="handleSubmit" class="space-y-6">
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
              >
              <p class="text-xs text-gray-500 mt-1">
                사용자명은 로그인 시 사용됩니다
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
              <p class="text-xs text-gray-500 mt-1">
                이메일 변경 시 재인증이 필요합니다
              </p>
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
                  rows="4"
                  placeholder="간단한 자기소개를 입력하세요"
                  maxlength="500"
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">
                {{ form.bio?.length || 0 }}/500자
              </p>
            </div>

            <!-- 알림 설정 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                알림 설정
              </label>
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

            <!-- 버튼 영역 -->
            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                  type="button"
                  @click="resetForm"
                  class="btn-secondary"
                  :disabled="authStore.loading"
              >
                초기화
              </button>
              <button
                  type="submit"
                  class="btn-primary"
                  :disabled="!isFormValid || authStore.loading"
              >
                <Icon
                    v-if="authStore.loading"
                    name="analytics"
                    size="sm"
                    class="mr-2 animate-spin"
                />
                저장하기
              </button>
            </div>
          </form>
        </div>

        <!-- 비밀번호 변경 카드 -->
        <div class="card p-6 mt-6">
          <h4 class="text-lg font-semibold text-gray-900 mb-6">비밀번호 변경</h4>

          <form @submit.prevent="handlePasswordChange" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                현재 비밀번호 *
              </label>
              <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  class="form-input"
                  placeholder="현재 비밀번호를 입력하세요"
                  required
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                새 비밀번호 *
              </label>
              <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="form-input"
                  placeholder="새 비밀번호를 입력하세요"
                  required
                  minlength="8"
              >
              <p class="text-xs text-gray-500 mt-1">
                최소 8자 이상, 영문/숫자/특수문자 조합
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                새 비밀번호 확인 *
              </label>
              <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="form-input"
                  placeholder="새 비밀번호를 다시 입력하세요"
                  required
              >
            </div>

            <div class="flex justify-end pt-4">
              <button
                  type="submit"
                  class="btn-warning"
                  :disabled="!isPasswordFormValid || authStore.loading"
              >
                <Icon
                    v-if="authStore.loading"
                    name="analytics"
                    size="sm"
                    class="mr-2 animate-spin"
                />
                비밀번호 변경
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 인증 미들웨어 적용
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const toast = useGlobalToast()

// 폼 데이터
const form = ref({
  fullName: '',
  username: '',
  email: '',
  phoneNumber: '',
  department: '',
  position: '',
  bio: '',
  emailNotifications: true,
  pushNotifications: true,
  marketingEmails: false
})

// 비밀번호 변경 폼
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 계산된 속성
const isFormValid = computed(() => {
  return form.value.fullName?.trim() &&
      form.value.username?.trim() &&
      form.value.email?.trim()
})

const isPasswordFormValid = computed(() => {
  return passwordForm.value.currentPassword &&
      passwordForm.value.newPassword &&
      passwordForm.value.confirmPassword &&
      passwordForm.value.newPassword === passwordForm.value.confirmPassword &&
      passwordForm.value.newPassword.length >= 8
})

// 사용자 정보 로드
onMounted(async () => {
  if (authStore.user) {
    loadUserData()
  } else {
    await authStore.getCurrentUser()
    loadUserData()
  }
})

// 사용자 데이터를 폼에 로드
const loadUserData = () => {
  if (authStore.user) {
    form.value = {
      fullName: authStore.user.fullName || '',
      username: authStore.user.username || '',
      email: authStore.user.email || '',
      phoneNumber: authStore.user.phoneNumber || '',
      department: authStore.user.department || '',
      position: authStore.user.position || '',
      bio: authStore.user.bio || '',
      emailNotifications: authStore.user.emailNotifications ?? true,
      pushNotifications: authStore.user.pushNotifications ?? true,
      marketingEmails: authStore.user.marketingEmails ?? false
    }
  }
}

// 유틸리티 함수
const getUserInitials = () => {
  const user = authStore.user
  if (!user || !user.fullName) return '?'

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

const formatDate = (dateString) => {
  if (!dateString) return '정보 없음'
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 폼 제출 처리
const handleSubmit = async () => {
  try {
    await authStore.updateProfile(form.value)
    toast.success('개인정보가 성공적으로 업데이트되었습니다.')
  } catch (error) {
    console.error('Profile update failed:', error)
  }
}

// 비밀번호 변경 처리
const handlePasswordChange = async () => {
  try {
    await authStore.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
      confirmPassword: passwordForm.value.confirmPassword
    })

    // 폼 초기화
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }

    toast.success('비밀번호가 성공적으로 변경되었습니다.')
  } catch (error) {
    console.error('Password change failed:', error)
  }
}

// 폼 초기화
const resetForm = () => {
  loadUserData()
  toast.info('폼이 초기화되었습니다.')
}

// SEO 메타데이터
useHead({
  title: '개인정보 수정 - Shop BackOffice',
  meta: [
    { name: 'description', content: '개인정보를 확인하고 수정할 수 있습니다' }
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