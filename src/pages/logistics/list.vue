<template>
  <PageLayout :currentPath="'/pages/logistics/list'" :showTabbar="true">
    <view class="page">
      <StatusTabs v-model="currentStatus" :list="tabList" />

      <template v-if="currentList.length">
        <LogisticsCard v-for="item in currentList" :key="item.id" :item="item" @detail="goDetail" @cancel="handleCancel"
          @dispatch="handleDispatch" @stage="handleStage" />
      </template>

      <EmptyState v-else text="暂无物流单数据" />
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import PageLayout from '@/components/page-layout/index.vue'
import StatusTabs from '@/components/status-tabs/index.vue'
import LogisticsCard from '@/components/logistics-card/index.vue'
import EmptyState from '@/components/empty-state/index.vue'
import { useUserStore } from '@/store/user'
import { useLogisticsStore } from '@/store/logistics'
import { requireLogin } from '@/utils/guard'
import {
  queryMyLogisticsListApi,
  queryFleetLogisticsListApi,
  querygmFleetLogisticsListApi,
  cancelFleetLogisticsApi
} from '@/api/logistics'
import type { LogisticsItem } from '@/api/logistics/type'

type StageKey = 'box' | 'pickup' | 'weigh'

const userStore = useUserStore()
const logisticsStore = useLogisticsStore()

const isFleet = computed(() => userStore.role === 'fleet')
const isOwner = computed(() => userStore.role === 'owner')

const currentList = ref<any[]>([])
const loading = ref(false)
const pageReady = ref(false)

/**
 * 角色对应的 tab
 */
const tabList = computed(() =>
  !isOwner.value ? logisticsStore.fleetStatusTabs : logisticsStore.ownerStatusTabs
)

/**
 * currentStatus 放到 store 中
 */
const currentStatus = computed({
  get() {
    return !isOwner.value
      ? logisticsStore.fleetCurrentStatus
      : logisticsStore.ownerCurrentStatus
  },
  set(val: string) {
    logisticsStore.setCurrentStatus( val)
  }
})

/**
 * 列表数据格式化
 */
const normalizeItem = (row: LogisticsItem) => {
  return {
    ...row,
    orderNo: row.code || `#${row.id}`,
    createdAt: row.inquiryTime || row.buildTime || '-',
    fromCity: row.loadingPlace || '-',
    toCity: row.destination || '-',
    boxPlace: row.pickUpPlace || '-',
    containerInfo: row.contType
      ? `${row.contType}${row.contNum != null ? ` × ${row.contNum}` : ''}`
      : '-',
    goodsName: row.detail || '-',
    pickupTime: row.planLoadingTime || '-',
    weight: row.weight != null ? `${row.weight} KGS` : '-',
    freight: row.freight != null ? row.freight : '-',
    status: row.status,
    workStage: (row as any).workStage,
    nodeType: (row as any).nodeType,
    stepType: (row as any).stepType,
    bizStatus: (row as any).bizStatus,
    stage: (row as any).stage
  }
}

/**
 * 加载列表
 */
const loadList = async () => {
  if (loading.value) return
  loading.value = true

  try {
    const req = isFleet.value
      ? queryFleetLogisticsListApi
      : isOwner.value
      ? queryMyLogisticsListApi
      :querygmFleetLogisticsListApi

    const res: any = await req({
      status: currentStatus.value || '',
      parmas: {
        pageSize: 999,
        pageNum: 1
      }
    })

    const rows = res?.rows || []

    currentList.value = rows.map(normalizeItem)
    await logisticsStore.loadLogisticsCount()
  } catch (err) {
    console.error('加载物流单列表失败:', err)
    currentList.value = []
  } finally {
    loading.value = false
  }
}

/**
 * 切 tab 时重新拉数据
 */
watch(currentStatus, async () => {
  if (!pageReady.value) return
  await loadList()
})

/**
 * 页面显示时初始化
 */
onShow(async () => {
  if (!requireLogin('/pages/logistics/list')) return

  // 加载 tab（只会取一次字典）
  await logisticsStore.loadStatusTabs()

  // 如果当前还没默认值，取第一个
  if (!currentStatus.value && tabList.value.length) {
    currentStatus.value = tabList.value[0].value
  }

  pageReady.value = true
  await loadList()
})

/**
 * 跳详情
 */
const goDetail = (id: string | number) => {
  uni.navigateTo({
    url: `/pages/logistics/detail?id=${id}`
  })
}

/**
 * 车队端取消物流单
 */
const handleCancel = (id: string | number) => {
  if (isOwner.value) return

  uni.showModal({
    title: '提示',
    content: '确认取消该物流单吗？',
    success: async (res) => {
      if (!res.confirm) return

      try {
        await cancelFleetLogisticsApi(id)
        uni.showToast({
          title: '取消成功',
          icon: 'success'
        })
        await loadList()
      } catch (err: any) {
        console.error('取消物流单失败:', err)
        uni.showToast({
          title: err?.message || '取消失败',
          icon: 'none'
        })
      }
    }
  })
}

/**
 * 车队端：调度
 * 你如果有单独调度页，改这里即可
 */
const handleDispatch = (id: string | number) => {
  uni.navigateTo({
    url: `/pages/dispatch/form?id=${id}`
  })
}


/**
 * 车队端：提箱 / 提货 / 落重
 */
const handleStage = (id: string | number, stageKey: StageKey) => {
  const routeMap: Record<StageKey, string> = {
    box: '/pages/pickup-box/form',
    pickup: '/pages/pickup-goods/form',
    weigh: '/pages/weigh-in/form'
  }

  const url = routeMap[stageKey] || '/pages/pickup-box/form'
  uni.navigateTo({
    url: `${url}?id=${id}`
  })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
}
</style>