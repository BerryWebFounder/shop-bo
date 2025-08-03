<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- 사이드바 -->
    <div
        class="fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0"
        :class="{ '-translate-x-full': !mainStore.sidebarOpen, 'translate-x-0': mainStore.sidebarOpen }"
    >
      <!-- 로고 영역 -->
      <div class="flex items-center justify-center h-16 bg-primary-600 text-white">
        <h1 class="text-xl font-bold">Shop BackOffice</h1>
      </div>

      <!-- 네비게이션 메뉴 -->
      <nav class="mt-8 px-4">
        <div class="space-y-2">
          <NuxtLink
              to="/"
              class="nav-link"
              :class="$route.path === '/' ? 'nav-link-active' : 'nav-link-inactive'"
              @click="mainStore.closeSidebar"
          >
            <Icon name="dashboard" size="sm" class="mr-3" />
            대시보드
          </NuxtLink>

          <NuxtLink
              to="/users"
              class="nav-link"
              :class="$route.path.startsWith('/users') ? 'nav-link-active' : 'nav-link-inactive'"
              @click="mainStore.closeSidebar"
              v-if="authStore.isModerator"
          >
            <Icon name="users" size="sm" class="mr-3" />
            사용자 관리
          </NuxtLink>

          <NuxtLink
              to="/orders"
              class="nav-link"
              :class="$route.path.startsWith('/orders') ? 'nav-link-active' : 'nav-link-inactive'"
              @click="mainStore.closeSidebar"
              v-if="authStore.isModerator"
          >
            <Icon name="orders" size="sm" class="mr-3" />
            주문 관리
          </NuxtLink>

          <NuxtLink
              to="/products"
              class="nav-link"
              :class="$route.path.startsWith('/products') ? 'nav-link-active' : 'nav-link-inactive'"
              @click="mainStore.closeSidebar"
              v-if="authStore.isModerator"
          >
            <Icon name="products" size="sm" class="mr-3" />
            상품 관리
          </NuxtLink>

          <NuxtLink
              to="/boards"
              class="nav-link"
              :class="$route.path.startsWith('/boards') ? 'nav-link-active' : 'nav-link-inactive'"
              @click="mainStore.closeSidebar"
          >
            <Icon name="boards" size="sm" class="mr-3" />
            게시판 관리
          </NuxtLink>

          <NuxtLink
              to="/analytics"
              class="nav-link"
              :class="$route.path.startsWith('/analytics') ? 'nav-link-active' : 'nav-link-inactive'"
              @click="mainStore.closeSidebar"
              v-if="authStore.isModerator"
          >
            <Icon name="analytics" size="sm" class="mr-3" />
            분석
          </NuxtLink>

          <NuxtLink
              to="/settings"
              class="nav-link"
              :class="$route.path.startsWith('/settings') ? 'nav-link-active' : 'nav-link-inactive'"
              @click="mainStore.closeSidebar"
          >
            <Icon name="settings" size="sm" class="mr-3" />
            설정
          </NuxtLink>

          <!-- 관리자 전용 메뉴 -->
          <div v-if="authStore.isAdmin" class="pt-4 mt-4 border-t border-gray-200">
            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              관리자 메뉴
            </div>

            <NuxtLink
                to="/admin/users"
                class="nav-link"
                :class="$route.path.startsWith('/admin/users') ? 'nav-link-active' : 'nav-link-inactive'"
                @click="mainStore.closeSidebar"
            >
              <Icon name="users" size="sm" class="mr-3" />
              사용자 관리
            </NuxtLink>

            <NuxtLink
                to="/admin/system"
                class="nav-link"
                :class="$route.path.startsWith('/admin/system') ? 'nav-link-active' : 'nav-link-inactive'"
                @click="mainStore.closeSidebar"
            >
              <Icon name="settings" size="sm" class="mr-3" />
              시스템 관리
            </NuxtLink>
          </div>
        </div>
      </nav>

      <!-- 사용자 정보 -->
      <div class="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t">
        <div v-if="authStore.user" class="flex items-center">
          <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {{ getUserInitials(authStore.user) }}
          </div>
          <div class="ml-3 flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ authStore.user.fullName }}</p>
            <p class="text-xs text-gray-500 truncate">{{ authStore.user.email }}</p>
            <div class="flex items-center mt-1">
              <Badge
                  :variant="getRoleVariant(authStore.user.role)"
                  :text="authStore.user.roleDisplayName"
                  size="sm"
              />
            </div>
          </div>
        </div>
        <div v-else class="flex items-center justify-center">
          <div class="animate-pulse bg-gray-300 h-8 w-8 rounded-full"></div>
          <div class="ml-3 flex-1">
            <div class="animate-pulse bg-gray-300 h-4 w-24 rounded mb-1"></div>
            <div class="animate-pulse bg-gray-300 h-3 w-32 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 사이드바 오버레이 (모바일) -->
    <div
        v-if="mainStore.sidebarOpen"
        class="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
        @click="mainStore.closeSidebar"
    ></div>

    <!-- 메인 콘텐츠 영역 -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- 헤더 -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- 메뉴 버튼 (모바일) -->
            <button
                type="button"
                class="lg:hidden -ml-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                @click="mainStore.toggleSidebar"
            >
              <Icon name="menu" size="md" />
            </button>

            <!-- 페이지 제목 -->
            <div class="flex-1 px-4 lg:px-0">
              <h1 class="text-2xl font-semibold text-gray-900">
                {{ pageTitle }}
              </h1>
            </div>

            <!-- 헤더 우측 영역 -->
            <div class="flex items-center space-x-4">
              <!-- 사용자 정보 표시 (데스크톱) -->
              <div class="hidden lg:flex items-center space-x-3 text-sm text-gray-600">
                <span v-if="authStore.user">{{ authStore.user.fullName }}</span>
                <Badge
                    v-if="authStore.user"
                    :variant="getRoleVariant(authStore.user.role)"
                    :text="authStore.user.roleDisplayName"
                    size="sm"
                />
              </div>

              <!-- 알림 버튼 -->
              <button
                  type="button"
                  class="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                  title="알림"
              >
                <Icon name="notification" size="md" />
              </button>

              <!-- 사용자 메뉴 -->
              <div class="relative">
                <button
                    type="button"
                    @click="showUserMenu = !showUserMenu"
                    class="flex items-center space-x-2 p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <div v-if="authStore.user" class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {{ getUserInitials(authStore.user) }}
                  </div>
                  <div v-else class="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                  <Icon name="arrow-down" size="sm" />
                </button>

                <!-- 사용자 드롭다운 메뉴 -->
                <div
                    v-if="showUserMenu"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                    @click.stop
                >
                  <NuxtLink
                      to="/profile"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      @click="showUserMenu = false"
                  >
                    <Icon name="users" size="sm" class="mr-2 inline" />
                    내 프로필
                  </NuxtLink>

                  <NuxtLink
                      to="/profile/settings"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      @click="showUserMenu = false"
                  >
                    <Icon name="settings" size="sm" class="mr-2 inline" />
                    계정 설정
                  </NuxtLink>

                  <div class="border-t border-gray-100"></div>

                  <button
                      @click="handleLogout"
                      class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <Icon name="close" size="sm" class="mr-2 inline" />
                    로그아웃
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- 메인 콘텐츠 -->
      <main class="flex-1 overflow-y-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <slot />
        </div>
      </main>
    </div>

    <!-- 로딩 오버레이 -->
    <div
        v-if="mainStore.loading || authStore.loading"
        class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg p-6 flex items-center space-x-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span class="text-gray-700">로딩 중...</span>
      </div>
    </div>

    <!-- 토스트 알림 -->
    <ToastContainer />

    <!-- 로그아웃 확인 모달 -->
    <div
        v-if="showLogoutModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="showLogoutModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
              <Icon name="notification" size="md" color="yellow" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">로그아웃</h3>
              <p class="text-sm text-gray-500">정말 로그아웃하시겠습니까?</p>
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <button
                type="button"
                @click="showLogoutModal = false"
                class="btn-secondary"
            >
              취소
            </button>
            <button
                @click="confirmLogout"
                class="btn-danger"
                :disabled="authStore.loading"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const mainStore = useMainStore()
