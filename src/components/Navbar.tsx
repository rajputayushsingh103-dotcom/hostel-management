import React from 'react';
import {
  UtensilsCrossed,
  Building2,
  Wrench,
  Fingerprint,
  UserX,
  Bell,
  ShieldCheck,
  User,
  Users,
  MessageSquare,
  LogOut,
  School
} from 'lucide-react';
import { Role, UserAuthSession } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: Role;
  userSession: UserAuthSession;
  onLogout: () => void;
  activeAlertCount: number;
  bunkCount: number;
  missedBiometricCount: number;
  activeLeavePassCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  role,
  userSession,
  onLogout,
  activeAlertCount,
  bunkCount,
  missedBiometricCount,
  activeLeavePassCount
}) => {
  const tabs = [
    {
      id: 'leave',
      label: 'Home Pass & Parent Alert',
      icon: MessageSquare,
      badge: activeLeavePassCount > 0 ? activeLeavePassCount : undefined,
      badgeColor: 'bg-amber-500'
    },
    {
      id: 'mess',
      label: 'Mess Menu',
      icon: UtensilsCrossed
    },
    {
      id: 'attendance',
      label: 'Biometric Attendance & Timing',
      icon: Fingerprint,
      badge: missedBiometricCount > 0 ? missedBiometricCount : undefined,
      badgeColor: 'bg-rose-500'
    },
    {
      id: 'groups',
      label: 'Year-Wise Groups',
      icon: Users
    },
    {
      id: 'rooms',
      label: role === 'warden' || role === 'college_admin' ? 'Rooms & Guardian Contact' : 'Room Vacancy',
      icon: Building2
    },
    {
      id: 'bunk',
      label: role === 'college_admin' ? 'College Attendance & Bunk Sync' : 'College Bunk Alert',
      icon: UserX,
      badge: bunkCount > 0 ? bunkCount : undefined,
      badgeColor: 'bg-amber-500'
    },
    {
      id: 'complaints',
      label: 'Complaints',
      icon: Wrench
    },
    {
      id: 'alerts',
      label: 'Hostel Alerts',
      icon: Bell,
      badge: activeAlertCount > 0 ? activeAlertCount : undefined,
      badgeColor: 'bg-red-600'
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-md">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 px-4 py-2 text-xs text-indigo-200 border-b border-indigo-900/40 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            Hostel SuperApp & Parent SMS Safety System
          </span>
          <span className="hidden sm:inline text-slate-400">•</span>
          <span className="hidden sm:inline font-medium text-slate-300">
            Tagore Block • Tilak Block • Subhash Block
          </span>
        </div>

        {/* User Session Bar & Logout */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-xs">
            {role === 'student' ? (
              <User className="w-3.5 h-3.5 text-indigo-400" />
            ) : role === 'college_admin' ? (
              <School className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
            )}
            <span className="font-semibold text-white">
              {userSession.name}
              {userSession.rollNo ? ` (${userSession.rollNo})` : ''}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {role === 'student' ? userSession.roomNumber || 'Tagore-101' : role === 'college_admin' ? 'College Admin' : 'Warden Admin'}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all"
            title="Switch User / Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Header Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Main Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('leave')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">HostelHub</h1>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Parent SMS Alert Active
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {role === 'warden' ? 'Warden Administrative Control Portal' : role === 'college_admin' ? 'College Academic Administration Portal' : 'Student Access Portal'}
              </p>
            </div>
          </div>
        </div>

        {/* Nav Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar border-t border-slate-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>

                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-[10px] font-bold text-white rounded-full ${tab.badgeColor} animate-pulse`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
