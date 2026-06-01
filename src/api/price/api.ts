import { http } from '@/request/http'
import type { BaseResult } from '@/api/common/type'
import type { PriceItem, PriceQueryParams } from './type'

/** 报价列表 */
export const queryPriceListApi = (data?: PriceQueryParams) => {
  return http<BaseResult<PriceItem[]>>({
    url: '/api/pri/price/list',
    method: 'POST',
    data
  })
}

/** 报价详情 */
export const getPriceDetailApi = (id: string | number) => {
  return http<BaseResult<PriceItem>>({
    url: `/api/pri/price/${id}`,
    method: 'GET'
  })
}