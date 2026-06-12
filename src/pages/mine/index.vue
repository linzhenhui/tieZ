<template>
  <PageLayout currentPath="/pages/mine/index" :showTabbar="true">
    <view class="my-page">
      <!-- 顶部个人信息 -->
      <view class="profile-banner" :class="{ 'guest-banner': !userStore.isLogin }"
        @click="!userStore.isLogin && !wxLoginLoading && goWxLogin()">
        <view class="profile-left">
          <image class="profile-avatar-img"
            :src="userStore.isLogin ? (userStore.userInfo?.avatar || defaultAvatar) : defaultAvatar"
            mode="aspectFill" />
          <view class="profile-info">
            <view class="name">
              {{
                userStore.isLogin
                  ? (userStore.userInfo?.nickName || userStore.userInfo?.userName || '未设置昵称')
                  : '未登录'
              }}
            </view>
            <view class="meta">
              {{
                userStore.isLogin
                  ? (userStore.userInfo?.phone || '未设置手机号')
                  : '点击微信登录'
              }}
            </view>
          </view>
        </view>

        <view class="settings-btn">
          <text class="settings-btn-text">{{ userStore.isLogin ? '设置' : '登录' }}</text>
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
              <image class="status-icon" :src="getInquiryIcon(item)" mode="aspectFit" />
              <view v-if="item.badge && item.badge > 0" class="badge">
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
              <image class="status-icon" :src="getLogisticsIcon(item)" mode="aspectFit" />
              <view v-if="item.badge && item.badge > 0" class="badge">
                <text class="badge-text">{{ item.badge }}</text>
              </view>
            </view>
            <text class="status-text">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <!-- 底部菜单 -->
      <view class="menu-list">
        <view class="menu-item" @click="goAgreement">
          <text class="menu-label">用户协议</text>
        </view>

        <view class="menu-item" @click="goPrivacy">
          <text class="menu-label">隐私政策</text>
        </view>

        <view class="menu-item" @click="goFleetLogin" v-if="!isFleet">
          <text class="menu-label">切换车队登录</text>
        </view>

        <view v-if="userStore.isLogin" class="menu-item" @click="handleLogout">
          <text class="menu-label danger">退出登录</text>
        </view>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import PageLayout from '@/components/page-layout/index.vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/user'
import { useInquiryStore } from '@/store/inquiry'
import { useLogisticsStore } from '@/store/logistics'
import { shipperWxLoginApi, getUserInfoApi } from '@/api'

type TabItem = {
  label: string
  value: string
  badge?: number
}

const userStore = useUserStore()
const { role } = storeToRefs(userStore)

const inquiryStore = useInquiryStore()
const logisticsStore = useLogisticsStore()

const defaultAvatar = 'https://img.yzcdn.cn/vant/cat.jpeg'

const wxLoginLoading = ref(false)
const pageRefreshing = ref(false)

const isFleet = computed(() => role.value === 'fleet')

const guestInquiryTabs: TabItem[] = [
  { label: '报价中', value: '0,1', badge: 0 },
  { label: '已报价', value: '2', badge: 0 },
  { label: '已建单', value: '3', badge: 0 },
  { label: '已取消', value: '4', badge: 0 }
]

const guestLogisticsTabs: TabItem[] = [
  { label: '待派单', value: '0', badge: 0 },
  { label: '调度中', value: '1', badge: 0 },
  { label: '提货中', value: '2', badge: 0 },
  { label: '已完成', value: '3', badge: 0 },
  { label: '已取消', value: '4', badge: 0 }
]

const inquiryTabs = computed<TabItem[]>(() => {
  if (!userStore.isLogin) return guestInquiryTabs
  return isFleet.value ? (inquiryStore.fleetStatusTabs || []) : (inquiryStore.ownerStatusTabs || [])
})

const logisticsTabs = computed<TabItem[]>(() => {
  if (!userStore.isLogin) return guestLogisticsTabs
  return isFleet.value ? (logisticsStore.fleetStatusTabs || []) : (logisticsStore.ownerStatusTabs || [])
})

const getInquiryIcon = (item: TabItem) => `/static/inquiry${item.value}.png`
const getLogisticsIcon = (item: TabItem) => `/static/logistics${item.value}.png`

const normalizeUserInfo = (info: any) => {
  return {
    id: info?.id || info?.userId || '',
    token: info?.token || '',
    avatar: info?.avatar || '',
    nickName: info?.nickName || info?.nickname || info?.userName || '',
    phone: info?.phone || info?.phonenumber || '',
    realName: info?.realName || ''
  }
}

const isUserInfoComplete = (info: any) => {
  return !!(
    info?.avatar &&
    (info?.nickName || info?.nickname || info?.userName) &&
    (info?.phone || info?.phonenumber)
  )
}

const clearMineData = () => {
  userStore.logout()
  uni.removeStorageSync('token')
  inquiryStore.resetState?.()
  logisticsStore.resetState?.()
}

const hasSession = () => {
  const token = uni.getStorageSync('token')
  return !!token && !!userStore.isLogin
}

