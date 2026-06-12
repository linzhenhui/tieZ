import { defineStore, storeToRefs } from 'pinia'
import { ref } from 'vue'
import type { InquiryFormData, InquiryOrder } from '@/api'
import { mockInquiryList } from '@/utils/mock'
import { useLogisticsStore } from './logistics'
import {
  getDictDataApi,
  getMyInquiryCountApi,
  getgmMyLogisticsCountApi,
  getTruckInquiryCountApi
} from '@/api'
import { useUserStore } from '@/store/user'

interface TabItem {
  label: string
  value: string
  badge?: number
}

interface InquiryCountOwner {
  quotedCount?: number
  placedCount?: number
  inquiryCount?: number
  ingCount?: number
}

interface InquiryCountFleet {
  quotedCount?: number
  inquiryCount?: number
  placedCount?: number
  ingCount?: number
}

const getDefaultForm = (): InquiryFormData => ({
  imageText: '',
  boxPlace1: '',
  boxPlace2: '',
  loadingPlace: '',
  destination: '',
  containerType: '20GP',
  containerCount: '',
  pickupTime: '',
  weight: '',
  goodsName: '',
  remark: ''
})

/**
 * 状态值 -> 统计字段 映射
 * 这里的 key 必须替换成你字典接口返回的 dictValue
 */
const OWNER_COUNT_FIELD_MAP: Record<string, keyof InquiryCountOwner> = {
  // 待询价
  '1': 'inquiryCount',
  // 报价中
  '0': 'ingCount',
  // 已报价
  '2': 'quotedCount',
  // 已派单 / 已下单 / 已接单
  '3': 'placedCount'
}

const FLEET_COUNT_FIELD_MAP: Record<string, keyof InquiryCountFleet> = {
  '1': 'inquiryCount',
  '2': 'quotedCount'
}

const OWNER_QUOTE_TAB_VALUE = '0,1'

