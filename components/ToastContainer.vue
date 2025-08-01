<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <TransitionGroup
        name="toast"
        tag="div"
        class="space-y-2"
    >
      <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="getToastClasses(toast.type)"
          class="toast-item"
      >
        <div class="flex items-start">
          <!-- 아이콘 -->
          <div class="flex-shrink-0 mr-3">
            <Icon
                :name="getToastIcon(toast.type)"
                size="md"
                :class="getIconColor(toast.type)"
            />
          </div>

          <!-- 메시지 -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900">
              {{ toast.message }}
            </p>
            <p v-if="toast.description" class="text-xs text-gray-500 mt-1">
              {{ toast.description }}
            </p>
          </div>

          <!-- 닫기 버튼 -->
          <button
              @click="removeToast(toast.id)"
              class="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
          >
            <Icon name="close" size="sm" />
          </button>
        </div>

        <!-- 프로그레스 바 (지속시간이 있는 경우) -->
        <div
            v-if="toast.duration > 0"
            class="absolute bottom-0 left-0 h-1 bg-current opacity-20 toast-progress"
            :style="{ animationDuration: toast.duration + 'ms' }"
        ></div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
const { toasts, removeToast } = useGlobalToast()

// 토스트 타입별 클래스 반환
const getToastClasses = (type) => {
  const baseClasses = 'relative max-w-sm w-full bg-white rounded-lg shadow-lg border p-4 pointer-events-auto overflow-hidden'

  const typeClasses = {
    success: 'border-green-200 bg-green-50',
    error: 'border-red-200 bg-red-50',
    warning: 'border-yellow-200 bg-yellow-50',
    info: 'border-blue-200 bg-blue-50'
  }

  return `${baseClasses} ${typeClasses[type] || typeClasses.info}`
}

// 토스트 타입별 아이콘 반환
const getToastIcon = (type) => {
  const icons = {
    success: 'plus', // 체크 아이콘 대신 plus 사용
    error: 'close',
    warning: 'notification',
    info: 'eye'
  }

  return icons[type] || icons.info
}

// 아이콘 색상 클래스 반환
const getIconColor = (type) => {
  const colors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  }

  return colors[type] || colors.info
}

// ESC 키로 모든 토스트 닫기
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    const { clearToasts } = useGlobalToast()
    clearToasts()
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
.toast-item {
  @apply animate-fadeIn;
}

/* 토스트 진입/퇴장 애니메이션 */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* 프로그레스 바 애니메이션 */
.toast-progress {
  animation: toast-progress linear forwards;
}

@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* 토스트 호버 시 프로그레스 바 일시정지 */
.toast-item:hover .toast-progress {
  animation-play-state: paused;
}

/* 페이드인 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

/* 반응형 스타일 */
@media (max-width: 640px) {
  .toast-item {
    @apply max-w-none w-[calc(100vw-2rem)] mx-4;
  }
}

/* 다크 모드 지원 (선택사항) */
@media (prefers-color-scheme: dark) {
  .toast-item {
    @apply bg-gray-800 text-white border-gray-700;
  }
}

/* 접근성 개선 */
.toast-item {
  @apply focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2;
}

/* 스크롤바가 있을 때 위치 조정 */
@media screen and (min-width: 1024px) {
  .fixed.top-4.right-4 {
    right: calc(1rem + env(scrollbar-width, 0px));
  }
}
</style>