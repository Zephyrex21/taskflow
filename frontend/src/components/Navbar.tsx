import { Link, useNavigate } from "react-router-dom"
import { Waves, LogOut } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <header className="sticky top-4 z-40 px-4">
      <div className="clay mx-auto flex h-16 max-w-6xl items-center justify-between bg-ink-raised px-6">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2">
          <span className="clay-sm flex h-8 w-8 items-center justify-center bg-flow">
            <Waves className="h-4 w-4 text-ink-raised" />
          </span>
          <span className="font-display text-sm font-medium">TaskFlow</span>
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-paper-dim sm:inline">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
