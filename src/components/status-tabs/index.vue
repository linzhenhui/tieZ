<template>
  <view class="tabs" :class="{ sticky: sticky }" :style="stickyStyle">
    <view class="tabs-inner">
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

      <view v-if="$slots.right" class="tabs-right">
        <slot name="right"></slot>
      </view>
    </view>
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
  border-radius: 24rpx;
  padding: 16rpx 12rpx 10rpx;
  box-sizing: border-box;
}

.tabs-inner {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.tabs-scroll {
  flex: 1;
  width: 0;
  white-space: nowrap;
}

.tabs-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding-top: 6rpx;
}

.tab-item {
  position: relative;
  flex-shrink: 0;
  height: 64rpx;
  padding: 0 24rpx;
  padding-right: 42rpx;
  border-radius: 999rpx;
  background: #f4f6fa;
  color: #5b6472;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  box-sizing: border-box;
}

.badge {
  position: absolute;
  top: -6rpx;
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
}

.tab-item.active {
  background: #2a7fff;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 6rpx 14rpx rgba(42, 127, 255, 0.18);
}

.tab-label {
  line-height: 1;
}

.badge-text {
  font-size: 18rpx;
  line-height: 1;
  transform: translateY(-1rpx);
}
</style>