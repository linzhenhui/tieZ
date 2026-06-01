<template>
  <view class="tabs" :class="{ sticky: sticky }" :style="stickyStyle">
    <scroll-view scroll-x class="tabs-scroll" :show-scrollbar="false">
      <view class="tabs-row">
        <view v-for="item in list" :key="item.value" class="tab-item" :class="{ active: modelValue === item.value }"
          @click="selectTab(item.value)">
          <text class="tab-label">{{ item.label }}</text>

          <view v-if="item.badge !== undefined" class="badge">
            <text class="badge-text">{{ item.badge }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type TabItem = {
  label: string
  value: string
  badge?: number
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    list: TabItem[]
    sticky?: boolean
    top?: string | number
  }>(),
  {
    sticky: true,
    top: 0
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const selectTab = (value: string) => {
  if (value === props.modelValue) return
  emit('update:modelValue', value)
}

const stickyStyle = computed(() => {
  if (!props.sticky) return {}

  return {
    position: 'sticky',
    top: typeof props.top === 'number' ? `${props.top}px` : props.top,
    zIndex: 100
  }
})
</script>

<style scoped lang="scss">
@import '@/uni.scss';

.tabs {
  width: 100%;
  margin-bottom: 20rpx;
  background: #fff;
  border-radius: $radius-md;
  padding: 16rpx 0;
}

.sticky {
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.04);
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs-row {
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  gap: 16rpx;
}

.tab-item {
  position: relative;
  flex-shrink: 0;
  height: 68rpx;
  padding: 0 28rpx;
  padding-right: 44rpx; // 给角标留点空间
  border-radius: 999rpx;
  background: $color-fill-light;
  color: $color-text-2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
}

.badge {
  position: absolute;
  top: 0;
  right: -6rpx;
  min-width: 30rpx;
  height: 30rpx;
  padding: 0 6rpx;
  border-radius: 999rpx;
  background: #ff4d4f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  z-index: 2;
  transform: scale(0.95);
}

.badge-text {
  font-size: 18rpx;
  line-height: 1;
  transform: translateY(-1rpx);
}

.tab-item.active {
  background: $color-primary;
  color: #fff;
  font-weight: 600;
}

.tab-label {
  line-height: 1;
}
</style>