<template>
  <view class="order-card">
    <view class="card-head">
      <text class="order-no">{{ item.orderNo }}</text>
      <text class="time">{{ item.createdAt }}</text>
    </view>

    <view class="card-body">
      <view class="route-row">
        <text class="route-text">{{ item.fromCity }} → {{ item.toCity }}</text>
        <OrderBadge :text="statusText" :type="badgeType" />
      </view>

      <view class="info-row">
        <text class="label">提箱地</text>
        <text class="value">{{ item.boxPlace }}</text>
      </view>

      <view class="info-row">
        <text class="label">箱型箱量</text>
        <text class="value">{{ item.containerInfo }}</text>
      </view>

      <view class="info-row">
        <text class="label">提货时间</text>
        <text class="value">{{ item.pickupTime || '-' }}</text>
      </view>

      <view class="info-row">
        <text class="label">货重</text>
        <text class="value">{{ item.weight || '-' }}</text>
      </view>

      <view class="info-row">
        <text class="label">品名</text>
        <text class="value">{{ item.goodsName || '-' }}</text>
      </view>

      <view class="price-row">
        <text class="price-label">运费</text>
        <text class="price-value">{{ '¥' }} {{ isFleet ? item.costPrice : item.price || '-' }}</text>
      </view>
      <view class="price-row" v-if="isAdmin">
        <text class="price-label">车队报价</text>
        <text class="price-value">{{ '¥' }} {{ item.costPrice || '-' }}</text>
      </view>
    </view>

    <view v-if="displayActions.length" class="card-footer">
      <button v-for="btn in displayActions" :key="btn.text" class="btn" :class="btn.type || 'default'"
        @click="handleAction(btn)">
        {{ btn.text }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OrderBadge from '@/components/order-badge/index.vue'
import { useUserStore } from '@/store/user'
import { useLogisticsStore } from '@/store/logistics'
import { storeToRefs } from 'pinia'
type ActionEvent = 'detail' | 'cancel' | 'dispatch' | 'stage' | 'waiting'
type StageKey = 'box' | 'pickup' | 'weigh'

interface ActionItem {
  text: string
  event: ActionEvent
  type?: string
  stageKey?: StageKey
}

const props = withDefaults(
  defineProps<{
    item: any
    actions?: ActionItem[]
  }>(),
  {
    actions: () => []
  }
)

const emit = defineEmits<{
  (e: 'detail', id: string | number): void
  (e: 'cancel', id: string | number): void
  (e: 'dispatch', id: string | number): void
  (e: 'waiting', id: string | number): void
  (e: 'stage', id: string | number, stageKey: StageKey): void
}>()

const userStore = useUserStore()
const logisticsStore = useLogisticsStore()
const { role } = storeToRefs(userStore)

const isFleet = computed(() => role.value === 'fleet')
const isAdmin = computed(() => role.value === 'admin')
const isOwner = computed(() => role.value === 'owner')

const statusDictList = computed(() =>
  !isOwner.value
    ? logisticsStore.fleetStatusDictList
    : logisticsStore.ownerStatusDictList
)

/**
 * 状态文案
 */
const statusText = computed(() => {
  const hit = statusDictList.value.find(
    (item) => String(item.dictValue) === String(props.item.status)
  )
  return hit?.dictLabel || String(props.item.status || '-')
})

/**
 * badge 类型
 */
const badgeType = computed(() => {
  const idx = statusDictList.value.findIndex(
    (item) => String(item.dictValue) === String(props.item.status)
  )

  const typeMap: Array<'warning' | 'primary' | 'success' | 'default'> = [
    'warning',
    'primary',
    'primary',
    'success'
  ]

  return typeMap[idx] || 'default'
})

/**
 * 是否待派单
 */
const isWaitingCount = computed(() => {
  const text = String(statusText.value || '')
  const raw = String(props.item.status || '')
  return (
    text.includes('待派单') ||
    // text.includes('调度中') ||
    raw === '0'
    // raw === '1'
  )
})

/**
 * 是否调度中
 */
const isDispatching = computed(() => {
  const text = String(statusText.value || '')
  const raw = String(props.item.status || '')
  return (
    text.includes('调度中') ||
    text.includes('待调度') ||
    raw === 'dispatching' ||
    raw === 'dispatch'
  )
})

/**
 * 是否提货中
 */
const isPicking = computed(() => {
  const text = String(statusText.value || '')
  const raw = String(props.item.status || '')
  return text.includes('提货中') || raw === 'picking' || raw === 'pickup'
})

/**
 * 后端步骤状态 -> 稳定 stageKey
 * 你如果后端字段名不是这些，改这里即可
 */
const stageKey = computed<StageKey>(() => {
  const row: any = props.item || {}
  const raw = String(
    row.pickUpStatus ||
    ''
  )

  const map: Record<string, StageKey> = {
    '0': 'box',
    '1': 'pickup',
    '2': 'weigh',
    box: 'box',
    pickup: 'pickup',
    pick: 'pickup',
    weigh: 'weigh',
    weighing: 'weigh',
    unload: 'weigh',
    loading: 'pickup',
    delivered: 'weigh'
  }

  return map[raw] || 'box'
})

/**
 * 默认按钮
 */
const defaultActions = computed<ActionItem[]>(() => {
  // 货主端：只看详情
  if (isOwner.value) {
    return [
      {
        text: '查看详情',
        event: 'detail',
        type: 'detail'
      }
    ]
  }
  if (isAdmin.value) {
    if (isWaitingCount.value) {
      return [
        {
          text: '派单',
          event: 'waiting',
          type: 'primary'
        },
        {
          text: '详情',
          event: 'detail',
          type: 'detail'
        }
      ]
    }
  }
  // 车队端：调度中
  if (isDispatching.value) {
    return [
      {
        text: '调度',
        event: 'dispatch',
        type: 'primary'
      },
      {
        text: '详情',
        event: 'detail',
        type: 'detail'
      }
    ]
  }

  // 车队端：提货中
  if (isPicking.value) {
    return [
      {
        text: stageText.value,
        event: 'stage',
        type: 'primary',
        stageKey: stageKey.value
      },
      {
        text: '详情',
        event: 'detail',
        type: 'detail'
      }
    ]
  }

  // 车队端：其他状态
  return [
    {
      text: '详情',
      event: 'detail',
      type: 'detail'
    }
  ]
})

/**
 * 后端返回步骤文案
 */
const stageText = computed(() => {
  switch (stageKey.value) {
    case 'box':
      return '提箱'
    case 'pickup':
      return '提货'
    case 'weigh':
      return '落重'
    default:
      return '状态'
  }
})

/**
 * 父组件传 actions 则优先使用，否则走默认规则
 */
const displayActions = computed(() => {
  return props.actions.length ? props.actions : defaultActions.value
})

const handleAction = (btn: ActionItem) => {
  const id = props.item.id

  if (btn.event === 'stage') {
    emit('stage', id, btn.stageKey || stageKey.value)
    return
  }

  emit(btn.event as Exclude<ActionEvent, 'stage'>, id)
}
</script>

<style scoped lang="scss">
@import '@/uni.scss';

.order-card {
  background: #fff;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  margin-top: 20rpx;
  overflow: hidden;
  box-shadow: 0 6rpx 20rpx rgba(31, 41, 55, 0.04);
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22rpx 24rpx;
  border-bottom: 1px solid $color-divider;
  font-size: $font-sm;
  background: #fcfcfd;
}

.order-no {
  font-weight: 600;
  color: $color-text;
}

.time {
  color: $color-text-3;
  font-size: $font-xs;
}

.card-body {
  padding: 24rpx;
}

.route-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.route-text {
  flex: 1;
  font-size: 32rpx;
  color: $color-text;
  font-weight: 600;
}

.info-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 14rpx;
  font-size: 27rpx;
  line-height: 1.7;
}

.label {
  width: 140rpx;
  color: $color-text-3;
  flex-shrink: 0;
}

.value {
  flex: 1;
  color: $color-text-2;
  word-break: break-all;
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

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  border-top: 1px solid $color-divider;
  background: #fff;
}

.btn {
  min-width: 140rpx;
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 24rpx;
  border-radius: $radius-sm;
  font-size: 28rpx;
  box-sizing: border-box;
  margin: 0;
}

.primary {
  background: $color-primary;
  color: #fff;
  border: 1px solid $color-primary;
}

.detail {
  background: #fff;
  color: $color-primary;
  border: 1px solid #b7d1ff;
}

.default {
  background: #fff;
  color: $color-text;
  border: 1px solid $color-border;
}
</style>