<template>
  <PageLayout currentPath="/pages/home/index" :showTabbar="true">
    <view class="page">
      <view class="hero-banner">
        <image class="hero-image"
          src="https://lulian-kunlun.oss-cn-beijing.aliyuncs.com/basicprofile.png" mode="aspectFill" />
      </view>

      <view class="query-card">
        <view class="card-title">快速询价</view>

        <!-- 提箱地 -->
        <view class="form-item autocomplete-wrap" :class="{ active: activeField === 'pickUpPlace' }">
          <text class="label">提箱地</text>

          <view class="input-box">
            <input :value="form.pickUpPlaceText" class="input" placeholder="请输入提箱地" placeholder-class="placeholder"
              @focus="handleFocus('pickUpPlace')" @input="handleInput('pickUpPlace', $event)" />

            <view v-if="showSuggest.pickUpPlace && suggestions.pickUpPlace.length" class="suggest-panel">
              <view v-for="item in suggestions.pickUpPlace" :key="item.id" class="suggest-item"
                @click="selectSuggestion('pickUpPlace', item)">
                <view class="suggest-main">{{ item.name }}</view>
                <view class="suggest-sub">{{ item.mername }}</view>
              </view>
            </view>
          </view>
        </view>

        <!-- 装箱地 -->
        <view class="form-item autocomplete-wrap" :class="{ active: activeField === 'loadingPlace' }">
          <text class="label">装箱地</text>

          <view class="input-box">
            <input :value="form.loadingPlaceText" class="input" placeholder="请输入装箱地" placeholder-class="placeholder"
              @focus="handleFocus('loadingPlace')" @input="handleInput('loadingPlace', $event)" />

            <view v-if="showSuggest.loadingPlace && suggestions.loadingPlace.length" class="suggest-panel">
              <view v-for="item in suggestions.loadingPlace" :key="item.id" class="suggest-item"
                @click="selectSuggestion('loadingPlace', item)">
                <view class="suggest-main">{{ item.name }}</view>
                <view class="suggest-sub">{{ item.mername }}</view>
              </view>
            </view>
          </view>
        </view>

        <!-- 目的地 -->
        <view class="form-item autocomplete-wrap" :class="{ active: activeField === 'destination' }">
          <text class="label">目的地</text>

          <view class="input-box">
            <input :value="form.destinationText" class="input" placeholder="请输入目的地" placeholder-class="placeholder"
              @focus="handleFocus('destination')" @input="handleInput('destination', $event)" />

            <view v-if="showSuggest.destination && suggestions.destination.length" class="suggest-panel">
              <view v-for="item in suggestions.destination" :key="item.id" class="suggest-item"
                @click="selectSuggestion('destination', item)">
                <view class="suggest-main">{{ item.name }}</view>
                <view class="suggest-sub">{{ item.mername }}</view>
              </view>
            </view>
          </view>
        </view>

        <button class="submit-btn" @click="handleSearch">查询报价</button>
      </view>

      <view class="quick-card">
        <view class="card-title">常用功能</view>

        <view class="quick-grid">
          <view class="quick-item" @click="goInquiryForm">
            <view class="quick-icon primary">询</view>
            <text class="quick-text">人工询价</text>
          </view>

          <view class="quick-item" @click="goInquiryList">
            <view class="quick-icon warning">单</view>
            <text class="quick-text">我的询价单</text>
          </view>

          <view class="quick-item" @click="goLogisticsList">
            <view class="quick-icon success">运</view>
            <text class="quick-text">我的物流单</text>
          </view>
        </view>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
import { reactive, ref, onBeforeUnmount, computed } from 'vue'
import PageLayout from '@/components/page-layout/index.vue'
import { searchAddressApi, queryTruckApi, type RegionItem } from '@/api'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
const userStore = useUserStore()

type FieldKey = 'pickUpPlace' | 'loadingPlace' | 'destination'

