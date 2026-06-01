type Role = 'shipper' | 'fleet'

type LoginResult = {
  token: string
  role: Role
  nickname: string
  phone: string
  avatar?: string
}