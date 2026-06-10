<template>
  <PageLayout :currentPath="'/pages/logistics/list'" :showTabbar="true">
    <view class="page" :key="currentStatus">
      <StatusTabs v-model="currentStatus" :list="tabList" />
      <view v-if="currentList.length">
        <LogisticsCard v-for="item in currentList" :key="item.id" :item="item" @detail="goDetail" @cancel="handleCancel"
          @dispatch="handleDispatch" @stage="handleStage" @waiting="handleWaiting" />
      </view>
      <EmptyState v-else text="暂无物流单数据" />
    </view>
    <!-- 派单弹窗 -->
    <view v-if="showAskPopup" class="popup-mask" @click="closeAskPopup">
      <view class="popup-card" @click.stop>
        <view class="popup-title">派单</view>
        <view class="form-item">
          <text class="form-label required">车队：</text>
          <view class="form-picker" @click="openTeamSelector">
            {{ form.supplierName || '请选择车队' }}
          </view>
        </view>
        <view class="form-item">
          <text class="form-label required">报价金额：</text>
          <input v-model="form.priceQuote" class="form-input" type="digit" placeholder="请输入报价金额" />
        </view>
        <view class="popup-actions">
          <button class="popup-btn cancel" @click="closeAskPopup">取消</button>
          <button class="popup-btn confirm" @click="submitAskprice">确认</button>
        </view>
      </view>
    </view>
    <!-- 车队选择弹窗 -->
    <view v-if="teamSelectorVisible" class="selector-mask" @click="closeTeamSelector" @touchmove.stop.prevent>
      <view class="selector-card" @click.stop>
        <view class="selector-header">
          <text class="selector-title">选择车队</text>
          <text class="selector-close" @click="closeTeamSelector">×</text>
        </view>

        <!-- 搜索框 -->
        <view class="selector-search">
          <input v-model="teamKeyword" class="search-input" placeholder="请输入车队名称筛选"
            placeholder-class="search-placeholder" confirm-type="search" />
          <text v-if="teamKeyword" class="search-clear" @click="clearTeamKeyword">清除</text>
        </view>

        <scroll-view class="selector-scroll" scroll-y>
          <view v-if="filteredTeamList.length > 0">
            <view v-for="item in filteredTeamList" :key="item.id" class="selector-item"
              :class="{ active: selectedTeamId === item.id }" @click="chooseTeam(item)">
              <view class="selector-item-left">
                <text class="selector-name">{{ item.nameCn || '未命名车队' }}</text>
              </view>

              <text v-if="selectedTeamId === item.id" class="selector-check">✓</text>
            </view>
          </view>

          <view v-else class="empty-box">暂无车队数据</view>
        </scroll-view>

        <view class="selector-footer">
          <button class="selector-btn" @click="closeTeamSelector">取消</button>
        </view>
      </view>
    </view>
  </PageLayout>
</template>
<script setup lang="ts">
import { reactive, computed, ref, watch } from 'vue'
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
  cancelFleetLogisticsApi,
  queryListApi
} from '@/api'
import type { LogisticsItem } from '@/api/logistics/type'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { role } = storeToRefs(userStore)

const logisticsStore = useLogisticsStore()

const teamSelectorVisible = ref(false)
const teamKeyword = ref('')
const selectedTeamId = ref<string | number>('')
const selectedTeam = ref<any>(null)
const allTeamList = ref<any[]>([])

const showAskPopup = ref(false)

const form = reactive({
  supplierName: '',
  teamPrice: '',
  priceQuote: '',
  quoteRemark: '',
  truckId: ''
})

const isFleet = computed(() => role.value === 'fleet')
const isOwner = computed(() => role.value === 'owner')

const currentList = ref<any[]>([])
const loading = ref(false)
const pageReady = ref(false)

const NAV_PAGE_SIZE = 999
const navigateLock = ref(false)

/**
 * 角色对应的 tab
 */
const tabList = computed(() =>
  isFleet.value ? logisticsStore.fleetStatusTabs : logisticsStore.ownerStatusTabs
)

/**
 * 当前筛选后的车队列表
 */
const filteredTeamList = computed(() => {
  const keyword = teamKeyword.value.trim().toLowerCase()
  if (!keyword) return allTeamList.value

  return allTeamList.value.filter((item) => {
    const name = (item.nameCn || '').toLowerCase()
    return name.includes(keyword)
  })
})

/**
 * 打开车队选择弹窗
 */
const openTeamSelector = () => {
  teamKeyword.value = ''
  teamSelectorVisible.value = true

  // 打开时高亮当前已选中的车队
  selectedTeamId.value = form.truckId || ''
}

/**
 * 关闭车队选择弹窗
 */
const closeTeamSelector = () => {
  teamSelectorVisible.value = false
}

/**
 * 清空搜索
 */
const clearTeamKeyword = () => {
  teamKeyword.value = ''
}

/**
 * 选择车队
 */
const chooseTeam = (item: any) => {
  selectedTeamId.value = item.id
  selectedTeam.value = item
  form.supplierName = item.nameCn || ''
  form.truckId = item.id || ''
  closeTeamSelector()
}

/**
 * 加载车队字典
 */
