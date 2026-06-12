<template>
  <PageLayout :showTabbar="false">
    <view class="detail-page" v-if="detail">
      <!-- 顶部主信息 -->
      <view class="header-card">
        <view class="header-row">
          <view class="header-left">
            <view class="order-no">{{ detail.orderNo }}</view>
            <view class="order-time">{{ detail.createdAt }}</view>
          </view>
          <OrderBadge :text="statusText" :type="badgeType" />
        </view>

        <view class="route-row">
          <text class="city">{{ detail.fromCity }}</text>
          <text class="arrow">→</text>
          <text class="city">{{ detail.toCity }}</text>
        </view>

        <view class="summary-grid">
          <view class="summary-item" v-if="detail.pickUpPlace">
            <text class="summary-label">提箱地</text>
            <text class="summary-value">{{ detail.pickUpPlace }}</text>
          </view>

          <view class="summary-item" v-if="detail.containerInfo">
            <text class="summary-label">箱型箱量</text>
            <text class="summary-value">{{ detail.containerInfo }}</text>
          </view>


          <view class="summary-item" v-if="detail.planLoadingTime">
            <text class="summary-label">提货时间</text>
            <text class="summary-value">{{ detail.planLoadingTime || '-' }}</text>
          </view>

          <view class="summary-item" v-if="detail.weight">
            <text class="summary-label">货重</text>
            <text class="summary-value">{{ detail.weight || '-' }} KGS</text>
          </view>

          <view class="summary-item" v-if="detail.goodsName">
            <text class="summary-label">品名</text>
            <text class="summary-value">{{ detail.goodsName || '-' }}</text>
          </view>
        </view>
      </view>

      <!-- 车辆信息 -->
      <SectionCard title="车辆信息"
        v-if="detail.truckNo || detail.driverName || detail.idCard || detail.mobile || detail.plateNo || detail.carRegistration || detail.carWeight || detail.carLength">
        <view class="detail-list">
          <view class="detail-row" v-if="detail.driverName">
            <text class="label">司机</text>
            <text class="value">{{ detail.driverName || '-' }}</text>
          </view>
          <view class="detail-row" v-if="detail.idCard">
            <text class="label">身份证</text>
            <text class="value">{{ detail.idCard || '-' }}</text>
          </view>
          <view class="detail-row" v-if="detail.mobile">
            <text class="label">联系方式</text>
            <text class="value">{{ detail.mobile || '-' }}</text>
          </view>
          <view class="detail-row" v-if="detail.plateNo">
            <text class="label">车牌号</text>
            <text class="value">{{ detail.plateNo || '-' }}</text>
          </view>
          <view class="detail-row" v-if="detail.carRegistration">
            <text class="label">车挂号</text>
            <text class="value">{{ detail.carRegistration || '-' }}</text>
          </view>
          <view class="detail-row" v-if="detail.carWeight">
            <text class="label">车挂重</text>
            <text class="value">{{ detail.carWeight || '-' }}</text>
          </view>
          <view class="detail-row" v-if="detail.carLength">
            <text class="label">车长</text>
            <text class="value">{{ detail.carLength || '-' }}</text>
          </view>
        </view>
      </SectionCard>

      <!-- 箱信息 -->
      <SectionCard title="箱信息"
        v-if="detail.cont || detail.contTitle || detail.pickUpTime || detail.loadingTime || detail.arriveTime">
        <view class="detail-list">
          <view class="detail-row" v-if="detail.cont">
            <text class="label">箱号</text>
            <text class="value">{{ detail.cont || '-' }}</text>
          </view>
          <view class="detail-row" v-if="detail.contTitle">
            <text class="label">封号</text>
            <text class="value">{{ detail.contTitle || '-' }}</text>
          </view>
          <view class="detail-row" v-if="detail.pickUpTime">
            <text class="label">提箱时间</text>
            <text class="value">{{ detail.pickUpTime || '-' }}</text>
          </view>
          <view class="detail-row" v-if="detail.loadingTime">
            <text class="label">提货时间</text>
            <text class="value">{{ detail.loadingTime || '-' }}</text>
          </view>
          <view class="detail-row" v-if="detail.arriveTime">
            <text class="label">到达时间</text>
            <text class="value">{{ detail.arriveTime || '-' }}</text>
          </view>
        </view>
      </SectionCard>

      <!-- 费用明细 -->
      <SectionCard :title="isAdmin ? '成本明细' : '费用明细'" v-if="(isFleet || isAdmin) && fleetFeeRows.length">
        <view class="fee-table">
          <view class="fee-row fee-head">
            <text class="fee-cell">费项</text>
            <text class="fee-cell">单价</text>
            <text class="fee-cell">数量</text>
            <text class="fee-cell">金额</text>
            <text class="fee-cell">备注</text>
          </view>

          <view class="fee-row" v-for="(item, index) in fleetFeeRows" :key="index">
            <text class="fee-cell">{{ item.feeItemName || '-' }}</text>
            <text class="fee-cell">{{ item.unitPrice ?? '-' }}</text>
            <text class="fee-cell">{{ item.quantity || '-' }}</text>
            <text class="fee-cell">{{ item.amount ?? '-' }}</text>
            <text class="fee-cell">{{ item.remark || '-' }}</text>
          </view>

          <view v-if="!fleetFeeRows.length" class="empty-inline">暂无费用明细</view>
        </view>
      </SectionCard>

      <!-- 费用明细 -->
      <SectionCard :title="isAdmin ? '收入明细' : '费用明细'" v-if="(isAdmin || isOwner) && ownerFeeRows.length">
        <view class="fee-table">
          <view class="fee-row fee-head">
            <text class="fee-cell">费项</text>
            <text class="fee-cell">单价</text>
            <text class="fee-cell">数量</text>
            <text class="fee-cell">金额</text>
            <text class="fee-cell">备注</text>
          </view>

          <view class="fee-row" v-for="(item, index) in ownerFeeRows" :key="index">
            <text class="fee-cell">{{ item.feeItemName || '-' }}</text>
            <text class="fee-cell">{{ item.unitPrice ?? '-' }}</text>
            <text class="fee-cell">{{ item.quantity || '-' }}</text>
            <text class="fee-cell">{{ item.amount ?? '-' }}</text>
            <text class="fee-cell">{{ item.remark || '-' }}</text>
          </view>

          <view v-if="!ownerFeeRows.length" class="empty-inline">暂无费用明细</view>
          <view v-if="isAdmin" class="add-fee-btn" @click="openAddFeeDialog">+ 添加费用</view>
        </view>
      </SectionCard>

      <!-- 照片记录 -->
      <SectionCard title="照片记录" v-if="photoList.length">
        <view class="photo-grid">
          <view class="photo-item" v-for="(img, index) in photoList" :key="index" @click="previewPhoto(img.url)">
            <image :src="img.url" mode="aspectFill" class="photo-img" />
            <text class="photo-label">{{ img.label }}</text>
          </view>
        </view>

        <view v-if="!photoList.length" class="empty-inline">暂无照片</view>
      </SectionCard>

      <!-- 备注信息 -->
      <SectionCard title="备注信息" v-if="detail.remark || detail.truckRemark || detail.inquiryRemark">
        <view class="remark-box">
          {{ detail.remark || detail.truckRemark || detail.inquiryRemark || '暂无备注' }}
        </view>
      </SectionCard>

      <!-- 底部按钮 -->
      <view class="bottom-bar">
        <button class="close-btn" @click="handleClose">关闭</button>
      </view>
    </view>

    <view v-else class="empty-page">未找到物流单</view>

    <view v-if="feeDialogVisible" class="fee-mask" @click="closeFeeDialog">
      <view class="fee-dialog" @click.stop>
        <view class="fee-dialog-title">
          {{ feeDialogMode === 'add' ? '添加费用' : '修改费用' }}
        </view>

        <view class="fee-form-item">
          <text class="fee-label">费用类型</text>
          <picker mode="selector" :range="feeItemNames" :value="feeItemIndex >= 0 ? feeItemIndex : 0"
            @change="onFeeItemChange">
            <view class="fee-picker-box">
              <text :class="['fee-picker-text', !feeDialogForm.feeItemName && 'placeholder']">
                {{
                  feeDialogForm.feeItemName ||
                  (feeItemLoading ? '正在加载费用类型...' : '请选择费用类型')
                }}
              </text>
            </view>
          </picker>
        </view>

        <view class="fee-form-item">
          <text class="fee-label">金额</text>
          <input v-model="feeDialogForm.unitPrice" class="fee-input" type="digit" placeholder="请输入金额"
            placeholder-class="placeholder" />
        </view>

        <view class="fee-form-item">
          <text class="fee-label">备注</text>
          <input v-model="feeDialogForm.remark" class="fee-input" placeholder="请输入备注" placeholder-class="placeholder" />
        </view>

        <view class="fee-dialog-footer">
          <view class="fee-btn cancel" @click="closeFeeDialog">取消</view>
          <view class="fee-btn confirm" @click="confirmFeeDialog">确定</view>
        </view>
      </view>
    </view>
  </PageLayout>

