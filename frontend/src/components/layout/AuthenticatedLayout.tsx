import type { ReactNode } from "react"
import Navbar from "./Navbar"

type AuthenticatedLayoutProps = {
  children: ReactNode
}

function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

export default AuthenticatedLayout