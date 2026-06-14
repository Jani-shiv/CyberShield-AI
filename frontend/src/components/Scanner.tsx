import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, ShieldAlert, CheckCircle, XCircle, FileDown, Eye, HelpCircle } from 'lucide-react';
import api from '../utils/api';

interface ScanResult {
  id: number;
  target_url: string;
  domain: string;
  risk_score: number;
  risk_level: string;
  timestamp: string;
  ssl_check: {
    enabled: boolean;
    valid: boolean;
    issuer: string;
    expiration: string;
    days_remaining?: number;
    details: string;
  };
  headers_check: Record<string, {
    present: boolean;
    value: string;
    risk: string;
    description: string;
    deduction: number;
  }>;
  vulnerabilities: Array<{
    type: string;
    severity: string;
    endpoint: string;
    description: string;
    remediation: string;
  }>;
  ports_scan: Array<{
    port: number;
    service: string;
    status: string;
    risk: string;
  }>;
}

const Scanner: React.FC = () => {
  const [targetUrl, setTargetUrl] = useState('');
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [progressLogs, setProgressLogs] = useState<string[]>([]);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  
  // PDF Report parameters
  const [studentName, setStudentName] = useState('');
  const [guideName, setGuideName] = useState('');
  const [showPdfOptions, setShowPdfOptions] = useState(false);

  const simulateLogs = (url: string) => {
    setProgressLogs([]);
    const logs = [
      `[+] Resolving DNS record mappings for target domain...`,
      `[+] Target domain parsed: ${url}`,
      `[+] Initiating SSL Certificate chain validation (Port 443)...`,
      `[+] Checking security headers: CSP, HSTS, X-Frame-Options...`,
      `[+] Injecting safe payloads to check for reflected XSS vulnerability...`,
      `[+] Analyzing target query fields for SQL Injection errors...`,
      `[+] Probing directory structure indexes (/admin, /config, /backup)...`,
      `[+] Testing open network port listeners (FTP, SSH, Telnet, Database interfaces)...`,
      `[+] Fetching results and computing threat scores...`
    ];

    logs.forEach((log, idx) => {
      setTimeout(() => {
        setProgressLogs(prev => [...prev, log]);
      }, idx * 600);
    });
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl) return;

    setError('');
    setScanResult(null);
    setScanStatus('scanning');
    simulateLogs(targetUrl);

    try {
      const res = await api.post('/scans', { target_url: targetUrl });
      
      // Wait for logs to finish simulating before showing success
      setTimeout(() => {
        setScanResult(res.data.results);
        setScanStatus('success');
      }, 5500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Security assessment failed. Verify connection settings.');
      setScanStatus('failed');
    }
  };

  const triggerPdfDownload = async (scanId: number) => {
    try {
      const response = await api.get(`/scans/${scanId}/report`, {
        params: {
          student_name: studentName || 'MSc Candidate',
          guide_name: guideName || 'Project Committee Guidance'
        },
        responseType: 'blob'
      });
      
      // Create local URL and trigger click download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `cybershield_ai_report_${scanId}.pdf`;
      link.click();
      setShowPdfOptions(false);
    } catch (err) {
      console.error("PDF generation failed: ", err);
    }
  };

  return (
    <div className="pt-24 min-h-screen px-4 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Intelligent Website Security Scanner</h1>
        <p className="text-slate-400 text-xs mt-1">Deploy multi-layer vulnerability assessment sweeps against online target sites</p>
      </div>

      {/* Input Bar Card */}
      <div className="glass border border-border p-6 rounded-2xl mb-8">
        <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-muted" />
            <input
              type="text"
              required
              disabled={scanStatus === 'scanning'}
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="e.g., https://example.com"
              className="w-full bg-slate-950 border border-border rounded-xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-primary transition"
            />
          </div>
          <button
            type="submit"
            disabled={scanStatus === 'scanning'}
            className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-primary/20 transition duration-300 disabled:opacity-50"
          >
            {scanStatus === 'scanning' ? 'Running Sweeps...' : 'Trigger Scan'}
          </button>
        </form>
      </div>

      {/* Scanning status/logs console */}
      <AnimatePresence>
        {scanStatus === 'scanning' && (
          <motion.div 
            className="glass border border-border p-6 rounded-2xl mb-8"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Security Assessment Console</h3>
            </div>
            
            <div className="bg-slate-950 font-mono text-xs text-accent/80 p-4 rounded-xl max-h-56 overflow-y-auto space-y-2 border border-border/40">
              {progressLogs.map((log, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-muted">[{new Date().toLocaleTimeString()}]</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Errors */}
      {scanStatus === 'failed' && (
        <div className="bg-danger/10 border border-danger/20 text-danger text-sm p-4 rounded-xl text-center mb-8">
          {error}
        </div>
      )}

      {/* Scan results visualizations */}
      {scanStatus === 'success' && scanResult && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Executive Overview Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="glass border border-border p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Threat Score</h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">{scanResult.risk_score}</span>
                  <span className="text-sm text-slate-500 font-semibold">/100</span>
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  Risk Assessment: <span className={`font-bold px-2 py-0.5 rounded text-white ${
                    scanResult.risk_level === 'Critical' ? 'bg-danger' : 
                    scanResult.risk_level === 'High' ? 'bg-warning' : 
                    scanResult.risk_level === 'Medium' ? 'bg-primary' : 'bg-success'
                  }`}>{scanResult.risk_level.toUpperCase()}</span>
                </div>
              </div>
              
              <div className="border-t border-border/60 pt-4 mt-6">
                <button
                  onClick={() => setShowPdfOptions(true)}
                  className="w-full flex items-center justify-center gap-2 bg-success hover:bg-success-dark text-white font-bold py-2.5 rounded-lg text-sm shadow-md transition"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download PDF Thesis Report</span>
                </button>
              </div>
            </div>

            {/* SSL Details Card */}
            <div className="glass border border-border p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">SSL Certificate Status</h3>
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-muted">HTTPS Connection</span>
                  <span className={`font-bold ${scanResult.ssl_check.enabled ? 'text-success' : 'text-danger'}`}>
                    {scanResult.ssl_check.enabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-muted">Certificate Validity</span>
                  <span className={`font-bold ${scanResult.ssl_check.valid ? 'text-success' : 'text-danger'}`}>
                    {scanResult.ssl_check.valid ? 'VALID' : 'INVALID/INSECURE'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-muted">Certificate Issuer</span>
                  <span className="text-white font-semibold">{scanResult.ssl_check.issuer}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Expiration Date</span>
                  <span className="text-white font-semibold">{scanResult.ssl_check.expiration}</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics stats */}
            <div className="glass border border-border p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Target Domain Info</h3>
                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <span className="text-muted block">Host Target</span>
                    <span className="text-white font-semibold break-all text-sm block mt-1">{scanResult.target_url}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Resolved Host Domain</span>
                    <span className="text-white font-semibold block mt-1">{scanResult.domain}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive PDF Modal */}
          {showPdfOptions && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-border p-6 rounded-2xl w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Academic Report Details</h3>
                <p className="text-xs text-slate-400 mb-4">Add Student/Guide metadata tags to output standard University formats.</p>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Student Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full bg-slate-950 border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Project Guide Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Robert Vance"
                      value={guideName}
                      onChange={(e) => setGuideName(e.target.value)}
                      className="w-full bg-slate-950 border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => triggerPdfDownload(scanResult.id)}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-2 rounded-lg text-xs transition"
                  >
                    Generate Report
                  </button>
                  <button
                    onClick={() => setShowPdfOptions(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded-lg text-xs transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HTTP Header Checks Table */}
          <div className="glass border border-border p-6 rounded-2xl mb-8">
            <h2 className="text-lg font-bold text-white mb-4">HTTP Security Header Audit</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-border/60 text-muted uppercase font-bold text-[10px]">
                    <th className="py-3">Header</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Description</th>
                    <th className="py-3">Assessed Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(scanResult.headers_check).map(([header, info]) => (
                    <tr key={header} className="border-b border-border/30 hover:bg-slate-900/40">
                      <td className="py-3.5 font-semibold text-white">{header}</td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1 font-bold ${info.present ? 'text-success' : 'text-danger'}`}>
                          {info.present ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          <span>{info.present ? 'Present' : 'Missing'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-400 max-w-sm">{info.description}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] text-white ${
                          info.risk === 'High' ? 'bg-warning' : info.risk === 'Medium' ? 'bg-primary' : info.risk === 'Low' ? 'bg-slate-800' : 'bg-success'
                        }`}>
                          {info.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vulnerability Findings Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Vulnerabilities Detected details */}
            <div className="lg:col-span-2 glass border border-border p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-white mb-4">Injection & Path Vulnerability Findings</h2>
              {scanResult.vulnerabilities.length > 0 ? (
                <div className="space-y-4">
                  {scanResult.vulnerabilities.map((vuln, idx) => (
                    <div key={idx} className="border border-border p-4 rounded-xl bg-slate-900/30">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-white">{vuln.type}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                          vuln.severity === 'Critical' ? 'bg-danger' :
                          vuln.severity === 'High' ? 'bg-warning' :
                          vuln.severity === 'Medium' ? 'bg-primary' : 'bg-slate-800'
                        }`}>{vuln.severity.toUpperCase()}</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                        <span className="text-muted block text-[10px] uppercase font-bold">Tested Parameter Endpoint:</span>
                        <code className="text-accent bg-slate-950 px-1 py-0.5 rounded break-all">{vuln.endpoint}</code>
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed mb-2">
                        <span className="text-muted text-[10px] uppercase font-bold block">Assessed Description:</span>
                        {vuln.description}
                      </p>
                      <div className="text-xs bg-success/10 border border-success/20 p-2.5 rounded-lg text-success leading-relaxed">
                        <span className="font-bold">Suggested Remediation:</span> {vuln.remediation}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs font-semibold">
                  No vulnerabilities detected. Target configuration matches clean filters.
                </div>
              )}
            </div>

            {/* Socket Port Scan Results */}
            <div className="glass border border-border p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-white mb-4">Open Socket Services</h2>
              <div className="overflow-y-auto max-h-[460px] space-y-3">
                {scanResult.ports_scan.map((port) => (
                  <div key={port.port} className="flex items-center justify-between p-3 rounded-xl border border-border bg-slate-950">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300">Port {port.port}</span>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 text-muted rounded uppercase font-bold">{port.service}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold ${port.status === 'Open' ? 'text-danger' : 'text-slate-500'}`}>
                        {port.status.toUpperCase()}
                      </span>
                      {port.status === 'Open' && (
                        <span className="px-1.5 py-0.5 bg-danger/20 text-danger rounded text-[9px] font-extrabold uppercase">
                          {port.risk}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Scanner;