const form = reactive({
  pickUpPlaceId: '',
  pickUpPlaceText: '',

  loadingPlaceId: '',
  loadingPlaceText: '',

  destinationId: '',
  destinationText: ''
})

const suggestions = reactive<Record<FieldKey, RegionItem[]>>({
  pickUpPlace: [],
  loadingPlace: [],
  destination: []
})

const showSuggest = reactive<Record<FieldKey, boolean>>({
  pickUpPlace: false,
  loadingPlace: false,
  destination: false
})

const activeField = ref<FieldKey | ''>('')

const debounceTimers: Record<FieldKey, ReturnType<typeof setTimeout> | null> = {
  pickUpPlace: null,
  loadingPlace: null,
  destination: null
}
const isFleet = computed(() => userStore.role === 'fleet')

/**
 * 页面显示时初始化
 */
onShow(async () => {
  if (isFleet.value) {
    uni.redirectTo({ url: '/pages/inquiry/list' })
  }
})

const handleFocus = (field: FieldKey) => {
  activeField.value = field
  showSuggest[field] = true

  const currentText =
    field === 'pickUpPlace'
      ? form.pickUpPlaceText
      : field === 'loadingPlace'
        ? form.loadingPlaceText
        : form.destinationText

  if (currentText) {
    querySuggest(field, currentText)
  }
}

const handleInput = (field: FieldKey, e: any) => {
  const value = e.detail.value as string
  activeField.value = field
  showSuggest[field] = true

  // 输入变化时，清空之前已选中的 id，避免“文本变了但 id 还是旧的”
  if (field === 'pickUpPlace') {
    form.pickUpPlaceText = value
    form.pickUpPlaceId = ''
  } else if (field === 'loadingPlace') {
    form.loadingPlaceText = value
    form.loadingPlaceId = ''
  } else {
    form.destinationText = value
    form.destinationId = ''
  }

  if (debounceTimers[field]) {
    clearTimeout(debounceTimers[field]!)
  }

  debounceTimers[field] = setTimeout(() => {
    querySuggest(field, value)
  }, 300)
}

const querySuggest = async (field: FieldKey, keyword: string) => {
  const text = keyword.trim()
  if (!text) {
    suggestions[field] = []
    return
  }
  const res = await searchAddressApi({ mername: text }) as any
  suggestions[field] = res || []
  showSuggest[field] = true

}

const selectSuggestion = (field: FieldKey, item: RegionItem) => {
  if (field === 'pickUpPlace') {
    form.pickUpPlaceId = String(item.id)
    form.pickUpPlaceText = item.mername || item.name
  } else if (field === 'loadingPlace') {
    form.loadingPlaceId = String(item.id)
    form.loadingPlaceText = item.mername || item.name
  } else {
    form.destinationId = String(item.id)
    form.destinationText = item.mername || item.name
  }

  suggestions[field] = []
  showSuggest[field] = false
  activeField.value = ''
}

const handleSearch = async () => {
  if (!form.pickUpPlaceId || !form.loadingPlaceId || !form.destinationId) {
    uni.showToast({
      title: '请先选择完整地址',
      icon: 'none'
    })
    return
  }

  const res = await queryTruckApi({
    pickUpPlace: form.pickUpPlaceId,
    loadingPlace: form.loadingPlaceId,
    destination: form.destinationId
  })


  // const res = await queryTruckApi({
  //   "pickUpPlace": "1032",
  //   "loadingPlace": "843",
  //   "destination": "990"
  // })

  uni.setStorageSync('truckQuoteResult', {
    form: {
      pickUpPlaceId: form.pickUpPlaceId,
      loadingPlaceId: form.loadingPlaceId,
      destinationId: form.destinationId,
      pickUpPlaceText: form.pickUpPlaceText,
      loadingPlaceText: form.loadingPlaceText,
      destinationText: form.destinationText
    },
    list: res || []
  })

  uni.navigateTo({
    url: '/pages/price-list/index'
  })
}

const goInquiryForm = () => {
  uni.navigateTo({ url: '/pages/inquiry/form' })
}

