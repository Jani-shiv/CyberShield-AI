import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserMinus, ShieldAlert, Activity, RefreshCw } from 'lucide-react';
import api from '../utils/api';

interface UserItem {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

const AdminPanel: React.FC = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      setError('Unauthorized access or server communication error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Verify: Do you want to remove this user from the security database?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error occurred deleting user.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl max-w-sm text-center">
          <ShieldAlert className="w-8 h-8 mx-auto mb-2" />
          <p className="font-bold">Access Denied</p>
          <p className="text-xs mt-1 text-slate-400">Admin credentials required to view this interface.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-24 min-h-screen px-4 max-w-7xl mx-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm text-slate-400">Loading user database archives...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen px-4 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-sans">Admin Control Dashboard</h1>
          <p className="text-slate-400 text-xs mt-1">Manage user profiles, clean assessment logs, and monitor project status</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-border px-3 py-2 rounded-lg text-slate-300 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Database</span>
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl text-center mb-6">
          {error}
        </div>
      )}

      {/* Users table */}
      <div className="glass border border-border rounded-2xl overflow-hidden mb-8">
        <div className="p-4 border-b border-border bg-slate-950/60 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Registered Users</h3>
          <span className="text-[10px] bg-primary/20 text-primary px-2.5 py-0.5 rounded font-bold uppercase">
            Total Users: {users.length}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-border/60 text-muted uppercase font-bold text-[10px] bg-slate-950/40">
                <th className="p-4">User ID</th>
                <th className="p-4">Username</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role Permission</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4 text-center">Operation</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/30 hover:bg-slate-900/40">
                  <td className="p-4 text-muted font-mono">{u.id}</td>
                  <td className="p-4 font-semibold text-white">{u.username}</td>
                  <td className="p-4 font-semibold text-slate-300">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      u.role === 'admin' ? 'bg-danger/20 text-danger' : 'bg-primary/20 text-primary'
                    }`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-muted font-mono">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-4 flex items-center justify-center">
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="flex items-center gap-1 text-[10px] font-bold bg-danger/20 text-danger border border-danger/30 hover:bg-danger hover:text-white px-2.5 py-1.5 rounded transition"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                      <span>Delete Account</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
