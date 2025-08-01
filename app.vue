<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// 글로벌 에러 핸들링
onErrorCaptured((error, instance, info) => {
  console.error('Global error captured:', { error, instance, info })
  return false
})

// 앱 수준 메타데이터
useHead({
  htmlAttrs: {
    lang: 'ko'
  },
  title: 'Shop BackOffice - 상점 관리 시스템',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: '효율적인 상점 관리를 위한 백오피스 시스템' },
    { name: 'format-detection', content: 'telephone=no' }
  ]
})
</script>