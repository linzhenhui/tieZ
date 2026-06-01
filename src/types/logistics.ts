export type LogisticsStatus =
  | 'confirming'
  | 'dispatching'
  | 'picking'
  | 'finished'

export interface DispatchInfo {
  driverName: string
  phone: string
  idCard: string
  truckNo: string
  trailerNo: string
}

export interface PickupBoxInfo {
  containerNo: string
  sealNo: string
  pickupBoxDate: string
  photos: string[]
}

export interface PickupGoodsInfo {
  pickupGoodsDate: string
  photos: string[]
}

export interface ExtraFeeItem {
  feeType: string
  price: number
  count: number
  amount: number
  remark?: string
}

export interface WeighInInfo {
  stationDate: string
  photos: string[]
  extraFeeType?: string
  extraFeeAmount?: string
  extraFeeRemark?: string
}

export interface LogisticsOrder {
  id: string
  orderNo: string
  createdAt: string
  status: LogisticsStatus
  fromCity: string
  toCity: string
  boxPlace: string
  containerInfo: string
  goodsName: string
  pickupTime: string
  weight: string
  freight: number
  dispatchInfo?: DispatchInfo
  pickupBoxInfo?: PickupBoxInfo
  pickupGoodsInfo?: PickupGoodsInfo
  weighInInfo?: WeighInInfo
  extraFees?: ExtraFeeItem[]
}