import { http } from '@/request/http'
import type { BaseResult } from '@/api/common/type'
import type { HomeBannerItem, HomeStatItem } from './type'

/** 首页 banner */
export const getHomeBannerApi = () => {
  return http<BaseResult<HomeBannerItem[]>>({
    url: '/api/noToken/home/banner',
    method: 'GET'
  })
}

/** 首页统计 */
export const getHomeStatsApi = () => {
  return http<BaseResult<HomeStatItem[]>>({
    url: '/api/pri/home/stats',
    method: 'GET'
  })
}