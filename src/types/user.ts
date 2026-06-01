export type UserRole = '' | 'shipper' | 'fleet'

export interface LoginDto {
  username: string
  password: string
}

export interface LoginUser {
  token: string
  nickname: string
  role: UserRole
}