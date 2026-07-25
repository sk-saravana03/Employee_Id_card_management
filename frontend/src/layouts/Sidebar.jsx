import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Printer,
  ShieldCheck,
  Building,
  Layers,
  UserCheck,
  Lock,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  BrainCircuit,
  Bell,
  FileSpreadsheet,
  Clock,
} from 'lucide-react';

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const userRole = user?.role?.name || 'Employee';

  const navItems = [
    {
      title: 'CORE PLATFORM',
      items: [
        {
          name: 'Dashboard Overview',
          path: '/dashboard',
          icon: LayoutDashboard,
          roles: ['Super Admin', 'HR/Admin', 'Printer Operator', 'Security Officer', 'Employee'],
        },
        {
          name: 'Employee Lifecycle',
          path: '/employees',
          icon: Users,
          roles: ['Super Admin', 'HR/Admin', 'Printer Operator', 'Security Officer', 'Employee'],
        },
        {
          name: 'Identity Mgmt (ID Cards)',
          path: '/id-cards',
          icon: CreditCard,
          roles: ['Super Admin', 'HR/Admin', 'Printer Operator', 'Security Officer', 'Employee'],
        },
        {
          name: 'Print Center Queue',
          path: '/print-queue',
          icon: Printer,
          roles: ['Super Admin', 'HR/Admin', 'Printer Operator', 'Security Officer', 'Employee'],
        },
        {
          name: 'Visitor Management',
          path: '/visitors',
          icon: UserCheck,
          roles: ['Super Admin', 'HR/Admin', 'Security Officer'],
        },
      ],
    },
    {
      title: 'ORGANIZATION & SECURITY',
      items: [
        {
          name: 'Branch Governance',
          path: '/branches',
          icon: Building,
          roles: ['Super Admin', 'HR/Admin', 'Printer Operator', 'Security Officer'],
        },
        {
          name: 'Departments',
          path: '/departments',
          icon: Layers,
          roles: ['Super Admin', 'HR/Admin', 'Printer Operator', 'Security Officer'],
        },
        {
          name: 'User Accounts Governance',
          path: '/users',
          icon: ShieldAlert,
          roles: ['Super Admin', 'HR/Admin', 'Employee'],
        },
      ],
    },
    {
      title: 'ACCOUNT & SECURITY',
      items: [
        {
          name: 'Security Profile',
          path: '/profile',
          icon: ShieldCheck,
          roles: ['Super Admin', 'HR/Admin', 'Printer Operator', 'Security Officer', 'Employee'],
        },
      ],
    },
  ];

  const handleAiClick = () => {
    window.dispatchEvent(new CustomEvent('ai:open'));
  };

  return (
    <aside
      className={`bg-white border-r border-slate-200 text-slate-700 flex flex-col justify-between transition-all duration-200 sticky top-14 h-[calc(100vh-3.5rem)] z-20 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="py-4 px-3 overflow-y-auto">
        {navItems.map((group, gIdx) => {
          const visibleItems = group.items.filter(
            (item) => userRole === 'Super Admin' || item.roles.includes(userRole)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={gIdx} className="mb-6">
              {!collapsed && (
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  {group.title}
                </p>
              )}
              <div className="space-y-1">
                {visibleItems.map((item, iIdx) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={iIdx}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          collapsed ? 'justify-center' : ''
                        } ${
                          isActive
                            ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                            : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`
                      }
                      title={collapsed ? item.name : undefined}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && <span>{item.name}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Assistant Quick-Open Button */}
      <div className="px-3 pb-1">
        <button
          onClick={handleAiClick}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200/60 ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'AI Assistant' : undefined}
        >
          <BrainCircuit className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          {!collapsed && (
            <span className="flex-1 text-left">
              AI Assistant
              <span className="ml-1.5 text-[9px] bg-emerald-600 text-white px-1 py-0.5 rounded font-bold">
                BETA
              </span>
            </span>
          )}
        </button>
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-slate-200 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-mono text-slate-500">AES-256 Active</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors mx-auto"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
