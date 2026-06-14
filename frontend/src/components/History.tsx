import React, { useEffect, useState } from 'react';
import { RefreshCw, Search, ShieldAlert, FileDown, Trash2, Eye } from 'lucide-react';
import api from '../utils/api';

interface ScanHistoryItem {
  id: number;
  target_url: string;
  risk_score: number;
  risk_level: string;
  status: string;
  created_at: string;
}

const History: React.FC = () => {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [filtered, setFiltered] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering and Searching
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('All');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/scans');
      setHistory(res.data);
      setFiltered(res.data);
    } catch (err) {
      setError('Failed to fetch historical scan data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filter lists dynamically
  useEffect(() => {
    let result = history.filter(item => 
      item.target_url.toLowerCase().includes(search.toLowerCase())
    );
    if (filterSeverity !== 'All') {
      result = result.filter(item => item.risk_level === filterSeverity);
    }
    setFiltered(result);
  }, [search, filterSeverity, history]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this vulnerability assessment scan?")) return;
    try {
      await api.delete(`/scans/${id}`);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Failed to delete scan: ", err);
    }
  };

  const downloadReport = async (id: number) => {
    try {
      const response = await api.get(`/scans/${id}/report`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `cybershield_report_${id}.pdf`;
      link.click();
    } catch (err) {
      console.error("Failed to download report: ", err);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 min-h-screen px-4 max-w-7xl mx-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm text-slate-400">Loading scans timeline archives...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen px-4 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Vulnerability Scan History</h1>
          <p className="text-slate-400 text-xs mt-1">Review historical target assessment sweeps and download PDF reports</p>
        </div>
        <button
          onClick={fetchHistory}
          className="flex items-center gap-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-border px-3 py-2 rounded-lg text-slate-300 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload</span>
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl text-center mb-6">
          {error}
        </div>
      )}

      {/* Filter and Search Bar Cards */}
      <div className="glass border border-border p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search target URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-border rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-primary transition"
          />
        </div>

        {/* Severity filter selectors */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-muted font-semibold">Filter:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-slate-950 border border-border text-xs text-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="All">All Severity Levels</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Scan History Table Card */}
      <div className="glass border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length > 0 ? (
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-border/60 text-muted uppercase font-bold text-[10px] bg-slate-950/60">
                  <th className="p-4">Scan Date</th>
                  <th className="p-4">Target Endpoint</th>
                  <th className="p-4">Risk Level</th>
                  <th className="p-4">Risk Score</th>
                  <th className="p-4">Scan Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((scan) => (
                  <tr key={scan.id} className="border-b border-border/30 hover:bg-slate-900/40">
                    <td className="p-4 text-muted font-mono">{new Date(scan.created_at).toLocaleString()}</td>
                    <td className="p-4 font-semibold text-white break-all max-w-sm">{scan.target_url}</td>
                    <td className="p-4">
                      {scan.status === 'Completed' ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                          scan.risk_level === 'Critical' ? 'bg-danger' : 
                          scan.risk_level === 'High' ? 'bg-warning' : 
                          scan.risk_level === 'Medium' ? 'bg-primary' : 'bg-success'
                        }`}>
                          {scan.risk_level.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-muted font-bold">-</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-white">
                      {scan.status === 'Completed' ? `${scan.risk_score}/100` : '-'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        scan.status === 'Completed' ? 'bg-success/10 text-success' :
                        scan.status === 'Running' ? 'bg-primary/10 text-primary animate-pulse' : 'bg-danger/10 text-danger'
                      }`}>{scan.status}</span>
                    </td>
                    <td className="p-4 flex items-center justify-center gap-3">
                      {scan.status === 'Completed' && (
                        <button
                          onClick={() => downloadReport(scan.id)}
                          className="flex items-center gap-1 text-[10px] font-bold bg-success/20 text-success border border-success/30 hover:bg-success hover:text-white px-2 py-1.5 rounded transition"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(scan.id)}
                        className="flex items-center gap-1 text-[10px] font-bold bg-danger/20 text-danger border border-danger/30 hover:bg-danger hover:text-white px-2 py-1.5 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs font-semibold">
              No historical scan profiles detected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
