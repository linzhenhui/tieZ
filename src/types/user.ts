import { Role } from '@/api'

export interface LoginDto {
  username: string
  password: string
}

export interface LoginUser {
  token: string
  nickname: string
  role: Role
}