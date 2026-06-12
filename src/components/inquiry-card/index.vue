<template>
  <view class="card">
    <view class="card-head">
      <view class="code-wrap">
        <text class="code">单号：{{ item.code || item.id }}</text>
      </view>
      <view class="status" :class="statusClass">
        {{ statusText }}
      </view>
    </view>

    <view class="card-body">
      <view class="row">
        <text class="label">提箱地</text>
        <text class="value">{{ item.pickUpPlace || '-' }}</text>
      </view>

      <view class="row">
        <text class="label">装箱地</text>
        <view class="value-wrap">
          <view v-if="splitText(item.loadingPlace!).length">
            <view v-for="(place, index) in splitText(item.loadingPlace!)" :key="index" class="value-line">
              {{ place }}
            </view>
          </view>
          <text v-else class="value">-</text>
        </view>
      </view>

      <view class="row">
        <text class="label">目的地</text>
        <view class="value-wrap">
          <view v-if="splitText(item.destination!).length">
            <view v-for="(place, index) in splitText(item.destination!)" :key="index" class="value-line">
              {{ place }}
            </view>
          </view>
          <text v-else class="value">-</text>
        </view>
      </view>

      <view class="row">
        <text class="label">箱型箱量</text>
        <text class="value">{{ item.contType || '-' }} * {{ item.contNum || '-' }}</text>
      </view>

      <view class="row">
        <text class="label">货重</text>
        <text class="value">{{ item.weight ?? '-' }} {{ item.weight ? 'KGS' : '' }}</text>
      </view>

      <view class="row">
        <text class="label">提货时间</text>
        <text class="value">{{ item.pickUpTime || '-' }}</text>
      </view>

      <view v-if="item.detail" class="row">
        <text class="label">品名</text>
        <text class="value">{{ item.detail }}</text>
      </view>

      <view v-if="item.notice" class="row">
        <text class="label">注意事项</text>
        <text class="value">{{ item.notice }}</text>
      </view>
      <view v-if="item.price !== null && item.price !== undefined" class="price-row">
        <text class="price-label">费用总计</text>
        <text class="price-value">{{ '¥' }} {{ item.price || '-' }}</text>
      </view>
      <view v-if="isAdmin && item.costPrice" class="price-row">
        <text class="price-label">车队费用总计</text>
        <text class="price-value">{{ '¥' }} {{ item.costPrice || '-' }}</text>
      </view>
    </view>

    <view v-if="actions && actions.length" class="card-footer">
      <button v-for="btn in actions" :key="btn.event + btn.text" class="action-btn" :class="btn.type"
        @click="handleAction(btn.event)">
        {{ btn.text }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useInquiryStore } from '@/store/inquiry'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
const userStore = useUserStore()
const { role } = storeToRefs(userStore)
const isFleet = computed(() => role.value === 'fleet')
const isAdmin = computed(() => role.value === 'admin')

type ActionItem = {
  text: string
  event: 'edit' | 'cancel' | 'confirm' | 'quote' | 'askprice' | 'golog'
  type?: 'primary' | 'success' | 'warn' | 'default'
}

type InquiryItem = {
  id: string | number
  code?: string
  status?: string | number
  pickUpPlace?: string
  loadingPlace?: string
  destination?: string
  contType?: string
  contNum?: number | string
  weight?: number | string
  pickUpTime?: string
  detail?: string
  notice?: string
  customerName?: string
  supplierName?: string
  price?: number | string | null
  currency?: string | null
  costPrice?: number | string | null
}

const props = defineProps<{
  item: InquiryItem
  actions?: ActionItem[]
}>()

const emit = defineEmits<{
  (e: 'edit', id: string): void
  (e: 'cancel', id: string): void
  (e: 'confirm', id: string): void
  (e: 'quote', id: string): void
  (e: 'askprice', id: string): void
  (e: 'golog', id: string): void
}>()

const inquiryStore = useInquiryStore()
const splitText = (val: string) => {
  return (val || '')
    .split(/[,，]/)
    .map(v => v.trim())
    .filter(Boolean)
}
/**
 * 状态文案：从字典查
 */
const statusText = computed(() => {
  return inquiryStore.getStatusLabel(
    props.item.status ?? ''
  )
})

/**
 * 状态样式：按字典顺序映射
 * 你可以按实际业务调这个顺序对应的颜色
 */
const statusClass = computed(() => {
  const index = inquiryStore.getStatusIndex(
    props.item.status ?? ''
  )

  const classMap = [
    'status-warn',
    'status-primary',
    'status-success',
    'status-cancel',
    'status-default'
  ]

  return classMap[index] || 'status-default'
})

const handleAction = (event: ActionItem['event']) => {
  const id = String(props.item.id)
  const code = String(props.item.code)
  if (event === 'edit') emit('edit', id)
  if (event === 'cancel') emit('cancel', id)
  if (event === 'confirm') emit('confirm', id)
  if (event === 'quote') emit('quote', id)
  if (event === 'askprice') emit('askprice', id)
  if (event === 'golog') emit('golog', code)
}
</script>

<style scoped lang="scss">
@import '@/uni.scss';

.card {
  background: #fff;
  border-radius: $radius-md;
  margin-bottom: 20rpx;
  overflow: hidden;
  border: 1px solid $color-border;
}

.card-head {
  padding: 20rpx 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid $color-divider;
  background: #fcfcfd;
}

.code {
  font-size: 24rpx;
  color: $color-text-2;
}

.status {
  font-size: 24rpx;
  font-weight: 600;
}

.status-warn {
  color: #fa8c16;
}

.status-primary {
  color: $color-primary;
}

.status-success {
  color: $color-success;
}

.status-cancel {
  color: $color-danger;
}

.status-default {
  color: $color-text-2;
}

.card-body {
  padding: 20rpx 24rpx;
}

.row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 14rpx;
  gap: 16rpx;
}

.label {
  width: 140rpx;
  flex-shrink: 0;
  color: $color-text-3;
  font-size: 26rpx;
}

.value {
  flex: 1;
  color: $color-text;
  font-size: 26rpx;
  line-height: 1.5;
  word-break: break-all;
}

.card-footer {
  padding: 18rpx 24rpx 24rpx;
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  flex-wrap: wrap;
}

.action-btn {
  min-width: 140rpx;
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 22rpx;
  border-radius: $radius-sm;
  font-size: 26rpx;
  margin: 0;
}

.primary {
  background: $color-primary;
  color: #fff;
}

.success {
  background: $color-success;
  color: #fff;
}

.warn {
  background: #fff7e6;
  color: #d46b08;
  border: 1px solid #ffd591;
}

.default {
  background: #f5f5f5;
  color: $color-text-2;
}

.price-row {
  margin-top: 18rpx;
  padding: 18rpx 20rpx;
  background: #f7faff;
  border-radius: $radius-sm;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-label {
  font-size: 26rpx;
  color: $color-text-3;
}

.price-value {
  font-size: 34rpx;
  font-weight: 600;
  color: $color-primary;
}

.row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.label {
  width: 120rpx;
  flex-shrink: 0;
  color: #666;
}

.value-wrap {
  flex: 1;
}

.value-line {
  color: #333;
  line-height: 1.6;
  margin-bottom: 6rpx;
}

.value {
  color: #333;
}
</style>