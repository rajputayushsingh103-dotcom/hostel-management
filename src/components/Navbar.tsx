// src/components/Navbar.tsx
import React, { useState } from 'react';
import {
  Menu,
  X,
  FileText,
  UtensilsCrossed,
  Fingerprint,
  Users,
  Building2,
  AlertOctagon,
  MessageSquareWarning,
  LogOut,
  School,
  Sun,
  Moon,
  ChevronRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Role, UserAuthSession } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: Role;
  userSession: UserAuthSession;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  activeAlertCount?: number;
  bunkCount?: number;
  missedBiometricCount?: number;
  activeLeavePassCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  role,
  userSession,
  onLogout,
  isDarkMode,
  onToggleTheme,
  activeAlertCount = 0,
  bunkCount = 0,
  missedBiometricCount = 0,
  activeLeavePassCount = 0
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const mainFeatures = [
    {
      id: 'leave',
      label: 'Home Pass & Parent Alert',
      desc: 'Gate Security, Outing & Leave',
      icon: FileText,
      badge: activeLeavePassCount > 0 ? activeLeavePassCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-black'
    },
    {
      id: 'mess',
      label: 'Mess Menu & Nutrition',
      desc: 'Live Diet Schedules & Meal Timings',
      icon: UtensilsCrossed
    },
    {
      id: 'attendance',
      label: 'Biometric Attendance & Timing',
      desc: 'Evening Cutoff & Hardware Sync',
      icon: Fingerprint,
      badge: missedBiometricCount > 0 ? missedBiometricCount : undefined,
      badgeColor: 'bg-rose-500 text-white font-bold'
    },
    {
      id: 'groups',
      label: 'Year-Wise Community Groups',
      desc: 'Batchmates Channel & Announcements',
      icon: Users
    }
  ];

  const adminFeatures = [
    {
      id: 'rooms',
      label: role === 'warden' || role === 'college_admin' ? 'Rooms & Student Admissions' : 'Hostel Room Directory',
      desc: 'Capacity Allocation & Occupancy',
      icon: Building2
    },
    {
      id: 'bunk',
      label: 'College Bunk Detection',
      desc: 'Class Sheet vs Biometrics Audit',
      icon: School,
      badge: bunkCount > 0 ? bunkCount : undefined,
      badgeColor: 'bg-rose-600 text-white font-bold'
    },
    {
      id: 'complaints',
      label: 'Facility & Maintenance Desk',
      desc: 'Electrical, Plumbing & Wi-Fi Logs',
      icon: MessageSquareWarning
    },
    {
      id: 'alerts',
      label: 'Administrative Circulars',
      desc: 'Urgent Notices & Broadcasts',
      icon: AlertOctagon,
      badge: activeAlertCount > 0 ? activeAlertCount : undefined,
      badgeColor: 'bg-indigo-600 text-white font-bold'
    }
  ];

  const allItems = [...mainFeatures, ...adminFeatures];
  const currentItem = allItems.find((item) => item.id === activeTab) || allItems[0];

  return (
    <>
      {/* Top Floating Navbar */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-300 ${
        isDarkMode
          ? 'bg-slate-950/90 border-slate-800/80 text-white shadow-2xl shadow-black/40'
          : 'bg-white/90 border-slate-200/90 text-slate-900 shadow-sm shadow-slate-200/60'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Hamburger & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`p-2.5 rounded-2xl border transition-all flex items-center gap-2 group active:scale-95 ${
                isDarkMode
                  ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border-slate-800 hover:border-indigo-500/50 shadow-inner'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
              }`}
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold tracking-tight hidden sm:inline">Menu</span>
            </button>

            {/* Brand Logo & Subtitle */}
            <div className={`flex items-center gap-2.5 pl-2.5 sm:pl-3 border-l ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-600/30 shrink-0">
                H
              </div>
              <div className="flex flex-col items-start justify-center">
                <span className="text-xs sm:text-sm font-black tracking-tight leading-none">HostelHub</span>
                <span className={`text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 mt-1 rounded-full border max-w-[130px] sm:max-w-none truncate ${
                  isDarkMode
                    ? 'bg-slate-900 text-indigo-300 border-slate-800'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  {currentItem.label}
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={onToggleTheme}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 ${
                isDarkMode
                  ? 'bg-slate-900/90 hover:bg-slate-800 text-amber-300 border-slate-800 hover:border-amber-500/30'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
              }`}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Day</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden md:inline">Night</span>
                </>
              )}
            </button>

            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
              isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold">{userSession.block || 'Hostel'} Block</span>
            </div>

            <button
              onClick={onLogout}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                isDarkMode
                  ? 'bg-slate-900/90 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border-slate-800 hover:border-red-500/30'
                  : 'bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 border-slate-200 hover:border-red-200'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* 🟢 100% FIXED MOBILE SLIDE-OVER DRAWER (FULL HEIGHT & VISIBLE ITEMS) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Container (Proper h-screen & flex-1 layout) */}
          <div className={`relative w-84 max-w-[85vw] h-screen h-[100dvh] border-r shadow-2xl flex flex-col justify-between z-10 transition-colors ${
            isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            {/* 1. Header (Fixed Height) */}
            <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
              isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-600/30">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-wider uppercase">Hostel Hub</h3>
                  <p className="text-[10px] text-indigo-500 font-bold">Campus Operations</p>
                </div>
              </div>

              <button
                onClick={() => setIsSidebarOpen(false)}
                className={`p-1.5 rounded-xl border transition-colors ${
                  isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200 border-slate-200'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Scrollable Middle Area (Fills 100% Available Space) */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-4">
              
              {/* Student Services */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 block">
                  Student Services
                </span>

                <div className="space-y-1.5">
                  {mainFeatures.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-2xl text-left transition-all relative flex items-center justify-between border ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 border-indigo-500 font-bold'
                            : isDarkMode
                            ? 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700 text-slate-300'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 pl-1">
                          <div className={`p-2 rounded-xl border ${
                            isActive
                              ? 'bg-indigo-700 text-white border-indigo-400 shadow-xs'
                              : isDarkMode
                              ? 'bg-slate-950 border-slate-800 text-slate-400'
                              : 'bg-white border-slate-200 text-slate-600 shadow-xs'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          <div>
                            <p className={`text-xs font-bold ${isActive ? 'text-white' : ''}`}>
                              {item.label}
                            </p>
                            <p className={`text-[10px] mt-0.5 line-clamp-1 ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                              {item.desc}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {item.badge !== undefined && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full shadow-xs ${item.badgeColor}`}>
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Campus Facilities */}
              <div className={`space-y-1.5 pt-3 border-t ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`}>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 block">
                  Campus Facilities
                </span>

                <div className="space-y-1.5">
                  {adminFeatures.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-2xl text-left transition-all relative flex items-center justify-between border ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 border-indigo-500 font-bold'
                            : isDarkMode
                            ? 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700 text-slate-300'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 pl-1">
                          <div className={`p-2 rounded-xl border ${
                            isActive
                              ? 'bg-indigo-700 text-white border-indigo-400 shadow-xs'
                              : isDarkMode
                              ? 'bg-slate-950 border-slate-800 text-slate-400'
                              : 'bg-white border-slate-200 text-slate-600 shadow-xs'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          <div>
                            <p className={`text-xs font-bold ${isActive ? 'text-white' : ''}`}>
                              {item.label}
                            </p>
                            <p className={`text-[10px] mt-0.5 line-clamp-1 ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                              {item.desc}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {item.badge !== undefined && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full shadow-xs ${item.badgeColor}`}>
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* 3. Bottom Profile Footer (Fixed Height) */}
            <div className={`p-4 border-t flex items-center justify-between shrink-0 ${
              isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                  {userSession.name ? userSession.name[0] : 'U'}
                </div>
                <div className="truncate max-w-[130px]">
                  <p className="text-xs font-bold truncate">{userSession.name || 'User'}</p>
                  <p className="text-[10px] font-mono text-emerald-500 font-bold uppercase">
                    {role === 'warden' ? 'Chief Warden' : role === 'college_admin' ? 'Admin Desk' : 'Student'}
                  </p>
                </div>
              </div>

              <button
                onClick={onLogout}
                className={`p-2 rounded-xl border transition-colors ${
                  isDarkMode ? 'bg-slate-950 text-slate-400 hover:text-red-400 border-slate-800 hover:bg-red-950/40' : 'bg-white text-slate-500 hover:text-red-600 border-slate-200 hover:bg-red-50'
                }`}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};