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