</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PageLayout from '@/components/page-layout/index.vue'
import SectionCard from '@/components/section-card/index.vue'
import OrderBadge from '@/components/order-badge/index.vue'
import { requireLogin } from '@/utils/guard'
import { getDictDataApi, getFeeItemApi, addLogisticsDetailApi, type ArriveFeeItem } from '@/api'
import { getMyLogisticsDetailApi, getAdminLogisticsDetailApi, getFleetLogisticsDetailApi } from '@/api/logistics'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
const userStore = useUserStore()
const { role } = storeToRefs(userStore)

const isFleet = computed(() => role.value === 'fleet')
const isAdmin = computed(() => role.value === 'admin')
const isOwner = computed(() => role.value === 'owner')

const detailId = ref('')
const detail = ref<any | null>(null)
const statusDictList = ref<Array<{ dictLabel: string; dictValue: string; dictSort?: number }>>([])

onLoad((options) => {
  if (!requireLogin('/pages/logistics/detail')) return
  detailId.value = String(options?.code || '')
  if (detailId.value) {
    loadDetail()
  }
  loadStatusDict()
  if (isAdmin.value) {
    loadFeeItems()
  }
})

const loadStatusDict = async () => {
  try {
    const res: any = await getDictDataApi('pri_logistics_status')
    statusDictList.value = res || []

    // 按排序字段排序
    statusDictList.value.sort((a, b) => (a.dictSort || 0) - (b.dictSort || 0))
  } catch (err) {
    console.error('加载物流状态字典失败:', err)
  }
}


