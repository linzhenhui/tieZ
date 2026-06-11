<template>
  <view class="login-page">
    <!-- 背景装饰 -->
    <view class="bg-shape bg-1"></view>
    <view class="bg-shape bg-2"></view>

    <!-- 顶部品牌区 -->
    <view class="hero">
      <view class="logo">L</view>
      <view class="hero-text">
        <view class="title">物流管理平台</view>
        <view class="subtitle">请选择登录方式</view>
      </view>
    </view>

    <!-- 主卡片 -->
    <view class="card">
      <!-- 选择登录方式 -->
      <view v-if="mode === 'choose'" class="option-list">
        <!-- #ifdef MP-WEIXIN -->
        <view class="option-card primary" @click="showShipperWxLogin">
          <view class="option-left">
            <view class="option-content">
              <view class="option-title">微信小程序登录</view>
              <view class="option-subtitle">货主端</view>
            </view>
          </view>
          <view class="option-arrow">›</view>
        </view>

        <view class="option-card secondary" @click="showFleetLogin">
          <view class="option-left">
            <view class="option-content">
              <view class="option-title dark">账号密码登录</view>
              <view class="option-subtitle dark">车队端</view>
            </view>
          </view>
          <view class="option-arrow dark">›</view>
        </view>
        <!-- #endif -->

        <!-- #ifndef MP-WEIXIN -->
        <view class="option-card secondary" @click="goAdmin">
          <view class="option-left">
            <view class="option-content">
              <view class="option-title dark">企微登录</view>
              <view class="option-subtitle dark">管理端</view>
            </view>
          </view>
          <view class="option-arrow dark">›</view>
        </view>
        <!-- #endif -->
      </view>

      <!-- 货主端微信登录：资料补全 -->
      <view v-else-if="mode === 'shipperWxForm'" class="wx-form">
        <view class="back-row" @click="mode = 'choose'">
          <text class="back-arrow">‹</text>
          <text class="back-text">返回选择登录方式</text>
        </view>

        <view class="form-title">微信授权登录</view>
        <view class="form-desc">请完善基本信息后提交登录</view>

        <!-- 头像 -->
        <view class="form-item">
          <text class="label required">头像</text>

          <!-- #ifdef MP-WEIXIN -->
          <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
            <image v-if="wxForm.avatar" :src="wxForm.avatar" class="avatar-img" mode="aspectFill" />
            <view v-else class="avatar-placeholder">+</view>
          </button>
          <!-- #endif -->

          <!-- #ifndef MP-WEIXIN -->
          <view class="avatar-preview" @click="pickAvatar">
            <image v-if="wxForm.avatar" :src="wxForm.avatar" class="avatar-img" mode="aspectFill" />
            <view v-else class="avatar-placeholder">+</view>
          </view>
          <!-- #endif -->
        </view>

        <!-- 昵称 -->
        <view class="form-item">
          <text class="label required">昵称</text>
          <view class="input-with-btn">
            <input v-model="wxForm.nickName" class="input" type="nickname" placeholder="请输入昵称"
              placeholder-class="placeholder" />
          </view>
        </view>

        <!-- 手机号 -->
        <view class="form-item">
          <text class="label required">手机号</text>
          <view class="phone-row">
            <view class="input-box phone-input-box">
              <input v-model="wxForm.phone" class="input" type="number" maxlength="11" placeholder="请输入手机号"
                placeholder-class="placeholder" />
            </view>
          </view>
        </view>
        <button class="submit-btn" :loading="loading" @click="handleShipperWxSubmit">
          提交登录
        </button>
      </view>

      <!-- 车队登录表单 -->
      <view v-else class="fleet-form">
        <view class="back-row" @click="mode = 'choose'">
          <text class="back-arrow">‹</text>
          <text class="back-text">返回选择登录方式</text>
        </view>

        <view class="form-title">车队端登录</view>
        <view class="form-desc">请输入账号和密码进行登录</view>

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
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useUserStore } from '@/store/user'
import {
  shipperWxLoginApi,
  fleetLoginApi,
  getUserInfoApi,
  updateUserInfoApi,
  queryMerchantListApi,
  getDictDataApi
} from '@/api'
import { uploadUrl } from '@/config/env'

const userStore = useUserStore()

type LoginMode = 'choose' | 'fleet' | 'shipperWxForm'
type OptionItem = {
  label: string
  value: string
}

const mode = ref<LoginMode>('choose')
const account = ref(import.meta.env.VITE_MOCK_CODE ? '6Y17r' : '')
const password = ref(import.meta.env.VITE_MOCK_CODE ? '123456' : '')
const loading = ref(false)
const showPassword = ref(false)
const tempToken = ref('')


const wxForm = reactive({
  id: '',
  avatar: '',
  nickName: '',
  phone: '',
})




const toggleShowPassword = () => {
  showPassword.value = !showPassword.value
}

