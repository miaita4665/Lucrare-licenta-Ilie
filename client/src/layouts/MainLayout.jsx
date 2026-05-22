import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function MainLayout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 bg-slate-950/90 backdrop-blur">
        <Link to="/" className="text-xl font-bold tracking-tight text-sky-400">
         
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link to="/flights" className="text-slate-300 hover:text-white transition">Flights</Link>
          <Link to="/hotels" className="text-slate-300 hover:text-white transition">Hotels</Link>
          <Link to="/map" className="text-slate-300 hover:text-white transition">Live Map</Link>

          {isAdmin && (
            <Link to="/admin" className="text-amber-400 hover:text-amber-300 transition">Admin</Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-slate-300 hover:text-white transition">
                {user?.first_name}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-slate-800 hover:bg-slate-700 px-4 py-1.5 rounded-full text-sm transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-slate-300 hover:text-white transition">Login</Link>
              <Link
                to="/register"
                className="bg-sky-500 hover:bg-sky-400 px-4 py-1.5 rounded-full text-sm font-medium transition"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-8 text-center text-slate-500 text-sm">
        <p>© 2025 Rez-Io — Bachelor's Degree Project</p>
      </footer>

    </div>
  )
}