const loadDict = async () => {
  try {
    const data = await queryListApi()
    allTeamList.value = data || []

    // 如果已有 truckId，回显名称
    if (form.truckId) {
      const current = allTeamList.value.find((item) => item.id === form.truckId)
      if (current) {
        selectedTeamId.value = current.id
        selectedTeam.value = current
        form.supplierName = current.nameCn || ''
      }
    }
  } catch (err) {
    console.error('加载车队字典失败:', err)
    allTeamList.value = []
  }
}

type StageKey = 'box' | 'pickup' | 'weigh'

/**
 * 切换状态
 */
const currentStatus = computed({
  get() {
    return isFleet.value
      ? logisticsStore.fleetCurrentStatus
      : logisticsStore.ownerCurrentStatus
  },
  set(val: string) {
    logisticsStore.setCurrentStatus(val)
  }
})

/**
 * 关闭派单弹窗
 */
const closeAskPopup = () => {
  showAskPopup.value = false
  form.supplierName = ''
  form.teamPrice = ''
  form.priceQuote = ''
  form.quoteRemark = ''
  form.truckId = ''
  selectedTeamId.value = ''
  teamKeyword.value = ''
}

/**
 * 提交派单（前端校验 + 示例处理）
 */
const submitAskprice = async () => {
  if (!form.truckId) {
    uni.showToast({ title: '请选择车队', icon: 'none' })
    return
  }
  const price = Number(form.priceQuote)
  if (!price || price <= 0) {
    uni.showToast({ title: '请输入有效报价金额', icon: 'none' })
    return
  }

  // 实际提交处：替换为真实的派单 API
  try {
    uni.showLoading({ title: '提交中...' })
    // TODO: 调用实际派单 API，例如 await askPriceApi({ ... })
    await new Promise((r) => setTimeout(r, 600)) // 模拟延迟

    uni.showToast({ title: '派单提交成功', icon: 'success' })
    closeAskPopup()
    await loadList()
  } catch (err) {
    console.error('提交派单失败:', err)
    uni.showToast({ title: (err as any)?.message || '提交失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

/**
 * 列表数据格式化
 */
const normalizeItem = (row: LogisticsItem) => {
  return {
    ...row,
    orderNo: (row as any).code || `#${(row as any).id}`,
    createdAt: (row as any).inquiryTime || (row as any).buildTime || '-',
    fromCity: (row as any).loadingPlace || '-',
    toCity: (row as any).destination || '-',
    boxPlace: (row as any).pickUpPlace || '-',
    containerInfo: (row as any).contType
      ? `${(row as any).contType}${(row as any).contNum != null ? ` × ${(row as any).contNum}` : ''}`
      : '-',
    goodsName: (row as any).detail || '-',
    pickupTime: (row as any).planLoadingTime || '-',
    weight: (row as any).weight != null ? `${(row as any).weight} KGS` : '-',
    freight: (row as any).freight != null ? (row as any).freight : '-',
    status: (row as any).status,
    workStage: (row as any).workStage,
    nodeType: (row as any).nodeType,
    stepType: (row as any).stepType,
    bizStatus: (row as any).bizStatus,
    stage: (row as any).stage
  }
}

/**
 * 安全导航，防止重复点击短时间多次跳转
 */
const safeNavigateTo = async (url: string) => {
  if (navigateLock.value) return
  navigateLock.value = true
  try {
    await uni.navigateTo({ url })
  } catch (err) {
    console.error('导航失败:', err)
  } finally {
    // 加一点延迟，避免连续多次触发
    setTimeout(() => {
      navigateLock.value = false
    }, 500)
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
        : querygmFleetLogisticsListApi

    const res: any = await req({
      status: currentStatus.value || '',
      params: {
        pageSize: NAV_PAGE_SIZE,
        pageNum: 1
      }
    })

    // 兼容不同后端返回结构
    const rows = res?.rows || res?.data?.rows || []
    currentList.value = (rows || []).map(normalizeItem)
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

  if (role.value) {
    await logisticsStore.loadStatusTabs()

    if (!currentStatus.value && tabList.value.length) {
      currentStatus.value = tabList.value[0].value
    }

    pageReady.value = true
    await loadList()
    await loadDict()
  }
})

/**
 * 跳详情
 */
const goDetail = (id: string | number) => {
  safeNavigateTo(`/pages/logistics/detail?id=${id}`)
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
 */
const handleWaiting = (id: string | number) => {
  safeNavigateTo(`/pages/dispatch/form?id=${id}`)
}

/**
 * 车队端：调度
 */
const handleDispatch = (id: string | number) => {
  safeNavigateTo(`/pages/dispatch/form?id=${id}`)
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
  safeNavigateTo(`${url}?id=${id}`)
}
</script>
<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
}

.selector-search {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  box-sizing: border-box;
}

.search-input {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  border: 1rpx solid #e5e5e5;
  border-radius: 12rpx;
  font-size: 28rpx;
  background: #fff;
  box-sizing: border-box;
}

.search-placeholder {
  color: #999;
}

.search-clear {
  color: #1677ff;
  font-size: 26rpx;
  white-space: nowrap;
}
</style>