/** =========================
 * 费用弹窗逻辑
 * ========================= */
const feeDialogVisible = ref(false)
const feeDialogMode = ref<'add' | 'edit'>('add')
const editingFeeIndex = ref(-1)

const feeItemOptions = ref<{ id: number | string; name: string }[]>([])
const feeItemNames = ref<string[]>([])
const feeItemIndex = ref(-1)
const feeItemLoading = ref(false)

const feeDialogForm = reactive({
  feeItemId: '' as number | string | '',
  feeItemName: '',
  unitPrice: '',
  remark: ''
})

const resetFeeDialogForm = () => {
  feeDialogForm.feeItemId = ''
  feeDialogForm.feeItemName = ''
  feeDialogForm.unitPrice = ''
  feeDialogForm.remark = ''
  editingFeeIndex.value = -1
  feeItemIndex.value = -1
}

const loadFeeItems = async () => {
  if (feeItemOptions.value.length || feeItemLoading.value) return

  feeItemLoading.value = true
  try {
    const res: any = await getFeeItemApi()
    const list = Array.isArray(res) ? res : []

    feeItemOptions.value = list
      .filter((item: any) => item && item.id != null)
      .map((item: any) => ({
        id: item.id,
        name: item.name
      }))

    feeItemNames.value = feeItemOptions.value.map(item => item.name)
  } catch (err) {
    console.error('获取费用类型失败:', err)
    uni.showToast({ title: '获取费用类型失败', icon: 'none' })
  } finally {
    feeItemLoading.value = false
  }
}

