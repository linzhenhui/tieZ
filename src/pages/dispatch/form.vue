<template>
  <PageLayout :showTabbar="false">
    <view class="page">
      <view class="wrapper">
        <view class="title-bar">
          <text class="title-text">调度信息</text>
        </view>

        <view class="section">
          <view class="form-item">
            <text class="label required">司机</text>
            <input v-model="form.driverName" class="input" placeholder="请输入司机姓名" placeholder-class="placeholder" />
          </view>

          <view class="form-item">
            <text class="label required">联系方式</text>
            <input v-model="form.phone" class="input" placeholder="请输入联系方式" placeholder-class="placeholder" />
          </view>

          <view class="form-item">
            <text class="label required">身份证</text>
            <input v-model="form.idCard" class="input" placeholder="请输入身份证号" placeholder-class="placeholder" />
          </view>

          <view class="form-item">
            <text class="label required">车牌号</text>
            <input v-model="form.truckNo" class="input" placeholder="请输入车牌号" placeholder-class="placeholder" />
          </view>

          <view class="form-item">
            <text class="label required">车挂号</text>
            <input v-model="form.trailerNo" class="input" placeholder="请输入车挂号" placeholder-class="placeholder" />
          </view>

          <view class="form-item">
            <text class="label required">车挂重</text>
            <input v-model="form.carWeight" class="input" placeholder="请输入车挂重" placeholder-class="placeholder" />
          </view>

          <view class="form-item">
            <text class="label required">车长</text>
            <input v-model="form.carLength" class="input" placeholder="请输入车长" placeholder-class="placeholder" />
          </view>
        </view>

        <button class="submit-btn" :loading="submitting" :disabled="submitting" @click="handleSubmit">
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
import { requireLogin } from '@/utils/guard'
import { dispatchingLogisticsTruckApi } from '@/api/logistics'

const orderId = ref('')

const submitting = ref(false)

const form = reactive({
  driverName: '',
  phone: '',
  idCard: '',
  truckNo: '',
  trailerNo: '',
  carWeight: '',
  carLength: ''
})

onLoad((options) => {
  if (!requireLogin('/pages/dispatch/form')) return
  orderId.value = String(options?.id || '')
})

const handleSubmit = async () => {
  if (!orderId.value) {
    uni.showToast({
      title: '缺少订单ID',
      icon: 'none'
    })
    return
  }

  if (!form.driverName || !form.phone || !form.idCard || !form.truckNo || !form.trailerNo || !form.carWeight || !form.carLength) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }

  const payload = {
    id: orderId.value,
    driver: form.driverName,
    phone: form.phone,
    idCard: form.idCard,
    carNo: form.truckNo,
    carRegistration: form.trailerNo,
    carWeight: form.carWeight,
    carLength: form.carLength
  }

  submitting.value = true
  uni.showLoading({ title: '提交中...' })

  const res: any = await dispatchingLogisticsTruckApi(payload)


  uni.showToast({
    title: '调度成功',
    icon: 'success'
  })

  setTimeout(() => {
    uni.reLaunch({
      url: '/pages/logistics/list'
    })
  }, 300)
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
  background: #f7f8fa;
}

.wrapper {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  padding: 24rpx;
}

.title-bar {
  margin-bottom: 24rpx;
}

.title-text {
  font-size: 34rpx;
  font-weight: 600;
  color: #1f2937;
}

.section {
  background: #fff;
}

.form-item {
  margin-bottom: 24rpx;
}

.label {
  display: block;
  margin-bottom: 12rpx;
  font-size: 28rpx;
  color: #374151;
}

.required::after {
  content: '*';
  color: #e53935;
  margin-left: 4rpx;
}

.input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  border: 1px solid #dbe2ea;
  border-radius: 12rpx;
  box-sizing: border-box;
  background: #fff;
  font-size: 28rpx;
}

.placeholder {
  color: #9ca3af;
}

.submit-btn {
  margin-top: 16rpx;
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 12rpx;
  background: #1677ff;
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
}
</style>