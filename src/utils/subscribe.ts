import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'

const FLEET_SUBSCRIBE_TMPL_IDS = [
  'FeUqZk-Qb4XWnFanxX4dudcrKNR_x7__-8K30friku4',
  'D4yoFsiOK4gIN7zHW4Fc7lg1_Jif1Hi5ngPjIDX8PWE'
]

const ON_SUBSCRIBE_TMPL_IDS = [
  'FeUqZk-Qb4XWnFanxX4dudcrKNR_x7__-8K30friku4',
  'sKnwvUaVdwVUof1kOaOg9m34tnm_2giVQM0b-uKkv6o'
]

const getSubscribeTmplIds = (role: string) => {
  return role === 'fleet' ? FLEET_SUBSCRIBE_TMPL_IDS : ON_SUBSCRIBE_TMPL_IDS
}

const getGuideCacheKey = (role: string) => `subscribe_guide_shown_${role}`
const getAuthCacheKey = (role: string) => `subscribe_auth_done_${role}`

const showSubscribeGuide = (role: string) => {
  const cacheKey = getGuideCacheKey(role)
  const hasShown = uni.getStorageSync(cacheKey)

  if (hasShown) return Promise.resolve(true)

  return new Promise<boolean>((resolve) => {
    uni.showModal({
      title: '开启消息通知',
      content: '建议在微信授权时勾选“总是保持以上选择，不再询问”，这样后续重要消息会更稳定收到，也能减少重复确认。',
      confirmText: '去授权',
      cancelText: '暂不',
      success: (res) => {
        uni.setStorageSync(cacheKey, 1)
        resolve(res.confirm)
      },
      fail: () => resolve(false)
    })
  })
}

const getSubscribeSetting = () => {
  return new Promise<UniApp.GetSettingSuccess>((resolve, reject) => {
    uni.getSetting({
      withSubscriptions: true,
      success: resolve,
      fail: reject
    })
  })
}

const hasAcceptedSubscribe = async (role: string, tmplIds: string[]) => {
  const authCacheKey = getAuthCacheKey(role)
  const localDone = uni.getStorageSync(authCacheKey)
  if (localDone) return true

  try {
    const setting = await getSubscribeSetting()
    const itemSettings = setting.subscriptionsSetting?.itemSettings || {}

    const allAccepted = tmplIds.every((id) => itemSettings[id] === 'accept')
    if (allAccepted) {
      uni.setStorageSync(authCacheKey, 1)
      return true
    }

    return false
  } catch (e) {
    console.warn('获取订阅状态失败:', e)
    return false
  }
}

export const requestSubscribeMessageByRole = async () => {
  const userStore = useUserStore()
  const { role } = storeToRefs(userStore)

  const tmplIds = getSubscribeTmplIds(role.value)

  // #ifdef MP-WEIXIN
  if (!tmplIds.length) return false

  // 1) 先查是否已经授权过
  const alreadyAccepted = await hasAcceptedSubscribe(role.value, tmplIds)
  if (alreadyAccepted) {
    console.log('已授权过，跳过弹窗')
    return true
  }

  // 2) 再显示你自己的引导弹窗
  const shouldContinue = await showSubscribeGuide(role.value)
  if (!shouldContinue) return false

  // 3) 调微信订阅弹窗
  return new Promise<boolean>((resolve) => {
    uni.requestSubscribeMessage({
      tmplIds,
      success: (res) => {
        console.log('订阅消息授权结果:', JSON.stringify(res, null, 2))

        const accepted = tmplIds.some((id) => res[id] === 'accept')
        if (accepted) {
          uni.setStorageSync(getAuthCacheKey(role.value), 1)
        }

        resolve(accepted)
      },
      fail: (err) => {
        console.warn('订阅消息授权失败:', err)
        resolve(false)
      }
    })
  })
  // #endif

  // #ifndef MP-WEIXIN
  return Promise.resolve(false)
  // #endif
}