const showFleetLogin = () => {
  mode.value = 'fleet'
}

const getRedirectUrl = (defaultUrl: string) => {
  const redirectUrl = userStore.redirectAfterLogin
  if (redirectUrl) {
    userStore.clearRedirectAfterLogin()
    return redirectUrl
  }
  return defaultUrl
}

const validatePhone = (phone: string) => {
  return /^1\d{10}$/.test(phone)
}


const avatarUploading = ref(false)

/**
 * 选择头像（非微信小程序）
 */
const pickAvatar = () => {
  if (avatarUploading.value) return

  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const filePath = res.tempFilePaths?.[0]
      if (filePath) {
        await uploadAvatarFile(filePath)
      }
    }
  })
}

/**
 * 微信小程序 chooseAvatar 回调
 * e.detail.avatarUrl 只是本地临时地址，仍然需要上传
 */
const onChooseAvatar = async (e: any) => {
  const filePath = e?.detail?.avatarUrl
  if (!filePath) return
  await uploadAvatarFile(filePath)
}

const uploadAvatarFile = async (filePath: string) => {
  if (!filePath) return
  if (avatarUploading.value) return

  avatarUploading.value = true
  uni.showLoading({ title: '上传中...' })

  try {
    const token = uni.getStorageSync('token') || tempToken.value || ''


    const uploadRes: any = await new Promise((resolve, reject) => {
      uni.uploadFile({
        url: uploadUrl,
        filePath,
        name: 'file',
        header: token ? { access_token: token } : {},
        success: resolve,
        fail: reject
      })
    })

    let data: any = uploadRes?.data
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data)
      } catch (e) {
        // 不是 JSON 就保持原样
      }
    }

    // 下面这几个字段按你后端返回结构兼容一下
    const url =
      data?.url ||
      data?.data?.url ||
      data?.fileUrl ||
      data?.data?.fileUrl ||
      data?.data ||
      data

    if (!url || typeof url !== 'string') {
      throw new Error('未获取到图片地址')
    }

    wxForm.avatar = url
    uni.showToast({
      title: '上传成功',
      icon: 'success'
    })
  } catch (err: any) {
    console.error('头像上传失败:', err)
    uni.showToast({
      title: err?.message || '头像上传失败',
      icon: 'none'
    })
  } finally {
    avatarUploading.value = false
    uni.hideLoading()
  }
}


/**
 * 判断登录补资料是否完整
 */
const isUserInfoComplete = (info: any) => {
  return !!(
    info?.avatar &&
    (info?.nickName || info?.nickname || info?.userName) &&
    (info?.phone || info?.phonenumber)
  )
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

/**
 * 微信登录后统一处理
 */
const afterWxLogin = async (token: string, role: string) => {
  uni.setStorageSync('token', token)

  const res: any = await getUserInfoApi()
  const userInfo = res?.data || res || {}
  const normalized = normalizeUserInfo(userInfo)
  wxForm.id = userInfo.id

  if (isUserInfoComplete(userInfo)) {
    userStore.login({
      role: role,
      userInfo: {
        token,
        ...normalized
      }
    })

    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.redirectTo({ url: getRedirectUrl('/pages/mine/index') })
    }, 300)

    return
  }

  tempToken.value = token
  mode.value = 'shipperWxForm'
  wxForm.avatar = normalized.avatar || wxForm.avatar || ''
  wxForm.nickName = normalized.nickName || wxForm.nickName || ''
  wxForm.phone = normalized.phone || wxForm.phone || ''
}

/**
 * 货主端微信登录入口
 */
