<template>
  <view class="skeleton-card" v-for="i in count" :key="i">
    <view class="line line-1 shimmer"></view>
    <view class="line line-2 shimmer"></view>
    <view class="line line-3 shimmer"></view>
    <view class="footer">
      <view class="btn shimmer"></view>
      <view class="btn shimmer"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    count?: number
  }>(),
  {
    count: 3
  }
)
</script>

<style scoped lang="scss">
@import '@/uni.scss';  

.skeleton-card {
  background: #fff;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.line {
  height: 24rpx;
  border-radius: 12rpx;
  background: linear-gradient(90deg, #f2f3f5 25%, #e9ecf1 37%, #f2f3f5 63%);
  background-size: 400% 100%;
}

.line-1 {
  width: 42%;
  height: 30rpx;
}

.line-2 {
  width: 88%;
  margin-top: 20rpx;
}

.line-3 {
  width: 62%;
  margin-top: 16rpx;
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 28rpx;
}

.btn {
  width: 140rpx;
  height: 64rpx;
  border-radius: $radius-sm;
  background: linear-gradient(90deg, #f2f3f5 25%, #e9ecf1 37%, #f2f3f5 63%);
  background-size: 400% 100%;
}

.shimmer {
  animation: shimmer 1.4s ease infinite;
}

@keyframes shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>