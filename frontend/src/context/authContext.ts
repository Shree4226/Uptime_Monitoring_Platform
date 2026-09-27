import { createContext } from "react"

export type User = {
  id: number
  email: string
  username: string
  created_at: string
}

export type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
)