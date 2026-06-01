<template>
  <button
    class="ui-btn"
    :class="[type, { block, disabled, loading }]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <text v-if="loading" class="loading-dot">· · ·</text>
    <text>{{ loading ? loadingText || '处理中' : text }}</text>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    text: string
    type?: 'primary' | 'default' | 'ghost' | 'danger'
    block?: boolean
    loading?: boolean
    disabled?: boolean
    loadingText?: string
  }>(),
  {
    type: 'primary',
    block: false,
    loading: false,
    disabled: false,
    loadingText: ''
  }
)

const emit = defineEmits<{
  (e: 'click'): void
}>()

const handleClick = () => {
  if (props.disabled || props.loading) return
  emit('click')
}
</script>

<style scoped lang="scss">
@import '@/uni.scss';  

.ui-btn {
  min-width: 140rpx;
  height: 76rpx;
  line-height: 76rpx;
  padding: 0 24rpx;
  border-radius: $radius-sm;
  font-size: 28rpx;
  box-sizing: border-box;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.ui-btn.block {
  width: 100%;
}

.ui-btn.primary {
  background: $color-primary;
  color: #fff;
  border: 1px solid $color-primary;
}

.ui-btn.default {
  background: #fff;
  color: $color-text;
  border: 1px solid $color-border;
}

.ui-btn.ghost {
  background: #fff;
  color: $color-primary;
  border: 1px solid #b7d1ff;
}

.ui-btn.danger {
  background: #fff;
  color: $color-danger;
  border: 1px solid rgba(250, 81, 81, 0.35);
}

.ui-btn.disabled,
.ui-btn[disabled] {
  opacity: 0.55;
}

.ui-btn.loading {
  opacity: 0.9;
}

.loading-dot {
  font-size: 26rpx;
  letter-spacing: 2rpx;
}
</style>