const onFeeItemChange = (e: any) => {
  const index = Number(e.detail.value)
  const item = feeItemOptions.value[index]
  if (!item) return

  feeItemIndex.value = index
  feeDialogForm.feeItemId = item.id
  feeDialogForm.feeItemName = item.name
}

const openAddFeeDialog = async () => {
  feeDialogMode.value = 'add'
  resetFeeDialogForm()
  feeDialogVisible.value = true
}

const closeFeeDialog = () => {
  feeDialogVisible.value = false
  resetFeeDialogForm()
}

const confirmFeeDialog = async () => {
  if (!feeDialogForm.feeItemId) {
    uni.showToast({ title: '请选择费用类型', icon: 'none' })
    return
  }

  if (!feeDialogForm.feeItemName.trim()) {
    uni.showToast({ title: '请选择费用类型', icon: 'none' })
    return
  }

  if (!feeDialogForm.unitPrice.trim()) {
    uni.showToast({ title: '请输入金额', icon: 'none' })
    return
  }

  const extraFeeList: ArriveFeeItem[] = [{
    feeItemId: feeDialogForm.feeItemId,
    feeItemName: feeDialogForm.feeItemName.trim(),
    unitPrice: feeDialogForm.unitPrice.trim(),
    remark: feeDialogForm.remark.trim()
  }]
  await addLogisticsDetailApi({
    id: detail.value.id,
    extraFeeList
  })
  closeFeeDialog()
  loadDetail()
}

const normalizeDetail = (row: any) => {
  const photos = row.photos || row.photoList || row.images || []

  return {
    ...row,
    orderNo: row.code || `#${row.id}`,
    createdAt: row.planLoadingTime,
    fromCity: row.loadingPlace,
    toCity: row.destination,
    pickUpPlace: row.pickUpPlace,
    loadingPlace: row.loadingPlace,
    containerInfo: row.contType
      ? `${row.contType}${row.contNum != null ? ` × ${row.contNum}` : ''}`
      : '-',
    goodsName: row.detail || row.goodsName,
    pickupTime: row.pickUpTime,
    weight: row.weight,
    remark: row.notice,

    // 车辆信息
    driverName: row.driverName || row.driver,
    idCard: row.idCard || row.idNo,
    mobile: row.mobile || row.phone,
    plateNo: row.plateNo || row.carNo,
    trailerNo: row.trailerNo || row.truckTrailerNo,
    trailerWeight:
      row.trailerWeight != null
        ? `${row.trailerWeight}${String(row.trailerWeight).includes('KGS') ? '' : ' KGS'}`
        : '-',
    truckLength:
      row.truckLength != null
        ? `${row.truckLength}${String(row.truckLength).includes('米') ? '' : ' 米'}`
        : '-',

    // 箱信息
    containerNo: row.containerNo || row.boxNo,
    sealNo: row.sealNo || row.sealNumber,
    containerPickTime: row.containerPickTime || row.pickContainerTime,
    arriveTime: row.arriveTime || row.arrivalTime,

    // 费用/照片
    feeList: row.feeList || row.costList || row.fees || [],
    photos: Array.isArray(photos) ? photos : []
  }
}

const loadDetail = async () => {
  try {
    if (isFleet.value) {
      const res: any = await getFleetLogisticsDetailApi(detailId.value)
      const row = res || null
      detail.value = row ? normalizeDetail(row) : null
      return

    } else if (isAdmin.value) {
      const res: any = await getAdminLogisticsDetailApi(detailId.value)
      const row = res || null
      detail.value = row ? normalizeDetail(row) : null
      return
    } else {
      // 默认加载个人端接口
      const res: any = await getMyLogisticsDetailApi(detailId.value)
      const row = res || null
      detail.value = row ? normalizeDetail(row) : null
    }
  } catch (err) {
    console.error('加载物流单详情失败:', err)
    detail.value = null
  }
}

