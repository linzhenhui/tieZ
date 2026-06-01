<template>
  <view class="search-bar">
    <view class="input-wrap">
      <text class="search-icon">⌕</text>
      <input
        :value="modelValue"
        class="input"
        :placeholder="placeholder"
        placeholder-class="placeholder"
        confirm-type="search"
        @input="handleInput"
        @confirm="$emit('search', modelValue)"
      />
      <text v-if="modelValue" class="clear-icon" @click="handleClear">×</text>
    </view>

    <view class="search-btn" @click="$emit('search', modelValue)">搜索</view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
}>()

const handleInput = (e: any) => {
  emit('update:modelValue', e.detail.value)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('search', '')
}
</script>

<style scoped lang="scss">
@import '@/uni.scss';  

.search-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.input-wrap {
  flex: 1;
  height: 76rpx;
  display: flex;
  align-items: center;
  background: $color-fill-light;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  padding: 0 20rpx;
  box-sizing: border-box;
}

.search-icon {
  font-size: 28rpx;
  color: $color-text-3;
  margin-right: 12rpx;
}

.input {
  flex: 1;
  height: 76rpx;
  font-size: 28rpx;
  color: $color-text;
}

.placeholder {
  color: $color-text-3;
}

.clear-icon {
  width: 36rpx;
  height: 36rpx;
  line-height: 36rpx;
  text-align: center;
  border-radius: 18rpx;
  background: #d9dde3;
  color: #fff;
  font-size: 24rpx;
}

.search-btn {
  width: 96rpx;
  height: 76rpx;
  line-height: 76rpx;
  text-align: center;
  border-radius: $radius-sm;
  background: #eef4ff;
  color: $color-primary;
  font-size: 28rpx;
  font-weight: 500;
}
</style>