import { useEffect, useState, type ReactNode } from "react"
import api from "../services/api"
import { AuthContext, type User } from "./authContext"

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("access_token")

      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await api.get<User>("/auth/me")
        setUser(response.data)
      } catch {
        localStorage.removeItem("access_token")
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}