const authStore = useAuthStore()

// 인증 미들웨어 적용
definePageMeta({
  middleware: 'auth'
})

// 반응형 데이터
const showUserMenu = ref(false)
const showLogoutModal = ref(false)

// 페이지 제목 계산
const pageTitle = computed(() => {
  const titleMap = {
    '/': '대시보드',
    '/users': '사용자 관리',
    '/orders': '주문 관리',
    '/products': '상품 관리',
    '/boards': '게시판 관리',
    '/analytics': '분석',
    '/settings': '설정',
    '/profile': '내 프로필',
    '/admin/users': '사용자 관리',
    '/admin/system': '시스템 관리'
  }

  // 상세 페이지 처리
  if (route.path.startsWith('/boards/')) {
    if (route.path.includes('/posts/')) {
      return '게시글 관리'
    }
    return '게시판 관리'
  }

  return titleMap[route.path] || '페이지'
})

// 초기화
onMounted(async () => {
  // 인증 스토어 초기화
  await authStore.initialize()

  // 메인 스토어 초기화
  await mainStore.initialize()
})

// 사용자 이니셜 생성
const getUserInitials = (user) => {
  if (!user || !user.fullName) return '?'

  return user.fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
}

// 역할에 따른 배지 색상
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

// 로그아웃 처리
const handleLogout = () => {
  showUserMenu.value = false
  showLogoutModal.value = true
}

const confirmLogout = async () => {
  try {
    await authStore.logout()
    showLogoutModal.value = false
    await router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// 외부 클릭시 사용자 메뉴 닫기
onMounted(() => {
  document.addEventListener('click', (event) => {
    if (showUserMenu.value) {
      showUserMenu.value = false
    }
  })
})

// 반응형 사이드바 처리
const handleResize = () => {
  if (window.innerWidth >= 1024) {
    mainStore.closeSidebar()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* 커스텀 스크롤바 */
main::-webkit-scrollbar {
  width: 6px;
}

main::-webkit-scrollbar-track {
  background: #f1f1f1;
}

main::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

main::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 사이드바 애니메이션 */
@media (max-width: 1023px) {
  .transform {
    transition: transform 0.3s ease-in-out;
  }
}

/* 드롭다운 애니메이션 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 펄스 애니메이션 */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

/* 스핀 애니메이션 */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>