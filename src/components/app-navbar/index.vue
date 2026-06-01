<template>
  <view class="navbar-wrap">
    <view class="status-holder" :style="{ height: statusBarHeight + 'px' }"></view>

    <view class="navbar">
      <view class="left" @click="handleBack">
        <text v-if="showBack" class="back-icon">‹</text>
      </view>

      <view class="center">
        <text class="title">{{ title }}</text>
      </view>

      <view class="right" @click="$emit('rightClick')">
        <text v-if="rightText" class="right-text">{{ rightText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string
    showBack?: boolean
    rightText?: string
  }>(),
  {
    showBack: true,
    rightText: ''
  }
)

defineEmits<{
  (e: 'rightClick'): void
}>()

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 20

const handleBack = () => {
  if (!props.showBack) return

  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.reLaunch({
      url: '/pages/home/index'
    })
  }
}
</script>

<style scoped lang="scss">
@import '@/uni.scss';  

.navbar-wrap {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid $color-divider;
  backdrop-filter: blur(12px);
}

.navbar {
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.left,
.right {
  width: 120rpx;
  display: flex;
  align-items: center;
}

.left {
  justify-content: flex-start;
}

.right {
  justify-content: flex-end;
}

.center {
  flex: 1;
  text-align: center;
}

.back-icon {
  font-size: 44rpx;
  line-height: 1;
  color: $color-text;
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  color: $color-text;
}

.right-text {
  font-size: 26rpx;
  color: $color-primary;
}
</style>