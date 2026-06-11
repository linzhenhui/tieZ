<template>
  <PageLayout :currentPath="'/pages/inquiry/list'" :showTabbar="true">
    <view class="page">
      <StatusTabs v-model="currentStatus" :list="tabList">
        <template #right>
          <view class="filter-btn" @click="showFilterPanel = true">
            <text class="filter-icon">⚲</text>
            <text class="filter-text">筛选</text>
          </view>
        </template>
      </StatusTabs>
      <template v-if="list.length">
        <InquiryCard v-for="item in list" :key="item.id" :item="item" :actions="getActions(item.status)"
          @edit="handleEdit" @cancel="handleCancel" @confirm="handleConfirm" @quote="openQuotePopup"
          @askprice="openAskpricePopup" />
      </template>

      <EmptyState v-else text="暂无询价单数据" />

      <view v-if="loadingMore" class="loading-text">加载中...</view>
      <view v-else-if="finished && list.length" class="loading-text">没有更多了</view>

      <!-- 报价弹窗 -->
      <QuotePopup v-model="showQuotePopup" title="车队报价结果" :quotedTeamList="teamList" :allTeamList="cdOptions"
        :isAdmin="isAdmin" @submit="submitQuote" />
      <!-- 询价弹窗 -->
      <view v-if="showAskPopup" class="popup-mask" @click="closeAskPopup">
        <view class="popup-card" @click.stop>
          <view class="popup-title">询价</view>

          <view class="form-row">
            <view class="label">
              <text>车队：</text>
            </view>
            <view class="field-inline">
              <view class="multi-select-box" @click="openContTypeList">
                <text v-if="!form.contTypeText" class="placeholder-text">请选择车队</text>
                <text v-else>{{ form.contTypeText }}</text>
              </view>
            </view>
          </view>
          <view class="form-row">
            <view class="label">
              <text>注意事项：</text>
            </view>
            <view class="field-inline">
              <textarea v-model="form.quoteRemark" class="form-textarea" placeholder="请输入报价备注" />
            </view>
          </view>

          <view class="popup-actions">
            <button class="popup-btn cancel" @click="closeAskPopup">取消</button>
            <button class="popup-btn confirm" :loading="askLoading" @click="submitAskprice">确认</button>
          </view>
        </view>
      </view>

      <!-- 车队多选弹层 -->
      <view v-if="showContTypeList" class="select-mask" @click="showContTypeList = false">
        <view class="select-card" @click.stop>
          <view class="select-title">选择车队</view>

          <!-- 搜索框 -->
          <view class="select-search">
            <input v-model="teamKeyword" class="search-input" placeholder="请输入车队名称筛选"
              placeholder-class="search-placeholder" confirm-type="search" />
            <text v-if="teamKeyword" class="search-clear" @click="clearTeamKeyword">清除</text>
          </view>
          <view class="scroll-view">
            <checkbox-group @change="onContTypeChange">
              <label v-for="item in filteredCdOptions" :key="item.id" class="checkbox-item">
                <checkbox :value="item.id" :checked="form.contType.includes(item.id)" />
                <text>{{ item.nameCn }}</text>
              </label>
            </checkbox-group>
          </view>


          <view class="popup-actions">
            <button class="popup-btn cancel" @click="showContTypeList = false">取消</button>
            <button class="popup-btn confirm" @click="confirmContType">确定</button>
          </view>
        </view>
      </view>
      <!-- 筛选面板 -->
      <view v-if="showFilterPanel" class="filter-mask" @click="closeFilterPanel">
        <view class="filter-card" @click.stop>
          <view class="filter-title">筛选</view>

          <view class="filter-item row-item">
            <text class="filter-label">单号</text>
            <input v-model="filterForm.orderNo" class="filter-input" placeholder="请输入单号"
              placeholder-class="filter-placeholder" />
          </view>
          <view class="filter-item row-item">
            <text class="filter-label">提货时间</text>

            <view class="date-range">
              <picker mode="date" :value="filterForm.pickupStartTime" @change="onPickupStartChange">
                <view class="filter-input date-box">
                  <text :class="filterForm.pickupStartTime ? 'filter-value' : 'filter-placeholder'">
                    {{ filterForm.pickupStartTime || '开始日期' }}
                  </text>
                </view>
              </picker>

              <text class="date-separator">-</text>

              <picker mode="date" :value="filterForm.pickupEndTime" @change="onPickupEndChange">
                <view class="filter-input date-box">
                  <text :class="filterForm.pickupEndTime ? 'filter-value' : 'filter-placeholder'">
                    {{ filterForm.pickupEndTime || '结束日期' }}
                  </text>
                </view>
              </picker>
            </view>
          </view>
          <view class="filter-item row-item">
            <text class="filter-label">装箱地</text>
            <input v-model="filterForm.loadingPlace" class="filter-input" placeholder="请输入装箱地"
              placeholder-class="filter-placeholder" />
          </view>

          <view class="filter-item row-item">
            <text class="filter-label">目的地</text>
            <input v-model="filterForm.destination" class="filter-input" placeholder="请输入目的地"
              placeholder-class="filter-placeholder" />
          </view>

          <view class="filter-item row-item">
            <text class="filter-label">提箱地</text>
            <input v-model="filterForm.containerPlace" class="filter-input" placeholder="请输入提箱地"
              placeholder-class="filter-placeholder" />
          </view>

          <view class="popup-actions">
            <button class="popup-btn cancel" @click="resetFilter">重置</button>
            <button class="popup-btn confirm" @click="applyFilter">查询</button>
          </view>
        </view>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
