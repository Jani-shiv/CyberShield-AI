import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LayoutDashboard, Search, History, ShieldAlert, LogOut, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass border-b border-border fixed top-0 left-0 w-full z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white tracking-wider">
              <Shield className="w-6 h-6 text-accent animate-pulse" />
              <span>Cyber<span className="text-primary">Shield</span> <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-normal">AI</span></span>
            </Link>
          </div>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition">
                <LayoutDashboard className="w-4 h-4 text-primary" />
                <span>Dashboard</span>
              </Link>
              <Link to="/scanner" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition">
                <Search className="w-4 h-4 text-accent" />
                <span>Security Scanner</span>
              </Link>
              <Link to="/history" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition">
                <History className="w-4 h-4 text-success" />
                <span>Scan History</span>
              </Link>
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition">
                  <ShieldAlert className="w-4 h-4 text-danger" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </div>
          )}

          {/* User Section / CTA */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-900 border border-border px-3 py-1.5 rounded-lg">
                  <User className="w-4 h-4 text-muted" />
                  <span className="text-xs font-semibold text-slate-300">{user?.username}</span>
                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase font-bold">{user?.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs font-medium text-danger border border-danger/20 hover:bg-danger/10 px-3 py-1.5 rounded-lg transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-primary/20 transition duration-300"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
