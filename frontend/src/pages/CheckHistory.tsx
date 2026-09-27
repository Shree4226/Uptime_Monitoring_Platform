import axios from "axios"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  getMonitor,
  getMonitorChecks,
  type Check,
  type Monitor,
} from "../services/monitors"

function CheckHistory() {
  const { monitorId } = useParams()

  const [monitor, setMonitor] = useState<Monitor | null>(null)
  const [checks, setChecks] = useState<Check[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const PAGE_SIZE = 20

  useEffect(() => {
    if (!monitorId) return

    const fetchCheckHistory = async () => {
      try {
        const [monitorData, checksData] = await Promise.all([
          getMonitor(Number(monitorId)),
          getMonitorChecks(
            Number(monitorId),
            currentPage,
            PAGE_SIZE,
            )
        ])

        setMonitor(monitorData)
        setChecks(checksData)
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.detail ||
              "Unable to load check history.",
          )
        } else {
          setError("Unable to load check history.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchCheckHistory()
  }, [monitorId, currentPage])

  if (isLoading) {
    return (
      <main className="dashboard-page">
        <h1>Check History</h1>
        <p>Loading check history...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <h1>Check History</h1>
        <p className="form-error">{error}</p>
      </main>
    )
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <h1>Check History</h1>
        {monitor && <p>{monitor.name}</p>}
      </header>

      <section className="dashboard-card">
        <h2>All Checks</h2>

        {checks.length === 0 ? (
          <p>No checks have been recorded yet.</p>
        ) : (
          <div className="check-table-wrapper">
            <table className="check-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Response Time</th>
                  <th>Result</th>
                </tr>
              </thead>

              <tbody>
                {checks.map((check) => (
                  <tr key={check.id}>
                    <td>
                      {new Date(check.created_at).toLocaleString()}
                    </td>

                    <td>{check.status_code ?? "—"}</td>

                    <td>
                      {check.response_time_ms !== null
                        ? `${check.response_time_ms} ms`
                        : "—"}
                    </td>

                    <td>
                      <span
                        className={`check-result ${
                          check.is_success ? "success" : "failed"
                        }`}
                      >
                        <span className="check-result-dot" />
                        {check.is_success ? "Success" : "Failed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="pagination-controls">
        <button
            type="button"
            onClick={() =>
            setCurrentPage((page) => Math.max(1, page - 1))
            }
            disabled={currentPage === 1}
        >
            Previous
        </button>

        <span>Page {currentPage}</span>

        <button
            type="button"
            onClick={() => setCurrentPage((page) => page + 1)}
            disabled={checks.length < PAGE_SIZE}
        >
            Next
        </button>
        </div>
    </main>
  )
}

export default CheckHistory