import axios from "axios"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  getMonitor,
  getMonitorAnalytics,
  getMonitorTimeSeries,
  getMonitorIncidents,
  type Monitor,
  type MonitorAnalytics,
  type MonitorTimeSeries,
  type Incident,
} from "../services/monitors"
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import CreateMonitorForm from "../components/monitors/CreateMonitorForm"

function MonitorDetails() {
  const { monitorId } = useParams()
  const navigate = useNavigate()
  const [monitor, setMonitor] = useState<Monitor | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [analytics, setAnalytics] = useState<MonitorAnalytics | null>(null)
  const [analyticsPeriod, setAnalyticsPeriod] = useState<
    "1h" | "24h" | "7d" | "30d"
  >("24h")
  const [timeSeries, setTimeSeries] = useState<MonitorTimeSeries | null>(null)
  const [incidents, setIncidents] = useState<Incident[]>([])

  useEffect(() => {
    if (!monitorId) return

    const fetchMonitorData = async () => {
        try {
        const monitorData = await getMonitor(Number(monitorId))
        setMonitor(monitorData)

        const incidentsData = await getMonitorIncidents(Number(monitorId))
        setIncidents(incidentsData)
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
      responseTime: Number(point.response_time_ms ?? 0),
      success: point.is_success,
    })) ?? []

  const uptimeValue =
    analytics && typeof analytics.uptime_percentage === "number"
      ? analytics.uptime_percentage.toFixed(2)
      : "0.00"

  const responseTimeValue =
    analytics && analytics.average_response_time_ms !== null
      ? `${analytics.average_response_time_ms.toFixed(0)} ms`
      : "N/A"

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>{monitor.name}</h1>
          <p>{monitor.url}</p>
        </div>
        <div className="monitor-detail-status">
          <span className={`monitor-state ${monitor.is_active ? "active" : "paused"}`}>
            <span className="status-dot" aria-hidden="true" />
            {monitor.is_active ? "Active" : "Paused"}
          </span>
          <span className="detail-interval">Every {monitor.interval_seconds}s</span>
        </div>
      </header>

      {isEditing && (
  <CreateMonitorForm
    monitorId={monitor.id}
    initialData={{
      name: monitor.name,
      url: monitor.url,
      method: monitor.method,
      interval_seconds: monitor.interval_seconds,
      expected_status: monitor.expected_status,
      timeout_seconds: monitor.timeout_seconds,
      retry_count: monitor.retry_count,
      failure_threshold: monitor.failure_threshold,
    }}
    onCreated={async () => {
      setIsEditing(false)

      const updatedMonitor = await getMonitor(Number(monitorId))
      setMonitor(updatedMonitor)
    }}
    onCancel={() => setIsEditing(false)}
  />
)}

      <section className="dashboard-card monitor-config-card">
  <div className="monitor-config-header">
    <div>
      <h2>Monitor Configuration</h2>
      <p>Current settings for this monitor.</p>
    </div>

    <button
      type="button"
      onClick={() => setIsEditing(true)}
    >
      Edit Configuration
    </button>
  </div>

  <div className="monitor-config-grid">
    <div className="monitor-config-item">
      <span>Name</span>
      <strong>{monitor.name}</strong>
    </div>

    <div className="monitor-config-item">
      <span>Status</span>
      <strong>
        {monitor.is_active ? "Active" : "Paused"}
      </strong>
    </div>

    <div className="monitor-config-item monitor-config-wide">
      <span>URL</span>
      <strong>{monitor.url}</strong>
    </div>

    <div className="monitor-config-item">
      <span>Method</span>
      <strong>{monitor.method}</strong>
    </div>

    <div className="monitor-config-item">
      <span>Expected Status</span>
      <strong>{monitor.expected_status}</strong>
    </div>

    <div className="monitor-config-item">
      <span>Check Interval</span>
      <strong>{monitor.interval_seconds} sec</strong>
    </div>

    <div className="monitor-config-item">
      <span>Timeout</span>
      <strong>{monitor.timeout_seconds} sec</strong>
    </div>

    <div className="monitor-config-item">
      <span>Retry Count</span>
      <strong>{monitor.retry_count}</strong>
    </div>

    <div className="monitor-config-item">
      <span>Failure Threshold</span>
      <strong>{monitor.failure_threshold}</strong>
    </div>
  </div>
</section>

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
                <strong>{uptimeValue}%</strong>
            </div>

            <div className="analytics-card">
                <span>Avg. Response Time</span>
                <strong>{responseTimeValue}</strong>
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
                    <CartesianGrid stroke="#D9D6CF" strokeDasharray="2 4" vertical={false} />
                    <XAxis
                        dataKey="time"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#6B6A66", fontSize: 11 }}
                    />
                    <YAxis
                        domain={[0, (dataMax: number) => Math.max(dataMax * 1.35, 100)]}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#6B6A66", fontSize: 11 }}
                        tickFormatter={(value) => `${value}ms`}
                        label={{
                        value: "ms",
                        angle: -90,
                        position: "insideLeft",
                        fill: "#6B6A66",
                        fontSize: 11,
                        }}
                    />
                    <Tooltip
                      formatter={(value) => [`${Number(value ?? 0)} ms`, "Response time"]}
                        labelStyle={{ color: "#1A1D21", fontFamily: "IBM Plex Mono" }}
                        contentStyle={{
                        borderRadius: 6,
                        border: "1px solid #D9D6CF",
                        background: "#F7F6F3",
                        color: "#1A1D21",
                        fontFamily: "IBM Plex Mono",
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="responseTime"
                        name="Response time"
                        stroke="#C8552B"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: "#C8552B", stroke: "#F7F6F3", strokeWidth: 2 }}
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

        <section className="dashboard-card incidents-card">
  <div className="section-header">
    <div>
      <h2>Incidents</h2>
      <p>Monitor failure and recovery history.</p>
    </div>
  </div>

  {incidents.length === 0 ? (
    <p className="empty-state">No incidents recorded.</p>
  ) : (
    <>
      <div className="incident-group">
        <h3>Active Incidents</h3>

        {incidents.filter((incident) => !incident.is_resolved).length === 0 ? (
          <p className="empty-state">No active incidents.</p>
        ) : (
          <div className="incident-list">
            {incidents
              .filter((incident) => !incident.is_resolved)
              .map((incident) => (
                <div className="incident-item incident-active" key={incident.id}>
                  <div>
                    <strong>Incident #{incident.id}</strong>
                    <span>
                      Started{" "}
                      {new Date(incident.started_at).toLocaleString()}
                    </span>
                  </div>

                  <span className="incident-status">Active</span>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="incident-group">
        <h3>Resolved Incidents</h3>

        {incidents.filter((incident) => incident.is_resolved).length === 0 ? (
          <p className="empty-state">No resolved incidents.</p>
        ) : (
          <div className="incident-list">
            {incidents
              .filter((incident) => incident.is_resolved)
              .map((incident) => (
                <div className="incident-item incident-resolved" key={incident.id}>
                  <div>
                    <strong>Incident #{incident.id}</strong>

                    <span>
                      Started{" "}
                      {new Date(incident.started_at).toLocaleString()}
                    </span>

                    <span>
                      Resolved{" "}
                      {incident.resolved_at
                        ? new Date(incident.resolved_at).toLocaleString()
                        : "—"}
                    </span>
                  </div>

                  <span className="incident-status">Resolved</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  )}
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