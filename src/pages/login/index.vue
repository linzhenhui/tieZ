<template>
  <view class="login-page">
    <view class="card fleet-form">
      <view class="form-title">车队登录</view>

      <view class="form-item">
        <text class="label required">账号</text>
        <input v-model="account" class="input" placeholder="请输入账号" placeholder-class="placeholder" />
      </view>

      <view class="form-item">
        <text class="label required">密码</text>
        <view class="password-box">
          <input v-model="password" class="input password-input" :password="!showPassword"
            :type="showPassword ? 'text' : 'password'" placeholder="请输入密码" placeholder-class="placeholder"
            confirm-type="done" @confirm="handleFleetLogin" />
          <text class="eye-icon" @click="toggleShowPassword">
            {{ showPassword ? '👁' : '🙈' }}
          </text>
        </view>
      </view>

      <button class="submit-btn" :loading="loading" @click="handleFleetLogin">
        登录
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import { fleetLoginApi, getUserInfoApi } from '@/api'
import { requestSubscribeMessageByRole } from '@/utils/subscribe'

const userStore = useUserStore()

const account = ref(import.meta.env.VITE_MOCK_CODE ? '6Y17r' : '')
const password = ref(import.meta.env.VITE_MOCK_CODE ? '123456' : '')
const loading = ref(false)
const showPassword = ref(false)

const toggleShowPassword = () => {
  showPassword.value = !showPassword.value
}

const normalizeUserInfo = (info: any) => {
  return {
    id: info?.id || info?.userId || '',
    token: info?.token || '',
    avatar: info?.avatar || '',
    nickName: info?.nickName || info?.nickname || info?.userName || '',
    phone: info?.phone || info?.phonenumber || '',
    realName: info?.realName || ''
  }
}

const isUserInfoComplete = (info: any) => {
  return !!(
    info?.avatar &&
    (info?.nickName || info?.nickname || info?.userName) &&
    (info?.phone || info?.phonenumber)
  )
}

const getWxCode = () => {
  return new Promise<string>((resolve, reject) => {
    // #ifdef MP-WEIXIN
    uni.login({
      provider: 'weixin',
      success: (res) => {
        if (res.code) {
          resolve(res.code)
        } else {
          reject(new Error('获取微信 code 失败'))
        }
      },
      fail: reject
    })
    // #endif

    // #ifndef MP-WEIXIN
    reject(new Error('仅支持微信小程序'))
    // #endif
  })
}

const handleFleetLogin = async () => {
  if (!account.value.trim() || !password.value.trim()) {
    uni.showToast({ title: '请输入账号和密码', icon: 'none' })
    return
  }

  if (loading.value) return
  loading.value = true
  uni.showLoading({
    title: '登录中...',
    mask: true
  })

  try {
    const code = await getWxCode()

    const res: any = await fleetLoginApi({
      username: account.value.trim(),
      password: password.value.trim(),
      code
    })

    const token = res?.data?.token || res?.token || res?.data || res
    if (!token) {
      throw new Error('未获取到 token')
    }

    uni.setStorageSync('token', token)

    const userRes: any = await getUserInfoApi()
    const userInfo = userRes?.data || userRes || {}
    const normalized = normalizeUserInfo(userInfo)

    userStore.login({
      role: 'fleet',
      userInfo: {
        token,
        ...normalized
      }
    })

    if (!isUserInfoComplete(userInfo)) {
      uni.redirectTo({
        url: '/pages/mine/detail'
      })
      return
    }

    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })

    await requestSubscribeMessageByRole()

    setTimeout(() => {
      uni.redirectTo({
        url: '/pages/mine/index'
      })
    }, 300)
  } catch (err: any) {
    console.error('登录失败:', err)
    uni.showToast({
      title: err?.message || '登录失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    uni.hideLoading()
  }
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  position: relative;
  background: linear-gradient(180deg, #eef5ff 0%, #f7f9fc 100%);
  padding: 40rpx 24rpx 32rpx;
  box-sizing: border-box;
  overflow: hidden;
}

.hero {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-top: 40rpx;
  margin-bottom: 36rpx;
  position: relative;
  z-index: 1;
}

.logo {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #1e80ff, #65a3ff);
  color: #fff;
  font-size: 42rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 24rpx rgba(30, 128, 255, 0.22);
}

.hero-text .title {
  font-size: 38rpx;
  font-weight: 700;
  color: #1f2937;
}

.hero-text .subtitle {
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #6b7280;
}

.card {
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 28rpx;
  padding: 28rpx;
  box-shadow: 0 14rpx 42rpx rgba(15, 23, 42, 0.08);
}

.fleet-form {
  display: flex;
  flex-direction: column;
}

.form-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8rpx;
  text-align: center;
}

.form-desc {
  font-size: 24rpx;
  color: #6b7280;
  margin-bottom: 28rpx;
}

.form-item {
  margin-bottom: 22rpx;
}

.label {
  display: block;
  font-size: 26rpx;
  color: #374151;
  margin-bottom: 10rpx;
}

.label.required::before {
  content: '*';
  color: #ef4444;
  margin-right: 6rpx;
}

.input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  border: 1px solid #e5e7eb;
  border-radius: 16rpx;
  background: #f8fafc;
  box-sizing: border-box;
  font-size: 28rpx;
  color: #111827;
}

.placeholder {
  color: #9ca3af;
}

.password-box {
  position: relative;
}

.password-input {
  padding-right: 72rpx;
}

.eye-icon {
  position: absolute;
  right: 22rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 30rpx;
  color: #9ca3af;
}

.submit-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  margin-top: 10rpx;
  background: linear-gradient(135deg, #1e80ff, #4fa0ff);
  color: #fff;
  border-radius: 18rpx;
  font-size: 30rpx;
  font-weight: 600;
}
</style>