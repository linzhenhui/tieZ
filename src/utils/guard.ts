import { useUserStore } from '@/store/user'
import { Role } from '@/api'
import { storeToRefs } from 'pinia'
const userStore = useUserStore()
const { role } = storeToRefs(userStore)

let jumpingToLogin = false

export const requireLogin = (
  redirectUrl: string,
  requiredRole?: Role
) => {

  // 未登录
  if (!userStore.isLogin) {
    if (jumpingToLogin) return false
    jumpingToLogin = true

    userStore.setRedirectAfterLogin(redirectUrl)

    uni.redirectTo({
      url: '/pages/mine/index',
      complete: () => {
        setTimeout(() => {
          jumpingToLogin = false
        }, 300)
      }
    })

    return false
  }

  // 角色不匹配
  if (requiredRole && role.value !== requiredRole) {
    uni.showToast({
      title: '当前账号角色不匹配',
      icon: 'none'
    })

    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/mine/index'
      })
    }, 300)

    return false
  }

  return true
}