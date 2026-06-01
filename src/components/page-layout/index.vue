<template>
    <view class="page-layout">
        <slot />
        <view v-if="showTabbar" class="tabbar-placeholder"></view>
        <CustomTabbar v-if="showTabbar" :currentPath="currentPath" />
    </view>
</template>

<script setup lang="ts">
import CustomTabbar from '@/components/custom-tabbar/index.vue'

defineProps<{
    currentPath?: string
    showTabbar?: boolean
}>()
</script>

<style scoped lang="scss">
.page-layout {
    min-height: 100vh;
    background: #f7f7f7;
}

.tabbar-placeholder {
    height: 100rpx;
    padding-bottom: env(safe-area-inset-bottom);
}
</style>