const showShipperWxLogin = async () => {
  if (loading.value) return
  loading.value = true

  try {
    try {
      const profile: any = await new Promise((resolve, reject) => {
        uni.getUserProfile({
          desc: '用于完善货主资料',
          success: resolve,
          fail: reject
        })
      })

      wxForm.avatar = profile?.userInfo?.avatarUrl || wxForm.avatar
      wxForm.nickName = profile?.userInfo?.nickName || wxForm.nickName
    } catch (err) {
      console.log('用户未授权 getUserProfile：', err)
    }

    const loginRes: any = await new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject
      })
    })

    if (!loginRes?.code) {
      throw new Error('没有拿到微信登录 code')
    }

    const res: any = await shipperWxLoginApi({
      code: loginRes.code
    })

    const token = res?.data?.token || res?.token || res?.data || res
    if (!token) {
      throw new Error('未获取到 token')
    }

    await afterWxLogin(token, 'owner')
  } catch (err: any) {
    console.error('微信登录失败:', err)
    uni.showToast({
      title: err?.message || '微信登录失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

/**
 * 补资料提交
 */
const handleShipperWxSubmit = async () => {
  if (loading.value) return

  const token = tempToken.value || uni.getStorageSync('token')
  if (!wxForm.avatar.trim()) {
    uni.showToast({ title: '请上传头像', icon: 'none' })
    return
  }

  if (!wxForm.nickName.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  if (!wxForm.phone.trim()) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }

  if (!validatePhone(wxForm.phone.trim())) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return
  }
  loading.value = true
  try {
    await updateUserInfoApi({
      id: wxForm.id,
      avatar: wxForm.avatar,
      nickName: wxForm.nickName.trim(),
      userName: wxForm.nickName.trim(), // 兼容老字段
      phone: wxForm.phone.trim(),
      phonenumber: wxForm.phone.trim(), // 兼容老字段
    })

    const userRes: any = await getUserInfoApi()
    const userInfo = userRes?.data || userRes || {}
    const normalized = normalizeUserInfo(userInfo)

    userStore.login({
      role: 'owner',
      userInfo: {
        token,
        ...normalized,
        avatar: normalized.avatar || wxForm.avatar,
        nickName: normalized.nickName || wxForm.nickName.trim(),
        phone: normalized.phone || wxForm.phone.trim(),
      }
    })

    uni.setStorageSync('token', token)

    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.redirectTo({ url: getRedirectUrl('/pages/mine/index') })
    }, 300)
  } catch (err: any) {
    console.error('提交资料失败:', err)
    uni.showToast({
      title: err?.message || '提交失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

/**
 * 车队端账号密码登录
 */
const handleFleetLogin = async () => {
  if (!account.value.trim() || !password.value.trim()) {
    uni.showToast({ title: '请输入账号和密码', icon: 'none' })
    return
  }

  if (loading.value) return
  loading.value = true

  try {
    const res: any = await fleetLoginApi({
      username: account.value.trim(),
      password: password.value.trim()
    })

    const token = res?.data?.token || res?.token || res?.data || res
    if (!token) {
      throw new Error('未获取到 token')
    }
    await afterWxLogin(token, 'fleet')


  } catch (err: any) {
    console.error('登录失败:', err)
    uni.showToast({
      title: err?.message || '登录失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}
const goAdmin = () => {
  uni.redirectTo({ url: '/pages/qw/index' })
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

.bg-shape {
  position: absolute;
  border-radius: 999rpx;
  opacity: 0.35;
  filter: blur(10rpx);
  pointer-events: none;
}

.bg-1 {
  width: 320rpx;
  height: 320rpx;
  background: #6aa6ff;
  top: -120rpx;
  right: -120rpx;
}

.bg-2 {
  width: 220rpx;
  height: 220rpx;
  background: #9ec5ff;
  bottom: 140rpx;
  left: -80rpx;
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

.option-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.option-card {
  min-height: 132rpx;
  border-radius: 22rpx;
  padding: 24rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.option-card.primary {
  background: linear-gradient(135deg, #1e80ff, #4fa0ff);
  color: #fff;
}

.option-card.secondary {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  color: #111827;
}

.option-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.option-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}

.option-title.dark {
  color: #111827;
}

.option-subtitle {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.86);
}

.option-subtitle.dark {
  color: #6b7280;
}

.option-arrow {
  font-size: 44rpx;
  color: rgba(255, 255, 255, 0.9);
}

.option-arrow.dark {
  color: #9ca3af;
}

.wx-form,
.fleet-form {
  display: flex;
  flex-direction: column;
}

.back-row {
  display: flex;
  align-items: center;
  gap: 6rpx;
  color: #6b7280;
  margin-bottom: 18rpx;
}

.back-arrow {
  font-size: 34rpx;
  line-height: 1;
}

.back-text {
  font-size: 26rpx;
}

.form-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8rpx;
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

.avatar-btn {
  width: 144rpx;
  height: 144rpx;
  border-radius: 22rpx;
  padding: 0;
  margin: 0;
  background: #f3f4f6;
  border: 1px dashed #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-preview {
  width: 144rpx;
  height: 144rpx;
  border-radius: 22rpx;
  background: #f3f4f6;
  border: 1px dashed #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.avatar-placeholder {
  font-size: 64rpx;
  color: #9ca3af;
  line-height: 1;
}

.input-with-btn {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.input-box {
  width: 100%;
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

.mini-btn {
  height: 88rpx;
  line-height: 88rpx;
  padding: 0 20rpx;
  border-radius: 16rpx;
  background: #eff6ff;
  color: #1e80ff;
  font-size: 24rpx;
  border: 1px solid #bfdbfe;
}

.phone-row {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.phone-input-box {
  flex: 1;
}

.get-phone-btn {
  width: 170rpx;
  height: 88rpx;
  line-height: 88rpx;
  padding: 0;
  margin: 0;
  background: #eaf2ff;
  color: #1e80ff;
  border-radius: 16rpx;
  font-size: 24rpx;
  box-sizing: border-box;
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

.picker-wrapper {
  width: 100%;
}

.picker-box {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  border: 1px solid #e5e7eb;
  border-radius: 16rpx;
  background: #f8fafc;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.picker-text {
  font-size: 28rpx;
  color: #111827;
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