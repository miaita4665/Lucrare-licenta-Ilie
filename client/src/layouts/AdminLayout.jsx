import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Ticket, Tag, Star } from 'lucide-react';

const links = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/bookings', label: 'Bookings', icon: Ticket },
  { to: '/admin/promo-codes', label: 'Promo Codes', icon: Tag },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
];

export default function AdminLayout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex bg-slate-950 text-white">
      <aside className="w-56 border-r border-slate-800 p-4 flex flex-col gap-1 sticky top-0 h-screen">
        <Link to="/" className="text-blue-400 font-bold text-lg mb-6 px-2">
          rezio
        </Link>
        <p className="text-xs text-slate-500 uppercase tracking-widest px-2 mb-2">
          Admin Panel
        </p>
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              pathname === to
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}