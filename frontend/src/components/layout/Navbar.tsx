import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/useAuth"

function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    navigate("/login")
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <NavLink to="/dashboard">
            <span className="brand-mark" aria-hidden="true" />
            Uptime Monitor
          </NavLink>
        </div>

        <div className="navbar-links">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/monitors"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Monitors
          </NavLink>
        </div>

        <div className="navbar-user">
          <span className="user-pill">{user?.username}</span>

          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar