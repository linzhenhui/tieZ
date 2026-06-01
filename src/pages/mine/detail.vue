<template>
  <PageLayout :showTabbar="false">
    <view class="page">
      <view class="card">
        <view class="title">修改用户信息</view>

        <!-- 头像 -->
        <view class="form-item">
          <text class="label required">头像</text>

          <!-- #ifdef MP-WEIXIN -->
          <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
            <image v-if="form.avatar" :src="form.avatar" class="avatar-img" mode="aspectFill" />
            <view v-else class="avatar-placeholder">+</view>
          </button>
          <!-- #endif -->

          <!-- #ifndef MP-WEIXIN -->
          <view class="avatar-preview" @click="pickAvatar">
            <image v-if="form.avatar" :src="form.avatar" class="avatar-img" mode="aspectFill" />
            <view v-else class="avatar-placeholder">+</view>
          </view>
          <!-- #endif -->
        </view>

        <!-- 昵称 -->
        <view class="form-item">
          <text class="label required">昵称</text>
          <view class="input-with-btn">
            <input v-model="form.nickName" class="input" placeholder="请输入昵称" placeholder-class="placeholder" />

            <button class="mini-btn" @click="getWechatNickname">微信昵称</button>
          </view>
        </view>

        <!-- 手机号 -->
        <view class="form-item">
          <text class="label required">手机号</text>
          <input v-model="form.phone" class="input" type="number" maxlength="11" placeholder="请输入手机号"
            placeholder-class="placeholder" />
        </view>

        <!-- 邮箱 -->
        <view class="form-item">
          <text class="label">邮箱</text>
          <input v-model="form.email" class="input" type="text" placeholder="请输入邮箱" placeholder-class="placeholder" />
        </view>

        <!-- 性别 -->
        <view class="form-item">
          <text class="label">性别</text>
          <picker :range="sexOptions" range-key="label" @change="handleSexChange" class="picker-wrapper">
            <view class="picker-box">
              <text :class="['picker-text', !form.sex && 'placeholder']">
                {{ getSexLabel(form.sex) || '请选择性别' }}
              </text>
            </view>
          </picker>
        </view>

        <!-- 所属客商 -->
        <view class="form-item" v-if="showRefIdField">
          <text class="label">所属客商</text>
          <picker :range="merchantOptions" range-key="label" @change="handleMerchantChange" class="picker-wrapper">
            <view class="picker-box">
              <text :class="['picker-text', !form.refId && 'placeholder']">
                {{ getMerchantLabel(form.refId) || '请选择所属客商' }}
              </text>
            </view>
          </picker>
        </view>

        <button class="submit-btn" :loading="loading" @click="handleSave">保存</button>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PageLayout from '@/components/page-layout/index.vue'
import { useUserStore } from '@/store/user'
import { getUserInfoApi, updateUserInfoApi } from '@/api'
import { queryMerchantListApi, getDictDataApi } from '@/api'
import { uploadUrl } from '@/config/env'

const sexOptions = ref<{ label: string; value: string }[]>([])
const loadSexOptions = async () => {
  try {
    const res: any = await getDictDataApi('sys_user_sex')
    const list = res || []

    sexOptions.value = list.map((item: any) => ({
      label: item.dictLabel,
      value: item.dictValue
    }))
  } catch (err) {
    console.error('获取性别字典失败:', err)
  }
}
const userStore = useUserStore()
const loading = ref(false)


const showRefIdField = ref(true)
const merchantOptions = ref<{ label: string; value: string }[]>([])

