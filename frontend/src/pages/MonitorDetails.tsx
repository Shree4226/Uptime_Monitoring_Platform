import axios from "axios"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  getMonitor,
  getMonitorAnalytics,
  getMonitorTimeSeries,
  type Monitor,
  type MonitorAnalytics,
  type MonitorTimeSeries,
} from "../services/monitors"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

function MonitorDetails() {
  const { monitorId } = useParams()
  const navigate = useNavigate()
  const [monitor, setMonitor] = useState<Monitor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [analytics, setAnalytics] = useState<MonitorAnalytics | null>(null)
  const [analyticsPeriod, setAnalyticsPeriod] = useState<
    "1h" | "24h" | "7d" | "30d"
  >("24h")
  const [timeSeries, setTimeSeries] = useState<MonitorTimeSeries | null>(null)

  useEffect(() => {
    if (!monitorId) return

    const fetchMonitorData = async () => {
        try {
        const monitorData = await getMonitor(Number(monitorId))

        setMonitor(monitorData)
        } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            setError(
            error.response?.data?.detail ||
                "Unable to load monitor data.",
            )
        } else {
            setError("Unable to load monitor data.")
        }
        } finally {
        setIsLoading(false)
        }
    }

    fetchMonitorData()
    }, [monitorId])

    useEffect(() => {
        if (!monitorId) return

        const fetchAnalytics = async () => {
            try {
            const data = await getMonitorAnalytics(
                Number(monitorId),
                analyticsPeriod,
            )

            setAnalytics(data)
            } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setError(
                error.response?.data?.detail ||
                    "Unable to load analytics.",
                )
            } else {
                setError("Unable to load analytics.")
            }
            }
        }

        fetchAnalytics()
        }, [monitorId, analyticsPeriod])

    useEffect(() => {
        if (!monitorId) return

        const fetchTimeSeries = async () => {
            try {
            const data = await getMonitorTimeSeries(
                Number(monitorId),
                analyticsPeriod,
            )

            setTimeSeries(data)
            } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setError(
                error.response?.data?.detail ||
                    "Unable to load performance data.",
                )
            } else {
                setError("Unable to load performance data.")
            }
            }
        }

        fetchTimeSeries()
        }, [monitorId, analyticsPeriod])
  if (isLoading) {
    return (
      <main className="dashboard-page">
        <h1>Monitor Details</h1>
        <p>Loading monitor...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <h1>Monitor Details</h1>
        <p className="form-error">{error}</p>
      </main>
    )
  }

  if (!monitor) {
    return (
      <main className="dashboard-page">
        <h1>Monitor Details</h1>
        <p className="form-error">Monitor not found.</p>
      </main>
    )
  }

  const chartData =
    timeSeries?.data.map((point) => ({
        time: new Date(point.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        }),
        responseTime: point.response_time_ms,
        success: point.is_success,
    })) ?? []

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>{monitor.name}</h1>
          <p>{monitor.url}</p>
        </div>
      </header>

      <section className="dashboard-card">
        <div className="analytics-header">
            <div>
            <h2>Performance</h2>
            <p>Monitoring performance for the selected period.</p>
            </div>

            <select
            value={analyticsPeriod}
            onChange={(event) =>
                setAnalyticsPeriod(
                event.target.value as "1h" | "24h" | "7d" | "30d",
                )
            }
            >
            <option value="1h">Last 1 hour</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            </select>
        </div>

        {analytics && (
            <div className="analytics-grid">
            <div className="analytics-card">
                <span>Uptime</span>
                <strong>
                {analytics.uptime_percentage.toFixed(2)}%
                </strong>
            </div>

            <div className="analytics-card">
                <span>Avg. Response Time</span>
                <strong>
                {analytics.average_response_time_ms.toFixed(0)} ms
                </strong>
            </div>

            <div className="analytics-card">
                <span>Total Checks</span>
                <strong>{analytics.total_checks}</strong>
            </div>

            <div className="analytics-card">
                <span>Failed Checks</span>
                <strong>{analytics.failed_checks}</strong>
            </div>
            </div>
        )}
        </section>

        <section className="dashboard-card">
            <div className="analytics-header">
                <div>
                <h2>Response Time</h2>
                <p>Response time over the selected period.</p>
                </div>
            </div>

            {chartData.length === 0 ? (
                <p>No performance data available yet.</p>
            ) : (
                <div className="response-time-chart">
                <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={chartData}>
                    <XAxis dataKey="time" />
                    <YAxis
                        label={{
                        value: "Milliseconds",
                        angle: -90,
                        position: "insideLeft",
                        }}
                    />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="responseTime"
                        name="Response time"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={false}
                    />
                    </LineChart>
                </ResponsiveContainer>
                <div className="check-status-summary">
                    <div className="check-status-item success">
                        <span className="check-status-dot" />
                        <strong>
                        {chartData.filter((point) => point.success).length}
                        </strong>
                        <span>successful</span>
                    </div>

                    <div className="check-status-item failed">
                        <span className="check-status-dot" />
                        <strong>
                        {chartData.filter((point) => !point.success).length}
                        </strong>
                        <span>failed</span>
                    </div>
                </div>
            </div>
            )}
            </section>
            
      <section className="dashboard-card">
        <h2>Monitor Configuration</h2>

        <p>
          <strong>Status:</strong>{" "}
          {monitor.is_active ? "Active" : "Paused"}
        </p>

        <p>
          <strong>Method:</strong> {monitor.method}
        </p>

        <p>
          <strong>Check interval:</strong>{" "}
          {monitor.interval_seconds} seconds
        </p>

        <p>
          <strong>Expected status:</strong>{" "}
          {monitor.expected_status}
        </p>

        <p>
          <strong>Timeout:</strong>{" "}
          {monitor.timeout_seconds} seconds
        </p>

        <p>
          <strong>Retry count:</strong> {monitor.retry_count}
        </p>

        <p>
          <strong>Failure threshold:</strong>{" "}
          {monitor.failure_threshold}
        </p>
      </section>

      <section className="dashboard-card check-history-card">
        <div className="check-history-header">
            <div>
            <h2>Check History</h2>
            <p>View all recorded checks for this monitor.</p>
            </div>

            <button
            type="button"
            onClick={() => navigate(`/monitors/${monitorId}/checks`)}
            >
            View Check History
            </button>
        </div>
      </section>
    </main>
  )
}

export default MonitorDetails