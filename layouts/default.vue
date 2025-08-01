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
          >
            <Icon name="users" size="sm" class="mr-3" />
            사용자 관리
          </NuxtLink>

          <NuxtLink
              to="/orders"
              class="nav-link"
              :class="$route.path.startsWith('/orders') ? 'nav-link-active' : 'nav-link-inactive'"
              @click="mainStore.closeSidebar"
          >
            <Icon name="orders" size="sm" class="mr-3" />
            주문 관리
          </NuxtLink>

          <NuxtLink
              to="/products"
              class="nav-link"
              :class="$route.path.startsWith('/products') ? 'nav-link-active' : 'nav-link-inactive'"
              @click="mainStore.closeSidebar"
          >
            <Icon name="products" size="sm" class="mr-3" />
            상품 관리
          </NuxtLink>

          <NuxtLink
              to="/analytics"
              class="nav-link"
              :class="$route.path.startsWith('/analytics') ? 'nav-link-active' : 'nav-link-inactive'"
              @click="mainStore.closeSidebar"
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
        </div>
      </nav>

      <!-- 사용자 정보 -->
      <div class="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {{ mainStore.userInitials }}
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">{{ mainStore.user.name }}</p>
            <p class="text-xs text-gray-500">{{ mainStore.user.email }}</p>
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
              <!-- 알림 버튼 -->
              <button
                  type="button"
                  class="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <Icon name="notification" size="md" />
              </button>

              <!-- 사용자 메뉴 -->
              <div class="relative">
                <button
                    type="button"
                    class="flex items-center space-x-2 p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {{ mainStore.userInitials }}
                  </div>
                  <Icon name="arrow-down" size="sm" />
                </button>
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
        v-if="mainStore.loading"
        class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg p-6 flex items-center space-x-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span class="text-gray-700">로딩 중...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const mainStore = useMainStore()

// 페이지 제목 계산
const pageTitle = computed(() => {
  const titleMap = {
    '/': '대시보드',
    '/users': '사용자 관리',
    '/orders': '주문 관리',
    '/products': '상품 관리',
    '/analytics': '분석',
    '/settings': '설정'
  }

  return titleMap[route.path] || '페이지'
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
</style>