<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
        <!-- 에러 아이콘 -->
        <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full mb-6"
             :class="errorIcon.bgColor">
          <Icon :name="errorIcon.name" size="xl" :color="errorIcon.color" />
        </div>

        <!-- 에러 메시지 -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            {{ error.statusCode || '오류' }}
          </h1>
          <h2 class="text-lg font-medium text-gray-600 mb-4">
            {{ getErrorTitle() }}
          </h2>
          <p class="text-gray-500">
            {{ getErrorMessage() }}
          </p>
        </div>

        <!-- 액션 버튼들 -->
        <div class="space-y-3">
          <button
              @click="handleError"
              class="w-full btn-primary"
          >
            <Icon name="analytics" size="sm" class="mr-2" />
            다시 시도
          </button>

          <NuxtLink
              to="/"
              class="w-full btn-secondary inline-flex items-center justify-center"
          >
            <Icon name="dashboard" size="sm" class="mr-2" />
            홈으로 돌아가기
          </NuxtLink>
        </div>

        <!-- 개발 환경에서만 표시 -->
        <div v-if="isDev && error.stack" class="mt-8 text-left">
          <details class="bg-gray-100 rounded p-4">
            <summary class="cursor-pointer text-sm font-medium text-gray-700">
              상세 오류 정보 (개발자용)
            </summary>
            <pre class="mt-2 text-xs text-gray-600 overflow-auto">{{ error.stack }}</pre>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 에러 정보 받기
const props = defineProps({
  error: {
    type: Object,
    required: true
  }
})

// 개발 환경 확인
const isDev = process.dev

// 에러 타입별 아이콘 설정
const errorIcon = computed(() => {
  const statusCode = props.error.statusCode

  switch (statusCode) {
    case 404:
      return {
        name: 'search',
        color: 'blue',
        bgColor: 'bg-blue-100'
      }
    case 403:
      return {
        name: 'close',
        color: 'red',
        bgColor: 'bg-red-100'
      }
    case 500:
      return {
        name: 'settings',
        color: 'yellow',
        bgColor: 'bg-yellow-100'
      }
    default:
      return {
        name: 'notification',
        color: 'gray',
        bgColor: 'bg-gray-100'
      }
  }
})

// 에러 제목 생성
const getErrorTitle = () => {
  const statusCode = props.error.statusCode

  switch (statusCode) {
    case 404:
      return '페이지를 찾을 수 없습니다'
    case 403:
      return '접근이 거부되었습니다'
    case 500:
      return '서버 내부 오류'
    case 401:
      return '인증이 필요합니다'
    default:
      return '오류가 발생했습니다'
  }
}

// 에러 메시지 생성
const getErrorMessage = () => {
  const statusCode = props.error.statusCode

  switch (statusCode) {
    case 404:
      return '요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.'
    case 403:
      return '이 페이지에 접근할 권한이 없습니다. 관리자에게 문의하세요.'
    case 500:
      return '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    case 401:
      return '로그인이 필요한 페이지입니다. 다시 로그인해주세요.'
    default:
      return props.error.statusMessage || '알 수 없는 오류가 발생했습니다.'
  }
}

// 에러 처리
const handleError = () => {
  const statusCode = props.error.statusCode

  if (statusCode === 401) {
    // 인증 오류 시 로그인 페이지로
    navigateTo('/login')
  } else {
    // 기본적으로 페이지 새로고침
    location.reload()
  }
}

// SEO 설정
useHead({
  title: `오류 ${props.error.statusCode || ''} - Shop BackOffice`,
  meta: [
    { name: 'robots', content: 'noindex' }
  ]
})
</script>