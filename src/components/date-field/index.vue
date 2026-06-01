<template>
  <picker mode="date" :value="modelValue" @change="handleChange">
    <view class="date-field" :class="{ placeholder: !modelValue }">
      {{ modelValue || placeholder || '请选择日期' }}
    </view>
  </picker>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const handleChange = (e: any) => {
  emit('update:modelValue', e.detail.value)
}
</script>

<style scoped lang="scss">
@import '@/uni.scss';  

.date-field {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  background: $color-fill-light;
  padding: 0 24rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  color: $color-text;
}

.date-field.placeholder {
  color: $color-text-3;
}
</style>