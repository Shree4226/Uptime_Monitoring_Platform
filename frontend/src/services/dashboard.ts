import api from "./api"

export type DashboardSummary = {
  total_monitors: number
  up_monitors: number
  down_monitors: number
  active_monitors: number
  paused_monitors: number
  active_incidents: number
  overall_uptime_percentage: number
  average_response_time_ms: number | null
}

export async function getDashboardSummary() {
  const response = await api.get<DashboardSummary>("/dashboard/summary")

  return response.data
}