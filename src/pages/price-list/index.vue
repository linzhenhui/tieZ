<template>
  <view class="page">
    <!-- #ifdef H5 -->
    <view class="topbar">
      <view class="back-btn" @click="goBack">‹</view>
      <view class="title">询价结果</view>
      <view class="placeholder"></view>
    </view>
    <!-- #endif -->

    <view class="content">
      <!-- 查询条件 -->
      <view class="query-card" v-if="queryInfo">
        <view class="card-title">查询条件</view>
        <view class="query-row">
          <text class="query-label">提箱地：</text>
          <text class="query-value">{{ queryInfo.pickUpPlaceText || '-' }}</text>
        </view>
        <view class="query-row">
          <text class="query-label">装箱地：</text>
          <text class="query-value">{{ queryInfo.loadingPlaceText || '-' }}</text>
        </view>
        <view class="query-row">
          <text class="query-label">目的地：</text>
          <text class="query-value">{{ queryInfo.destinationText || '-' }}</text>
        </view>
      </view>

      <!-- 结果列表 -->
      <view class="result-card">
        <view class="card-title">
          报价结果
          <text class="count" v-if="list.length">（{{ list.length }}条）</text>
        </view>

        <view v-if="loading" class="empty-state">
          <text class="empty-text">加载中...</text>
        </view>

        <view v-else-if="!list.length" class="empty-state">
          <text class="empty-text">暂无报价结果</text>
        </view>

        <view v-else class="quote-list">
          <view v-for="item in list" :key="item.id" class="quote-item">
            <view class="quote-head">
              <view class="price">
                <text class="price-num">{{ formatPrice(item.price) }}</text>
                <text class="price-currency">{{ item.currency || 'CNY' }}</text>
              </view>
            </view>

            <view class="quote-body">
              <view class="info-row">
                <text class="info-label">箱型</text>
                <text class="info-value">{{ item.contType || '-' }}</text>
              </view>

              <view class="info-row">
                <text class="info-label">有效期</text>
                <text class="info-value">{{ formatDateRange(item.startDate, item.endDate) }}</text>
              </view>
            </view>

            <view class="quote-foot">
              <view class="status" :class="statusClass(item.status)">
                {{ formatStatus(item.status) }}
              </view>

              <button class="order-btn" :disabled="orderingId === item.id" @click="handleOrder(item)">
                {{ orderingId === item.id ? '下单中...' : '下单' }}
              </button>
            </view>
          </view>
        </view>
      </view>

      <view class="actions">
        <button class="primary-btn" @click="goHome">重新询价</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { TruckQuoteItem } from '@/api'
import { orderTruckApi } from '@/api'

interface TruckQuoteStorage {
  form: {
    pickUpPlaceId?: string
    loadingPlaceId?: string
    destinationId?: string
    pickUpPlaceText?: string
    loadingPlaceText?: string
    destinationText?: string
  }
  list: TruckQuoteItem[]
}

const loading = ref(true)
const list = ref<TruckQuoteItem[]>([])
const queryInfo = ref<TruckQuoteStorage['form'] | null>(null)
const orderingId = ref<number | ''>('')

const loadData = () => {
  loading.value = true

  try {
    const data = uni.getStorageSync('truckQuoteResult') as TruckQuoteStorage | null

    if (data && Array.isArray(data.list)) {
      queryInfo.value = data.form || null
      list.value = data.list || []
    } else {
      queryInfo.value = null
      list.value = []
    }
  } catch (error) {
    queryInfo.value = null
    list.value = []
  } finally {
    loading.value = false
  }
}

const formatPrice = (val: any) => {
  const num = Number(val)
  if (Number.isNaN(num)) return '-'
  return num.toFixed(2)
}

const formatDateRange = (start?: string, end?: string) => {
  if (!start && !end) return '-'
  if (start && end) return `${start} ~ ${end}`
  return start || end || '-'
}

