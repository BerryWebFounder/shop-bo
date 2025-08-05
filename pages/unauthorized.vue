<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
        <!-- 권한 없음 아이콘 -->
        <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
          <Icon name="close" size="xl" color="red" />
        </div>

        <!-- 메시지 -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">403</h1>
          <h2 class="text-lg font-medium text-gray-600 mb-4">접근 권한 없음</h2>
          <p class="text-gray-500">
            이 페이지에 접근할 권한이 없습니다.<br>
            관리자 권한이 필요한 페이지입니다.
          </p>
        </div>

        <!-- 사용자 정보 -->
        <div v-if="authStore.user" class="mb-6 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-center space-x-3">
            <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
              {{ getUserInitials() }}
            </div>
            <div class="text-left">
              <p class="text-sm font-medium text-gray-900">{{ authStore.user.fullName }}</p>
              <p class="text-xs text-gray-500">{{ authStore.user.email }}</p>
              <Badge
                  :variant="getRoleVariant(authStore.user.role)"
                  :text="getRoleDisplayName(authStore.user.role)"
                  size="sm"
                  class="mt-1"
              />
            </div>
          </div>
        </div>

        <!-- 액션 버튼들 -->
        <div class="space-y-3">
          <NuxtLink
              to="/"
              class="w-full btn-primary inline-flex items-center justify-center"
          >
            <Icon name="dashboard" size="sm" class="mr-2" />
            대시보드로 돌아가기
          </NuxtLink>

          <button
              @click="requestAccess"
              class="w-full btn-secondary"
          >
            <Icon name="notification" size="sm" class="mr-2" />
            권한 요청하기
          </button>

          <button
              @click="logout"
              class="w-full btn-danger"
          >
            <Icon name="users" size="sm" class="mr-2" />
            다른 계정으로 로그인
          </button>
        </div>

        <!-- 연락처 정보 -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <p class="text-xs text-gray-500">
            권한이 필요하시면 시스템 관리자에게 문의하세요.<br>
            <a href="mailto:admin@shop.com" class="text-primary-600 hover:text-primary-500">
              admin@shop.com
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 페이지 메타데이터
definePageMeta({
  layout: false, // 기본 레이아웃 사용 안함
  auth: false    // 인증 미들웨어 스킵
})

const authStore = useAuthStore()
const router = useRouter()

// 사용자 이니셜 생성
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

// 역할 표시 함수들
const getRoleDisplayName = (role) => {
  switch (role) {
    case 'ADMIN':
      return '관리자'
    case 'SYSOP':
      return '운영자'
    case 'USER':
    default:
      return '일반 사용자'
  }
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

// 권한 요청
const requestAccess = () => {
  alert('권한 요청 기능은 준비 중입니다. 관리자에게 직접 문의해주세요.')
}

// 로그아웃
const logout = async () => {
  try {
    await authStore.logout()
    await router.push('/login')
  } catch (error) {
    console.error('로그아웃 실패:', error)
  }
}

// SEO 설정
useHead({
  title: '접근 권한 없음 - Shop BackOffice',
  meta: [
    { name: 'robots', content: 'noindex' }
  ]
})
</script>