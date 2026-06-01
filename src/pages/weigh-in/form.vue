<template>
  <PageLayout :showTabbar="false">
    <view class="page">
      <view class="wrapper">
        <view class="title-bar">
          <text class="title-text">落重信息</text>
        </view>

        <view class="section">
          <view class="section-title">基础信息</view>

          <view class="form-item">
            <text class="label required">到达时间</text>
            <picker mode="date" :value="form.arriveTime" @change="onDateChange">
              <view class="picker-box">
                <text :class="['picker-text', !form.arriveTime && 'placeholder']">
                  {{ form.arriveTime || '请选择到达时间' }}
                </text>
              </view>
            </picker>
          </view>
        </view>

        <view class="divider"></view>

        <view class="section">
          <view class="section-title required">落重照片</view>
          <view class="photo-tip">进站照片必填，其他照片可选</view>

          <view class="photo-item">
            <text class="photo-label required">进站照片</text>
            <UploadImage v-model="form.arriveImg" text="上传进站照" />
          </view>

          <view class="other-photo-block">
            <view class="section-subtitle">其他照片（可选）</view>

            <view v-if="form.arriveOtherImg.length" class="other-photo-list">
              <view v-for="(item, index) in form.arriveOtherImg" :key="index" class="other-photo-item">
                <UploadImage v-model="form.arriveOtherImg[index]" text="上传其他照片" />
                <view class="remove-btn" @click="removeOtherPhoto(index)">删除</view>
              </view>
            </view>

            <view class="add-btn" @click="addOtherPhoto">+ 添加其他照片</view>
          </view>
        </view>

        <view class="divider"></view>

        <view class="section">
          <view class="section-title">额外费用</view>

          <view class="table-box">
            <view class="table-header">
              <text class="th th-type">费项</text>
              <text class="th th-amount">金额</text>
              <text class="th th-remark">备注</text>
              <text class="th th-op">操作</text>
            </view>

            <view v-for="(row, index) in form.fees" :key="index" class="table-row">
              <view class="td td-type">
                <text class="cell-text">{{ row.feeType || '-' }}</text>
              </view>

              <view class="td td-amount">
                <text class="cell-text">{{ row.feeAmount || '-' }}</text>
              </view>

              <view class="td td-remark">
                <text class="cell-text">{{ row.feeRemark || '-' }}</text>
              </view>

              <view class="td td-op">
                <text class="action-link" @click="openEditFeeDialog(index)">修改</text>
                <text class="action-link danger" @click="removeFeeRow(index)">删除</text>
              </view>
            </view>

            <view v-if="!form.fees.length" class="empty-row">暂无费用</view>
          </view>

          <view class="add-fee-btn" @click="openAddFeeDialog">+ 添加费用</view>
        </view>

        <button class="submit-btn" :disabled="logisticsStore.loading" @click="handleSubmit">
          {{ logisticsStore.loading ? '提交中...' : '提交' }}
        </button>
      </view>
      <view v-if="feeDialogVisible" class="fee-mask" @click="closeFeeDialog">
        <view class="fee-dialog" @click.stop>
          <view class="fee-dialog-title">
            {{ feeDialogMode === 'add' ? '添加费用' : '修改费用' }}
          </view>

          <view class="fee-form-item">
            <text class="fee-label">费用类型</text>
            <input v-model="feeDialogForm.feeType" class="fee-input" placeholder="请输入费用类型"
              placeholder-class="placeholder" />
          </view>

          <view class="fee-form-item">
            <text class="fee-label">金额</text>
            <input v-model="feeDialogForm.feeAmount" class="fee-input" type="digit" placeholder="请输入金额"
              placeholder-class="placeholder" />
          </view>

          <view class="fee-form-item">
            <text class="fee-label">备注</text>
            <input v-model="feeDialogForm.feeRemark" class="fee-input" placeholder="请输入备注"
              placeholder-class="placeholder" />
          </view>

          <view class="fee-dialog-footer">
            <view class="fee-btn cancel" @click="closeFeeDialog">取消</view>
            <view class="fee-btn confirm" @click="confirmFeeDialog">确定</view>
          </view>
        </view>
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

const form = reactive({
  arriveTime: '',
  arriveImg: '',
  arriveOtherImg: [] as string[],
  fees: [] as {
    feeType: string
    feeAmount: string
    feeRemark: string
  }[]
})

onLoad((options) => {
  if (!requireLogin('/pages/arrive/form')) return
  orderId.value = String(options?.id || '')
})

const onDateChange = (e: any) => {
  form.arriveTime = e.detail.value
}

const addOtherPhoto = () => {
  form.arriveOtherImg.push('')
}

const removeOtherPhoto = (index: number) => {
  form.arriveOtherImg.splice(index, 1)
}

/** =========================
 *  费用弹窗逻辑
 *  ========================= */
const feeDialogVisible = ref(false)
const feeDialogMode = ref<'add' | 'edit'>('add')
const editingFeeIndex = ref(-1)

const feeDialogForm = reactive({
  feeType: '',
  feeAmount: '',
  feeRemark: ''
})

const resetFeeDialogForm = () => {
  feeDialogForm.feeType = ''
  feeDialogForm.feeAmount = ''
  feeDialogForm.feeRemark = ''
  editingFeeIndex.value = -1
}

const openAddFeeDialog = () => {
  feeDialogMode.value = 'add'
  resetFeeDialogForm()
  feeDialogVisible.value = true
}

const openEditFeeDialog = (index: number) => {
  const row = form.fees[index]
  if (!row) return

  feeDialogMode.value = 'edit'
  editingFeeIndex.value = index
  feeDialogForm.feeType = row.feeType || ''
  feeDialogForm.feeAmount = row.feeAmount || ''
  feeDialogForm.feeRemark = row.feeRemark || ''
  feeDialogVisible.value = true
}

