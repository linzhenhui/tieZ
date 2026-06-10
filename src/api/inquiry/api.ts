import { http } from '@/request/http'
import type { BaseResult } from '@/api/common/type'
import type {
  AddressQueryParams,
  RegionItem,
  TruckQueryParams,
  TruckQuoteItem,
  TruckOrderParams,
  ManualInquiryParams,
  InquiryListQueryParams,
  InquiryItem,
  DictItem
} from './type'

/** 地址联想查询 */
export const searchAddressApi = (params: AddressQueryParams) => {
  return http<BaseResult<RegionItem[]>>({
    url: '/api/pri/inquiryTruck/region',
    method: 'POST',
    data: params
  })
}

/** 查询报价 */
export const queryTruckApi = (params: TruckQueryParams) => {
  return http<BaseResult<TruckQuoteItem[]>>({
    url: '/api/pri/inquiryTruck/query',
    method: 'POST',
    data: params
  })
}

/** 选择报价下单 */
export const orderTruckApi = (params: TruckOrderParams) => {
  return http<BaseResult<null>>({
    url: '/api/pri/inquiryTruck/order',
    method: 'POST',
    data: params
  })
}

/** 获取字典 */
export const getDictDataApi = (dictType: string) => {
  return http<BaseResult<DictItem[]>>({
    url: `/api/common/noToken/dictData/${dictType}`,
    method: 'GET'
  })
}

/** 人工询价 */
export const addManualInquiryApi = (params: ManualInquiryParams) => {
  return http<BaseResult<null>>({
    url: '/api/pri/inquiryTruck/add',
    method: 'POST',
    data: params
  })
}

/** 我的询价列表 */
export const queryInquiryListApi = (data: InquiryListQueryParams) => {
  return http<BaseResult<InquiryItem[]>>({
    url: '/api/pri/inquiryTruck/myInquiryTruck/queryList',
    method: 'POST',
    data
  })
}
/** 询价单详情页 */
export const detailInquiryTruckApi = (id: string | number) => {
  return http<BaseResult<null>>({
    url: '/api/pri/inquiryTruck/myInquiryTruck/detail',
    method: 'GET',
    data: { id }
  })
}
/** 企微询价单详情页 */
export const createOrderApi = (id: string | number) => {
  return http<BaseResult<null>>({
    url: '/api/pri/inquiryTruck/createOrder/'+id,
    method: 'GET',
  })
}

/** 建单 */
export const postCreateOrderApi = (data: any) => {
  return http<BaseResult<null>>({
    url: '/api/pri/inquiryTruck/createOrder',
    method: 'POST',
    data
  })
}
/** 修改询价单 */
export const editInquiryTruckApi = (data: any) => {
  return http<BaseResult<null>>({
    url: '/api/pri/inquiryTruck/myInquiryTruck/edit',
    method: 'POST',
    data
  })
}

/** 确认询价单 */
export const confirmInquiryTruckApi = (id: string | number) => {
  return http<BaseResult<null>>({
    url: '/api/pri/inquiryTruck/myInquiryTruck/confirm',
    method: 'GET',
    data: { id }
  })
}

/** 询价单取消 */
export const cancelInquiryTruckApi = (id: string | number) => {
  return http<BaseResult<null>>({
    url: '/api/pri/inquiryTruck/myInquiryTruck/cancel',
    method: 'GET',
    data: { id }
  })
}

// 车队询价单列表
export const queryTruckInquiryListApi = (data: any) => {
  return http({
    url: '/api/pri/inquiryTruck/truckInquiryTruck/queryList',
    method: 'POST',
    data
  })
}

// 企微询价单列表
export const querygmTruckInquiryListApi = (data: any) => {
  return http({
    url: '/api/pri/inquiryTruck/gm/myInquiryTruck/queryList',
    method: 'POST',
    data
  })
}

// 车队报价
export const truckInquiryQuoteApi = (data: {
  id: string | number
  price: string | number
  remark?: string
}) => {
  return http({
    url: '/api/pri/inquiryTruck/truckInquiryTruck/edit',
    method: 'POST',
    data
  })
}

// 取消询价单
export const cancelTruckInquiryApi = (id: string | number) => {
  return http({
    url: '/api/pri/inquiryTruck/truckInquiryTruck/cancel',
    method: 'GET',
    data: { id }
  })
}

export const queryListApi = () => {
  return http({
    url: '/api/meb/queryTruckList',
    method: 'GET',
  })
}
//询价结果
export const inquiryTruckQuoteApi = (id: string | number) => {
  return http({
    url: '/api/pri/inquiryTruck/inquiryTruckQuote/' + id,
    method: 'GET',
  })
}
/**
企微报价
 入参{
 inquiryId：询价单id
 truckId：车队id
 priceQuote：报价
 costPrice：车队价格
 remark：备注
 }
 */
export const inquiryQuoteApi = (data: {
  inquiryId: string | number
  truckId: string | number
  priceQuote: string
  costPrice: string
  remark?: string
}) => {
  return http({
    url: '/api/pri/inquiryTruck/inquiryQuote',
    method: 'POST',
    data
  })
}

/**
 * 询价
 * 入参{
id：询价单id
supplierIdList[]：车队id集合
truckRemark：备注
}
 */
export const inquiryApi = (data: {
  id: string | number
  supplierIdList: Array<any>
  truckRemark?: string
}) => {
  return http({
    url: '/api/pri/inquiryTruck/inquiry',
    method: 'POST',
    data
  })
}