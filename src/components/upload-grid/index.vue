<template>
  <view class="upload-image" @click="chooseImage">
    <image v-if="modelValue" class="img" :src="modelValue" mode="aspectFill" />
    <view v-else class="placeholder">
      <text class="plus">+</text>
      <text class="text">{{ text }}</text>
    </view>

    <view v-if="loading" class="mask">
      <text>上传中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { uploadUrl } from '@/config/env'

const props = withDefaults(defineProps<{
  modelValue: string
  text?: string
  headers?: Record<string, string>
}>(), {
  text: '上传图片',
  headers: () => ({})
})

const getToken = () => {
  return uni.getStorageSync('token') || ''
}

const token = getToken()

const emit = defineEmits(['update:modelValue', 'success', 'fail'])

const loading = ref(false)

const chooseImage = async () => {
  if (loading.value) return

  loading.value = true
  try {
    const chooseRes: any = await new Promise((resolve, reject) => {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: resolve,
        fail: reject
      })
    })

    const filePath = chooseRes?.tempFilePaths?.[0]
    if (!filePath) {
      throw new Error('未选择图片')
    }

    const uploadRes: any = await new Promise((resolve, reject) => {
      uni.uploadFile({
        url: uploadUrl,
        filePath,
        name: 'file', // 如果后端字段不是 file，这里改掉
        header: { access_token: token, ...props.headers },
        success: resolve,
        fail: reject
      })
    })

    const rawData = uploadRes?.data
    const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData

    // 按常见返回格式兼容解析
    const url =
      data?.data?.url ||
      data?.data?.path ||
      data?.url ||
      data?.path ||
      data?.data ||
      ''

    if (!url) {
      throw new Error('图片上传成功，但未获取到图片地址')
    }
    loading.value = false

    emit('update:modelValue', url)
    emit('success', url)
  } catch (error) {
    console.error('图片上传失败:', error)
    loading.value = false
    emit('fail', error)

  }

}
</script>

<style scoped lang="scss">
.upload-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: #f7f8fa;
  border: 1px dashed #d9d9d9;
  position: relative;
}

.img {
  width: 100%;
  height: 100%;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.plus {
  font-size: 44rpx;
  line-height: 1;
}

.text {
  margin-top: 8rpx;
  font-size: 22rpx;
}

.mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}
</style>