const closeFeeDialog = () => {
  feeDialogVisible.value = false
  resetFeeDialogForm()
}

const confirmFeeDialog = () => {
  if (!feeDialogForm.feeType.trim()) {
    uni.showToast({ title: '请输入费用类型', icon: 'none' })
    return
  }

  if (!feeDialogForm.feeAmount.trim()) {
    uni.showToast({ title: '请输入金额', icon: 'none' })
    return
  }

  const newRow = {
    feeType: feeDialogForm.feeType.trim(),
    feeAmount: feeDialogForm.feeAmount.trim(),
    feeRemark: feeDialogForm.feeRemark.trim()
  }

  if (feeDialogMode.value === 'add') {
    form.fees.push(newRow)
  } else {
    if (editingFeeIndex.value < 0 || !form.fees[editingFeeIndex.value]) return
    form.fees.splice(editingFeeIndex.value, 1, newRow)
  }

  closeFeeDialog()
}

const removeFeeRow = (index: number) => {
  uni.showModal({
    title: '提示',
    content: '确定删除这条费用吗？',
    success: (res) => {
      if (res.confirm) {
        form.fees.splice(index, 1)
      }
    }
  })
}

const validateForm = () => {
  if (!form.arriveTime) {
    uni.showToast({
      title: '请选择到达时间',
      icon: 'none'
    })
    return false
  }

  if (!form.arriveImg) {
    uni.showToast({
      title: '请上传进站照片',
      icon: 'none'
    })
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  const validFees = form.fees.filter(
    item => item.feeType || item.feeAmount || item.feeRemark
  )

  try {
    await logisticsStore.submitArrive(orderId.value, {
      arriveTime: form.arriveTime,
      arriveImg: form.arriveImg,
      arriveOtherImg: form.arriveOtherImg.filter(Boolean).toString(),
      fees: validFees
    })

    uni.showToast({
      title: '落重提交成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 300)
  } catch (err: any) {
    console.error('落重提交失败:', err)
    uni.showToast({
      title: err?.message || '落重提交失败',
      icon: 'none'
    })
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

.section-subtitle {
  font-size: 26rpx;
  font-weight: 600;
  color: $color-text;
  margin-bottom: 16rpx;
}

.photo-tip {
  font-size: 24rpx;
  color: $color-text-3;
  margin-bottom: 20rpx;
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

.label {
  width: 160rpx;
  font-size: 28rpx;
  color: $color-text-2;
  flex-shrink: 0;
  padding-top: 2rpx;
}

.label.required::before {
  content: '*';
  color: $color-danger;
  margin-right: 6rpx;
}

.picker-box {
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

.placeholder {
  color: $color-text-3;
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

.add-btn,
.add-fee-btn {
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

.table-box {
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  overflow: hidden;
}

.table-header,
.table-row {
  display: flex;
  align-items: stretch;
}

.table-header {
  background: #f8f9fb;
  border-bottom: 1px solid $color-border;
}

.th,
.td {
  padding: 16rpx 12rpx;
  box-sizing: border-box;
  border-right: 1px solid $color-border;
  display: flex;
  align-items: center;
  justify-content: center;
}

.th:last-child,
.td:last-child {
  border-right: none;
}

.th {
  font-size: 24rpx;
  font-weight: 600;
  color: $color-text-2;
}

.table-row {
  border-bottom: 1px solid $color-border;
}

.table-row:last-child {
  border-bottom: none;
}

.td {
  min-height: 88rpx;
}

.th-type,
.td-type {
  width: 22%;
}

.th-amount,
.td-amount {
  width: 20%;
}

.th-remark,
.td-remark {
  width: 40%;
}

.th-op,
.td-op {
  width: 18%;
}

.cell-picker {
  width: 100%;
  min-height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell-text {
  font-size: 24rpx;
  color: $color-text;
  text-align: center;
}

.cell-input {
  width: 100%;
  min-height: 56rpx;
  font-size: 24rpx;
  color: $color-text;
  text-align: center;
}

.remove-link {
  font-size: 24rpx;
  color: #ff4d4f;
}

.submit-btn {
  width: calc(100% - 48rpx);
  height: 84rpx;
  line-height: 84rpx;
  margin: 24rpx auto 32rpx;
  background: $color-primary;
  color: #fff;
  border-radius: $radius-sm;
  font-size: 30rpx;
  font-weight: 600;
}

.submit-btn:disabled {
  opacity: 0.7;
}

.empty-row {
  padding: 28rpx 0;
  text-align: center;
  font-size: 24rpx;
  color: $color-text-3;
  border-bottom: 1px solid $color-border;
}

.action-link {
  font-size: 24rpx;
  color: $color-primary;
  margin: 0 8rpx;
}

.action-link.danger {
  color: #ff4d4f;
}

/* 弹窗遮罩 */
.fee-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

/* 弹窗主体 */
.fee-dialog {
  width: 650rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx 28rpx 24rpx;
  box-sizing: border-box;
}

.fee-dialog-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $color-text;
  margin-bottom: 24rpx;
  text-align: center;
}

.fee-form-item {
  margin-bottom: 22rpx;
}

.fee-label {
  display: block;
  font-size: 26rpx;
  color: $color-text-2;
  margin-bottom: 10rpx;
}

.fee-input {
  width: 100%;
  height: 78rpx;
  border: 1px solid $color-border;
  border-radius: 12rpx;
  background: $color-fill-light;
  padding: 0 20rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  color: $color-text;
}

.fee-dialog-footer {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.fee-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.fee-btn.cancel {
  background: #f2f3f5;
  color: $color-text-2;
}

.fee-btn.confirm {
  background: $color-primary;
  color: #fff;
}
</style>
