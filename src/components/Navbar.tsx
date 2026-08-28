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
      {/* Top Floating Glassmorphism Navbar */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-300 ${
        isDarkMode
          ? 'bg-slate-950/80 border-slate-800/80 text-white shadow-2xl shadow-black/40'
          : 'bg-white/85 border-slate-200/90 text-slate-900 shadow-sm shadow-slate-200/60'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Hamburger & Brand */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`p-2.5 rounded-2xl border transition-all flex items-center gap-2 group active:scale-95 ${
                isDarkMode
                  ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border-slate-800 hover:border-indigo-500/50 shadow-inner'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
              }`}
              title="Open Navigation Drawer"
            >
              <Menu className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold tracking-tight hidden sm:inline">Menu</span>
            </button>

            <div className={`flex items-center gap-3 pl-3 border-l ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-600/30">
                H
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black tracking-tight">HostelHub</span>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    isDarkMode
                      ? 'bg-slate-900 text-indigo-300 border-slate-800'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>
                    {currentItem.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            
            {/* Theme Toggle Pill */}
            <button
              onClick={onToggleTheme}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 ${
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

            {/* Block Tag */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
              isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold">{userSession.block || 'Hostel'} Block</span>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
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

      {/* Modern Slide-Over Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
          />

          <div className={`relative w-84 max-w-[85vw] border-r shadow-2xl flex flex-col justify-between z-10 animate-slideIn transition-colors ${
            isDarkMode ? 'bg-slate-950 border-slate-800/80 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div>
              {/* Drawer Header */}
              <div className={`p-4 border-b flex items-center justify-between ${
                isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/80 border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-600/30">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black tracking-wider uppercase">Hostel Hub</h3>
                    <p className="text-[10px] text-indigo-500 font-semibold">Campus Operations</p>
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

              {/* Navigation Items Group */}
              <div className="p-3.5 space-y-4 overflow-y-auto max-h-[calc(100vh-150px)]">
                
                {/* Core Modules */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 block">
                    Student Services
                  </span>

                  <div className="space-y-1">
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
                          className={`w-full p-2.5 rounded-2xl text-left transition-all relative group flex items-center justify-between border ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 border-indigo-500 font-bold'
                              : isDarkMode
                              ? 'bg-slate-900/40 hover:bg-slate-900 border-slate-800/60 hover:border-slate-700 text-slate-300'
                              : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200/80 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3 pl-1">
                            <div className={`p-2 rounded-xl border ${
                              isActive
                                ? 'bg-indigo-700 text-white border-indigo-400 shadow-xs'
                                : isDarkMode
                                ? 'bg-slate-950 border-slate-800 text-slate-400'
                                : 'bg-white border-slate-200 text-slate-600 shadow-2xs'
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

                {/* Facility & Administrative Control */}
                <div className={`space-y-1.5 pt-3 border-t ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`}>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 block">
                    Campus Facilities
                  </span>

                  <div className="space-y-1">
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
                          className={`w-full p-2.5 rounded-2xl text-left transition-all relative group flex items-center justify-between border ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 border-indigo-500 font-bold'
                              : isDarkMode
                              ? 'bg-slate-900/40 hover:bg-slate-900 border-slate-800/60 hover:border-slate-700 text-slate-300'
                              : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200/80 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3 pl-1">
                            <div className={`p-2 rounded-xl border ${
                              isActive
                                ? 'bg-indigo-700 text-white border-indigo-400 shadow-xs'
                                : isDarkMode
                                ? 'bg-slate-950 border-slate-800 text-slate-400'
                                : 'bg-white border-slate-200 text-slate-600 shadow-2xs'
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
            </div>

            {/* Bottom Profile Footer */}
            <div className={`p-4 border-t flex items-center justify-between ${
              isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50/80 border-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                  {userSession.name[0]}
                </div>
                <div className="truncate max-w-[130px]">
                  <p className="text-xs font-bold truncate">{userSession.name}</p>
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