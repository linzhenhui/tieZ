<template>
  <view class="empty-wrap">
    <view class="empty-icon">—</view>
    <text class="empty-text">{{ text || '暂无数据' }}</text>
    <text v-if="desc" class="empty-desc">{{ desc }}</text>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  text?: string
  desc?: string
}>()
</script>

<style scoped lang="scss">
@import '@/uni.scss';  

.empty-wrap {
  padding: 72rpx 24rpx;
  text-align: center;
}

.empty-icon {
  width: 88rpx;
  height: 88rpx;
  line-height: 88rpx;
  margin: 0 auto 20rpx;
  border-radius: 24rpx;
  background: #f2f3f5;
  color: $color-text-3;
  font-size: 40rpx;
  font-weight: 600;
}

.empty-text {
  display: block;
  font-size: 30rpx;
  color: $color-text-2;
}

.empty-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: $color-text-3;
  line-height: 1.6;
}
</style>