<template>
  <span :class="badgeClasses">
    <Icon v-if="icon" :name="icon" :size="iconSize" class="mr-1" />
    {{ text }}
  </span>
</template>

<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => [
      'default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'
    ].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  text: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: null
  },
  rounded: {
    type: Boolean,
    default: true
  }
})

// 계산된 속성
const badgeClasses = computed(() => {
  const baseClasses = 'inline-flex items-center font-medium'

  // 크기별 클래스
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  }

  // 변형별 클래스
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  }

  // 둥근 모서리
  const roundedClass = props.rounded ? 'rounded-full' : 'rounded'

  return [
    baseClasses,
    sizeClasses[props.size],
    variantClasses[props.variant],
    roundedClass
  ].join(' ')
})

const iconSize = computed(() => {
  const iconSizes = {
    sm: 'xs',
    md: 'xs',
    lg: 'sm'
  }
  return iconSizes[props.size] || 'xs'
})
</script>

<style scoped>
/* 추가 커스텀 스타일이 필요한 경우 여기에 작성 */
</style>