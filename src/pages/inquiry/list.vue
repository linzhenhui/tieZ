<template>
  <PageLayout :currentPath="'/pages/inquiry/list'" :showTabbar="true">
    <view class="page">
      <StatusTabs v-model="currentStatus" :list="tabList" />
      <template v-if="list.length">
        <InquiryCard v-for="item in list" :key="item.id" :item="item" :actions="getActions(item.status)"
          @edit="handleEdit" @cancel="handleCancel" @confirm="handleConfirm" @quote="openQuotePopup" />
      </template>

      <EmptyState v-else text="暂无询价单数据" />

      <view v-if="loadingMore" class="loading-text">加载中...</view>
      <view v-else-if="finished && list.length" class="loading-text">没有更多了</view>

      <!-- 报价弹窗：仅车队端可用 -->
      <view v-if="showQuotePopup" class="popup-mask" @click="closeQuotePopup">
        <view class="popup-card" @click.stop>
          <view class="popup-title">输入报价</view>
          <input v-model="quotePrice" class="popup-input" type="digit" placeholder="请输入报价金额" confirm-type="done"
            @confirm="submitQuote" />
          <view class="popup-actions">
            <button class="popup-btn cancel" @click="closeQuotePopup">取消</button>
            <button class="popup-btn confirm" :loading="quoteLoading" @click="submitQuote">确认</button>
          </view>
        </view>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onShow, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import PageLayout from '@/components/page-layout/index.vue'
import StatusTabs from '@/components/status-tabs/index.vue'
import InquiryCard from '@/components/inquiry-card/index.vue'
import EmptyState from '@/components/empty-state/index.vue'
import { useInquiryStore } from '@/store/inquiry'
import { useUserStore } from '@/store/user'
import {
  queryInquiryListApi,
  cancelInquiryTruckApi,
  queryTruckInquiryListApi,
  truckInquiryQuoteApi,
  cancelTruckInquiryApi,
  confirmInquiryTruckApi
} from '@/api'
import { requireLogin } from '@/utils/guard'

type InquiryStatus = string

const inquiryStore = useInquiryStore()
const userStore = useUserStore()

const isFleet = computed(() => userStore.role === 'fleet')

/**
 * 直接从 store 读取 tabList
 */
const tabList = computed(() =>
  isFleet.value ? inquiryStore.fleetStatusTabs : inquiryStore.ownerStatusTabs
)

/**
 * currentStatus 也放到 store 中
 */
const currentStatus = computed({
  get() {
    return isFleet.value
      ? inquiryStore.fleetCurrentStatus
      : inquiryStore.ownerCurrentStatus
  },
  set(val: string) {
    inquiryStore.setCurrentStatus( val)
  }
})

