import { defineStore, storeToRefs } from 'pinia'
import { ref } from 'vue'
import {
  getDictDataApi, submitPickupGoodsApi,
  type SubmitPickupGoodsParams,
  submitArriveApi,
  type SubmitArriveParams,
  getMyLogisticsCountApi,
  getTruckLogisticsCountApi,
  getgmTruckLogisticsCountApi,
} from '@/api'
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
const { role } = storeToRefs(userStore)



export interface StatusTab {
  label: string
  value: string
  badge?: number
}

export interface StatusDictItem {
  dictLabel: string
  dictValue: string
  dictSort?: number
}

interface LogisticsCount {
  dispatchingCount: number
  pickingCount: number
  endCount: number
  waitingCount: number
}

export const useLogisticsStore = defineStore('logistics', () => {
  const ownerStatusTabs = ref<StatusTab[]>([])
  const fleetStatusTabs = ref<StatusTab[]>([])

  // 原始字典
  const ownerStatusDictList = ref<StatusDictItem[]>([])
  const fleetStatusDictList = ref<StatusDictItem[]>([])

  const ownerCurrentStatus = ref('')
  const fleetCurrentStatus = ref('')

  const ownerTabsLoaded = ref(false)
  const fleetTabsLoaded = ref(false)

  // 统计缓存
  const ownerLogisticsCount = ref<LogisticsCount>({
    dispatchingCount: 0,
    pickingCount: 0,
    endCount: 0,
    waitingCount: 0
  })

  const fleetLogisticsCount = ref<LogisticsCount>({
    dispatchingCount: 0,
    pickingCount: 0,
    endCount: 0,
    waitingCount: 0
  })

  /**
   * 物流状态值 -> 统计字段
   * 这里的 key 请替换成你真实的 dictValue
   */
  const OWNER_LOGISTICS_COUNT_MAP: Record<string, keyof LogisticsCount> = {
    '0': 'waitingCount',
    '1': 'dispatchingCount',
    '2': 'pickingCount',
    '3': 'endCount',
  }

  const FLEET_LOGISTICS_COUNT_MAP: Record<string, keyof LogisticsCount> = {
    '0': 'waitingCount',
    '1': 'dispatchingCount',
    '2': 'pickingCount',
    '3': 'endCount',
  }

  /**
   * 只拉字典，不拉统计
   */
  const loadStatusTabs = async () => {
    if (ownerTabsLoaded.value) return

    const res: any = await getDictDataApi('pri_logistics_status')
    const list = res?.data || res || []
    const dictList = Array.isArray(list) ? list : []

    dictList.sort((a, b) => (a.dictSort || 0) - (b.dictSort || 0))

    const tabs: StatusTab[] = dictList
      .map((item: any) => ({
        label: item.dictLabel,
        value: item.dictValue,
        badge: 0
      }))
      .filter((item: StatusTab) => item.label || item.value)

    // 如果两端字典一致，可以共用；如果后续你要分别过滤，也可以这里分别处理
    ownerStatusTabs.value = tabs
    fleetStatusTabs.value = tabs.slice(1)

    ownerStatusDictList.value = dictList
    fleetStatusDictList.value = dictList

    ownerTabsLoaded.value = true
    fleetTabsLoaded.value = true

    if (!ownerCurrentStatus.value && tabs.length) {
      ownerCurrentStatus.value = tabs[0].value
    }
    if (!fleetCurrentStatus.value && tabs.length) {
      fleetCurrentStatus.value = tabs[0].value
    }

    return tabs
  }

  /**
   * 只拉统计数量，不自动触发，由外部决定什么时候调用
   */
  const loadLogisticsCount = async () => {
    if (role.value === 'owner') {
      const res: any = await getMyLogisticsCountApi()
      const data = res?.data || res || {}
      ownerLogisticsCount.value = {
        dispatchingCount: data.dispatchingCount || 0,
        pickingCount: data.pickingCount || 0,
        endCount: data.endCount || 0,
        waitingCount: data.waitingCount || 0
      }
      applyTabsBadge()
    } else if (role.value === 'admin') {
      const res: any = await getgmTruckLogisticsCountApi()
      const data = res?.data || res || {}
      ownerLogisticsCount.value = {
        dispatchingCount: data.dispatchingCount || 0,
        pickingCount: data.pickingCount || 0,
        endCount: data.endCount || 0,
        waitingCount: data.waitingCount || 0
      }
      applyTabsBadge()
    } else {
      const res: any = await getTruckLogisticsCountApi()
      const data = res?.data || res || {}
      fleetLogisticsCount.value = {
        dispatchingCount: data.dispatchingCount || 0,
        pickingCount: data.pickingCount || 0,
        endCount: data.endCount || 0,
        waitingCount: data.waitingCount || 0
      }
      applyTabsBadge()
    }
  }

  /**
   * 把统计数量回填到 tabs.badge
   */
  const applyTabsBadge = () => {
    if (role.value !== 'fleet') {
      ownerStatusTabs.value = ownerStatusTabs.value.map((item) => ({
        ...item,
        badge:
          ownerLogisticsCount.value[
          OWNER_LOGISTICS_COUNT_MAP[item.value] || 'waitingCount'
          ] || 0
      }))
    } else {
      fleetStatusTabs.value = fleetStatusTabs.value.map((item) => ({
        ...item,
        badge:
          fleetLogisticsCount.value[
          FLEET_LOGISTICS_COUNT_MAP[item.value] || 'waitingCount'
          ] || 0
      }))
    }
  }

  /**
   * 可选：一次性刷新字典 + 数量
   * 只是组合方法，不会自动触发
   */
  const refreshTabsAndCount = async () => {
    await loadStatusTabs()
    await loadLogisticsCount()
  }

  const setCurrentStatus = (value: string) => {
    if (role.value !== 'fleet') {
      ownerCurrentStatus.value = value
    } else {
      fleetCurrentStatus.value = value
    }
  }

  const submitPickupGoods = async (
    orderId: string,
    form: Omit<SubmitPickupGoodsParams, 'id'>
  ) => {
    const res = await submitPickupGoodsApi({
      id: orderId,
      ...form
    })
    return res
  }

  const submitArrive = async (
    orderId: string,
    form: Omit<SubmitArriveParams, 'id'>
  ) => {
    return await submitArriveApi({
      id: orderId,
      ...form
    })
  }

  return {
    ownerStatusTabs,
    fleetStatusTabs,
    ownerStatusDictList,
    fleetStatusDictList,
    ownerCurrentStatus,
    fleetCurrentStatus,
    ownerTabsLoaded,
    fleetTabsLoaded,
    loadStatusTabs,
    loadLogisticsCount,
    refreshTabsAndCount,
    setCurrentStatus,
    submitPickupGoods,
    submitArrive
  }
})