const goInquiryList = () => {
  uni.navigateTo({ url: '/pages/inquiry/list' })
}

const goLogisticsList = () => {
  uni.navigateTo({ url: '/pages/logistics/list' })
}

onBeforeUnmount(() => {
  ; (['pickUpPlace', 'loadingPlace', 'destination'] as FieldKey[]).forEach((key) => {
    if (debounceTimers[key]) {
      clearTimeout(debounceTimers[key]!)
    }
  })
})
</script>

<style scoped lang="scss">
@import '@/uni.scss';

.page {
  min-height: 100vh;
  background: $color-page-bg;
  padding: 24rpx;
  box-sizing: border-box;
}

.hero-banner {
  position: relative;
  width: 100%;
  height: 260rpx;
  border-radius: $radius-md;
  overflow: hidden;
  margin-bottom: 20rpx;
  background: #f5f7fa;
}

.hero-image {
  width: 100%;
  height: 100%;
  display: block;
}

.hero-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 28rpx;
  box-sizing: border-box;
  background: linear-gradient(to top,
      rgba(0, 0, 0, 0.55),
      rgba(0, 0, 0, 0));
  color: #fff;
}

.hero-title {
  font-size: 38rpx;
  font-weight: 600;
  margin-bottom: 10rpx;
}

.hero-desc {
  font-size: 26rpx;
  line-height: 1.6;
  opacity: 0.95;
}

.query-card,
.quick-card {
  background: #fff;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  overflow: visible;
  margin-bottom: 20rpx;
}

.card-title {
  padding: 24rpx 28rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: $color-text;
  border-bottom: 1px solid $color-divider;
  background: #fcfcfd;
}

.form-item {
  padding: 24rpx 28rpx 0;
}

.label {
  display: block;
  margin-bottom: 12rpx;
  font-size: 26rpx;
  color: $color-text-2;
}

.autocomplete-wrap {
  position: relative;
  z-index: 1;
  overflow: visible;
}

.autocomplete-wrap.active {
  z-index: 100;
}

.input-box {
  position: relative;
  overflow: visible;
}

.input {
  width: 100%;
  height: 80rpx;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  background: $color-fill-light;
  padding: 0 24rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  color: $color-text;
}

.placeholder {
  color: $color-text-3;
}

.submit-btn {
  width: calc(100% - 56rpx);
  height: 84rpx;
  line-height: 84rpx;
  margin: 28rpx auto 28rpx;
  background: $color-primary;
  color: #fff;
  border-radius: $radius-sm;
  font-size: 30rpx;
  font-weight: 600;
}

.suggest-panel {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 8rpx);
  background: #fff;
  border: 1px solid #e5e8ee;
  border-radius: 16rpx;
  box-shadow: 0 12rpx 30rpx rgba(31, 35, 41, 0.08);
  overflow: hidden;
  z-index: 999;
  max-height: 420rpx;
  overflow-y: auto;
}

.suggest-item {
  padding: 18rpx 24rpx;
  border-bottom: 1px solid #f0f2f5;
  background: #fff;
}

.suggest-item:last-child {
  border-bottom: none;
}

.suggest-item:active {
  background: #f5f7fa;
}

.suggest-main {
  font-size: 28rpx;
  color: #1f2329;
  line-height: 1.4;
}

.suggest-sub {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #86909c;
  line-height: 1.3;
}

.quick-grid {
  display: flex;
  padding: 24rpx 10rpx 20rpx;
}

.quick-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rpx 0;
}

.quick-icon {
  width: 84rpx;
  height: 84rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34rpx;
  font-weight: 600;
  margin-bottom: 14rpx;
}

.quick-icon.primary {
  background: #edf5ff;
  color: $color-primary;
}

.quick-icon.warning {
  background: #fff7e8;
  color: $color-warning;
}

.quick-icon.success {
  background: #e8fff1;
  color: $color-success;
}

.quick-text {
  font-size: 26rpx;
  color: $color-text-2;
}
</style>