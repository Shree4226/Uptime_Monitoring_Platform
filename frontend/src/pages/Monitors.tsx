import axios from "axios"
import { useEffect, useState } from "react"
import { getMonitors, type Monitor } from "../services/monitors"

function Monitors() {
  const [monitors, setMonitors] = useState<Monitor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    getMonitors()
      .then((data) => {
        setMonitors(data)
      })
      .catch((error: unknown) => {
        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.detail ||
              "Unable to load monitors.",
          )
        } else {
          setError("Unable to load monitors.")
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <main className="dashboard-page">
        <h1>Monitors</h1>
        <p>Loading monitors...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <h1>Monitors</h1>
        <p className="form-error">{error}</p>
      </main>
    )
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <h1>Monitors</h1>
        <p>Manage the websites and APIs you want to monitor.</p>
      </header>

      {monitors.length === 0 ? (
        <section className="dashboard-card">
          <h2>No monitors yet</h2>
          <p>Create your first monitor to start tracking a service.</p>
        </section>
      ) : (
        <section className="monitor-list">
          {monitors.map((monitor) => (
            <article className="monitor-card" key={monitor.id}>
              <div>
                <h2>{monitor.name}</h2>
                <p className="monitor-url">{monitor.url}</p>
              </div>

              <div className="monitor-info">
                <span>
                  {monitor.is_active ? "Active" : "Paused"}
                </span>

                <span>
                  Every {monitor.interval_seconds}s
                </span>

                <span>
                  Expected {monitor.expected_status}
                </span>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

export default Monitors