import { defineStore } from 'pinia'
import type { InquiryFormData, InquiryOrder, InquiryStatus } from '@/api'
import { mockInquiryList } from '@/utils/mock'
import { useLogisticsStore } from './logistics'
import { getDictDataApi, getMyInquiryCountApi, getTruckInquiryCountApi, Role } from '@/api'
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
const role = userStore.role

interface TabItem {
  label: string
  value: string
  badge?: number
}

interface InquiryCountOwner {
  quotedCount: number
  cancelCount: number
  placedCount: number
  inquiryCount: number
  ingCount: number
}

interface InquiryCountFleet {
  quotedCount: number
  cancelCount: number
  inquiryCount: number
}

interface InquiryState {
  list: InquiryOrder[]
  formDraft: InquiryFormData
  editingId: string

  // 货主端 / 车队端字典缓存
  ownerStatusTabs: TabItem[]
  fleetStatusTabs: TabItem[]

  // 各角色当前选中状态
  ownerCurrentStatus: string
  fleetCurrentStatus: string

  // 统计缓存
  ownerInquiryCount: InquiryCountOwner
  fleetInquiryCount: InquiryCountFleet
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
  // 示例：按你的实际字典值修改
  // 待询价: inquiryCount
  '0': 'inquiryCount',
  // 报价中: ingCount
  '1': 'ingCount',
  // 已报价: quotedCount
  '2': 'quotedCount',
  // 已派单 / 已下单 / 已接单（按你实际字典改）
  '3': 'placedCount',
  // 已取消
  '4': 'cancelCount'
}

