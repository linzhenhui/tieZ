export interface LoginParams {
  username: string
  password: string
}

export interface LoginData {
  token: string
  refreshToken?: string
  userId: number
  nickname: string
  phone?: string
  avatar?: string
  role: 'shipper' | 'fleet' | string
}

export interface WxLoginParams {
  code: string
  encryptedData?: string
  iv?: string
}

export interface WxLoginData {
  token: string
  nickname: string
  phone?: string
  avatar?: string
  role: 'shipper' | 'fleet' | string
}
export interface UpdateUserInfoParams {
  avatar?: string
  userName?: string
  realName?: string
  phonenumber?: string
}