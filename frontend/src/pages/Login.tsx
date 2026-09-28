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
      <div className="auth-shell">
        <section className="auth-visual" aria-label="Platform overview">
          <div className="auth-visual-inner">
            <div>
              <div className="brand-badge">
                <span className="brand-mark" aria-hidden="true" />
                Uptime Monitoring Platform
              </div>

              <h1 className="hero-title">
                Monitor.
                <span>Detect.</span>
                Respond.
              </h1>

              <p className="hero-copy">
                Know when your services go down before your users do.
                Track uptime, incidents, and response times from a single
                operational dashboard.
              </p>

              <div className="hero-metrics">
                <div className="metric-card">
                  <strong>99.96%</strong>
                  <span>Global uptime</span>
                </div>

                <div className="metric-card">
                  <strong>24/7</strong>
                  <span>Monitoring</span>
                </div>

                <div className="metric-card">
                  <strong>&lt; 2s</strong>
                  <span>Incident alerts</span>
                </div>
              </div>
            </div>

            <div className="status-strip" aria-label="Service statuses">
              <span className="status-pill">
                <span className="status-dot" aria-hidden="true" />
                API status healthy
              </span>
              <span className="status-pill">
                <span className="status-dot" aria-hidden="true" />
                Web checks active
              </span>
            </div>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-card">
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
          </div>
        </section>
      </div>
    </main>
  )
}

export default Login