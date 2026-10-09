// Global shared types for zvalley-dashboard

export interface UserInfo {
  username: string
  roles: string[]
  avatar?: string
}

export interface LoginPayload {
  username: string
  password: string
  remember?: boolean
}

export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

export interface Statistics {
  users: number
  orders: number
  revenue: number
  visits: number
}
