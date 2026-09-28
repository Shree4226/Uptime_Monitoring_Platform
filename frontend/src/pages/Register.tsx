import axios from "axios"
import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../services/api"

function Register() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setError("")
    setIsLoading(true)

    try {
      await api.post("/auth/register", {
        username,
        email,
        password,
      })

      navigate("/login")
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.detail ||
            "Unable to create account. Please try again.",
        )
      } else {
        setError("Unable to create account. Please try again.")
      }
    } finally {
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
                Keep every
                <span>service online.</span>
              </h1>

              <p className="hero-copy">
                Spot outages, track performance, and respond faster with
                real-time observability across your monitoring stack.
              </p>

              <div className="hero-metrics">
                <div className="metric-card">
                  <strong>18K</strong>
                  <span>Checks/min</span>
                </div>

                <div className="metric-card">
                  <strong>0.4s</strong>
                  <span>Mean response</span>
                </div>

                <div className="metric-card">
                  <strong>99.9%</strong>
                  <span>Target SLA</span>
                </div>
              </div>
            </div>

            <div className="status-strip" aria-label="Service statuses">
              <span className="status-pill">
                <span className="status-dot" aria-hidden="true" />
                Uptime coverage active
              </span>
              <span className="status-pill">
                <span className="status-dot" aria-hidden="true" />
                Alert routing ready
              </span>
            </div>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-card">
            <h1>Create your account</h1>

            <p className="auth-subtitle">
              Start monitoring your websites and APIs.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Choose a username"
                  minLength={3}
                  maxLength={100}
                  required
                />
              </div>

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
                  placeholder="At least 8 characters"
                  minLength={8}
                  maxLength={128}
                  required
                />
              </div>

              {error && <p className="form-error">{error}</p>}

              <button type="submit" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="auth-footer">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Register