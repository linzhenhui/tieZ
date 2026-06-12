// src/store/user.ts
import { defineStore } from 'pinia'
import { Role } from '@/api'

type UserInfo = {
  id?: string
  token?: string
  avatar?: string

  // 新字段
  nickName?: string
  phone?: string
  email?: string
  sex?: string
  refId?: string

  // 兼容旧字段
  nickname?: string
  userName?: string
  phonenumber?: string

  [key: string]: any
}

const USER_KEY = 'USER_STORE_CACHE'

const defaultUserInfo = (): UserInfo => ({
  id: '',
  token: '',
  avatar: '',
  nickName: '',
  phone: '',
  email: '',
  sex: '',
  refId: ''
})

const loadCache = () => {
  try {
    return uni.getStorageSync(USER_KEY) || {}
  } catch {
    return {}
  }
}

const saveCache = (state: any) => {
  try {
    uni.setStorageSync(USER_KEY, state)
  } catch { }
}

export const useUserStore = defineStore('user', {
  state: () => {
    const cache: any = loadCache()
    return {
      isLogin: !!cache?.isLogin,
      role: (cache?.role || '') as Role,
      userInfo: {
        ...defaultUserInfo(),
        ...(cache?.userInfo || {})
      } as UserInfo,
      // 登录后跳转地址：不建议持久化，只存在内存里
      redirectAfterLogin: '' as string
    }
  },

  getters: {
    token: (state) => state.userInfo?.token || '',

    // 新字段优先
    nickName: (state) => state.userInfo?.nickName || state.userInfo?.nickname || state.userInfo?.userName || '',
    phone: (state) => state.userInfo?.phone || state.userInfo?.phonenumber || '',
    email: (state) => state.userInfo?.email || '',
    sex: (state) => state.userInfo?.sex || '',
    refId: (state) => state.userInfo?.refId || '',

    // 兼容旧代码
    userName: (state) => state.userInfo?.nickName || state.userInfo?.nickname || state.userInfo?.userName || '',
    userPhone: (state) => state.userInfo?.phone || state.userInfo?.phonenumber || '',
    nickname: (state) => state.userInfo?.nickName || state.userInfo?.nickname || state.userInfo?.userName || '',

    isLoggedIn: (state) => state.isLogin
  },

  actions: {
    login(payload: { role: Role; userInfo: UserInfo }) {
      this.role = payload.role
      this.userInfo = {
        ...defaultUserInfo(),
        ...(payload.userInfo || {})
      }
      this.isLogin = true

      saveCache({
        isLogin: this.isLogin,
        role: this.role,
        userInfo: this.userInfo
      })
    },

    /**
     * 更新用户信息
     * 兼容旧字段：
     * nickname / userName -> nickName
     * phonenumber -> phone
     */
    updateUserInfo(payload: Partial<UserInfo> & Record<string, any>) {
      const current = this.userInfo || {}

      this.userInfo = {
        ...current,
        id: payload.id ?? current.id ?? '',
        token: payload.token ?? current.token ?? '',
        avatar: payload.avatar ?? current.avatar ?? '',

        nickName:
          payload.nickName ??
          payload.nickname ??
          payload.userName ??
          current.nickName ??
          current.nickname ??
          current.userName ??
          '',

        phone: payload.phone ?? payload.phonenumber ?? current.phone ?? current.phonenumber ?? '',
        email: payload.email ?? current.email ?? '',
        sex: payload.sex ?? current.sex ?? '',
        refId: payload.refId ?? current.refId ?? ''
      }

      saveCache({
        isLogin: this.isLogin,
        role: this.role,
        userInfo: this.userInfo
      })
    },

    /**
     * 兼容旧命名
     */
    setUserInfo(payload: Partial<UserInfo> & Record<string, any>) {
      this.updateUserInfo(payload)
    },

    logout() {
      this.isLogin = false
      this.role = ''
      this.userInfo = defaultUserInfo()
      this.redirectAfterLogin = ''
      try {
        uni.removeStorageSync(USER_KEY)
      } catch { }
    },

    hydrate() {
      const cache: any = loadCache()
      this.isLogin = !!cache?.isLogin
      this.role = (cache?.role || '') as Role
      this.userInfo = {
        ...defaultUserInfo(),
        ...(cache?.userInfo || {})
      }
    },

    setRedirectAfterLogin(url: string) {
      this.redirectAfterLogin = url
    },

    clearRedirectAfterLogin() {
      this.redirectAfterLogin = ''
    }
  }
})