<template>
  <view v-if="isTabbarPage" class="custom-tabbar">
    <view
      v-for="item in tabbarList"
      :key="item.pagePath"
      class="tab-item"
      :class="{ active: currentPath === item.pagePath }"
      @click="handleSwitch(item.pagePath)"
    >
      <text class="tab-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTabbarStore } from '@/store/tabbar'

const props = defineProps<{
  currentPath: string
}>()

const tabbarStore = useTabbarStore()
const tabbarList = computed(() => tabbarStore.tabbarList)

// 只要当前路径是 tabbarList 里的页面，就显示 tabbar
const isTabbarPage = computed(() => {
  return tabbarList.value.some(item => item.pagePath === props.currentPath)
})

const handleSwitch = (url: string) => {
  if (url === props.currentPath) return

  uni.reLaunch({
    url
  })
}
</script>

<style scoped lang="scss">
@import '@/uni.scss';

.custom-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 104rpx;
  padding-bottom: env(safe-area-inset-bottom);
  display: flex;
  background: rgba(255, 255, 255, 0.96);
  border-top: 1px solid $color-border;
  z-index: 999;
}

.tab-item {
  flex: 1;
  height: 104rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-text-3;
  background: transparent;
  position: relative;
}

.tab-item.active {
  color: $color-primary;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 14rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 36rpx;
  height: 6rpx;
  border-radius: 3rpx;
  background: $color-primary;
}

.tab-text {
  font-size: 26rpx;
}
</style>