const formatStatus = (status?: string) => {
  switch (status) {
    case '0':
      return '有效'
    case '1':
      return '停用'
    default:
      return status || '-'
  }
}

const statusClass = (status?: string) => {
  return {
    active: status === '0',
    inactive: status === '1'
  }
}

const handleOrder = async (item: TruckQuoteItem) => {
  try {
    orderingId.value = item.id

    const res = await orderTruckApi({
      id: item.id
    })
    uni.showToast({
      title: '下单成功',
      icon: 'success'
    })

    // 下单成功后跳转到物流单页面
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/logistics/list'
      })
    }, 500)
  } catch (error) {
    uni.showToast({
      title: '下单失败',
      icon: 'none'
    })
  } finally {
    orderingId.value = ''
  }
}

const goBack = () => {
  uni.navigateBack({
    delta: 1
  })
}

const goHome = () => {
  uni.reLaunch({
    url: '/pages/home/index'
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #f5f7fa;
}

.topbar {
  height: 88rpx;
  padding: 0 24rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eef0f3;
  position: sticky;
  top: 0;
  z-index: 10;
  box-sizing: border-box;
}

.back-btn,
.placeholder {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 44rpx;
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2329;
}

.content {
  padding: 24rpx;
  box-sizing: border-box;
}

.query-card,
.result-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  box-shadow: 0 6rpx 20rpx rgba(31, 35, 41, 0.04);
}

.card-title {
  padding: 24rpx 28rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2329;
  border-bottom: 1px solid #eef0f3;
  background: #fcfcfd;
}

.count {
  font-size: 26rpx;
  color: #86909c;
  font-weight: 400;
}

.query-row {
  display: flex;
  padding: 18rpx 28rpx;
  border-bottom: 1px solid #f2f3f5;
  font-size: 26rpx;
}

.query-row:last-child {
  border-bottom: none;
}

.query-label {
  color: #86909c;
  width: 110rpx;
  flex-shrink: 0;
}

.query-value {
  color: #1f2329;
  flex: 1;
  word-break: break-all;
}

.empty-state {
  padding: 70rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #86909c;
}

.quote-list {
  padding: 20rpx;
}

.quote-item {
  background: #fff;
  border: 1px solid #eef0f3;
  border-radius: 18rpx;
  padding: 22rpx;
  margin-bottom: 18rpx;
}

.quote-item:last-child {
  margin-bottom: 0;
}

.quote-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20rpx;
  margin-bottom: 18rpx;
}

.supplier {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.supplier-cn {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2329;
  line-height: 1.4;
}

.supplier-en {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #86909c;
  line-height: 1.3;
}

.price {
  flex-shrink: 0;
  text-align: right;
}

.price-num {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #1677ff;
  line-height: 1.2;
}

.price-currency {
  display: block;
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #86909c;
}

.quote-body {
  background: #fafbfc;
  border-radius: 14rpx;
  padding: 18rpx 16rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  font-size: 24rpx;
  padding: 8rpx 0;
}

.info-label {
  color: #86909c;
  flex-shrink: 0;
}

.info-value {
  color: #1f2329;
  text-align: right;
  word-break: break-all;
}

.quote-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20rpx;
  margin-top: 16rpx;
}

.status {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  line-height: 1;
}

.status.active {
  background: #e8fff1;
  color: #18a058;
}

.status.inactive {
  background: #fff1f0;
  color: #d4380d;
}

.order-btn {
  min-width: 140rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 16rpx;
  background: #1677ff;
  color: #fff;
  font-size: 26rpx;
  padding: 0 24rpx;
  margin: 0;
}

.order-btn[disabled] {
  opacity: 0.6;
}

.actions {
  margin-top: 28rpx;
}

.primary-btn {
  height: 84rpx;
  line-height: 84rpx;
  border-radius: 16rpx;
  background: #1677ff;
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
}
</style>