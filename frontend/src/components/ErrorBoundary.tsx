import { Component, type ErrorInfo, type ReactNode } from "react"
import { Link } from "react-router-dom"

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled application error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="dashboard-page">
          <header className="dashboard-header">
            <div>
              <h1>Something went wrong</h1>
              <p>
                We couldn’t load this section. Please try again or return to
                the dashboard.
              </p>
            </div>
          </header>

          <section className="dashboard-card">
            <p className="empty-state">
              The monitor details view failed to render. This is usually caused
              by a missing or malformed monitor response.
            </p>

            <div className="pagination-controls">
              <Link to="/dashboard" className="nav-link active">
                Return to dashboard
              </Link>
            </div>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
