<template>
    <view class="page">
        <view class="text">正在登录中...</view>
    </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { loginByWeComCodeApi } from '@/api'
import { useUserStore } from '@/store/user'
const useMock = import.meta.env.VITE_USE_MOCK === 'true'
const userStore = useUserStore()

/**
 * 从 URL 获取参数
 */
function getQueryParam(key: string) {
    const url = new URL(window.location.href)
    return url.searchParams.get(key)
}


/**
 * 静默登录主流程
 */
async function startSilentLogin() {
    const code = useMock
        ? import.meta.env.VITE_MOCK_CODE
        : getQueryParam('code')

    // 没有 code，先去企微授权
    if (!code) {
        uni.showToast({
            title: '登录失败，请重试',
            icon: 'none'
        })
        return
    }
    const res = await loginByWeComCodeApi({ code })
    // 这里按你的实际返回结构保存 token
    const token = res || res?.data
    if (!token) {
        throw new Error('未获取到 token')
    }
    userStore.login({
        role: 'admin',
        userInfo: {
            token
        }
    })
    uni.setStorageSync('token', token)
    // 登录成功，跳默认首页
    uni.redirectTo({ url: '/pages/home/index' })

}

onMounted(() => {
    startSilentLogin()
})
</script>

<style scoped>
.page {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #ffffff;
}

.text {
    font-size: 16px;
    color: #666;
}
</style>