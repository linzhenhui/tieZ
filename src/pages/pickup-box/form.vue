<template>
  <PageLayout :showTabbar="false">
    <view class="page">
      <view class="wrapper">
        <view class="title-bar">
          <text class="title-text">提箱信息</text>
        </view>

        <view class="section">
          <view class="section-title">基础信息</view>

          <view class="form-item">
            <text class="label required">箱号</text>
            <input v-model="form.containerNo" class="input" placeholder="请输入箱号" placeholder-class="placeholder" />
          </view>

          <view class="form-item">
            <text class="label required">封号</text>
            <input v-model="form.sealNo" class="input" placeholder="请输入封号" placeholder-class="placeholder" />
          </view>

          <view class="form-item">
            <text class="label required">提箱日期</text>
            <picker mode="date" :value="form.pickupBoxDate" @change="onDateChange">
              <view class="picker-view">
                <text v-if="!form.pickupBoxDate" class="placeholder-text">请选择提箱日期</text>
                <text v-else>{{ form.pickupBoxDate }}</text>
              </view>
            </picker>
          </view>
        </view>

        <view class="divider"></view>

        <view class="section">
          <view class="section-title required">提箱照片</view>
          <view class="photo-tip">以下 4 张照片为必传</view>

          <view class="photo-list">
            <view class="photo-item">
              <text class="photo-label required">箱底照</text>
              <UploadImage v-model="form.contBottomImg" text="上传箱底照" />
            </view>

            <view class="photo-item">
              <text class="photo-label required">铭牌照</text>
              <UploadImage v-model="form.namePlateImg" text="上传铭牌照" />
            </view>

            <view class="photo-item">
              <text class="photo-label required">空箱照</text>
              <UploadImage v-model="form.pickUpEmptyImg" text="上传空箱照" />
            </view>

            <view class="photo-item">
              <text class="photo-label required">空箱开门照</text>
              <UploadImage v-model="form.pickUpOpenEmptyImg" text="上传开门照" />
            </view>
          </view>

          <view class="other-photo-block">
            <view class="section-subtitle">其他照片（可选）</view>

            <view v-if="form.otherPhotos.length" class="other-photo-list">
              <view v-for="(item, index) in form.otherPhotos" :key="index" class="other-photo-item">
                <UploadImage v-model="form.otherPhotos[index]" :text="'其他照片'" />
                <view class="remove-btn" @click="removeOtherPhoto(index)">删除</view>
              </view>
            </view>

            <view class="add-btn" @click="addOtherPhoto">+ 添加其他照片</view>
          </view>
        </view>

        <button class="submit-btn" :loading="loading" @click="handleSubmit">
          提交
        </button>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PageLayout from '@/components/page-layout/index.vue'
import UploadImage from '@/components/upload-grid/index.vue'
import { pickupBoxApi } from '@/api/logistics'
import { requireLogin } from '@/utils/guard'
import { BASE_URL } from '@/config/env'
import {isValidContainerNo} from "@/utils/validate";

const orderId = ref('')
const loading = ref(false)
const containerNoReg = /^[A-Z]{4}\d{7}$/

const form = reactive({
  containerNo: '',
  sealNo: '',
  pickupBoxDate: '',

  // 4个固定必传
  contBottomImg: '',
  namePlateImg: '',
  pickUpEmptyImg: '',
  pickUpOpenEmptyImg: '',

  // 可选多张
  otherPhotos: [] as string[]
})

onLoad((options) => {
  if (!requireLogin('/pages/pickup-box/form')) return
  orderId.value = String(options?.id || '')
})

const onDateChange = (e: any) => {
  form.pickupBoxDate = e.detail.value
}
const addOtherPhoto = () => {
  form.otherPhotos.push('')
}

const removeOtherPhoto = (index: number) => {
  form.otherPhotos.splice(index, 1)
}

