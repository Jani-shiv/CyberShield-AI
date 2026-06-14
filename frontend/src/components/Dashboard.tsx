import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Shield, ShieldCheck, ShieldAlert, Activity, RefreshCw } from 'lucide-react';
import api from '../utils/api';

interface Stats {
  total_scans: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  average_score: number;
  vulnerability_distribution: Array<{ name: string; value: number }>;
  history_trend: Array<{ date: string; score: number; url: string }>;
}

const COLORS = ['#EF4444', '#F59E0B', '#2563EB', '#10B981']; // Red, Orange, Blue, Green

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err: any) {
      setError('Failed to fetch dashboard metrics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="pt-24 min-h-screen px-4 max-w-7xl mx-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm text-slate-400">Loading security intelligence metrics...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="pt-24 min-h-screen px-4 max-w-7xl mx-auto">
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl text-center">
          {error || 'Error loading dashboard'}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen px-4 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Security Analytics Dashboard</h1>
          <p className="text-slate-400 text-xs mt-1">Real-time threat feeds and vulnerability distributions</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-border px-3 py-2 rounded-lg text-slate-300 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="glass border border-border p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">Total Scans</p>
            <h3 className="text-3xl font-extrabold text-white mt-2">{stats.total_scans}</h3>
          </div>
          <Activity className="w-8 h-8 text-primary" />
        </div>

        <div className="glass border border-border p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">Critical Threats</p>
            <h3 className="text-3xl font-extrabold text-danger mt-2">{stats.critical}</h3>
          </div>
          <ShieldAlert className="w-8 h-8 text-danger" />
        </div>

        <div className="glass border border-border p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">High Risks</p>
            <h3 className="text-3xl font-extrabold text-warning mt-2">{stats.high}</h3>
          </div>
          <ShieldAlert className="w-8 h-8 text-warning" />
        </div>

        <div className="glass border border-border p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">Medium / Low</p>
            <h3 className="text-3xl font-extrabold text-accent mt-2">{stats.medium + stats.low}</h3>
          </div>
          <ShieldCheck className="w-8 h-8 text-accent" />
        </div>

        <div className="glass border border-border p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">Avg Risk Score</p>
            <h3 className="text-3xl font-extrabold mt-2 text-white">
              {stats.average_score}
              <span className="text-xs text-slate-500 font-normal">/100</span>
            </h3>
          </div>
          <Shield className="w-8 h-8 text-success" />
        </div>
      </div>

      {/* Recharts Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Risk Trend Chart */}
        <div className="lg:col-span-2 glass border border-border p-6 rounded-2xl">
          <h2 className="text-lg font-bold text-white mb-4">Security Risk Trend Analysis</h2>
          <div className="h-72">
            {stats.history_trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.history_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" domain={[0, 100]} style={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b' }}
                    labelStyle={{ color: '#fff', fontSize: 12 }}
                  />
                  <Bar dataKey="score" fill="#2563EB" radius={[4, 4, 0, 0]}>
                    {stats.history_trend.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 75 ? '#EF4444' : entry.score >= 45 ? '#F59E0B' : '#2563EB'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No completed vulnerability scan records.
              </div>
            )}
          </div>
        </div>

        {/* Vulnerability Distribution Chart */}
        <div className="glass border border-border p-6 rounded-2xl">
          <h2 className="text-lg font-bold text-white mb-4">Vulnerability Distribution</h2>
          <div className="h-72 flex flex-col justify-between">
            <div className="h-48 relative">
              {stats.critical + stats.high + stats.medium + stats.low > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.vulnerability_distribution.filter(d => d.value > 0)}
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.vulnerability_distribution.filter(d => d.value > 0).map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  No active threat distributions.
                </div>
              )}
            </div>

            {/* Legends */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-danger" />
                <span className="text-slate-300">Critical ({stats.critical})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-warning" />
                <span className="text-slate-300">High ({stats.high})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary" />
                <span className="text-slate-300">Medium ({stats.medium})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-success" />
                <span className="text-slate-300">Low ({stats.low})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