const statusText = computed(() => {
  const status = String(detail.value?.status || '')
  const hit = statusDictList.value.find((item) => item.dictValue === status)
  return hit?.dictLabel || '-'
})

const badgeType = computed(() => {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'default'> = {
    '0': 'warning',
    '1': 'primary',
    '2': 'primary',
    '3': 'success'
  }
  return map[String(detail.value?.status || '')] || 'default'
})

const fleetFeeRows = computed(() => {
  const list = detail.value?.extraFeeList.filter((item: { type: string }) => item.type === '2') || []
  return Array.isArray(list) ? list : []
})

const ownerFeeRows = computed(() => {
  const list = detail.value?.extraFeeList.filter((item: { type: string }) => item.type === '1') || []
  return Array.isArray(list) ? list : []
})

const photoList = computed(() => {
  const data = detail.value
  return [...(data?.contBottomImg ? [{ url: data?.contBottomImg, label: '提箱-箱底照' }] : []),
  ...(data?.namePlateImg ? [{ url: data?.namePlateImg, label: '提箱-铭牌照' }] : []),
  ...(data?.pickUpEmptyImg ? [{ url: data?.pickUpEmptyImg, label: '提箱-空箱照' }] : []),
  ...(data?.pickUpOpenEmptyImg ? [{ url: data?.pickUpOpenEmptyImg, label: '提箱-空箱开门照' }] : []),
  ...(data?.pickUpOtherImg ? data.pickUpOtherImg.split(',').map((url: string, index: number) => ({ url, label: `提箱-其他照${index + 1}` })).filter(Boolean) : []),
  ...(data?.loadingOpenEmptyImg ? [{ url: data?.loadingOpenEmptyImg, label: '提货-空箱开门照' }] : []),
  ...(data?.quarterImg ? [{ url: data?.quarterImg, label: '提货-四分之一照' }] : []),
  ...(data?.halfImg ? [{ url: data?.halfImg, label: '提货-二分之一照' }] : []),
  ...(data?.loadingOtherImg ? data.loadingOtherImg.split(',').map((url: string, index: number) => ({ url, label: `提货-其他照${index + 1}` })).filter(Boolean) : []),
  ...(data?.arriveImg ? [{ url: data?.arriveImg, label: '落重-进站照片' }] : []),
  ...(data?.arriveOtherImg ? data.arriveOtherImg.split(',').map((url: string, index: number) => ({ url, label: `落重-其他照${index + 1}` })).filter(Boolean) : [])]


})

const previewPhoto = (url: string) => {
  const urls = photoList.value.map((item) => item.url)
  uni.previewImage({
    current: url,
    urls
  })
}

