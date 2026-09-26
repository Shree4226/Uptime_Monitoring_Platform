import { Link } from "react-router-dom"

function Register() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Create your account</h1>
        <p className="auth-subtitle">
          Start monitoring your websites and APIs.
        </p>

        <form>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Choose a username"
            />
          </div>

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
              placeholder="At least 8 characters"
            />
          </div>

          <button type="submit">Create account</button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  )
}

export default Register