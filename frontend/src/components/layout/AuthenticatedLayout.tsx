import type { ReactNode } from "react"
import Navbar from "./Navbar"

type AuthenticatedLayoutProps = {
  children: ReactNode
}

function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <>
      <Navbar />
      <div className="app-shell">{children}</div>
    </>
  )
}

export default AuthenticatedLayout