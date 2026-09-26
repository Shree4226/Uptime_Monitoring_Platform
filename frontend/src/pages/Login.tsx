import { Link } from "react-router-dom"

function Login() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Welcome back</h1>
        <p className="auth-subtitle">
          Sign in to monitor your websites and APIs.
        </p>

        <form>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit">Sign in</button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </section>
    </main>
  )
}

export default Login