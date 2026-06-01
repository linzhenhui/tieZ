<template>
  <slot />
</template>

<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'

onLaunch(() => {
  const userStore = useUserStore()
  userStore.hydrate()
})
</script>

<style lang="scss">
page {
  background-color: #f5f6f7;
  color: #333;
  font-size: 28rpx;
}

view,
text,
button,
input {
  box-sizing: border-box;
}
</style>