<template>
  <PageLayout :showTabbar="false">
    <view class="page">
      <view class="wrapper">
        <view class="title-bar">
          <text class="title-text">提货信息</text>
        </view>

        <view class="section">
          <view class="section-title">基础信息</view>

          <view class="form-item">
            <text class="label required">提货日期</text>

            <picker mode="date" :value="form.pickupGoodsDate" @change="onDateChange">
              <view class="picker-input">
                <text :class="['picker-text', !form.pickupGoodsDate && 'placeholder']">
                  {{ form.pickupGoodsDate || '请选择提货日期' }}
                </text>
              </view>
            </picker>
          </view>
        </view>

        <view class="divider"></view>

        <view class="section">
          <view class="section-title required">提货照片</view>
          <view class="photo-tip">以下 3 张照片为必传</view>

          <view class="photo-list">
            <view class="photo-item">
              <text class="photo-label required">空箱开门照</text>
              <UploadImage v-model="form.loadingOpenEmptyImg" text="上传空箱开门照" />
            </view>

            <view class="photo-item">
              <text class="photo-label required">四分之一照</text>
              <UploadImage v-model="form.quarterImg" text="上传4/1照" />
            </view>

            <view class="photo-item">
              <text class="photo-label required">二分之一照</text>
              <UploadImage v-model="form.halfImg" text="上传2/1照" />
            </view>
          </view>

          <view class="other-photo-block">
            <view class="section-subtitle">其他照片（可选）</view>

            <view v-if="form.otherPhotos.length" class="other-photo-list">
              <view v-for="(item, index) in form.otherPhotos" :key="index" class="other-photo-item">
                <UploadImage v-model="form.otherPhotos[index]" text="其他照片" />
                <view class="remove-btn" @click="removeOtherPhoto(index)">删除</view>
              </view>
            </view>

            <view class="add-btn" @click="addOtherPhoto">+ 添加其他照片</view>
          </view>
        </view>

        <button class="submit-btn" @click="handleSubmit">提交</button>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PageLayout from '@/components/page-layout/index.vue'
import UploadImage from '@/components/upload-grid/index.vue'
import { useLogisticsStore } from '@/store/logistics'
import { requireLogin } from '@/utils/guard'

const logisticsStore = useLogisticsStore()
const orderId = ref('')
const onDateChange = (e: any) => {
  form.pickupGoodsDate = e.detail.value
}

const form = reactive({
  pickupGoodsDate: '',
  loadingOpenEmptyImg: '',
  quarterImg: '',
  halfImg: '',
  otherPhotos: [] as string[]
})

onLoad((options) => {
  if (!requireLogin('/pages/pickup-goods/form')) return
  orderId.value = String(options?.id || '')
})

const addOtherPhoto = () => {
  form.otherPhotos.push('')
}

const removeOtherPhoto = (index: number) => {
  form.otherPhotos.splice(index, 1)
}

const validateForm = () => {
  if (!form.pickupGoodsDate) {
    uni.showToast({ title: '请填写提货日期', icon: 'none' })
    return false
  }

  if (!form.loadingOpenEmptyImg) {
    uni.showToast({ title: '请上传空箱开门照', icon: 'none' })
    return false
  }

  if (!form.quarterImg) {
    uni.showToast({ title: '请上传四分之一照', icon: 'none' })
    return false
  }

  if (!form.halfImg) {
    uni.showToast({ title: '请上传二分之一照', icon: 'none' })
    return false
  }

  return true
}

const handleSubmit = () => {
  if (!validateForm()) return

  logisticsStore.submitPickupGoods(orderId.value, {
    loadingTime: form.pickupGoodsDate,
    loadingOpenEmptyImg: form.loadingOpenEmptyImg,
    quarterImg: form.quarterImg,
    halfImg: form.halfImg,
    loadingOtherImg: form.otherPhotos.filter(Boolean).toString() // 过滤掉空字符串并转换为逗号分隔的字符串
  })

  uni.showToast({
    title: '提货提交成功',
    icon: 'none'
  })

  setTimeout(() => {
    uni.navigateBack()
  }, 300)
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