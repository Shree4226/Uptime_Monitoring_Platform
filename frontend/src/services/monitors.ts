import api from "./api"

export type Monitor = {
  id: number
  name: string
  url: string
  interval_seconds: number
  expected_status: number
  method: string
  timeout_seconds: number
  headers: Record<string, string> | null
  body: string | null
  retry_count: number
  failure_threshold: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getMonitors() {
  const response = await api.get<Monitor[]>("/monitors/")
  return response.data
}

export async function updateMonitorStatus(
  monitorId: number,
  isActive: boolean,
) {
  const response = await api.patch(
    `/monitors/${monitorId}/status`,
    null,
    {
      params: {
        is_active: isActive,
      },
    },
  )

  return response.data
}

export async function deleteMonitor(monitorId: number) {
  const response = await api.delete(`/monitors/${monitorId}`)
  return response.data
}

export async function getMonitor(monitorId: number) {
  const response = await api.get<Monitor>(`/monitors/${monitorId}`)
  return response.data
}

export type Check = {
  id: number
  monitor_id: number
  status_code: number | null
  response_time_ms: number | null
  is_success: boolean
  created_at: string
}

export async function getMonitorChecks(
  monitorId: number,
  page = 1,
  limit = 20,
) {
  const response = await api.get<Check[]>(
    `/monitors/${monitorId}/checks`,
    {
      params: {
        page,
        limit,
      },
    },
  )

  return response.data
}

export type MonitorAnalytics = {
  uptime_percentage: number
  average_response_time_ms: number
  total_checks: number
  successful_checks: number
  failed_checks: number
}

export async function getMonitorAnalytics(
  monitorId: number,
  period: "1h" | "24h" | "7d" | "30d",
) {
  const response = await api.get<MonitorAnalytics>(
    `/monitors/${monitorId}/analytics`,
    {
      params: {
        period,
      },
    },
  )

  return response.data
}

export type MonitorTimeSeriesPoint = {
  timestamp: string
  response_time_ms: number | null
  is_success: boolean
}

export type MonitorTimeSeries = {
  period: "1h" | "24h" | "7d" | "30d"
  data: MonitorTimeSeriesPoint[]
}

export async function getMonitorTimeSeries(
  monitorId: number,
  period: "1h" | "24h" | "7d" | "30d",
) {
  const response = await api.get<MonitorTimeSeries>(
    `/monitors/${monitorId}/analytics/timeseries`,
    {
      params: {
        period,
      },
    },
  )

  return response.data
}