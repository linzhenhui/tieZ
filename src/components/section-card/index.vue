<template>
  <view class="section-card">
    <view v-if="title" class="section-title">{{ title }}</view>
    <slot />
  </view>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<style scoped lang="scss">
@import '@/uni.scss';  

.section-card {
  background: $color-card-bg;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.section-title {
  padding: 24rpx 28rpx;
  font-size: 30rpx;
  font-weight: 600;
  text-align: left;
  color: $color-text;
  border-bottom: 1px solid $color-divider;
  background: #fbfbfc;
}
</style>