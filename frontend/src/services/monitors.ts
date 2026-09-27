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