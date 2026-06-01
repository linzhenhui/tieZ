<template>
  <view class="badge" :class="badgeClass">
    {{ text }}
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  text: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'default'
}>()

const badgeClass = computed(() => props.type || 'primary')
</script>

<style scoped lang="scss">
@import '@/uni.scss';  

.badge {
  min-width: 96rpx;
  height: 52rpx;
  line-height: 52rpx;
  text-align: center;
  border-radius: 26rpx;
  font-size: 24rpx;
  padding: 0 16rpx;
  box-sizing: border-box;
  font-weight: 500;
}

.primary {
  background: #edf5ff;
  color: $color-primary;
}

.success {
  background: #e8fff1;
  color: $color-success;
}

.warning {
  background: #fff7e8;
  color: $color-warning;
}

.danger {
  background: #fff1f0;
  color: $color-danger;
}

.default {
  background: #f2f3f5;
  color: $color-text-3;
}
</style>