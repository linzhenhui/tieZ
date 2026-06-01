import { useUserStore } from '@/store/user'

export function ensureLogin(redirectUrl?: string) {
  const userStore = useUserStore()

  if (userStore.isLogin) {
    return true
  }

  const targetUrl = redirectUrl || '/pages/inquiry/form'
  userStore.setRedirectAfterLogin(targetUrl)

  uni.showToast({
    title: '请先登录',
    icon: 'none'
  })

  return false
}