export interface BaseResult<T = any> {
  code: number
  message: string
  data: T
}

export interface PageQuery {
  pageNum: number
  pageSize: number
}

export interface PageResult<T = any> {
  records: T[]
  total: number
  pageNum: number
  pageSize: number
}