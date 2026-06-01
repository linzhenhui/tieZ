<template>
  <PageLayout currentPath="/pages/mine/index" :showTabbar="true">
    <view class="my-page">
      <!-- 未登录 -->
      <view v-if="!userStore.isLogin" class="guest-card" @click="goLoginPage">
        <view class="avatar-placeholder">未登录</view>

        <view class="guest-title">欢迎来到物流管理平台</view>
        <view class="guest-desc">
          货主端支持微信小程序登录，车队端使用账号密码登录
        </view>

        <view class="guest-actions">
          <button class="btn primary">去登录</button>
        </view>
      </view>

      <!-- 已登录 -->
      <view v-else class="logged-page">
        <!-- 顶部用户卡 -->
        <view class="profile-banner">
          <view class="profile-left">
            <image class="profile-avatar-img" :src="userStore.userInfo?.avatar || defaultAvatar" mode="aspectFill" />
            <view class="profile-info">
              <view class="name">
                {{ userStore.userInfo?.nickName }}
              </view>
              <view class="meta">
                {{ userStore.userInfo?.phone }}
              </view>
            </view>
          </view>

          <view class="settings-btn" @click="goUserDetail">
            <text class="settings-btn-text">设置</text>
          </view>
        </view>
        <!-- 我的询价单 -->
        <view class="section-block">
          <view class="section-header">
            <text class="section-title">我的询价单</text>
            <text class="section-more" @click="goAllInquiry">全部</text>
          </view>

          <view class="status-card">
            <view v-for="item in inquiryTabs" :key="item.value" class="status-item" @click="goInquiryList(item.value)">
              <view class="status-dot-wrap">
                <view v-if="item.badge !== undefined && item.badge > 0" class="badge">
                  <text class="badge-text">{{ item.badge }}</text>
                </view>
              </view>
              <text class="status-text">{{ item.label }}</text>
            </view>
          </view>
        </view>

        <!-- 我的物流单 -->
        <view class="section-block">
          <view class="section-header">
            <text class="section-title">我的物流单</text>
            <text class="section-more" @click="goAllLogistics">全部</text>
          </view>

          <view class="status-card">
            <view v-for="item in logisticsTabs" :key="item.value" class="status-item"
              @click="goLogisticsList(item.value)">
              <view class="status-dot-wrap">
                <view v-if="item.badge !== undefined && item.badge > 0" class="badge">
                  <text class="badge-text">{{ item.badge }}</text>
                </view>
              </view>
              <text class="status-text">{{ item.label }}</text>
            </view>
          </view>
        </view>
        <!-- 菜单列表 -->
        <view class="menu-list">
          <view class="menu-item" @click="goAgreement">
            <text class="menu-label">用户协议</text>
          </view>

          <view class="menu-item" @click="goPrivacy">
            <text class="menu-label">隐私政策</text>
          </view>
          <!-- #ifdef MP-WEIXIN -->
          <view class="menu-item" @click="handleLogout">
            <text class="menu-label danger">退出登录</text>
          </view>
          <!-- #endif -->
        </view>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PageLayout from '@/components/page-layout/index.vue'
