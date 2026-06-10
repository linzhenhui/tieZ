import { http } from '@/request/http'
import type { BaseResult } from '@/api/common/type'
import type { LogisticsItem, PickupBoxParams, DispatchingParams } from './type'
import { request } from '@/utils/request'
export interface LogisticsQueryListParams {
  status: string
  parmas: {
    pageSize: number
    pageNum: number
  }
}

/** 我的物流单列表 */
export const queryMyLogisticsListApi = (data: LogisticsQueryListParams) => {
  return http<BaseResult<{ total: number; rows: LogisticsItem[] }>>({
    url: '/api/pri/logisticsTruck/myLogisticsTruck/queryList',
    method: 'POST',
    data
  })
}

/** 车队物流单列表 */
export const queryFleetLogisticsListApi = (data: LogisticsQueryListParams) => {
  return http<BaseResult<{ total: number; rows: LogisticsItem[] }>>({
    url: '/api/pri/logisticsTruck/truckLogisticsTruck/queryList',
    method: 'POST',
    data
  })
}

/** 企微物流单列表 */
export const querygmFleetLogisticsListApi = (data: LogisticsQueryListParams) => {
  return http<BaseResult<{ total: number; rows: LogisticsItem[] }>>({
    url: '/api/pri/logisticsTruck/gm/myLogisticsTruck/queryList',
    method: 'POST',
    data
  })
}

/** 我的物流单详情 */
export const getMyLogisticsDetailApi = (id: string | number) => {
  return http<BaseResult<LogisticsItem>>({
    url: '/api/pri/logisticsTruck/myLogisticsTruck/detail',
    method: 'GET',
    data: { id }
  })
}

/** 车队物流单详情 */
export const getFleetLogisticsDetailApi = (id: string | number) => {
  return http<BaseResult<LogisticsItem>>({
    url: '/api/pri/logisticsTruck/truckLogisticsTruck/detail',
    method: 'GET',
    data: { id }
  })
}

/** 车队取消物流单 */
export const cancelFleetLogisticsApi = (id: string | number) => {
  return http<BaseResult<null>>({
    url: '/api/pri/logisticsTruck/truckLogisticsTruck/cancel',
    method: 'GET',
    data: { id }
  })
}

/**
 * 物流单调度
 */
export const dispatchingLogisticsTruckApi = (data: DispatchingParams) => {
  return http({
    url: '/api/pri/logisticsTruck/truckLogisticsTruck/dispatching',
    method: 'POST',
    data
  })
}

/**
 * 物流单提箱
 */
export const pickupBoxApi = (data: PickupBoxParams) => {
  return http({
    url: '/api/pri/logisticsTruck/truckLogisticsTruck/pickup',
    method: 'POST',
    data
  })
}
export interface SubmitPickupGoodsParams {
  id: string
  loadingTime: string
  loadingOpenEmptyImg: string
  quarterImg: string
  halfImg: string
  loadingOtherImg?: string
}

/**
 * 物流单提货
 */
export const submitPickupGoodsApi = (data: SubmitPickupGoodsParams) => {
  return request({
    url: '/api/pri/logisticsTruck/truckLogisticsTruck/loading',
    method: 'POST',
    data
  })
}

export interface ArriveFeeItem {
  feeType: string
  feeAmount: string
  feeRemark: string
}

export interface SubmitArriveParams {
  id: string
  arriveTime: string
  arriveImg: string
  arriveOtherImg?: string
  extraFeeList?: any[]
}

/**
 * 物流单落重
 */
export const submitArriveApi = (data: SubmitArriveParams) => {
  return request({
    url: '/api/pri/logisticsTruck/truckLogisticsTruck/arrive',
    method: 'POST',
    data
  })
}

/**
 * 获取费用列表
 */
export const getFeeItemApi = () => {
  return request({
    url: '/api/bsd/getFeeItem',
    method: 'GET',
  })
}