const validateForm = () => {
  const containerNo = form.containerNo.trim().toUpperCase()
  const sealNo = form.sealNo.trim()
  const pickupBoxDate = form.pickupBoxDate.trim()

  if (!containerNo || !sealNo || !pickupBoxDate) {
    uni.showToast({
      title: '请填写完整基础信息',
      icon: 'none'
    })
    return false
  }

  if (!isValidContainerNo(containerNo)) {
    uni.showToast({
      title: '请输入正确的集装箱箱号',
      icon: 'none'
    })
    return false
  }

  if (!form.contBottomImg) {
    uni.showToast({ title: '请上传箱底照', icon: 'none' })
    return false
  }

  if (!form.namePlateImg) {
    uni.showToast({ title: '请上传铭牌照', icon: 'none' })
    return false
  }

  if (!form.pickUpEmptyImg) {
    uni.showToast({ title: '请上传空箱照', icon: 'none' })
    return false
  }

  if (!form.pickUpOpenEmptyImg) {
    uni.showToast({ title: '请上传空箱开门照', icon: 'none' })
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (loading.value) return
  if (!validateForm()) return

  if (!orderId.value) {
    uni.showToast({ title: '缺少订单ID', icon: 'none' })
    return
  }

  loading.value = true
  try {
    await pickupBoxApi({
      id: orderId.value,
      cont: form.containerNo.trim().toUpperCase(),
      contTitle: form.sealNo.trim(),
      pickUpTime: form.pickupBoxDate,
      contBottomImg: form.contBottomImg,
      namePlateImg: form.namePlateImg,
      pickUpEmptyImg: form.pickUpEmptyImg,
      pickUpOpenEmptyImg: form.pickUpOpenEmptyImg,
      pickUpOtherImg: form.otherPhotos.filter(Boolean).toString()
    })

    uni.showToast({
      title: '提箱提交成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 300)
  } catch (err: any) {
    console.error('提箱提交失败:', err)
    uni.showToast({
      title: err?.message || '提箱提交失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
@import '@/uni.scss';

.page {
  min-height: 100vh;
  background: $color-page-bg;
  padding: 24rpx;
  box-sizing: border-box;
}

.wrapper {
  background: #fff;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  overflow: hidden;
}

.title-bar {
  padding: 26rpx 30rpx;
  border-bottom: 1px solid $color-divider;
  background: #fcfcfd;
}

.title-text {
  font-size: 34rpx;
  font-weight: 600;
  color: $color-text;
}

.section {
  padding: 24rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $color-text;
  margin-bottom: 20rpx;
}

.section-title.required::before {
  content: '*';
  color: $color-danger;
  margin-right: 6rpx;
}

.photo-tip {
  font-size: 24rpx;
  color: $color-text-3;
  margin-bottom: 20rpx;
}

.photo-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.photo-item {
  background: #fafafa;
  border-radius: 16rpx;
  padding: 16rpx;
}

.photo-label {
  display: block;
  font-size: 26rpx;
  color: $color-text-2;
  margin-bottom: 12rpx;
}

.photo-label.required::before {
  content: '*';
  color: $color-danger;
  margin-right: 6rpx;
}

.other-photo-block {
  margin-top: 26rpx;
}

.section-subtitle {
  font-size: 26rpx;
  font-weight: 600;
  color: $color-text;
  margin-bottom: 16rpx;
}

.other-photo-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.other-photo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.remove-btn {
  font-size: 22rpx;
  color: #ff4d4f;
}

.add-btn {
  margin-top: 16rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border: 1px dashed $color-border;
  border-radius: $radius-sm;
  color: $color-primary;
  font-size: 28rpx;
  background: #fafcff;
}

.divider {
  height: 20rpx;
  background: $color-page-bg;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.label {
  width: 160rpx;
  font-size: 28rpx;
  color: $color-text-2;
  flex-shrink: 0;
}

.label.required::before {
  content: '*';
  color: $color-danger;
  margin-right: 6rpx;
}

.input {
  flex: 1;
  height: 80rpx;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  background: $color-fill-light;
  padding: 0 24rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  color: $color-text;
}

.picker-view {
  flex: 1;
  height: 82rpx;
  border: 1px solid #e4e7ed;
  border-radius: 14rpx;
  background: #f9fafc;
  box-sizing: border-box;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333;
  display: flex;
  align-items: center;
  color: #333;
}

.picker-input {
  flex: 1;
  height: 80rpx;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  background: $color-fill-light;
  padding: 0 24rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.picker-text {
  font-size: 28rpx;
  color: $color-text;
}

.placeholder {
  color: $color-text-3;
}

.placeholder {
  color: $color-text-3;
}

.submit-btn {
  width: calc(100% - 48rpx);
  height: 84rpx;
  line-height: 84rpx;
  margin: 8rpx auto 32rpx;
  background: $color-primary;
  color: #fff;
  border-radius: $radius-sm;
  font-size: 30rpx;
  font-weight: 600;
}
</style>