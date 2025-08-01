<template>
  <div v-if="totalPages > 1" class="pagination">
    <!-- 결과 정보 -->
    <div class="pagination-info">
      총 {{ formatNumber(total) }}개 중
      {{ startItem }}-{{ endItem }}개 표시
    </div>

    <!-- 페이지네이션 컨트롤 -->
    <div class="pagination-controls">
      <!-- 첫 페이지 버튼 -->
      <button
          v-if="showFirstLast"
          @click="goToPage(1)"
          :disabled="currentPage === 1"
          class="pagination-button"
          title="첫 페이지"
      >
        <Icon name="arrow-up" size="sm" class="rotate-[-90deg]" />
        <Icon name="arrow-up" size="sm" class="rotate-[-90deg] -ml-1" />
      </button>

      <!-- 이전 페이지 버튼 -->
      <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="pagination-button"
          title="이전 페이지"
      >
        <Icon name="arrow-up" size="sm" class="rotate-[-90deg]" />
      </button>

      <!-- 페이지 번호들 -->
      <div class="flex items-center space-x-1">
        <!-- 시작 생략 표시 -->
        <span v-if="showStartEllipsis" class="px-2 text-gray-500">...</span>

        <!-- 페이지 번호 버튼들 -->
        <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="[
            'pagination-button',
            page === currentPage ? 'pagination-button-active' : ''
          ]"
        >
          {{ page }}
        </button>

        <!-- 끝 생략 표시 -->
        <span v-if="showEndEllipsis" class="px-2 text-gray-500">...</span>
      </div>

      <!-- 다음 페이지 버튼 -->
      <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="pagination-button"
          title="다음 페이지"
      >
        <Icon name="arrow-up" size="sm" class="rotate-90" />
      </button>

      <!-- 마지막 페이지 버튼 -->
      <button
          v-if="showFirstLast"
          @click="goToPage(totalPages)"
          :disabled="currentPage === totalPages"
          class="pagination-button"
          title="마지막 페이지"
      >
        <Icon name="arrow-up" size="sm" class="rotate-90" />
        <Icon name="arrow-up" size="sm" class="rotate-90 -ml-1" />
      </button>
    </div>

    <!-- 페이지 직접 이동 -->
    <div v-if="showPageJump" class="flex items-center space-x-2 ml-4">
      <span class="text-sm text-gray-700">페이지:</span>
      <input
          v-model.number="jumpPage"
          @keyup.enter="jumpToPage"
          type="number"
          :min="1"
          :max="totalPages"
          class="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
      >
      <button
          @click="jumpToPage"
          class="btn-secondary btn-sm"
      >
        이동
      </button>
    </div>

    <!-- 페이지 크기 선택 -->
    <div v-if="showPageSize" class="flex items-center space-x-2 ml-4">
      <span class="text-sm text-gray-700">표시:</span>
      <select
          :value="pageSize"
          @change="changePageSize($event.target.value)"
          class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
      >
        <option v-for="size in pageSizeOptions" :key="size" :value="size">
          {{ size }}개
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  // 현재 페이지
  currentPage: {
    type: Number,
    required: true
  },
  // 페이지당 항목 수
  pageSize: {
    type: Number,
    default: 10
  },
  // 전체 항목 수
  total: {
    type: Number,
    required: true
  },
  // 표시할 페이지 번호 개수
  maxVisiblePages: {
    type: Number,
    default: 5
  },
  // 첫/마지막 페이지 버튼 표시 여부
  showFirstLast: {
    type: Boolean,
    default: true
  },
  // 페이지 직접 이동 기능 표시 여부
  showPageJump: {
    type: Boolean,
    default: true
  },
  // 페이지 크기 변경 기능 표시 여부
  showPageSize: {
    type: Boolean,
    default: true
  },
  // 페이지 크기 옵션들
  pageSizeOptions: {
    type: Array,
    default: () => [10, 20, 50, 100]
  }
})

const emit = defineEmits(['page-change', 'page-size-change'])

// 반응형 데이터
const jumpPage = ref(props.currentPage)

// 계산된 속성들
const totalPages = computed(() => {
  return Math.ceil(props.total / props.pageSize)
})

const startItem = computed(() => {
  return (props.currentPage - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  return Math.min(props.currentPage * props.pageSize, props.total)
})

// 표시할 페이지 번호들 계산
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = props.maxVisiblePages
  const current = props.currentPage
  const total = totalPages.value

  if (total <= maxVisible) {
    // 전체 페이지가 maxVisible보다 적으면 모든 페이지 표시
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 현재 페이지를 중심으로 페이지 범위 계산
    const half = Math.floor(maxVisible / 2)
    let start = Math.max(1, current - half)
    let end = Math.min(total, start + maxVisible - 1)

    // 끝에서 시작 조정
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }

  return pages
})

// 시작 생략 표시 여부
const showStartEllipsis = computed(() => {
  return visiblePages.value.length > 0 && visiblePages.value[0] > 2
})

// 끝 생략 표시 여부
const showEndEllipsis = computed(() => {
  const lastVisible = visiblePages.value[visiblePages.value.length - 1]
  return lastVisible < totalPages.value - 1
})

// 현재 페이지 변경 시 jumpPage 업데이트
watch(() => props.currentPage, (newPage) => {
  jumpPage.value = newPage
})

// 메서드들
const formatNumber = (num) => {
  return new Intl.NumberFormat('ko-KR').format(num)
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('page-change', page)
  }
}

const jumpToPage = () => {
  const page = parseInt(jumpPage.value)
  if (page >= 1 && page <= totalPages.value) {
    goToPage(page)
  } else {
    jumpPage.value = props.currentPage
  }
}

const changePageSize = (newSize) => {
  const size = parseInt(newSize)
  if (size > 0) {
    emit('page-size-change', size)
  }
}
</script>

<style scoped>
.rotate-90 {
  transform: rotate(90deg);
}

.rotate-\[-90deg\] {
  transform: rotate(-90deg);
}

/* 페이지네이션 반응형 스타일 */
@media (max-width: 640px) {
  .pagination {
    @apply flex-col space-y-3;
  }

  .pagination-controls {
    @apply justify-center;
  }

  .pagination-info {
    @apply text-center;
  }
}

/* 비활성 버튼 스타일 */
.pagination-button:disabled {
  @apply opacity-40 cursor-not-allowed;
}

.pagination-button:disabled:hover {
  @apply bg-white;
}

/* 활성 페이지 버튼 스타일 */
.pagination-button-active {
  @apply bg-primary-600 border-primary-600 text-white;
}

.pagination-button-active:hover {
  @apply bg-primary-700;
}

/* 입력 필드 스타일 */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>