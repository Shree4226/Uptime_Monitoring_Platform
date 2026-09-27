import axios from "axios"
import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import api from "../services/api"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      })

      await login(response.data.access_token)
      navigate("/dashboard")
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
       setError(error.response?.data?.detail || "Unable to sign in. Please try again.")
      } else {
        setError("Unable to sign in. Please try again.")
      }
      }finally {
        setIsLoading(false)
      }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Welcome back</h1>

        <p className="auth-subtitle">
          Sign in to monitor your websites and APIs.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </section>
    </main>
  )
}

export default Login