<template>
    <view v-if="visible" class="drawer-mask" @click.self="$emit('close')">
        <view class="drawer-panel">
            <view class="drawer-header">
                <text class="drawer-title">{{ title || '筛选条件' }}</text>
            </view>

            <scroll-view scroll-y class="drawer-body">
                <view v-for="group in options" :key="group.key" class="group">
                    <view class="group-title">{{ group.label }}</view>

                    <view class="tag-list">
                        <view v-for="item in group.items" :key="item.value" class="tag-item"
                            :class="{ active: localValue[group.key] === item.value }"
                            @click="handleSelect(group.key, item.value)">
                            {{ item.label }}
                        </view>
                    </view>
                </view>
            </scroll-view>

            <view class="drawer-footer">
                <button class="btn reset" @click="handleReset">重置</button>
                <button class="btn confirm" @click="handleConfirm">确定</button>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

interface FilterItem {
    label: string
    value: string
}

interface FilterGroup {
    key: string
    label: string
    items: FilterItem[]
}

const props = defineProps<{
    visible: boolean
    title?: string
    modelValue: Record<string, string>
    options: FilterGroup[]
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'update:modelValue', value: Record<string, string>): void
    (e: 'confirm', value: Record<string, string>): void
}>()

const localValue = reactive<Record<string, string>>({})

watch(
    () => props.modelValue,
    (val) => {
        Object.keys(localValue).forEach((k) => delete localValue[k])
        Object.assign(localValue, val || {})
    },
    { immediate: true, deep: true }
)

const handleSelect = (key: string, value: string) => {
    localValue[key] = localValue[key] === value ? '' : value
}

const handleReset = () => {
    Object.keys(localValue).forEach((k) => {
        localValue[k] = ''
    })
    emit('update:modelValue', { ...localValue })
}

const handleConfirm = () => {
    const next = { ...localValue }
    emit('update:modelValue', next)
    emit('confirm', next)
    emit('close')
}
</script>

<style scoped lang="scss">
@import '@/uni.scss';  

.drawer-mask {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.32);
    z-index: 9999;
    display: flex;
    justify-content: flex-end;
}

.drawer-panel {
    width: 560rpx;
    height: 100%;
    background: #fff;
    display: flex;
    flex-direction: column;
}

.drawer-header {
    padding: 30rpx 28rpx 24rpx;
    border-bottom: 1px solid $color-divider;
}

.drawer-title {
    font-size: 32rpx;
    font-weight: 600;
    color: $color-text;
}

.drawer-body {
    flex: 1;
    padding: 24rpx;
    box-sizing: border-box;
}

.group {
    margin-bottom: 28rpx;
}

.group-title {
    font-size: 26rpx;
    color: $color-text-2;
    margin-bottom: 16rpx;
}

.tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
}

.tag-item {
    min-width: 120rpx;
    height: 64rpx;
    line-height: 64rpx;
    padding: 0 20rpx;
    text-align: center;
    background: #f2f3f5;
    color: $color-text-2;
    border-radius: $radius-sm;
    font-size: 26rpx;
    box-sizing: border-box;
}

.tag-item.active {
    background: #eef4ff;
    color: $color-primary;
    border: 1px solid #b7d1ff;
}

.drawer-footer {
    display: flex;
    gap: 16rpx;
    padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
    border-top: 1px solid $color-divider;
}

.btn {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: $radius-sm;
    font-size: 28rpx;
    margin: 0;
}

.reset {
    background: #fff;
    color: $color-text;
    border: 1px solid $color-border;
}

.confirm {
    background: $color-primary;
    color: #fff;
    border: 1px solid $color-primary;
}
</style>