const list = ref<any[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const loading = ref(false)
const loadingMore = ref(false)
const finished = ref(false)

const showQuotePopup = ref(false)
const quotePrice = ref('')
const currentQuoteId = ref<string | number>('')
const quoteLoading = ref(false)

const pageReady = ref(false)

/**
 * 列表接口根据角色切换
 */
const fetchListApi = (params: any) => {
  return isFleet.value
    ? queryTruckInquiryListApi(params)
    : queryInquiryListApi(params)
}

/**
 * 取消接口根据角色切换
 */
const cancelApi = (id: string | number) => {
  return isFleet.value
    ? cancelTruckInquiryApi(id)
    : cancelInquiryTruckApi(id)
}

/**
 * 获取字典 tab：交给 store 缓存
 */
const loadTabs = async () => {
  await inquiryStore.loadStatusTabs()
}

/**
 * 分页查询
 */
const loadList = async (reset = false) => {
  if (loading.value || loadingMore.value) return
  if (finished.value && !reset) return

  if (reset) {
    pageNum.value = 1
    total.value = 0
    list.value = []
    finished.value = false
  }

  reset ? (loading.value = true) : (loadingMore.value = true)

  try {
    const res: any = await fetchListApi({
      status: currentStatus.value === 'quoteing' ? '1,2' : currentStatus.value,
      params: {
        pageNum: pageNum.value,
        pageSize: pageSize.value
      }
    })

    const data = res?.data || res || {}
    const rows = data?.rows || []
    const count = data?.total || 0

    total.value = count

    if (pageNum.value === 1) {
      list.value = rows
    } else {
      list.value = list.value.concat(rows)
    }

    if (list.value.length >= total.value || rows.length < pageSize.value) {
      finished.value = true
    } else {
      pageNum.value += 1
    }
    await inquiryStore.loadInquiryCount()
  } catch (err: any) {
    uni.showToast({
      title: err?.message || '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    loadingMore.value = false
    uni.stopPullDownRefresh?.()
  }
}

/**
 * 切 tab 时重新拉数据
 */
watch(currentStatus, async () => {
  if (!pageReady.value) return
  await loadList(true)
})

/**
 * 页面显示时初始化
 */
onShow(async () => {
  if (!requireLogin('/pages/inquiry/list')) return

  // 首次进入，加载字典并缓存到 store
  if (!tabList.value.length) {
    await loadTabs()
  }

  // 如果当前角色没有选中状态，默认取第一个
  if (!currentStatus.value && tabList.value.length) {
    currentStatus.value = tabList.value[0].value
  }

  pageReady.value = true
  await loadList(true)
})

/**
 * 下拉刷新
 */
onPullDownRefresh(async () => {
  await loadList(true)
})

/**
 * 上拉加载更多
 */
onReachBottom(async () => {
  if (!finished.value) {
    await loadList(false)
  }
})

/**
 * 动作按钮
 */
const getActions = (status: InquiryStatus) => {
  if (isFleet.value) {
    if (status === '0' || status === '1') {
      return [
        { text: '报价', event: 'quote', type: 'primary' },
        { text: '取消', event: 'cancel', type: 'warn' }
      ]
    }
    return []
  }

  if (status === '0') {
    return [
      { text: '修改', event: 'edit', type: 'primary' },
      { text: '取消', event: 'cancel', type: 'warn' }
    ]
  }

  if (status === '2') {
    return [
      { text: '确认', event: 'confirm', type: 'success' },
      { text: '取消', event: 'cancel', type: 'warn' }
    ]
  }

  return []
}

const handleEdit = (id: string | number) => {
  if (isFleet.value) return

  uni.navigateTo({
    url: `/pages/inquiry/form?id=${id}`
  })
}

const handleCancel = async (id: string | number) => {
  try {
    await cancelApi(id)

    uni.showToast({
      title: '已取消',
      icon: 'none'
    })

    await loadList(true)
  } catch (err: any) {
    uni.showToast({
      title: err?.message || '取消失败',
      icon: 'none'
    })
  }
}

const handleConfirm = async (id: string | number) => {
  if (isFleet.value) return
  await confirmInquiryTruckApi(id)

  inquiryStore.confirmInquiry(String(id))

  uni.showToast({
    title: '已确认',
    icon: 'none'
  })
  await loadList(true)
}

const openQuotePopup = (id: string | number) => {
  if (!isFleet.value) {
    uni.showToast({
      title: '只有车队用户可以报价',
      icon: 'none'
    })
    return
  }

  currentQuoteId.value = id
  quotePrice.value = ''
  showQuotePopup.value = true
}

const closeQuotePopup = () => {
  showQuotePopup.value = false
  currentQuoteId.value = ''
  quotePrice.value = ''
}

const submitQuote = async () => {
  if (!isFleet.value) {
    uni.showToast({
      title: '只有车队用户可以报价',
      icon: 'none'
    })
    return
  }

  if (!quotePrice.value) {
    uni.showToast({
      title: '请输入报价',
      icon: 'none'
    })
    return
  }

  if (quoteLoading.value) return
  quoteLoading.value = true

  try {
    await truckInquiryQuoteApi({
      id: currentQuoteId.value,
      price: quotePrice.value,
      remark: ''
    })

    uni.showToast({
      title: '报价成功',
      icon: 'success'
    })

    closeQuotePopup()
    await loadList(true)
  } catch (err: any) {
    uni.showToast({
      title: err?.message || '报价失败',
      icon: 'none'
    })
  } finally {
    quoteLoading.value = false
  }
}
</script>

<style scoped lang="scss">
@import '@/uni.scss';

.page {
  min-height: 100vh;
  padding: 20rpx;
  background: $color-page-bg;
}

.role-tip {
  margin: 12rpx 0 18rpx;
  font-size: 24rpx;
  color: $color-text-3;
  text-align: center;
}

.loading-text {
  text-align: center;
  color: $color-text-3;
  font-size: 26rpx;
  padding: 20rpx 0 40rpx;
}

/* 弹窗 */
.popup-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.32);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.popup-card {
  width: 580rpx;
  background: #fff;
  border-radius: $radius-md;
  padding: 30rpx;
  box-shadow: $shadow-popup;
}

.popup-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
  color: $color-text;
}

.popup-input {
  width: 100%;
  height: 80rpx;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  padding: 0 20rpx;
  box-sizing: border-box;
  background: $color-fill-light;
  font-size: 28rpx;
  color: $color-text;
}

.popup-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30rpx;
  gap: 20rpx;
}

.popup-btn {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: $radius-sm;
  font-size: 28rpx;
  margin: 0;
}

.cancel {
  background: #fff;
  color: $color-text-2;
  border: 1px solid $color-border;
}

.confirm {
  background: $color-primary;
  color: #fff;
  border: 1px solid $color-primary;
}
</style>