<template>
  <svg
      :class="[
      'inline-block',
      sizeClasses[size],
      colorClass
    ]"
      :fill="fill"
      :stroke="stroke"
      :stroke-width="strokeWidth"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Dashboard 아이콘 -->
    <path v-if="name === 'dashboard'" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>

    <!-- Users 아이콘 -->
    <path v-else-if="name === 'users'" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z"/>

    <!-- Orders 아이콘 -->
    <path v-else-if="name === 'orders'" d="M16 11V7a4 4 0 00-8 0v4M8 11v6a2 2 0 002 2h4a2 2 0 002-2v-6M8 11h8"/>

    <!-- Products 아이콘 -->
    <path v-else-if="name === 'products'" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 4v16"/>

    <!-- Analytics 아이콘 -->
    <path v-else-if="name === 'analytics'" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>

    <!-- Settings 아이콘 -->
    <path v-else-if="name === 'settings'" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
    <path v-else-if="name === 'settings'" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>

    <!-- Menu 아이콘 -->
    <path v-else-if="name === 'menu'" d="M4 6h16M4 12h16M4 18h16"/>

    <!-- Close/X 아이콘 -->
    <path v-else-if="name === 'close'" d="M6 18L18 6M6 6l12 12"/>

    <!-- Search 아이콘 -->
    <path v-else-if="name === 'search'" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>

    <!-- Plus 아이콘 -->
    <path v-else-if="name === 'plus'" d="M12 4v16m8-8H4"/>

    <!-- Edit 아이콘 -->
    <path v-else-if="name === 'edit'" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>

    <!-- Delete 아이콘 -->
    <path v-else-if="name === 'delete'" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>

    <!-- Eye 아이콘 -->
    <path v-else-if="name === 'eye'" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    <path v-else-if="name === 'eye'" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>

    <!-- Arrow Down 아이콘 -->
    <path v-else-if="name === 'arrow-down'" d="M19 9l-7 7-7-7"/>

    <!-- Arrow Up 아이콘 -->
    <path v-else-if="name === 'arrow-up'" d="M5 15l7-7 7 7"/>

    <!-- Filter 아이콘 -->
    <path v-else-if="name === 'filter'" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>

    <!-- Download 아이콘 -->
    <path v-else-if="name === 'download'" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>

    <!-- Upload 아이콘 -->
    <path v-else-if="name === 'upload'" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>

    <!-- Notification 아이콘 -->
    <path v-else-if="name === 'notification'" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>

    <!-- Calendar 아이콘 -->
    <path v-else-if="name === 'calendar'" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>

    <!-- 기본 아이콘 (알 수 없는 아이콘명일 때) -->
    <circle v-else cx="12" cy="12" r="10"/>
  </svg>
</template>

<script setup>
const props = defineProps({
  name: {
    type: String,
    required: true,
    validator: (value) => [
      'dashboard', 'users', 'orders', 'products', 'analytics', 'settings',
      'menu', 'close', 'search', 'plus', 'edit', 'delete', 'eye',
      'arrow-down', 'arrow-up', 'filter', 'download', 'upload',
      'notification', 'calendar'
    ].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  color: {
    type: String,
    default: 'current'
  },
  fill: {
    type: String,
    default: 'none'
  },
  stroke: {
    type: String,
    default: 'currentColor'
  },
  strokeWidth: {
    type: [String, Number],
    default: 2
  }
})

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
}

const colorClass = computed(() => {
  if (props.color === 'current') return 'text-current'

  const colorMap = {
    primary: 'text-primary-500',
    gray: 'text-gray-500',
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500',
    purple: 'text-purple-500',
    indigo: 'text-indigo-500',
    pink: 'text-pink-500'
  }

  return colorMap[props.color] || 'text-current'
})
</script>