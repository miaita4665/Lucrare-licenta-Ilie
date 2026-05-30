import { useState, useEffect } from 'react'
import { Shield, User } from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/users')
      .then(r => r.json())
      .then(data => { setUsers(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleRoleChange = async (userId, role_name) => {
    try {
      await fetch(`/api/auth/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role_name }),
      })
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, Role: { role_name } } : u
      ))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <p className="text-slate-400">Loading...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Users</h1>
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-white">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-left">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Change role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="px-4 py-3">{user.first_name} {user.last_name}</td>
                <td className="px-4 py-3 text-slate-400">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    user.Role?.role_name === 'Admin' ? 'bg-red-500/20 text-red-400' :
                    user.Role?.role_name === 'Support Agent' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {user.Role?.role_name}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {user.Role?.role_name !== 'Admin' && (
                    <select
                      value={user.Role?.role_name}
                      onChange={e => handleRoleChange(user.id, e.target.value)}
                      className="bg-slate-700 text-white text-xs px-2 py-1 rounded-lg outline-none"
                    >
                      <option value="Registered User">Registered User</option>
                      <option value="Support Agent">Support Agent</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}