export interface RegionItem {
  id: number
  name: string
  mername: string
}

export interface AddressQueryParams {
  mername: string
}

export interface TruckQueryParams {
  pickUpPlace: string
  loadingPlace: string
  destination: string
}

export interface TruckQuoteItem {
  id: number
  supplierId: number
  nameEn: string
  nameCn: string
  pickUpPlace: string
  loadingPlace: string
  destination: string
  costPrice: number
  price: number
  currency: string
  startDate: string
  endDate: string
  contType: string
  status: string
  pickUpPlaceName: string
  pickUpPlaceMerName: string
  loadingPlaceName: string
  loadingPlaceMerName: string
  destinationName: string
  destinationMerName: string
}

export interface TruckOrderParams {
  id: string | number
}

export interface DictItem {
  dictLabel: string
  dictValue: string
  [key: string]: any
}

export interface ManualInquiryParams {
  id?: string | number | ''
  pickUpPlace: string
  loadingPlace: string
  destination: string
  contType: string
  contNum: string | number
  weight: string | number
  cont: string
  detail: string
  pickUpTime: string
  notice: string
}

export interface InquiryListQueryParams {
  status?: string
  params: {
    pageNum: number
    pageSize: number
  }
}

export interface InquiryItem {
  id: number
  status: string
  pickUpPlace: string
  loadingPlace: string
  destination: string
  [key: string]: any
}
export type InquiryStatus =
  | 'inquiring'
  | 'quoted'
  | 'confirmed'
  | 'cancelled'

export interface InquiryFormData {
  id?: string
  orderNo?: string
  imageText?: string
  boxPlace1: string
  boxPlace2: string
  loadingPlace: string
  destination: string
  containerType: string
  containerCount: number | string
  pickupTime: string
  weight: string
  goodsName: string
  remark: string
}

export interface InquiryOrder extends InquiryFormData {
  id: string
  orderNo: string
  createdAt: string
  status: InquiryStatus
  quotedPrice?: number
  fromCity: string
  toCity: string
  boxPlace: string
}