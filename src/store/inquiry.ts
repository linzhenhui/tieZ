import { defineStore, storeToRefs } from 'pinia'
import type { InquiryFormData, InquiryOrder, InquiryStatus } from '@/api'
import { mockInquiryList } from '@/utils/mock'
import { useLogisticsStore } from './logistics'
import { getDictDataApi, getMyInquiryCountApi, getgmMyLogisticsCountApi, getTruckInquiryCountApi, Role } from '@/api'
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
const { role } = storeToRefs(userStore)
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
  quotedCount: number
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
  fleetInquiryCount: InquiryCountOwner
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
  '1': 'inquiryCount',
  // 报价中: ingCount
  '0': 'ingCount',
  // 已报价: quotedCount
  '2': 'quotedCount',
  // 已派单 / 已下单 / 已接单（按你实际字典改）
  '3': 'placedCount'
}

const FLEET_COUNT_FIELD_MAP: Record<string, keyof InquiryCountFleet> = {
  // 示例：按你的实际字典值修改
  '1': 'inquiryCount',
  '2': 'quotedCount',
}
const OWNER_QUOTE_TAB_VALUE = '0,1'
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
      placedCount: 0,
      inquiryCount: 0,
      ingCount: 0
    },

    fleetInquiryCount: {
      quotedCount: 0,
      placedCount: 0,
      inquiryCount: 0,
      ingCount: 0
    }
  }),

  getters: {
    // 按角色 + 状态值取状态文案
    getStatusLabel: (state) => {
      return (status: string | number) => {
        const tabs = role.value !== 'owner' ? state.fleetStatusTabs : state.ownerStatusTabs
        return tabs.find((item) => String(item.value) === String(status))?.label || '报价中'
      }
    },
    // 按角色 + status 值 获取它在字典中的顺序
    getStatusIndex: (state) => {
      return (status: string | number) => {
        const tabs = role.value !== 'owner' ? state.fleetStatusTabs : state.ownerStatusTabs
        return tabs.findIndex((item) => String(item.value) === String(status))
      }
    }
  },

  actions: {
    confirmInquiry(id: string) {
      const target = this.list.find((item) => item.id === id)
      if (!target) return

      target.status = 'confirmed'

      const logisticsStore = useLogisticsStore()
      logisticsStore.createFromInquiry(target)
    },

    /**
     * 只拉字典，不拉统计
     * role:Role
     */
    async loadStatusTabs() {
      console.log("🚀 ~ role:", role.value)
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
        this.ownerStatusTabs = tabs
        if (!this.ownerCurrentStatus && tabs.length) {
          this.ownerCurrentStatus = tabs[0].value
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
        this.fleetStatusTabs = tabs
        if (!this.fleetCurrentStatus && tabs.length) {
          this.fleetCurrentStatus = tabs[0].value
        }
        return tabs
      }
      if (role.value === 'admin') {
        const tabs: TabItem[] = rows
          .map((item: any) => {
            return {
              label: item.dictLabel,
              value: item.dictValue,
              badge: 0
            }
          })
        this.fleetStatusTabs = tabs
        if (!this.fleetCurrentStatus && tabs.length) {
          this.fleetCurrentStatus = tabs[0].value
        }
        return tabs
      }
    },

    /**
     * 只拉统计数量，不主动触发，由外部决定什么时候调用
     * role:Role
     */
    async loadInquiryCount() {
      if (role.value === 'owner') {
        const res: any = await getMyInquiryCountApi()
        const data = res?.data || res || {}
        this.ownerInquiryCount = {
          quotedCount: data.quotedCount,
          placedCount: data.placedCount,
          inquiryCount: data.inquiryCount + data.ingCount,
          ingCount: data.ingCount
        }
        this.applyTabsBadge()
      } else if (role.value === 'admin') {
        const res: any = await getgmMyLogisticsCountApi()
        const data = res?.data || res || {}
        this.fleetInquiryCount = data
        this.applyTabsBadge()
      } else {
        const res: any = await getTruckInquiryCountApi()
        const data = res?.data || res || {}
        this.fleetInquiryCount = data
        this.applyTabsBadge()
      }
    },

    /**
     * 把统计数量回填到 tabs.badge
     */
    applyTabsBadge() {
      if (role.value === 'owner') {
        this.ownerStatusTabs = this.ownerStatusTabs.map((item) => ({
          ...item,
          badge: this.ownerInquiryCount[
            OWNER_COUNT_FIELD_MAP[item.value] || 'inquiryCount'
          ]
        }))
      } else if (role.value === 'admin') {
        this.fleetStatusTabs = this.fleetStatusTabs.map((item) => ({
          ...item,
          badge: this.fleetInquiryCount[
            OWNER_COUNT_FIELD_MAP[item.value] || 'inquiryCount'
          ]
        }))
      } else {
        this.fleetStatusTabs = this.fleetStatusTabs.map((item) => ({
          ...item,
          badge: this.fleetInquiryCount[
            FLEET_COUNT_FIELD_MAP[item.value] || 'inquiryCount'
          ]
        }))
        console.log("🚀 ~ this.fleetStatusTabs:", this.fleetStatusTabs)
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
      if (role.value !== 'owner') {
        this.fleetCurrentStatus = value
      } else {
        this.ownerCurrentStatus = value
      }
    }
  }
})