<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- 헤더 -->
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center bg-primary-600 rounded-full">
          <Icon name="dashboard" size="lg" class="text-white" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Shop BackOffice
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          관리자 로그인
        </p>
      </div>

      <!-- 로그인 폼 -->
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm space-y-4">
          <!-- 사용자명 또는 이메일 -->
          <div>
            <label for="usernameOrEmail" class="sr-only">
              사용자명 또는 이메일
            </label>
            <input
                id="usernameOrEmail"
                v-model="form.usernameOrEmail"
                type="text"
                autocomplete="username"
                required
                class="form-input relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="사용자명 또는 이메일"
                :disabled="authStore.loginLoading"
            >
          </div>

          <!-- 비밀번호 -->
          <div>
            <label for="password" class="sr-only">
              비밀번호
            </label>
            <input
                id="password"
                v-model="form.password"
                type="password"
                autocomplete="current-password"
                required
                class="form-input relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="비밀번호"
                :disabled="authStore.loginLoading"
            >
          </div>
        </div>

        <!-- 로그인 유지 및 비밀번호 찾기 -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
                id="rememberMe"
                v-model="form.rememberMe"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                :disabled="authStore.loginLoading"
            >
            <label for="rememberMe" class="ml-2 block text-sm text-gray-900">
              로그인 유지
            </label>
          </div>

          <div class="text-sm">
            <button
                type="button"
                @click="showPasswordReset = true"
                class="font-medium text-primary-600 hover:text-primary-500"
                :disabled="authStore.loginLoading"
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>
        </div>

        <!-- 로그인 버튼 -->
        <div>
          <button
              type="submit"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!isFormValid || authStore.loginLoading"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <Icon
                  v-if="authStore.loginLoading"
                  name="analytics"
                  size="sm"
                  class="animate-spin"
              />
              <Icon
                  v-else
                  name="users"
                  size="sm"
              />
            </span>
            {{ authStore.loginLoading ? '로그인 중...' : '로그인' }}
          </button>
        </div>

        <!-- 에러 메시지 -->
        <div v-if="errorMessage" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <Icon name="close" size="sm" class="text-red-400" />
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                로그인 실패
              </h3>
              <div class="mt-2 text-sm text-red-700">
                {{ errorMessage }}
              </div>
            </div>
          </div>
        </div>

        <!-- 성공 메시지 -->
        <div v-if="successMessage" class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <Icon name="plus" size="sm" class="text-green-400" />
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">
                성공
              </h3>
              <div class="mt-2 text-sm text-green-700">
                {{ successMessage }}
              </div>
            </div>
          </div>
        </div>
      </form>

      <!-- 회원가입 링크 -->
      <div class="text-center">
        <p class="text-sm text-gray-600">
          계정이 없으신가요?
          <button
              @click="showRegister = true"
              class="font-medium text-primary-600 hover:text-primary-500"
          >
            회원가입
          </button>
        </p>
      </div>
    </div>

    <!-- 비밀번호 재설정 모달 -->
    <div
        v-if="showPasswordReset"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="showPasswordReset = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">비밀번호 재설정</h3>
        </div>
        <div class="p-6">
          <p class="text-gray-600 mb-4">
            가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
          </p>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              이메일 주소
            </label>
            <input
                v-model="resetEmail"
                type="email"
                class="form-input w-full"
                placeholder="이메일을 입력하세요"
                required
            >
          </div>
          <div class="flex justify-end space-x-3">
            <button
                @click="showPasswordReset = false"
                class="btn-secondary"
            >
              취소
            </button>
            <button
                @click="handlePasswordReset"
                class="btn-primary"
                :disabled="!resetEmail || authStore.loading"
            >
              재설정 이메일 발송
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 회원가입 모달 -->
    <div
        v-if="showRegister"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="showRegister = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">회원가입</h3>
        </div>
        <div class="p-6">
          <form @submit.prevent="handleRegister" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                사용자명
              </label>
              <input
                  v-model="registerForm.username"
                  type="text"
                  class="form-input w-full"
                  placeholder="사용자명을 입력하세요"
                  required
                  minlength="3"
                  maxlength="50"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                  v-model="registerForm.email"
                  type="email"
                  class="form-input w-full"
                  placeholder="이메일을 입력하세요"
                  required
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <input
                  v-model="registerForm.fullName"
                  type="text"
                  class="form-input w-full"
                  placeholder="이름을 입력하세요"
                  required
                  maxlength="100"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                  v-model="registerForm.password"
                  type="password"
                  class="form-input w-full"
                  placeholder="비밀번호를 입력하세요"
                  required
                  minlength="8"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인
              </label>
              <input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  class="form-input w-full"
                  placeholder="비밀번호를 다시 입력하세요"
                  required
              >
            </div>
            <div class="flex justify-end space-x-3 pt-4">
              <button
                  type="button"
                  @click="showRegister = false"
                  class="btn-secondary"
              >
                취소
              </button>
              <button
                  type="submit"
                  class="btn-primary"
                  :disabled="!isRegisterFormValid || authStore.loading"
              >
                회원가입
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false,
  auth: false
})

