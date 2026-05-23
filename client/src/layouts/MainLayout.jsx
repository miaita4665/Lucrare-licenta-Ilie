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

      <nav className="border-b border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 z-50 bg-slate-950/95 backdrop-blur">
        <Link to="/" className="text-lg font-semibold text-white tracking-tight">
          rez<span className="text-blue-400">io</span>
        </Link>

        <div className="flex items-center gap-8 text-sm">
          <Link to="/flights" className="text-slate-400 hover:text-white transition">Flights</Link>
          <Link to="/hotels" className="text-slate-400 hover:text-white transition">Hotels</Link>
          <Link to="/map" className="text-slate-400 hover:text-white transition">Map</Link>
          {isAdmin && (
            <Link to="/admin" className="text-amber-400 hover:text-amber-300 transition">Admin</Link>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-slate-400 hover:text-white transition">
                {user?.first_name}
              </Link>
              <button
                onClick={handleLogout}
                className="border border-slate-700 hover:border-slate-500 px-4 py-1.5 rounded-full transition text-slate-300 hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-400 hover:text-white transition">Login</Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-full font-medium transition"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-800 px-8 py-6 text-center text-slate-600 text-sm">
        © 2026 rezio — Bachelor's Degree Project
      </footer>

    </div>
  )
}