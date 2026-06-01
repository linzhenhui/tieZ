<template>
  <PageLayout currentPath="/pages/inquiry/form" :showTabbar="true">
    <view class="page">
      <view class="content">
        <view class="section-title">基础信息</view>
        <!-- 提箱地 -->
        <view class="form-row">
          <view class="label">
            <text class="required">*</text>
            <text>提箱地</text>
          </view>
          <view class="field">
            <input class="input" v-model="form.pickUpPlace" placeholder="请输入提箱地" />
          </view>
        </view>

        <!-- 装箱地 -->
        <view v-for="(item, index) in form.loadingPlaces" :key="'loading-' + index" class="form-row">
          <view class="label">
            <text class="required" v-if="index === 0">*</text>
            <text>装箱地{{ index + 1 }}</text>
          </view>

          <view class="field-with-btn">
            <input class="input flex-input" v-model="item.value" :placeholder="`请输入装箱地${index + 1}`" />
            <text class="delete-btn" @click="removeLoadingPlace(index)">删除</text>
          </view>
        </view>

        <view class="add-row">
          <text class="add-btn" @click="addLoadingPlace">+ 添加装箱地</text>
        </view>

        <!-- 目的地 -->
        <view v-for="(item, index) in form.destinations" :key="'dest-' + index" class="form-row">
          <view class="label">
            <text class="required" v-if="index === 0">*</text>
            <text>目的地{{ index + 1 }}</text>
          </view>

          <view class="field-with-btn">
            <input class="input flex-input" v-model="item.value" :placeholder="`请输入目的地${index + 1}`" />
            <text class="delete-btn" @click="removeDestination(index)">删除</text>
          </view>
        </view>

        <view class="add-row">
          <text class="add-btn" @click="addDestination">+ 添加目的地</text>
        </view>

        <!-- 箱型 + 箱量 -->
        <view class="form-row">
          <view class="label">
            <text class="required">*</text>
            <text>箱型箱量</text>
          </view>

          <view class="field-inline">
            <picker class="picker-box" mode="selector" :range="contTypeOptions" range-key="dictLabel"
              @change="onContTypeChange">
              <view class="picker-view">
                <text v-if="!form.contTypeText" class="placeholder-text">请选择箱型</text>
                <text v-else>{{ form.contTypeText }}</text>
              </view>
            </picker>

            <input class="input input-small" v-model="form.contNum" type="number" placeholder="数量" />
          </view>
        </view>

        <!-- 提货时间 -->
        <view class="form-row">
          <view class="label">
            <text class="required">*</text>
            <text>提货时间</text>
          </view>
          <view class="field">
            <picker mode="date" :value="form.pickUpTime" @change="onDateChange">
              <view class="picker-view">
                <text v-if="!form.pickUpTime" class="placeholder-text">请选择提货日期</text>
                <text v-else>{{ form.pickUpTime }}</text>
              </view>
            </picker>
          </view>
        </view>

        <!-- 货重 -->
        <view class="form-row">
          <view class="label">
            <text class="required">*</text>
            <text>货重</text>
          </view>
          <view class="field-inline weight-field">
            <input class="input" v-model="form.weight" type="number" placeholder="请输入货重" />
            <text class="unit">KGS</text>
          </view>
        </view>

        <!-- 品名 -->
        <view class="form-row">
          <view class="label">
            <text>品名</text>
          </view>
          <view class="field">
            <input class="input" v-model="form.detail" placeholder="请输入品名" />
          </view>
        </view>

        <!-- 注意事项 -->
        <view class="form-row textarea-row">
          <view class="label">
            <text>注意事项</text>
          </view>
          <view class="field">
            <textarea class="textarea" v-model="form.notice" placeholder="请输入注意事项" />
          </view>
        </view>

        <view class="actions">
          <button class="primary-btn" :loading="submitting" @click="handleInquiry">
            {{ isEditMode ? '保存修改' : '询价' }}
          </button>
        </view>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PageLayout from '@/components/page-layout/index.vue'
import { editInquiryTruckApi, addManualInquiryApi, getDictDataApi, detailInquiryTruckApi } from '@/api'
import { useInquiryStore } from '@/store/inquiry'

type DynamicItem = { value: string }

const inquiryStore = useInquiryStore()

const submitting = ref(false)
const contTypeOptions = ref<any[]>([])
const isEditMode = ref(false)
const editId = ref('')

const form = reactive({
  id: '',
  pickUpPlace: '',
  loadingPlaces: [{ value: '' }] as DynamicItem[],
  destinations: [{ value: '' }] as DynamicItem[],
  contType: '40HQ',
  contTypeText: '40HQ',
  contNum: '1',
  weight: '',
  cont: '',
  detail: '',
  pickUpTime: '',
  notice: ''
})

const goBack = () => {
  uni.navigateBack()
}

const addLoadingPlace = () => {
  form.loadingPlaces.push({ value: '' })
}

const removeLoadingPlace = (index: number) => {
  form.loadingPlaces.splice(index, 1)
  if (form.loadingPlaces.length === 0) {
    form.loadingPlaces.push({ value: '' })
  }
}

const addDestination = () => {
  form.destinations.push({ value: '' })
}

const removeDestination = (index: number) => {
  form.destinations.splice(index, 1)
  if (form.destinations.length === 0) {
    form.destinations.push({ value: '' })
  }
}

const onContTypeChange = (e: any) => {
  const index = Number(e.detail.value)
  const item = contTypeOptions.value[index]
  if (item) {
    form.contType = item.dictValue
    form.contTypeText = item.dictLabel
  }
}

const onDateChange = (e: any) => {
  form.pickUpTime = e.detail.value
}

