export interface PriceItem {
  id: number
  name: string
  price: number
  currency?: string
  status?: string
  [key: string]: any
}

export interface PriceQueryParams {
  [key: string]: any
}
export interface PriceQuoteItem {
  id: string
  fromCity: string
  toCity: string
  boxPlace: string
  remark: string
  price: number
}