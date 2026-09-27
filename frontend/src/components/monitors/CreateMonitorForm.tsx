import { useState, type FormEvent } from "react"
import axios from "axios"
import api from "../../services/api"

type CreateMonitorFormProps = {
  onCreated: () => void
  onCancel: () => void
}

function CreateMonitorForm({
  onCreated,
  onCancel,
}: CreateMonitorFormProps) {
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [method, setMethod] = useState("GET")
  const [intervalSeconds, setIntervalSeconds] = useState(60)
  const [expectedStatus, setExpectedStatus] = useState(200)
  const [timeoutSeconds, setTimeoutSeconds] = useState(10)
  const [retryCount, setRetryCount] = useState(0)
  const [failureThreshold, setFailureThreshold] = useState(3)

  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await api.post("/monitors/", {
        name,
        url,
        method,
        interval_seconds: intervalSeconds,
        expected_status: expectedStatus,
        timeout_seconds: timeoutSeconds,
        retry_count: retryCount,
        failure_threshold: failureThreshold,
        is_active: true,
        headers: null,
        body: null,
      })

      onCreated()
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.detail ||
            "Unable to create monitor. Please try again.",
        )
      } else {
        setError("Unable to create monitor. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="monitor-form-card">
      <div className="monitor-form-header">
        <div>
          <h2>Create Monitor</h2>
          <p>Configure a website or API to monitor.</p>
        </div>

        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="monitor-form-grid">
          <div className="form-group">
            <label htmlFor="monitor-name">Name</label>
            <input
              id="monitor-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="My API"
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="monitor-url">URL</label>
            <input
              id="monitor-url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="monitor-method">HTTP Method</label>
            <select
              id="monitor-method"
              value={method}
              onChange={(event) => setMethod(event.target.value)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="monitor-interval">
              Check Interval (seconds)
            </label>
            <input
              id="monitor-interval"
              type="number"
              min={10}
              max={86400}
              value={intervalSeconds}
              onChange={(event) =>
                setIntervalSeconds(Number(event.target.value))
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="monitor-status">
              Expected Status Code
            </label>
            <input
              id="monitor-status"
              type="number"
              min={100}
              max={599}
              value={expectedStatus}
              onChange={(event) =>
                setExpectedStatus(Number(event.target.value))
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="monitor-timeout">
              Timeout (seconds)
            </label>
            <input
              id="monitor-timeout"
              type="number"
              min={1}
              max={60}
              value={timeoutSeconds}
              onChange={(event) =>
                setTimeoutSeconds(Number(event.target.value))
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="monitor-retries">Retry Count</label>
            <input
              id="monitor-retries"
              type="number"
              min={0}
              max={5}
              value={retryCount}
              onChange={(event) =>
                setRetryCount(Number(event.target.value))
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="monitor-threshold">
              Failure Threshold
            </label>
            <input
              id="monitor-threshold"
              type="number"
              min={1}
              max={10}
              value={failureThreshold}
              onChange={(event) =>
                setFailureThreshold(Number(event.target.value))
              }
              required
            />
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="monitor-form-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Monitor"}
          </button>
        </div>
      </form>
    </section>
  )
}

export default CreateMonitorForm