import { reactive, computed, ref, watch } from 'vue'
import { onShow, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import PageLayout from '@/components/page-layout/index.vue'
import StatusTabs from '@/components/status-tabs/index.vue'
import InquiryCard from '@/components/inquiry-card/index.vue'
import EmptyState from '@/components/empty-state/index.vue'
import { useInquiryStore } from '@/store/inquiry'
import { useUserStore } from '@/store/user'
import QuotePopup from '@/components/QuotePopup/index.vue'
import {
  queryInquiryListApi,
  querygmTruckInquiryListApi,
  cancelInquiryTruckApi,
  queryTruckInquiryListApi,
  truckInquiryQuoteApi,
  cancelTruckInquiryApi,
  confirmInquiryTruckApi,
  queryListApi,
  inquiryTruckQuoteApi,
  inquiryQuoteApi,
  inquiryApi
} from '@/api'
import { requireLogin } from '@/utils/guard'
import { storeToRefs } from 'pinia'
const userStore = useUserStore()
const { role } = storeToRefs(userStore)
type InquiryStatus = string
const inquiryStore = useInquiryStore()
const isFleet = computed(() => role.value === 'fleet')
const isAdmin = computed(() => role.value === 'admin')
const isOwner = computed(() => role.value === 'owner')
const showFilterPanel = ref(false)
const filterForm = reactive({
  pickupStartTime: '',
  pickupEndTime: '',
  orderNo: '',
  loadingPlace: '',
  destination: '',
  containerPlace: ''
})

const closeFilterPanel = () => {
  showFilterPanel.value = false
}

const onPickupStartChange = (e: any) => {
  filterForm.pickupStartTime = e.detail.value
}

const onPickupEndChange = (e: any) => {
  filterForm.pickupEndTime = e.detail.value
}

const resetFilter = async () => {
  filterForm.pickupStartTime = ''
  filterForm.pickupEndTime = ''
  filterForm.orderNo = ''
  filterForm.loadingPlace = ''
  filterForm.destination = ''
  filterForm.containerPlace = ''
  showFilterPanel.value = false
  await loadList(true)
}

const applyFilter = async () => {
  showFilterPanel.value = false
  await loadList(true)
}

const buildListParams = () => {
  const params: Record<string, any> = {
    pageNum: pageNum.value,
    pageSize: pageSize.value
  }

  // 这里字段名按你的后端接口改
  if (filterForm.pickupStartTime) params.pickupStartTime = filterForm.pickupStartTime
  if (filterForm.pickupEndTime) params.pickupEndTime = filterForm.pickupEndTime
  if (filterForm.orderNo) params.orderNo = filterForm.orderNo
  if (filterForm.loadingPlace) params.loadingPlace = filterForm.loadingPlace
  if (filterForm.destination) params.destination = filterForm.destination
  if (filterForm.containerPlace) params.containerPlace = filterForm.containerPlace

  return params
}
/**
 * 直接从 store 读取 tabList
 */
const tabList = computed(() =>
  !isOwner.value ? inquiryStore.fleetStatusTabs : inquiryStore.ownerStatusTabs
)

const currentStatus = computed({
  get() {
    return !isOwner.value
      ? inquiryStore.fleetCurrentStatus
      : inquiryStore.ownerCurrentStatus
  },
  set(val: string) {
    inquiryStore.setCurrentStatus(val)
  }
})
const teamList = ref<any[]>([])
const list = ref<any[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const loading = ref(false)
const loadingMore = ref(false)
const finished = ref(false)

const showQuotePopup = ref(false)
const showAskPopup = ref(false)
const currentQuoteId = ref<string | number>('')
const quoteLoading = ref(false)
const askLoading = ref(false)

const pageReady = ref(false)

const showContTypeList = ref(false)
const cdOptions = ref<any[]>([])
const teamKeyword = ref('')
const filteredCdOptions = computed(() => {
  const keyword = teamKeyword.value.trim().toLowerCase()
  if (!keyword) return cdOptions.value

  return cdOptions.value.filter((item) => {
    const name = (item.nameCn || '').toLowerCase()
    return name.includes(keyword)
  })
})
const clearTeamKeyword = () => {
  teamKeyword.value = ''
}
const form = reactive({
  id: '',
  contType: [] as string[],
  contTypeText: '',
  quoteRemark: ''
})
const loadQuotedTeams = async (id: any) => {
  try {
    const data = await inquiryTruckQuoteApi(id)
    teamList.value = data || []
  } catch (e) {
    teamList.value = []
  }
}
/**
 * 列表接口根据角色切换
 */
const fetchListApi = (params: any) => {
  return isFleet.value
    ? queryTruckInquiryListApi(params)
    : isOwner.value
      ? queryInquiryListApi(params)
      : querygmTruckInquiryListApi(params)
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
      status: currentStatus.value,
      params: buildListParams()
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

  if (!tabList.value.length && role.value) {
    await loadTabs()
  }

  if (!currentStatus.value && tabList.value.length) {
    currentStatus.value = tabList.value[0].value
  }

  pageReady.value = true
  await loadList(true)
  loadDict()
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

const getActions = (status: InquiryStatus) => {
  if (isAdmin.value) {
    if (status === '0' || status === '1') {
      return [
        { text: '报价', event: 'quote', type: 'primary' },
        { text: '询价', event: 'askprice', type: 'primary' },
        { text: '建单', event: 'edit', type: 'primary' },
        { text: '取消', event: 'cancel', type: 'warn' }
      ]
    }
    if (status === '2') {
      return [
        { text: '建单', event: 'edit', type: 'primary' },
        { text: '确认', event: 'confirm', type: 'success' },
      ]
    }
    return []
  }

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

const openQuotePopup = async (id: string | number) => {
  await loadQuotedTeams(id)
  currentQuoteId.value = id
  showQuotePopup.value = true
}

const closeQuotePopup = () => {
  showQuotePopup.value = false
  currentQuoteId.value = ''
}

const openAskpricePopup = (id: string) => {
  form.id = id
  form.contType = []
  form.contTypeText = ''
  showAskPopup.value = true
}

const closeAskPopup = () => {
  showAskPopup.value = false
  form.id = ''
  form.contType = []
  form.contTypeText = ''
  showContTypeList.value = false
}

const onContTypeChange = (e: any) => {
  form.contType = e.detail.value
}
const openContTypeList = () => {
  teamKeyword.value = ''
  showContTypeList.value = true
}
const confirmContType = () => {
  console.log("🚀 ~ confirmContType ~ form.contType:", form.contType)
  form.contTypeText = form.contType
    .map(v => cdOptions.value.find(item => item.id === v)?.nameCn)
    .filter(Boolean)
    .join('、')

  showContTypeList.value = false
}
const loadDict = async () => {
  const data = await queryListApi()
  cdOptions.value = data || []
}

const submitAskprice = async () => {
  if (!form.contType.length) {
    uni.showToast({
      title: '请选择车队',
      icon: 'none'
    })
    return
  }

  if (askLoading.value) return
  askLoading.value = true

  try {
    console.log('询价参数：', {
      id: form.id,
      contType: form.contType.join(','),
      contTypeText: form.contTypeText
    })
    await inquiryApi({
      id: form.id,
      supplierIdList: form.contType,
      truckRemark: form.quoteRemark
    })
    uni.showToast({
      title: '询价成功',
      icon: 'success'
    })

    closeAskPopup()
    await loadList(true)
  } catch (err: any) {
    uni.showToast({
      title: err?.message || '询价失败',
      icon: 'none'
    })
  } finally {
    askLoading.value = false
  }
}

const submitQuote = async (data?: any) => {
  console.log("🚀 ~ submitQuote ~ data:", data)
  if (quoteLoading.value) return
  quoteLoading.value = true

  try {
    if (isFleet.value) {
      await truckInquiryQuoteApi({
        id: currentQuoteId.value,
        price: data.priceQuote,
        remark: data.quoteRemark
      })
    }
    if (isAdmin.value) {
      await inquiryQuoteApi({
        inquiryId: currentQuoteId.value,
        truckId: data.truckId,
        priceQuote: data.priceQuote,
        costPrice: data.teamPrice,
        remark: data.quoteRemark
      })
    }

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
  z-index: 999;
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

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.label {
  width: 160rpx;
  flex-shrink: 0;
  font-size: 28rpx;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.required {
  color: #ff4d4f;
  font-size: 30rpx;
  line-height: 1;
}

.field {
  flex: 1;
}

.field-inline {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.multi-select-box {
  flex: 1;
  min-height: 72rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  background: #fff;
  font-size: 28rpx;
  color: $color-text;
  box-sizing: border-box;
}

.placeholder-text {
  color: $color-text-3;
}

.select-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}

.select-card {
  width: 580rpx;
  background: #fff;
  border-radius: $radius-md;
  padding: 30rpx;
  box-shadow: $shadow-popup;
}

.scroll-view {
  max-height: 400rpx;
  overflow-y: auto;
}

.select-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 18rpx 0;
  border-bottom: 1px solid #f2f2f2;
}

.form-textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1rpx solid #dcdcdc;
  border-radius: 14rpx;
  background: #fff;
  font-size: 28rpx;
  color: #222;
}

.select-search {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.search-input {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  border: 1rpx solid #e5e5e5;
  border-radius: 12rpx;
  background: #fff;
  font-size: 28rpx;
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

.filter-btn {
  height: 58rpx;
  padding: 0 16rpx;
  border-radius: 16rpx;
  background: #f6f8fc;
  border: 1px solid #e7ecf3;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 6rpx;
  box-sizing: border-box;
  flex-shrink: 0;
}

.filter-icon {
  font-size: 24rpx;
  color: #1f6dff;
  line-height: 1;
}

.filter-text {
  font-size: 24rpx;
  line-height: 1;
}

@keyframes slideDown {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }

  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.filter-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 10001;
  background: rgba(0, 0, 0, 0.35);
}

.filter-card {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 0 0 24rpx 24rpx;
  padding: 30rpx;
  box-shadow: $shadow-popup;
  transform: translateY(-100%);
  animation: slideDown 0.25s ease forwards;
  max-height: 78vh;
  overflow-y: auto;
}

.filter-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
  color: $color-text;
}

.filter-item {
  margin-bottom: 20rpx;
}

.row-item {
  display: flex;
  align-items: center;
}

.filter-label {
  width: 150rpx;
  flex-shrink: 0;
  font-size: 28rpx;
  color: $color-text-2;
}

.filter-input {
  flex: 1;
  height: 72rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  background: #fff;
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: $color-text;
}

.filter-placeholder {
  color: $color-text-3;
}

.filter-value {
  color: $color-text;
}

.date-range {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.date-range picker {
  flex: 1;
}

.date-box {
  width: 100%;
  min-width: 0;
}

.date-separator {
  flex-shrink: 0;
  color: $color-text-3;
  font-size: 26rpx;
}
</style>