export const useInquiryStore = defineStore('inquiry', () => {
  const userStore = useUserStore()
  const { role } = storeToRefs(userStore)

  const list = ref<InquiryOrder[]>([...mockInquiryList])
  const formDraft = ref<InquiryFormData>(getDefaultForm())
  const editingId = ref('')

  // 货主端 / 车队端字典缓存
  const ownerStatusTabs = ref<TabItem[]>([])
  const fleetStatusTabs = ref<TabItem[]>([])

  // 各角色当前选中状态
  const ownerCurrentStatus = ref('')
  const fleetCurrentStatus = ref('')

  // 统计缓存
  const ownerInquiryCount = ref<InquiryCountOwner>({
    quotedCount: 0,
    placedCount: 0,
    inquiryCount: 0,
    ingCount: 0
  })

  const fleetInquiryCount = ref<InquiryCountFleet>({
    quotedCount: 0,
    inquiryCount: 0
  })

  const resetState = () => {
    list.value = [...mockInquiryList]
    formDraft.value = getDefaultForm()
    editingId.value = ''

    ownerStatusTabs.value = []
    fleetStatusTabs.value = []
    ownerCurrentStatus.value = ''
    fleetCurrentStatus.value = ''

    ownerInquiryCount.value = {
      quotedCount: 0,
      placedCount: 0,
      inquiryCount: 0,
      ingCount: 0
    }

    fleetInquiryCount.value = {
      quotedCount: 0,
      inquiryCount: 0
    }
  }

  // 按角色 + 状态值取状态文案
  const getStatusLabel = (status: string | number) => {
    const tabs = role.value !== 'owner' ? fleetStatusTabs.value : ownerStatusTabs.value
    return tabs.find((item) => String(item.value) === String(status))?.label || '报价中'
  }

  // 按角色 + status 值 获取它在字典中的顺序
  const getStatusIndex = (status: string | number) => {
    const tabs = role.value !== 'owner' ? fleetStatusTabs.value : ownerStatusTabs.value
    return tabs.findIndex((item) => String(item.value) === String(status))
  }

  const confirmInquiry = (id: string) => {
    const target = list.value.find((item) => item.id === id)
    if (!target) return

    target.status = 'confirmed'

    const logisticsStore = useLogisticsStore()
    logisticsStore.createFromInquiry(target)
  }

  /**
   * 只拉字典，不拉统计
   */
  const loadStatusTabs = async () => {
    console.log('🚀 ~ role:', role.value)

    const dictKey =
      role.value === 'fleet' ? 'pri_inquiry_quote_status' : 'pri_inquiry_status'

    const res: any = await getDictDataApi(dictKey)
    const rows = Array.isArray(res) ? res : res?.data || []

    if (role.value === 'owner') {
      const tabs: TabItem[] = []

      // 报价中：合并 0 + 1
      tabs.push({
        label: '报价中',
        value: OWNER_QUOTE_TAB_VALUE,
        badge: 0
      })

      // 已报价
      const item2 = rows.find((i: any) => i.dictValue === '2')
      if (item2) {
        tabs.push({
          label: item2.dictLabel || '已报价',
          value: '2',
          badge: 0
        })
      }

      // 已建单
      const item3 = rows.find((i: any) => i.dictValue === '3')
      if (item3) {
        tabs.push({
          label: item3.dictLabel || '已建单',
          value: '3',
          badge: 0
        })
      }

      // 已取消
      const item4 = rows.find((i: any) => i.dictValue === '4')
      if (item4) {
        tabs.push({
          label: item4.dictLabel || '已取消',
          value: '4'
        })
      }

      ownerStatusTabs.value = tabs

      if (!ownerCurrentStatus.value && tabs.length) {
        ownerCurrentStatus.value = tabs[0].value
      }

      return tabs
    }

    if (role.value === 'fleet') {
      const tabs: TabItem[] = []

      // 报价中
      const item2 = rows.find((i: any) => i.dictValue === '1')
      if (item2) {
        tabs.push({
          label: '报价中',
          value: '1',
          badge: 0
        })
      }

      // 已报价
      const item3 = rows.find((i: any) => i.dictValue === '2')
      if (item3) {
        tabs.push({
          label: '已报价',
          value: '2',
          badge: 0
        })
      }

      // 已取消
      const item4 = rows.find((i: any) => i.dictValue === '3')
      if (item4) {
        tabs.push({
          label: item4.dictLabel || '已取消',
          value: '3'
        })
      }

      fleetStatusTabs.value = tabs

      if (!fleetCurrentStatus.value && tabs.length) {
        fleetCurrentStatus.value = tabs[0].value
      }

      return tabs
    }

    if (role.value === 'admin') {
      const tabs: TabItem[] = rows.map((item: any) => ({
        label: item.dictLabel,
        value: item.dictValue,
        badge: 0
      }))

      fleetStatusTabs.value = tabs

      if (!fleetCurrentStatus.value && tabs.length) {
        fleetCurrentStatus.value = tabs[0].value
      }

      return tabs
    }

    return []
  }

  /**
   * 只拉统计数量，不主动触发，由外部决定什么时候调用
   */
  const loadInquiryCount = async () => {
    if (role.value === 'owner') {
      const res: any = await getMyInquiryCountApi()
      const data = res?.data || res || {}

      ownerInquiryCount.value = {
        quotedCount: data.quotedCount,
        placedCount: data.placedCount,
        inquiryCount: data.inquiryCount + data.ingCount,
        ingCount: data.ingCount
      }

      applyTabsBadge()
    } else if (role.value === 'admin') {
      const res: any = await getgmMyLogisticsCountApi()
      const data = res?.data || res || {}

      fleetInquiryCount.value = data

      applyTabsBadge()
    } else {
      const res: any = await getTruckInquiryCountApi()
      const data = res?.data || res || {}

      fleetInquiryCount.value = data

      applyTabsBadge()
    }
  }

  /**
   * 把统计数量回填到 tabs.badge
   */
  const applyTabsBadge = () => {
    if (role.value === 'owner') {
      ownerStatusTabs.value = ownerStatusTabs.value.map((item) => ({
        ...item,
        badge: ownerInquiryCount.value[OWNER_COUNT_FIELD_MAP[item.value]] || 0
      }))
    } else if (role.value === 'admin') {
      fleetStatusTabs.value = fleetStatusTabs.value.map((item) => ({
        ...item,
        badge: fleetInquiryCount.value[OWNER_COUNT_FIELD_MAP[item.value]] || 0
      }))
    } else {
      fleetStatusTabs.value = fleetStatusTabs.value.map((item) => ({
        ...item,
        badge: fleetInquiryCount.value[FLEET_COUNT_FIELD_MAP[item.value]] || 0
      }))
    }
  }

  /**
   * 可选：一次性刷新字典 + 数量
   * 只是组合方法，不会自动触发
   */
  const refreshTabsAndCount = async () => {
    await loadStatusTabs()
    await loadInquiryCount()
  }

  const setCurrentStatus = (value: string) => {
    if (role.value !== 'owner') {
      fleetCurrentStatus.value = value
    } else {
      ownerCurrentStatus.value = value
    }
  }

  return {
    list,
    formDraft,
    editingId,

    ownerStatusTabs,
    fleetStatusTabs,
    ownerCurrentStatus,
    fleetCurrentStatus,

    ownerInquiryCount,
    fleetInquiryCount,

    getStatusLabel,
    getStatusIndex,

    resetState,
    confirmInquiry,
    loadStatusTabs,
    loadInquiryCount,
    applyTabsBadge,
    refreshTabsAndCount,
    setCurrentStatus
  }
})