import { useUserStore } from '@/store/user'
import { useInquiryStore } from '@/store/inquiry'
import { useLogisticsStore } from '@/store/logistics'
import { onShow, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'

const userStore = useUserStore()

const defaultAvatar = 'https://img.yzcdn.cn/vant/cat.jpeg'

const defaultUserName = computed(() => {
  return userStore.role === 'fleet' ? '车队用户' : '货主用户'
})

type TabItem = {
  label: string
  value: string
  showDot: boolean
}

const inquiryStore = useInquiryStore()
const logisticsStore = useLogisticsStore()

const isFleet = computed(() => userStore.role === 'fleet')

/**
 * 页面显示时初始化
 */
onShow(async () => {
  if (!inquiryTabs.value.length) {
    await inquiryStore.loadStatusTabs()
  }
  if (!logisticsTabs.value.length) {
    await logisticsStore.loadStatusTabs()
  }
  if (userStore.isLogin) {
    await inquiryStore.loadInquiryCount()
    await logisticsStore.loadLogisticsCount()
  }
})

/**
 * 直接从 store 读取 tabList
 */
const inquiryTabs = computed(() =>
  isFleet.value ? inquiryStore.fleetStatusTabs : inquiryStore.ownerStatusTabs
)
const logisticsTabs = computed(() =>
  isFleet.value ? logisticsStore.fleetStatusTabs : logisticsStore.ownerStatusTabs
)
const loadMyPageStatus = async () => {
  try {
    // 后续接接口时再处理
  } catch (err) {
    console.error('加载我的页面状态失败:', err)
  }
}

onMounted(() => {
  loadMyPageStatus()
})

/** 点击未登录区域 -> 去登录页 */
const goLoginPage = () => {
  uni.navigateTo({
    url: '/pages/login/index'
  })
}

/** 右上角设置 -> 用户详情页 */
const goUserDetail = () => {
  uni.navigateTo({
    url: '/pages/mine/detail'
  })
}

const goAllInquiry = () => {
  uni.navigateTo({
    url: '/pages/inquiry/list'
  })
}

const goInquiryList = (status: string) => {
  inquiryStore.setCurrentStatus( status)
  uni.navigateTo({
    url: `/pages/inquiry/list`
  })
}

const goAllLogistics = () => {
  uni.navigateTo({
    url: '/pages/logistics/list'
  })
}

const goLogisticsList = (status: string) => {
  logisticsStore.setCurrentStatus( status)
  uni.navigateTo({
    url: `/pages/logistics/list`
  })
}

const goAgreement = () => {
  uni.navigateTo({
    url: '/pages/webview/index?type=agreement'
  })
}

const goPrivacy = () => {
  uni.navigateTo({
    url: '/pages/webview/index?type=privacy'
  })
}

const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '退出后将清除当前登录状态，是否继续？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.removeStorageSync('token')
        uni.reLaunch({
          url: '/pages/mine/index'
        })
      }
    }
  })
}
</script>
<style scoped lang="scss">
.my-page {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
  background: #f5f6fa;
}

/* 未登录 */
.guest-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 8rpx 30rpx rgba(31, 35, 41, 0.05);
}

.avatar-placeholder {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: #eef4ff;
  color: #1677ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
}

.guest-title {
  margin-top: 20rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: #1f2329;
}

.guest-desc {
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #687182;
  line-height: 1.6;
}

.guest-actions {
  margin-top: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.btn {
  width: 100%;
  height: 84rpx;
  line-height: 84rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  margin: 0;
}

.btn.primary {
  background: #1677ff;
  color: #fff;
}

.btn.default {
  background: #fff;
  color: #1677ff;
  border: 1px solid #b7d1ff;
}

/* 已登录页面 */
.logged-page {
  display: flex;
  flex-direction: column;
}

/* 顶部蓝色卡片 */
.profile-banner {
  height: 168rpx;
  border-radius: 28rpx;
  background: linear-gradient(90deg, #dcecff 0%, #d8ebff 100%);
  padding: 0 28rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 8rpx 30rpx rgba(31, 35, 41, 0.06);
  margin-bottom: 28rpx;
}

.profile-left {
  display: flex;
  align-items: center;
}

.profile-avatar-img {
  width: 104rpx;
  height: 104rpx;
  border-radius: 52rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.9);
  margin-right: 22rpx;
  background: #fff;
}

.profile-info .name {
  font-size: 34rpx;
  font-weight: 700;
  color: #1f2329;
}

.profile-info .meta {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #667085;
}

/* 右上角设置 */
.settings-btn {
  width: 58rpx;
  height: 58rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.settings-btn-text {
  font-size: 20rpx;
  color: #5b7cff;
  font-weight: 600;
}

/* section */
.section-block {
  margin-bottom: 28rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
  padding: 0 6rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1f2329;
}

.section-more {
  font-size: 24rpx;
  color: #3d7eff;
}

.status-card {
  height: 126rpx;
  background: #fff;
  border-radius: 22rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 12rpx;
  box-sizing: border-box;
}

.status-item {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.status-dot-wrap {
  height: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
}

.status-dot {
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background: #ff4d4f;
  display: inline-block;
}

.status-text {
  font-size: 24rpx;
  color: #5f6b7a;
}

/* 菜单 */
.menu-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.menu-item {
  height: 96rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 0 32rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
}

.menu-label {
  font-size: 28rpx;
  color: #2c3e50;
}

.menu-label.danger {
  color: #e74c3c;
}

.badge {
  min-width: 30rpx;
  height: 30rpx;
  padding: 0 6rpx;
  border-radius: 999rpx;
  background: #ff4d4f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  z-index: 2;
  transform: scale(0.95);
}

.badge-text {
  font-size: 18rpx;
  line-height: 1;
  transform: translateY(-1rpx);
}
</style>