const refreshMineLists = async () => {
  if (!userStore.isLogin) return

  await inquiryStore.loadStatusTabs?.()
  await logisticsStore.loadStatusTabs?.()
  await inquiryStore.loadInquiryCount?.()
  await logisticsStore.loadLogisticsCount?.()
}

onShow(async () => {
  if (!hasSession()) {
    clearMineData()
    return
  }

  if (pageRefreshing.value) return
  pageRefreshing.value = true

  try {
    await refreshMineLists()
  } catch (error) {
    console.error('刷新我的页面失败:', error)
    clearMineData()
    uni.reLaunch({
      url: '/pages/mine/index'
    })
  } finally {
    pageRefreshing.value = false
  }
})

const goWxLogin = async () => {
  if (wxLoginLoading.value) return false
  wxLoginLoading.value = true
  uni.showLoading({
    title: '登录中...',
    mask: true
  })

  try {
    // #ifdef MP-WEIXIN
    await new Promise((resolve, reject) => {
      uni.getUserProfile({
        desc: '用于微信登录',
        success: resolve,
        fail: reject
      })
    })

    const loginRes: any = await new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject
      })
    })

    if (!loginRes?.code) {
      throw new Error('没有拿到微信登录 code')
    }

    const res: any = await shipperWxLoginApi({
      code: loginRes.code
    })

    const token = res?.data?.token || res?.token || res?.data || res
    if (!token) {
      throw new Error('未获取到 token')
    }

    uni.setStorageSync('token', token)

    const userRes: any = await getUserInfoApi()
    const userInfo = userRes?.data || userRes || {}
    const normalized = normalizeUserInfo(userInfo)

    userStore.login({
      role: 'owner',
      userInfo: {
        token,
        ...normalized
      }
    })

    if (!isUserInfoComplete(userInfo)) {
      uni.redirectTo({
        url: '/pages/mine/detail'
      })
      return true
    }

    await refreshMineLists()

    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })

    return true
    // #endif
  } catch (err: any) {
    console.error('微信登录失败:', err)
    uni.showToast({
      title: err?.message || '微信登录失败',
      icon: 'none'
    })
    return false
  } finally {
    wxLoginLoading.value = false
    uni.hideLoading()
  }

}

const ensureWxLogin = async () => {
  if (userStore.isLogin) return true
  const ok = await goWxLogin()
  return !!ok && userStore.isLogin
}

const goAllInquiry = async () => {
  const ok = await ensureWxLogin()
  if (!ok) return

  uni.navigateTo({
    url: '/pages/inquiry/list'
  })
}

const goInquiryList = async (status: string) => {
  const ok = await ensureWxLogin()
  if (!ok) return

  inquiryStore.setCurrentStatus?.(status)
  uni.navigateTo({
    url: '/pages/inquiry/list'
  })
}

const goAllLogistics = async () => {
  const ok = await ensureWxLogin()
  if (!ok) return

  uni.navigateTo({
    url: '/pages/logistics/list'
  })
}

const goLogisticsList = async (status: string) => {
  const ok = await ensureWxLogin()
  if (!ok) return

  logisticsStore.setCurrentStatus?.(status)
  uni.navigateTo({
    url: '/pages/logistics/list'
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

const goFleetLogin = () => {
  uni.navigateTo({
    url: '/pages/login/index'
  })
}

const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '退出后将清除当前登录状态，是否继续？',
    success: (res) => {
      if (res.confirm) {
        clearMineData()
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
  background: #f5f6fa;
  padding: 24rpx;
  box-sizing: border-box;
}

.profile-banner {
  height: 180rpx;
  border-radius: 24rpx;
  padding: 24rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
  margin-bottom: 24rpx;
}

.guest-banner {
  cursor: pointer;
}

.profile-left {
  display: flex;
  align-items: center;
  min-width: 0;
}

.profile-avatar-img {
  width: 112rpx;
  height: 112rpx;
  border-radius: 56rpx;
  background: #fff;
  margin-right: 20rpx;
}

.profile-info {
  min-width: 0;
}

.name {
  font-size: 34rpx;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}

.meta {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #6b7280;
}

.settings-btn {
  min-width: 100rpx;
  height: 54rpx;
  padding: 0 18rpx;
  border-radius: 27rpx;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-btn-text {
  font-size: 24rpx;
  color: #2563eb;
  font-weight: 600;
}

.section-block {
  margin-bottom: 24rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
  padding: 0 4rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #111827;
}

.section-more {
  font-size: 24rpx;
  color: #2563eb;
}

.status-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx 12rpx;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.status-item {
  width: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx 0;
  box-sizing: border-box;
}

.status-dot-wrap {
  position: relative;
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon {
  width: 52rpx;
  height: 52rpx;
}

.badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 28rpx;
  height: 28rpx;
  border-radius: 14rpx;
  background: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6rpx;
  box-sizing: border-box;
}

.badge-text {
  color: #fff;
  font-size: 20rpx;
  line-height: 1;
}

.status-text {
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #374151;
}

.menu-list {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.menu-item {
  height: 92rpx;
  padding: 0 28rpx;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #f0f0f0;
  box-sizing: border-box;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-label {
  font-size: 28rpx;
  color: #374151;
}

.danger {
  color: #ef4444;
}
</style>