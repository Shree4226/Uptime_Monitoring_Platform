import { useEffect, useState, type ReactNode } from "react"
import api from "../services/api"
import { AuthContext, type User } from "./authContext"

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(() => {
    return Boolean(localStorage.getItem("access_token"))
  })

  const login = async (token: string) => {
    localStorage.setItem("access_token", token)

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

  useEffect(() => {
    const token = localStorage.getItem("access_token")

    if (!token) {
      return
    }

    api.get<User>("/auth/me")
      .then((response) => {
        setUser(response.data)
      })
      .catch(() => {
        localStorage.removeItem("access_token")
        setUser(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}