const handleClose = () => {
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
@import '@/uni.scss';

.detail-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 24rpx;
  box-sizing: border-box;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.header-card {
  background: #fff;
  border: 1px solid #e8ebf0;
  border-radius: 24rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 6rpx 20rpx rgba(31, 41, 55, 0.04);
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20rpx;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.order-no {
  font-size: 32rpx;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.4;
}

.order-time {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #8a94a6;
}

.route-row {
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
  font-size: 36rpx;
  font-weight: 700;
  color: #1f2937;
}

.city {
  line-height: 1.4;
}

.arrow {
  color: #6b7280;
  font-weight: 600;
}

.summary-grid {
  margin-top: 22rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.summary-item {
  width: calc(50% - 20rpx);
  background: #f8fafc;
  border: 1px solid #edf0f4;
  border-radius: 18rpx;
  padding: 18rpx 18rpx 16rpx;
  box-sizing: border-box;
}

.summary-label {
  display: block;
  font-size: 24rpx;
  color: #8a94a6;
  margin-bottom: 10rpx;
}

.summary-value {
  font-size: 28rpx;
  color: #1f2937;
  line-height: 1.5;
  word-break: break-all;
  font-weight: 500;
}

.detail-list {
  padding: 6rpx 0;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  padding: 18rpx 24rpx;
  border-bottom: 1px solid #eef1f5;
}

.detail-row:last-child {
  border-bottom: none;
}

.label {
  width: 150rpx;
  font-size: 26rpx;
  color: #6b7280;
  flex-shrink: 0;
  line-height: 1.6;
}

.value {
  flex: 1;
  font-size: 28rpx;
  color: #1f2937;
  line-height: 1.7;
  word-break: break-all;
  font-weight: 500;
}

.remark-box {
  padding: 24rpx;
  font-size: 28rpx;
  color: #1f2937;
  line-height: 1.8;
  min-height: 120rpx;
  background: #f8fafc;
  border-radius: 18rpx;
  border: 1px solid #edf0f4;
}

.fee-table {
  border: 1px solid #e8ebf0;
  border-radius: 18rpx;
  overflow: hidden;
  background: #fff;
}

.fee-row {
  display: flex;
  border-bottom: 1px solid #eef1f5;
}

.fee-row:last-child {
  border-bottom: none;
}

.fee-head {
  background: #f8fafc;
  font-weight: 600;
}

.fee-cell {
  flex: 1;
  padding: 18rpx 12rpx;
  font-size: 24rpx;
  color: #1f2937;
  text-align: center;
  word-break: break-all;
}

.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
  padding: 10rpx 0;
}

.photo-item {
  width: calc(33.333% - 12rpx);
  text-align: center;
}

.photo-img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 14rpx;
  background: #f3f4f6;
  border: 1px solid #e8ebf0;
}

.photo-label {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #4b5563;
}

.bottom-bar {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  margin-top: 24rpx;
  padding: 18rpx 0 calc(18rpx + env(safe-area-inset-bottom));
  background: linear-gradient(to top, #f5f7fa 75%, rgba(245, 247, 250, 0));
}

.close-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #1677ff;
  color: #fff;
  border-radius: 18rpx;
  font-size: 30rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 20rpx rgba(22, 119, 255, 0.2);
}

.empty-inline {
  padding: 22rpx 0 8rpx;
  text-align: center;
  color: #8a94a6;
  font-size: 26rpx;
}

.empty-page {
  padding: 140rpx 30rpx;
  text-align: center;
  color: #8a94a6;
  font-size: 30rpx;
}

.add-btn,
.add-fee-btn {
  margin-top: 16rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border: 1px dashed $color-border;
  border-radius: $radius-sm;
  color: $color-primary;
  font-size: 28rpx;
  background: #fafcff;
}

/* 弹窗遮罩 */
.fee-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

/* 弹窗主体 */
.fee-dialog {
  width: 650rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx 28rpx 24rpx;
  box-sizing: border-box;
}

.fee-dialog-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $color-text;
  margin-bottom: 24rpx;
  text-align: center;
}

.fee-form-item {
  margin-bottom: 22rpx;
}

.fee-label {
  display: block;
  font-size: 26rpx;
  color: $color-text-2;
  margin-bottom: 10rpx;
}

.fee-picker-box {
  width: 100%;
  height: 78rpx;
  border: 1px solid $color-border;
  border-radius: 12rpx;
  background: $color-fill-light;
  padding: 0 20rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.fee-picker-text {
  font-size: 28rpx;
  color: $color-text;
}

.fee-input {
  width: 100%;
  height: 78rpx;
  border: 1px solid $color-border;
  border-radius: 12rpx;
  background: $color-fill-light;
  padding: 0 20rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  color: $color-text;
}

.fee-dialog-footer {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.fee-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.fee-btn.cancel {
  background: #f2f3f5;
  color: $color-text-2;
}

.fee-btn.confirm {
  background: $color-primary;
  color: #fff;
}
</style>