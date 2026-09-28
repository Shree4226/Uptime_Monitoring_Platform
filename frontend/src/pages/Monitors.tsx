import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import { getMonitors,updateMonitorStatus, deleteMonitor, type Monitor } from "../services/monitors"
import CreateMonitorForm from "../components/monitors/CreateMonitorForm"
import Toast from "../components/common/Toast"
import { Link } from "react-router-dom"

type SortOption =
  | "updated_desc"
  | "created_desc"
  | "name_asc"
  | "name_desc"
  | "active_first"
  | "paused_first"

function Monitors() {
  const [monitors, setMonitors] = useState<Monitor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [sortOption, setSortOption] =
    useState<SortOption>("updated_desc")

  useEffect(() => {
    let cancelled = false

    const fetchMonitors = async () => {
      try {
        const data = await getMonitors()

        if (!cancelled) {
          setMonitors(data)
        }
      } catch (error: unknown) {
        if (!cancelled) {
          if (axios.isAxiosError(error)) {
            setError(
              error.response?.data?.detail ||
                "Unable to load monitors.",
            )
          } else {
            setError("Unable to load monitors.")
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchMonitors()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
  if (!toastMessage) {
    return
  }

  const timer = setTimeout(() => {
    setToastMessage("")
  }, 3000)

  return () => {
    clearTimeout(timer)
  }
}, [toastMessage])

  const handleStatusChange = async (monitor: Monitor) => {
  const newStatus = !monitor.is_active

  try {
    await updateMonitorStatus(monitor.id, newStatus)

    setMonitors((currentMonitors) =>
      currentMonitors.map((currentMonitor) =>
        currentMonitor.id === monitor.id
          ? {
              ...currentMonitor,
              is_active: newStatus,
              updated_at: new Date().toISOString(),
            }
          : currentMonitor,
      ),
    )

    setToastMessage(
      newStatus
        ? "Monitor activated successfully."
        : "Monitor paused successfully.",
    )
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      setError(
        error.response?.data?.detail ||
          "Unable to update monitor status.",
      )
    } else {
      setError("Unable to update monitor status.")
    }
  }
}

  const sortedMonitors = useMemo(() => {
    const sorted = [...monitors]

    switch (sortOption) {
        case "created_desc":
        return sorted.sort(
            (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        )

        case "name_asc":
        return sorted.sort((a, b) =>
            a.name.localeCompare(b.name),
        )

        case "name_desc":
        return sorted.sort((a, b) =>
            b.name.localeCompare(a.name),
        )

        case "active_first":
        return sorted.sort(
            (a, b) => Number(b.is_active) - Number(a.is_active),
        )

        case "paused_first":
        return sorted.sort(
            (a, b) => Number(a.is_active) - Number(b.is_active),
        )

        case "updated_desc":
        default:
        return sorted.sort(
            (a, b) =>
            new Date(b.updated_at).getTime() -
            new Date(a.updated_at).getTime(),
        )
    }
    }, [monitors, sortOption])

  const handleMonitorCreated = async () => {
    setShowCreateForm(false)

    try {
      const data = await getMonitors()
      setMonitors(data)
      setToastMessage("Monitor created successfully.")
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.detail ||
            "Unable to refresh monitors.",
        )
      } else {
        setError("Unable to refresh monitors.")
      }
    }
  }

  const handleDelete = async (monitor: Monitor) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${monitor.name}"?`,
  )

  if (!confirmed) {
    return
  }

  try {
    await deleteMonitor(monitor.id)

    setMonitors((currentMonitors) =>
      currentMonitors.filter(
        (currentMonitor) => currentMonitor.id !== monitor.id,
      ),
    )

    setToastMessage("Monitor deleted successfully.")
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      setError(
        error.response?.data?.detail ||
          "Unable to delete monitor. Please try again.",
      )
    } else {
      setError("Unable to delete monitor. Please try again.")
    }
  }
}

  if (isLoading) {
    return (
      <main className="dashboard-page">
        <h1>Monitors</h1>
        <p>Loading monitors...</p>
      </main>
    )
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header monitor-page-header">
        <div>
          <h1>Monitors</h1>
          <p>Manage the websites and APIs you want to monitor.</p>
        </div>

        {!showCreateForm && (
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
          >
            Create Monitor
          </button>
        )}
      </header>

      {showCreateForm && (
        <CreateMonitorForm
          onCreated={handleMonitorCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {error && <p className="form-error">{error}</p>}

      {!showCreateForm && monitors.length > 0 && (
        <div className="monitor-toolbar">
          <label htmlFor="monitor-sort">Sort by</label>

          <select
            id="monitor-sort"
            value={sortOption}
            onChange={(event) =>
              setSortOption(event.target.value as SortOption)
            }
          >
            <option value="updated_desc">
              Recently updated
            </option>
            <option value="created_desc">
              Recently created
            </option>
            <option value="name_asc">
              Name: A → Z
            </option>
            <option value="name_desc">
              Name: Z → A
            </option>
            <option value="active_first">Active first</option>
            <option value="paused_first">Paused first</option>
          </select>
        </div>
      )}

      {!showCreateForm && monitors.length === 0 ? (
        <section className="dashboard-card">
          <h2>No monitors yet</h2>
          <p>Create your first monitor to start tracking a service.</p>
        </section>
      ) : (
        !showCreateForm && (
          <section className="monitor-list">
            {sortedMonitors.map((monitor) => (
            <article className="monitor-card" key={monitor.id}>
                <Link className="monitor-content" to={`/monitors/${monitor.id}`}>
                    <div>
                        <h2>{monitor.name}</h2>
                        <p className="monitor-url">{monitor.url}</p>
                    </div>

                    <div className="monitor-info">
                  <span className={`monitor-state ${monitor.is_active ? "active" : "paused"}`}>
                  <span className="status-dot" aria-hidden="true" />
                  {monitor.is_active ? "Active" : "Paused"}
                        </span>

                        <span>
                        Every {monitor.interval_seconds}s
                        </span>

                        <span>
                        Expected {monitor.expected_status}
                        </span>
                    </div>
                    </Link>

                <div className="monitor-actions">
                <button
                    type="button"
                    className={
                    monitor.is_active
                        ? "monitor-status-toggle active"
                        : "monitor-status-toggle paused"
                    }
                    onClick={() => handleStatusChange(monitor)}
                    aria-label={
                    monitor.is_active
                        ? `Pause ${monitor.name}`
                        : `Activate ${monitor.name}`
                    }
                >
                    {monitor.is_active ? "ON" : "OFF"}
                </button>

                <button
                    type="button"
                    className="monitor-delete-button"
                    onClick={() => handleDelete(monitor)}
                    aria-label={`Delete ${monitor.name}`}
                >
                    Delete
                </button>
                </div>
            </article>
            ))}
          </section>
        )
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage("")}
        />
      )}
    </main>
  )
}

export default Monitors