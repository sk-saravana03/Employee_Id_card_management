import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { ShieldCheck, Bell, Search, User, LogOut, ChevronDown, Building2, KeyRound } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const TopNav = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const userRole = user?.role?.name || 'Employee';
  const branchName = user?.branch?.name || 'Headquarters';

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left section: Brand & Security Level */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm text-slate-900 tracking-tight block">
              ENTERPRISE ID PORTAL
            </span>
            <span className="text-[10px] text-slate-500 font-mono block -mt-1 uppercase tracking-wider">
              Identity System v1.0
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-600 font-medium">
            {branchName}
          </span>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden lg:flex items-center relative max-w-xs w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Global System Search..."
          className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 placeholder-slate-400"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* System Active Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[11px] font-medium text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          System Active
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-semibold text-xs border border-emerald-600">
              {user?.firstName?.[0] || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <div className="mt-0.5">
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {userRole}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-2 border-b border-slate-200">
                <p className="text-xs font-semibold text-slate-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[11px] text-slate-500 font-mono truncate">
                  {user?.email}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  ID: <span className="font-mono">{user?.employeeId}</span>
                </p>
              </div>

              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-100"
                onClick={() => setDropdownOpen(false)}
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                Security Profile
              </Link>

              <div className="my-1 border-t border-slate-200"></div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                End Security Session
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
