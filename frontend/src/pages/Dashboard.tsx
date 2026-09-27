import { useEffect, useState } from "react"
import axios from "axios"
import {
  getDashboardSummary,
  type DashboardSummary,
} from "../services/dashboard"

function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getDashboardSummary()
      .then((data) => {
        setSummary(data)
      })
      .catch((error: unknown) => {
        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.detail ||
              "Unable to load dashboard data.",
          )
        } else {
          setError("Unable to load dashboard data.")
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <main className="dashboard-page">
        <h1>Dashboard</h1>
        <p>Loading dashboard...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <h1>Dashboard</h1>
        <p className="form-error">{error}</p>
      </main>
    )
  }

  if (!summary) {
    return null
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Monitor the health and performance of your services.</p>
      </header>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <h2>Total Monitors</h2>
          <p>{summary.total_monitors}</p>
        </article>

        <article className="dashboard-card">
          <h2>Up</h2>
          <p>{summary.up_monitors}</p>
        </article>

        <article className="dashboard-card">
          <h2>Down</h2>
          <p>{summary.down_monitors}</p>
        </article>

        <article className="dashboard-card">
          <h2>Active</h2>
          <p>{summary.active_monitors}</p>
        </article>

        <article className="dashboard-card">
          <h2>Paused</h2>
          <p>{summary.paused_monitors}</p>
        </article>

        <article className="dashboard-card">
          <h2>Active Incidents</h2>
          <p>{summary.active_incidents}</p>
        </article>

        <article className="dashboard-card">
          <h2>Overall Uptime</h2>
          <p>{summary.overall_uptime_percentage.toFixed(2)}%</p>
        </article>

        <article className="dashboard-card">
          <h2>Average Response Time</h2>
          <p>
            {summary.average_response_time_ms !== null
              ? `${summary.average_response_time_ms.toFixed(0)} ms`
              : "N/A"}
          </p>
        </article>
      </section>
    </main>
  )
}

export default Dashboard