const loadDict = async () => {
  const data = await getDictDataApi('sys_cnt_type')
  contTypeOptions.value = data || []

  // 如果是编辑模式且 contType 已有值，补一下文案
  if (form.contType && !form.contTypeText) {
    const hit = contTypeOptions.value.find((item: any) => item.dictValue === form.contType)
    if (hit) {
      form.contTypeText = hit.dictLabel
    }
  }
}

const splitToList = (val?: string) => {
  if (!val) return ['']
  return val
    .split(',')
    .map((i) => i.trim())
    .filter(Boolean)
}

const fillFormByDetail = (detail: any) => {
  if (!detail) return

  form.id = String(detail.id || '')
  form.pickUpPlace = detail.pickUpPlace || ''
  form.loadingPlaces = splitToList(detail.loadingPlace).map((item) => ({ value: item }))
  form.destinations = splitToList(detail.destination).map((item) => ({ value: item }))
  form.contType = detail.contType || ''
  form.contNum = detail.contNum != null ? String(detail.contNum) : ''
  form.weight = detail.weight != null ? String(detail.weight) : ''
  form.cont = detail.cont || ''
  form.detail = detail.detail || ''
  form.pickUpTime = detail.pickUpTime || ''
  form.notice = detail.notice || ''

  if (!form.loadingPlaces.length) form.loadingPlaces = [{ value: '' }]
  if (!form.destinations.length) form.destinations = [{ value: '' }]

  // contTypeText 先给空，等字典加载后再补
  const hit = contTypeOptions.value.find((item: any) => item.dictValue === form.contType)
  if (hit) {
    form.contTypeText = hit.dictLabel
  }
}

onLoad((options) => {
  const id = String(options?.id || '')
  if (id) {
    isEditMode.value = true
    editId.value = id
    form.id = id
    detailInquiryTruckApi(id).then((res: any) => {
      const detail = res || null
      fillFormByDetail(detail)
    })
  }
})

const validate = () => {
  if (!form.pickUpPlace.trim()) {
    uni.showToast({ title: '请输入提箱地', icon: 'none' })
    return false
  }

  const loadingPlaces = form.loadingPlaces.map(i => i.value.trim()).filter(Boolean)
  if (!loadingPlaces.length) {
    uni.showToast({ title: '请至少填写一个装箱地', icon: 'none' })
    return false
  }

  const destinations = form.destinations.map(i => i.value.trim()).filter(Boolean)
  if (!destinations.length) {
    uni.showToast({ title: '请至少填写一个目的地', icon: 'none' })
    return false
  }

  if (!form.contType) {
    uni.showToast({ title: '请选择箱型', icon: 'none' })
    return false
  }

  if (!form.contNum.trim()) {
    uni.showToast({ title: '请输入箱量', icon: 'none' })
    return false
  }

  if (!form.pickUpTime) {
    uni.showToast({ title: '请选择提货时间', icon: 'none' })
    return false
  }

  if (!form.weight.trim()) {
    uni.showToast({ title: '请输入货重', icon: 'none' })
    return false
  }

  return true
}

const handleInquiry = async () => {
  if (!validate()) return

  try {
    submitting.value = true

    const payload = {
      id: form.id || '',
      pickUpPlace: form.pickUpPlace.trim(),
      loadingPlace: form.loadingPlaces.map(i => i.value.trim()).filter(Boolean).join(','),
      destination: form.destinations.map(i => i.value.trim()).filter(Boolean).join(','),
      contType: form.contType,
      contNum: form.contNum,
      weight: form.weight,
      cont: form.cont.trim(),
      detail: form.detail.trim(),
      pickUpTime: form.pickUpTime,
      notice: form.notice.trim()
    }

    if (isEditMode.value) {
      await editInquiryTruckApi(payload)
      uni.showToast({
        title: '修改成功',
        icon: 'success'
      })
    } else {
      await addManualInquiryApi(payload)
      uni.showToast({
        title: '询价成功',
        icon: 'success'
      })
    }

    setTimeout(() => {
      if (isEditMode.value) {
        // 编辑成功后返回上一页
        uni.navigateBack()
        return
      }
      uni.navigateTo({ url: '/pages/inquiry/list' })
    }, 500)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadDict()
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #fff;
}

.topbar {
  height: 88rpx;
  padding: 0 24rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  border-bottom: 1px solid #f0f0f0;
}

.back-btn,
.placeholder {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 44rpx;
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #111;
}

.content {
  padding: 24rpx;
  box-sizing: border-box;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #111;
  margin-bottom: 18rpx;
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

.field-with-btn {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.input,
.textarea,
.picker-view {
  width: 100%;
  height: 82rpx;
  border: 1px solid #e4e7ed;
  border-radius: 14rpx;
  background: #f9fafc;
  box-sizing: border-box;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333;
}

.picker-view {
  display: flex;
  align-items: center;
  color: #333;
}

.placeholder-text {
  color: #a8adb7;
}

.input-small {
  width: 160rpx;
  flex-shrink: 0;
}

.weight-field {
  align-items: center;
}

.unit {
  width: 70rpx;
  text-align: right;
  color: #666;
  font-size: 28rpx;
  flex-shrink: 0;
}

.textarea-row .field {
  flex: 1;
}

.textarea {
  height: 260rpx;
  padding-top: 18rpx;
}

.add-row {
  padding-left: 160rpx;
  margin-bottom: 20rpx;
}

.add-btn {
  font-size: 26rpx;
  color: #1677ff;
}

.delete-btn {
  flex-shrink: 0;
  font-size: 26rpx;
  color: #ff4d4f;
}

.actions {
  margin-top: 36rpx;
}

.primary-btn {
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 16rpx;
  background: #1677ff;
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
}
</style>