const FLEET_COUNT_FIELD_MAP: Record<string, keyof InquiryCountFleet> = {
  // 示例：按你的实际字典值修改
  '0': 'inquiryCount',
  '1': 'quotedCount',
  '2': 'cancelCount'
}
const OWNER_QUOTE_TAB_VALUE = 'quoteing'
export const useInquiryStore = defineStore('inquiry', {
  state: (): InquiryState => ({
    list: [...mockInquiryList],
    formDraft: getDefaultForm(),
    editingId: '',

    ownerStatusTabs: [],
    fleetStatusTabs: [],
    ownerCurrentStatus: '',
    fleetCurrentStatus: '',

    ownerInquiryCount: {
      quotedCount: 0,
      cancelCount: 0,
      placedCount: 0,
      inquiryCount: 0,
      ingCount: 0
    },

    fleetInquiryCount: {
      quotedCount: 0,
      cancelCount: 0,
      inquiryCount: 0
    }
  }),

  getters: {
    getListByStatus: (state) => {
      return (status: InquiryStatus) => state.list.filter((item) => item.status === status)
    },
    getById: (state) => {
      return (id: string) => state.list.find((item) => item.id === id)
    },

    // 按角色取 tab
    getStatusTabs: (state) => {
      return role === 'fleet' ? state.fleetStatusTabs : state.ownerStatusTabs
    },

    // 按角色取当前状态
    getCurrentStatus: (state) => {
      return role === 'fleet' ? state.fleetCurrentStatus : state.ownerCurrentStatus
    },

    // 按角色 + 状态值取状态文案
    getStatusLabel: (state) => {
      return (status: string | number) => {
        const tabs = role === 'fleet' ? state.fleetStatusTabs : state.ownerStatusTabs
        return tabs.find((item) => String(item.value) === String(status))?.label || '未知状态'
      }
    },

    // 按角色 + status 值 获取它在字典中的顺序
    getStatusIndex: (state) => {
      return (status: string | number) => {
        const tabs = role === 'fleet' ? state.fleetStatusTabs : state.ownerStatusTabs
        return tabs.findIndex((item) => String(item.value) === String(status))
      }
    }
  },

  actions: {
    setDraft(data: Partial<InquiryFormData>) {
      this.formDraft = {
        ...this.formDraft,
        ...data
      }
    },

    resetDraft() {
      this.formDraft = getDefaultForm()
      this.editingId = ''
    },

    loadDraftFromOrder(id: string) {
      const target = this.list.find((item) => item.id === id)
      if (!target) return

      this.editingId = id
      this.formDraft = {
        id: target.id,
        orderNo: target.orderNo,
        imageText: target.imageText || '',
        boxPlace1: target.boxPlace1,
        boxPlace2: target.boxPlace2,
        loadingPlace: target.loadingPlace,
        destination: target.destination,
        containerType: target.containerType,
        containerCount: target.containerCount,
        pickupTime: target.pickupTime,
        weight: target.weight,
        goodsName: target.goodsName,
        remark: target.remark
      }
    },

    submitInquiry() {
      if (this.editingId) {
        const index = this.list.findIndex((item) => item.id === this.editingId)
        if (index > -1) {
          this.list[index] = {
            ...this.list[index],
            ...this.formDraft,
            boxPlace: this.formDraft.boxPlace1,
            fromCity: this.formDraft.loadingPlace || '台州',
            toCity: this.formDraft.destination || '金华',
            status: 'inquiring'
          } as InquiryOrder
        }
      } else {
        const newItem: InquiryOrder = {
          id: `inq-${Date.now()}`,
          orderNo: `TZ${Date.now()}`,
          createdAt: '2026-03-30 10:10:10',
          status: 'inquiring',
          quotedPrice: undefined,
          fromCity: this.formDraft.loadingPlace || '台州',
          toCity: this.formDraft.destination || '金华',
          boxPlace: this.formDraft.boxPlace1,
          ...this.formDraft
        }
        this.list.unshift(newItem)
      }

      this.resetDraft()
    },

    cancelInquiry(id: string) {
      const target = this.list.find((item) => item.id === id)
      if (target) {
        target.status = 'cancelled'
      }
    },

    confirmInquiry(id: string) {
      const target = this.list.find((item) => item.id === id)
      if (!target) return

      target.status = 'confirmed'

      const logisticsStore = useLogisticsStore()
      logisticsStore.createFromInquiry(target)
    },

    fleetQuote(id: string, price: number) {
      const target = this.list.find((item) => item.id === id)
      if (!target) return

      target.status = 'quoted'
      target.quotedPrice = price
    },

    /**
     * 只拉字典，不拉统计
     * role:Role
     */
    async loadStatusTabs() {
      const dictKey =
        role === 'fleet' ? 'pri_inquiry_quote_status' : 'pri_inquiry_status'

      const res: any = await getDictDataApi(dictKey)
      const rows = Array.isArray(res) ? res : res?.data || []
      if (role === 'owner') {
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
            value: '4',
            badge: 0
          })
        }
        this.ownerStatusTabs = tabs
        if (!this.ownerCurrentStatus && tabs.length) {
          this.ownerCurrentStatus = tabs[0].value
        }
        return tabs
      }

      // 车队端：保持原来的字典渲染逻辑
      const tabs: TabItem[] = rows
        .map((item: any) => {
          if (item.dictValue === '1') {
            item.dictLabel = '报价中'
          }
          return {
            label: item.dictLabel,
            value: item.dictValue,
            badge: 0
          }
        })
        .filter((item: TabItem) => item.label || item.value)

      this.fleetStatusTabs = tabs
      if (!this.fleetCurrentStatus && tabs.length) {
        this.fleetCurrentStatus = tabs[0].value
      }

      return tabs
    },

    /**
     * 只拉统计数量，不主动触发，由外部决定什么时候调用
     * role:Role
     */
    async loadInquiryCount() {
      if (role === 'owner') {
        const res: any = await getMyInquiryCountApi()
        const data = res?.data || res || {}

        this.ownerInquiryCount = {
          quotedCount: data.quotedCount || 0,
          cancelCount: data.cancelCount || 0,
          placedCount: data.placedCount || 0,
          inquiryCount: data.inquiryCount || 0,
          ingCount: data.ingCount || 0
        }

        this.applyTabsBadge()
      } else {
        const res: any = await getTruckInquiryCountApi()
        const data = res?.data || res || {}

        this.fleetInquiryCount = {
          quotedCount: data.quotedCount || 0,
          cancelCount: data.cancelCount || 0,
          inquiryCount: data.inquiryCount || 0
        }

        this.applyTabsBadge()
      }
    },

    /**
     * 把统计数量回填到 tabs.badge
     */
    applyTabsBadge() {
      if (role === 'owner') {
        this.ownerStatusTabs = this.ownerStatusTabs.map((item) => ({
          ...item,
          badge: this.ownerInquiryCount[
            OWNER_COUNT_FIELD_MAP[item.value] || 'inquiryCount'
          ] || 0
        }))
      } else {
        this.fleetStatusTabs = this.fleetStatusTabs.map((item) => ({
          ...item,
          badge: this.fleetInquiryCount[
            FLEET_COUNT_FIELD_MAP[item.value] || 'inquiryCount'
          ] || 0
        }))
      }
    },

    /**
     * 可选：一次性刷新字典 + 数量
     * 只是组合方法，不会自动触发
     */
    async refreshTabsAndCount() {
      await this.loadStatusTabs()
      await this.loadInquiryCount()
    },

    setCurrentStatus(value: string) {
      if (role === 'fleet') {
        this.fleetCurrentStatus = value
      } else {
        this.ownerCurrentStatus = value
      }
    }
  }
})