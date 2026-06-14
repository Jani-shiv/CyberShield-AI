import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Terminal, Activity, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Hero: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="pt-24 min-h-screen flex flex-col justify-between">
      {/* Hero Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow flex flex-col lg:flex-row items-center gap-12 py-12">
        {/* Left Intro content */}
        <motion.div 
          className="flex-1 text-center lg:text-left"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-xs font-semibold mb-6">
            <Lock className="w-3.5 h-3.5" />
            <span>AI-Driven Cyber Security Platform</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-none">
            CyberShield <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">AI</span>
          </h1>
          <p className="text-lg sm:text-2xl font-bold text-slate-300 mt-4">
            Protect Websites Before Hackers Find Vulnerabilities
          </p>
          <p className="text-slate-400 mt-6 max-w-xl leading-relaxed text-sm sm:text-base">
            Perform enterprise-grade vulnerability scanning, check security headers, analyze SSL/TLS health metrics, scan TCP ports, and compile final year report-ready PDF assessments in one click.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center lg:justify-start">
            <Link
              to={isAuthenticated ? "/scanner" : "/register"}
              className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3 rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition duration-300 text-center"
            >
              Start Free Scan
            </Link>
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="glass hover:bg-slate-900 border border-border text-slate-200 font-bold px-8 py-3 rounded-lg transition duration-300 text-center"
            >
              View Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Right Graphic content */}
        <motion.div 
          className="flex-1 w-full max-w-md lg:max-w-none relative flex justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Cyber Graphic */}
          <div className="w-full aspect-square max-w-[420px] rounded-3xl glass border border-primary/20 flex flex-col p-6 shadow-2xl relative overflow-hidden group">
            {/* Background scanner sweep line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent scanning-line" />
            
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-danger" />
                <div className="w-3 h-3 rounded-full bg-warning" />
                <div className="w-3 h-3 rounded-full bg-success" />
              </div>
              <span className="text-xs text-muted font-mono">scanner_engine.py</span>
            </div>

            {/* Simulated Live Scan Feed */}
            <div className="font-mono text-xs text-slate-300 flex-grow space-y-2.5 overflow-y-auto">
              <p className="text-primary font-bold">INFO: Starting vulnerability scan against target...</p>
              <p className="text-accent flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-accent" />
                <span>SSL certificate analysis verified.</span>
              </p>
              <p className="text-success flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-success" />
                <span>HSTS Header status: present.</span>
              </p>
              <p className="text-danger flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-danger" />
                <span>Content-Security-Policy: missing.</span>
              </p>
              <p className="text-warning flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-warning" />
                <span>Port 3306 (MySQL): open (High Risk)</span>
              </p>
              <p className="text-primary font-bold">SUCCESS: Threat score computed: 45/100</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 border-t border-border/40">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-primary/10 border border-primary/20 p-3 rounded-2xl mb-4 text-primary">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Vulnerability Scanner</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detect injections (SQLi, XSS), directory leaks, open parameters, and input flaws.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-accent/10 border border-accent/20 p-3 rounded-2xl mb-4 text-accent">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Network Port Scan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analyze port endpoints and service signatures (FTP, SSH, Redis, Telnet, databases).
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-success/10 border border-success/20 p-3 rounded-2xl mb-4 text-success">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">PDF Report Generator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compile university format final year thesis reports including cover guides.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-warning/10 border border-warning/20 p-3 rounded-2xl mb-4 text-warning">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Risk Scoring Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamically assign threat grades (Low, Med, High, Critical) using weights.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="glass border-t border-border py-6 text-center text-xs text-slate-400">
        <p>© 2026 CyberShield AI Security Platform. Prepared for MSc Cyber Security Final Project.</p>
      </footer>
    </div>
  );
};

export default Hero;
