import { Outlet, Link } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
      <Link to="/" className="text-2xl font-bold text-sky-400 mb-8 tracking-tight">
        Rez-Io
      </Link>
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <Outlet />
      </div>
    </div>
  )
}
