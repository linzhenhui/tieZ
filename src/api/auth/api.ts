import { http } from '@/request/http'
import type { BaseResult } from '@/api/common/type'
import type { UpdateUserInfoParams, LoginData, WxLoginParams, WxLoginData } from './type'

/** 账号密码登录 */
export function fleetLoginApi(data: { username: string; password: string }) {
  return http<string>({
    url: '/wechat/login',
    method: 'POST',
    data
  })
}

/** 微信登录 */
export const shipperWxLoginApi = (params: { code: string }) => {
  return http<string>({
    url: '/wechat/auth/login',
    method: 'GET',
    data: params
  })
}

/** 退出登录 */
export const logoutApi = () => {
  return http<BaseResult<null>>({
    url: '/api/pri/auth/logout',
    method: 'POST'
  })
}
 
/** 获取用户信息 */
export const getUserInfoApi = () => {
  return http({
    url: '/system/userInfo',
    method: 'POST'
  })
}

/** 更新用户信息 */
export const updateUserInfoApi = (data: UpdateUserInfoParams) => {
  return http({
    url: '/system/userInfo/update',
    method: 'POST',
    data
  })
}

/** 获取客商列表 */
export const queryMerchantListApi = (data: any = {}) => {
  return http({
    url: '/api/meb/queryList',
    method: 'POST',
    data
  })
}

/** 获取企微用户信息 */
export const loginByWeComCodeApi = (data: any = {}) => {
  return http({
    url: '/wechat/qw/login',
    method: 'GET',
    data
  })
}