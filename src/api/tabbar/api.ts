import { http } from '@/request/http'
import type { BaseResult } from '@/api/common/type'
import type { TabbarItem } from './type'

/** 获取底部菜单配置 */
export const getTabbarConfigApi = (role?: string) => {
  return http<BaseResult<TabbarItem[]>>({
    url: '/api/noToken/tabbar/config',
    method: 'GET',
    data: { role }
  })
}