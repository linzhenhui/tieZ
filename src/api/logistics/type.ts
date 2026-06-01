export interface LogisticsQueryParams {
  status?: string
  parmas?: {
    pageSize: number
    pageNum: number
  }
}

export interface LogisticsItem {
  id: number | string
  pickUpPlace?: string
  loadingPlace?: string
  destination?: string
  contType?: string
  cont?: string
  contNum?: number
  weight?: number
  planLoadingTime?: string
  detail?: string
  notice?: string
  isFlag?: string | null
  code?: string | null
  type?: string | null
  customerId?: number | null
  supplierId?: number | null
  costPrice?: number | null
  price?: number | null
  currency?: string | null
  userName?: string | null
  status?: string | null
  inquiryTime?: string | null
  quoteTime?: string | null
  buildTime?: string | null
  customerName?: string | null
  supplierName?: string | null
  inquiryRemark?: string | null
  truckRemark?: string | null
  supplierIdList?: any
}

export interface DispatchingParams {
  id: string | number
  driver: string
  phone: string
  idCard: string
  carNo: string
  carRegistration: string
}
export interface PickupBoxParams {
  id: string
  cont: string
  contTitle: string
  pickUpTime: string
  contBottomImg: string
  namePlateImg: string
  pickUpEmptyImg: string
  pickUpOpenEmptyImg: string
  pickUpOtherImg?: string
}