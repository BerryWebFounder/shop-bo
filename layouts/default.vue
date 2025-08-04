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
                  class="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                  title="알림"
              >
                <Icon name="notification" size="md" />
                <!-- 알림 뱃지 (새로운 알림이 있을 때) -->
                <span v-if="hasNewNotifications" class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <!-- 사용자 메뉴 드롭다운 -->
              <div class="relative" ref="userMenuRef">
                <button
                    type="button"
                    @click.stop="showUserMenu = !showUserMenu"
                    class="flex items-center space-x-2 p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                >
                  <!-- 사용자 아바타 -->
                  <div v-if="authStore.user" class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {{ getUserInitials(authStore.user) }}
                  </div>
                  <div v-else class="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>

                  <!-- 드롭다운 화살표 -->
                  <Icon
                      name="arrow-down"
                      size="sm"
                      :class="{ 'rotate-180': showUserMenu }"
                      class="transition-transform duration-200"
                  />
                </button>

                <!-- 드롭다운 메뉴 -->
                <Transition
                    enter-active-class="transition ease-out duration-200"
                    enter-from-class="opacity-0 scale-95"
                    enter-to-class="opacity-100 scale-100"
                    leave-active-class="transition ease-in duration-75"
                    leave-from-class="opacity-100 scale-100"
                    leave-to-class="opacity-0 scale-95"
                >
                  <div
                      v-if="showUserMenu"
                      class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200 ring-1 ring-black ring-opacity-5"
                      @click.stop
                  >
                    <!-- 사용자 정보 헤더 -->
                    <div v-if="authStore.user" class="px-4 py-3 border-b border-gray-100">
                      <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                          {{ getUserInitials(authStore.user) }}
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium text-gray-900 truncate">
                            {{ authStore.user.fullName }}
                          </p>
                          <p class="text-xs text-gray-500 truncate">
                            {{ authStore.user.email }}
                          </p>
                          <Badge
                              :variant="getRoleVariant(authStore.user.role)"
                              :text="authStore.user.roleDisplayName"
                              size="sm"
                              class="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- 메뉴 항목들 -->
                    <div class="py-1">
                      <!-- 개인정보 수정 -->
                      <button
                          @click="goToProfile"
                          class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          role="menuitem"
                      >
                        <Icon name="users" size="sm" class="mr-3 text-gray-400" />
                        <span>개인정보 수정</span>
                      </button>

                      <!-- 계정 설정 -->
                      <button
                          @click="goToSettings"
                          class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          role="menuitem"
                      >
                        <Icon name="settings" size="sm" class="mr-3 text-gray-400" />
                        <span>계정 설정</span>
                      </button>

                      <!-- 내 활동 -->
                      <button
                          @click="goToMyActivity"
                          class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          role="menuitem"
                      >
                        <Icon name="analytics" size="sm" class="mr-3 text-gray-400" />
                        <span>내 활동</span>
                      </button>

                      <!-- 도움말 -->
                      <button
                          @click="goToHelp"
                          class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          role="menuitem"
                      >
                        <Icon name="notification" size="sm" class="mr-3 text-gray-400" />
                        <span>도움말</span>
                      </button>
                    </div>

                    <!-- 구분선 -->
                    <div class="border-t border-gray-100 my-1"></div>

                    <!-- 로그아웃 -->
                    <div class="py-1">
                      <button
                          @click="handleLogout"
                          class="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-900 transition-colors"
                          role="menuitem"
                      >
                        <Icon name="close" size="sm" class="mr-3 text-red-400" />
                        <span>로그아웃</span>
                      </button>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>

            <!-- 로그아웃 확인 모달 -->
            <div
                v-if="showLogoutModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                @click.self="showLogoutModal = false"
            >
              <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div class="p-6">
                  <div class="flex items-center mb-4">
                    <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                      <Icon name="notification" size="lg" color="yellow" />
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900">로그아웃 확인</h3>
                      <p class="text-sm text-gray-500">정말 로그아웃하시겠습니까?</p>
                    </div>
                  </div>

                  <p class="text-gray-600 mb-6">
                    현재 작업 중인 내용이 저장되지 않을 수 있습니다.
                  </p>

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
                      <Icon
                          v-if="authStore.loading"
                          name="analytics"
                          size="sm"
                          class="mr-2 animate-spin"
                      />
                      로그아웃
                    </button>
                  </div>
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
const toast = useGlobalToast()

// 인증 미들웨어 적용
definePageMeta({
  middleware: 'auth'
})

// 반응형 데이터
const showUserMenu = ref(false)
const showLogoutModal = ref(false)
const hasNewNotifications = ref(false) // 새 알림 여부
const userMenuRef = ref(null) // 드롭다운 메뉴 참조

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
    '/profile/settings': '계정 설정',
    '/profile/activity': '내 활동',
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

  // 알림 상태 확인 (예시)
  checkNotifications()
})

// 알림 확인 (예시 함수)
const checkNotifications = () => {
  // 실제로는 API에서 알림 상태를 확인
  // 임시로 랜덤하게 설정
  hasNewNotifications.value = Math.random() > 0.7
}

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

// 네비게이션 함수들
const goToProfile = () => {
  showUserMenu.value = false
  router.push('/profile')
}

const goToSettings = () => {
  showUserMenu.value = false
  router.push('/profile/settings')
}

const goToMyActivity = () => {
  showUserMenu.value = false
  router.push('/profile/activity')
}

const goToHelp = () => {
  showUserMenu.value = false
  // 도움말 페이지나 외부 링크로 이동
  window.open('/help', '_blank')
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

    // 성공 메시지
    toast.success('안전하게 로그아웃되었습니다.')

    // 로그인 페이지로 이동
    await router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
    toast.error('로그아웃 중 오류가 발생했습니다.')
  }
}

const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showUserMenu.value = false
  }
}

// 이벤트 리스너 등록/해제
onMounted(() => {
  // 약간의 지연을 두고 이벤트 리스너 등록 (드롭다운 버튼 클릭과 충돌 방지)
  nextTick(() => {
    document.addEventListener('click', handleClickOutside)
  })

  // ESC 키로 드롭다운 닫기
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      showUserMenu.value = false
      showLogoutModal.value = false
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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

// 키보드 네비게이션 (접근성 개선)
const handleMenuKeydown = (event) => {
  if (!showUserMenu.value) return

  const menuItems = document.querySelectorAll('[role="menuitem"]')
  const currentIndex = Array.from(menuItems).findIndex(item =>
      item === document.activeElement
  )

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      const nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0
      menuItems[nextIndex]?.focus()
      break
    case 'ArrowUp':
      event.preventDefault()
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1
      menuItems[prevIndex]?.focus()
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      document.activeElement?.click()
      break
    case 'Escape':
      event.preventDefault()
      showUserMenu.value = false
      break
  }
}

// 드롭다운 메뉴가 열릴 때 첫 번째 항목에 포커스
watch(showUserMenu, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      const firstMenuItem = document.querySelector('[role="menuitem"]')
      firstMenuItem?.focus()
    })
  }
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