const form = reactive({
  id: '',
  avatar: '',
  nickName: '',
  phone: '',
  email: '',
  sex: '',
  refId: ''
})
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
  console.log("🚀 ~ uploadAvatarFile ~ filePath:", filePath)
  if (!filePath) return
  if (avatarUploading.value) return

  avatarUploading.value = true
  uni.showLoading({ title: '上传中...' })

  try {
    const token = uni.getStorageSync('token')

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

    form.avatar = url
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

const getWechatNickname = () => {
  // #ifdef MP-WEIXIN
  uni.getUserProfile({
    desc: '用于完善用户资料',
    success: (res: any) => {
      const nickname = res?.userInfo?.nickName || ''
      if (nickname) {
        form.nickName = nickname
        uni.showToast({
          title: '已获取微信昵称',
          icon: 'none'
        })
      } else {
        uni.showToast({
          title: '未获取到昵称',
          icon: 'none'
        })
      }
    },
    fail: () => {
      uni.showToast({
        title: '已取消授权',
        icon: 'none'
      })
    }
  })
  // #endif

  // #ifndef MP-WEIXIN
  uni.showToast({
    title: '仅微信小程序支持获取微信昵称',
    icon: 'none'
  })
  // #endif
}

const loadUserInfo = async () => {
  try {
    const res: any = await getUserInfoApi()
    const info = res?.data || res || {}

    form.id = info?.id || ''
    form.avatar = info?.avatar || ''
    form.nickName = info?.nickName || info?.userName || ''
    form.phone = info?.phone || info?.phonenumber || ''
    form.email = info?.email || ''
    form.sex = info?.sex || ''
    form.refId = info?.refId || ''
  } catch (err) {
    console.error('获取用户信息失败:', err)
  }
}

const loadMerchantList = async () => {
  try {
    const res: any = await queryMerchantListApi({})
    const list = res?.data || res || []

    merchantOptions.value = list.map((item: any) => ({
      label: item.nameCn,
      value: String(item.id || item.mebId || item.refId || '')
    }))
  } catch (err) {
    console.error('获取客商列表失败:', err)
  }
}

const handleSexChange = (e: any) => {
  const index = Number(e.detail.value)
  const item = sexOptions.value[index]
  if (item) {
    form.sex = item.value
  }
}
const getSexLabel = (value: string) => {
  const item = sexOptions.value.find(i => i.value === value)
  return item?.label || ''
}

const handleMerchantChange = (e: any) => {
  const index = Number(e.detail.value)
  const item = merchantOptions.value[index]
  if (item) {
    form.refId = item.value
  }
}

const getMerchantLabel = (value: string) => {
  const item = merchantOptions.value.find(i => i.value === value)
  return item?.label || ''
}

const validatePhone = (phone: string) => {
  return /^1\d{10}$/.test(phone)
}

const validateEmail = (email: string) => {
  if (!email) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const handleSave = async () => {
  if (!form.nickName.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  if (!form.phone.trim()) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }

  if (!validatePhone(form.phone.trim())) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return
  }

  if (!validateEmail(form.email.trim())) {
    uni.showToast({ title: '邮箱格式不正确', icon: 'none' })
    return
  }

  try {
    loading.value = true
    uni.showLoading({ title: '保存中...' })

    await updateUserInfoApi({
      id: form.id,
      nickName: form.nickName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      sex: form.sex,
      avatar: form.avatar,
      refId: form.refId
    })

    const res: any = await getUserInfoApi()
    const info = res?.data || res || {}

    userStore.updateUserInfo({
      id: info?.id || form.id,
      avatar: info?.avatar || form.avatar,
      nickName: info?.nickName || form.nickName.trim(),
      phone: info?.phone || info?.phonenumber || form.phone.trim(),
      email: info?.email || form.email.trim(),
      sex: info?.sex || form.sex,
      refId: info?.refId || form.refId
    })

    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 300)
  } catch (err: any) {
    console.error('保存失败:', err)
    uni.showToast({
      title: err?.message || '保存失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    uni.hideLoading()
  }
}

onLoad(() => {
  loadUserInfo()
  loadMerchantList()
  loadSexOptions()
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
  background: #f7f8fa;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
}

.title {
  font-size: 34rpx;
  font-weight: 700;
  color: #111827;
  margin-bottom: 28rpx;
}

.form-item {
  margin-bottom: 24rpx;
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

.input {
  flex: 1;
  height: 88rpx;
  padding: 0 24rpx;
  border: 1px solid #e5e7eb;
  border-radius: 16rpx;
  background: #f8fafc;
  box-sizing: border-box;
  font-size: 28rpx;
  color: #111827;
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

.placeholder {
  color: #9ca3af;
}

.submit-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  margin-top: 10rpx;
  background: #1e80ff;
  color: #fff;
  border-radius: 18rpx;
  font-size: 30rpx;
  font-weight: 600;
}
</style>