const authStore = useAuthStore()
const router = useRouter()

// 반응형 데이터
const form = ref({
  usernameOrEmail: '',
  password: '',
  rememberMe: false
})

const registerForm = ref({
  username: '',
  email: '',
  fullName: '',
  password: '',
  confirmPassword: ''
})

const errorMessage = ref('')
const successMessage = ref('')
const showPasswordReset = ref(false)
const showRegister = ref(false)
const resetEmail = ref('')

// 계산된 속성
const isFormValid = computed(() => {
  return form.value.usernameOrEmail.trim() && form.value.password.trim()
})

const isRegisterFormValid = computed(() => {
  return registerForm.value.username.trim() &&
      registerForm.value.email.trim() &&
      registerForm.value.fullName.trim() &&
      registerForm.value.password.trim() &&
      registerForm.value.confirmPassword.trim() &&
      registerForm.value.password === registerForm.value.confirmPassword
})

// 이미 로그인된 경우 대시보드로 리다이렉트
onMounted(() => {
  if (authStore.isLoggedIn) {
    router.push('/')
  }
})

// 로그인 처리
const handleLogin = async () => {
  try {
    errorMessage.value = ''
    successMessage.value = ''

    await authStore.login({
      usernameOrEmail: form.value.usernameOrEmail.trim(),
      password: form.value.password,
      rememberMe: form.value.rememberMe
    })

    successMessage.value = '로그인되었습니다. 잠시만 기다려주세요...'

    // 로그인 성공 후 대시보드로 이동
    setTimeout(() => {
      router.push('/')
    }, 1000)

  } catch (error) {
    errorMessage.value = error.message || '로그인에 실패했습니다.'
  }
}

// 회원가입 처리
const handleRegister = async () => {
  try {
    if (registerForm.value.password !== registerForm.value.confirmPassword) {
      return
    }

    await authStore.register({
      username: registerForm.value.username.trim(),
      email: registerForm.value.email.trim(),
      fullName: registerForm.value.fullName.trim(),
      password: registerForm.value.password,
      confirmPassword: registerForm.value.confirmPassword
    })

    showRegister.value = false
    successMessage.value = '회원가입이 완료되었습니다. 이메일 인증을 진행해주세요.'

    // 폼 초기화
    registerForm.value = {
      username: '',
      email: '',
      fullName: '',
      password: '',
      confirmPassword: ''
    }

  } catch (error) {
    // 에러는 스토어에서 토스트로 처리됨
  }
}

// 비밀번호 재설정 처리
const handlePasswordReset = async () => {
  try {
    if (!resetEmail.value.trim()) {
      return
    }

    await authStore.requestPasswordReset(resetEmail.value.trim())

    showPasswordReset.value = false
    successMessage.value = '비밀번호 재설정 이메일이 발송되었습니다.'
    resetEmail.value = ''

  } catch (error) {
    // 에러는 스토어에서 토스트로 처리됨
  }
}

// SEO 메타데이터
useHead({
  title: '로그인 - Shop BackOffice',
  meta: [
    { name: 'description', content: 'Shop BackOffice 관리자 로그인' },
    { name: 'robots', content: 'noindex, nofollow' }
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

/* 로그인 폼 커스텀 스타일 */
.form-input:focus {
  @apply ring-2 ring-primary-500 border-primary-500;
}

/* 비활성화된 버튼 스타일 */
button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* 모달 애니메이션 */
.modal-overlay {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>