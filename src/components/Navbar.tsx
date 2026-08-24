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
  ShieldCheck,
  School,
  QrCode,
  User,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Role, UserAuthSession } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: Role;
  userSession: UserAuthSession;
  onLogout: () => void;
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
  activeAlertCount = 0,
  bunkCount = 0,
  missedBiometricCount = 0,
  activeLeavePassCount = 0
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Categorized Navigation Items with Descriptions
  const mainFeatures = [
    {
      id: 'leave',
      label: 'Home Pass & Parent Alert',
      desc: 'Gate Pass, Night Leave & Outing',
      icon: FileText,
      badge: activeLeavePassCount > 0 ? activeLeavePassCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950',
      accent: 'border-amber-500/40 text-amber-400'
    },
    {
      id: 'mess',
      label: 'Mess Menu & Diet Schedule',
      desc: 'Weekly Breakfast, Lunch & Dinner',
      icon: UtensilsCrossed,
      accent: 'border-emerald-500/40 text-emerald-400'
    },
    {
      id: 'attendance',
      label: 'Biometric Attendance & Timing',
      desc: 'Evening Cutoff & Machine Sync',
      icon: Fingerprint,
      badge: missedBiometricCount > 0 ? missedBiometricCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
      accent: 'border-indigo-500/40 text-indigo-400'
    },
    {
      id: 'groups',
      label: 'Year-Wise Groups & Broadcast',
      desc: 'Batchmates Channel & Announcements',
      icon: Users,
      accent: 'border-purple-500/40 text-purple-400'
    }
  ];

  const adminFeatures = [
    {
      id: 'rooms',
      label: role === 'warden' || role === 'college_admin' ? 'Rooms & Student Manager' : 'Hostel Room Directory',
      desc: 'Capacity Setup & Floor Allotment',
      icon: Building2,
      accent: 'border-sky-500/40 text-sky-400'
    },
    {
      id: 'bunk',
      label: 'College Bunk Detection & Alert',
      desc: 'Class Sheet vs Biometric Cross-check',
      icon: School,
      badge: bunkCount > 0 ? bunkCount : undefined,
      badgeColor: 'bg-rose-600 text-white',
      accent: 'border-rose-500/40 text-rose-400'
    },
    {
      id: 'complaints',
      label: 'Maintenance Complaints',
      desc: 'Electrical, Plumbing & Wi-Fi Issues',
      icon: MessageSquareWarning,
      accent: 'border-teal-500/40 text-teal-400'
    },
    {
      id: 'alerts',
      label: 'Official Notices & Circulars',
      desc: 'Chief Warden Urgent Broadcasts',
      icon: AlertOctagon,
      badge: activeAlertCount > 0 ? activeAlertCount : undefined,
      badgeColor: 'bg-indigo-500 text-white',
      accent: 'border-blue-500/40 text-blue-400'
    }
  ];

  const allItems = [...mainFeatures, ...adminFeatures];
  const currentItem = allItems.find((item) => item.id === activeTab) || allItems[0];

  return (
    <>
      {/* 🟢 TOP HEADER BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: 3-Line Hamburger Trigger Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="px-3 py-2 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-slate-900 hover:from-indigo-900/80 hover:to-indigo-950 text-white border border-indigo-500/30 hover:border-indigo-400/60 transition-all shadow-lg flex items-center gap-2.5 group"
              title="Open Navigation Menu"
            >
              <div className="p-1 rounded-lg bg-indigo-600 text-white group-hover:scale-105 transition-transform shadow-md">
                <Menu className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-white">Menu</span>
            </button>

            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-600/30">
                H
              </div>
              <div>
                <h1 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
                  HostelHub Portal
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 text-indigo-300 border border-slate-800">
                    {currentItem.label}
                  </span>
                </h1>
              </div>
            </div>
          </div>

          {/* Right User Bar */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-semibold">{userSession.block || 'Hostel'} Block</span>
            </div>

            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-red-950/50 text-slate-300 hover:text-red-400 border border-slate-800 hover:border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* 🟢 PROFESSIONAL VERTICAL SIDEBAR DRAWER */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fadeIn"
          />

          {/* Vertical Menu Container */}
          <div className="relative w-84 max-w-[88vw] bg-slate-950 border-r border-slate-800/90 shadow-2xl flex flex-col justify-between z-10 animate-slideIn">
            <div>
              {/* Sidebar Header */}
              <div className="p-5 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/90 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-600/30 border border-indigo-400/30">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wide">HOSTEL DASHBOARD</h3>
                    <p className="text-[10px] text-indigo-400 font-semibold">Campus Management Suite</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl border border-transparent hover:border-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Navigation Boxed Cards */}
              <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-160px)]">
                
                {/* SECTION 1: CORE STUDENT SERVICES */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1 block">
                    Core Student Services
                  </span>

                  <div className="space-y-2">
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
                          className={`w-full p-3 rounded-2xl text-left transition-all relative group flex items-center justify-between border ${
                            isActive
                              ? 'bg-gradient-to-r from-indigo-950/90 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-600/20 translate-x-1'
                              : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700 hover:translate-x-1'
                          }`}
                        >
                          {/* Active Indicator Strip */}
                          {isActive && (
                            <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-indigo-500 rounded-r-full shadow-md shadow-indigo-500" />
                          )}

                          <div className="flex items-center gap-3 pl-1">
                            <div
                              className={`p-2.5 rounded-xl border shadow-inner ${
                                isActive
                                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 group-hover:text-white group-hover:border-slate-700'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>

                            <div>
                              <p className={`text-xs font-extrabold ${isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                                {item.label}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                                {item.desc}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {item.badge !== undefined && (
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full shadow-md ${item.badgeColor}`}
                              >
                                {item.badge}
                              </span>
                            )}
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-indigo-400 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 2: ADMINISTRATIVE & FACILITIES */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1 block">
                    Hostel & Campus Facilities
                  </span>

                  <div className="space-y-2">
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
                          className={`w-full p-3 rounded-2xl text-left transition-all relative group flex items-center justify-between border ${
                            isActive
                              ? 'bg-gradient-to-r from-indigo-950/90 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-600/20 translate-x-1'
                              : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700 hover:translate-x-1'
                          }`}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-indigo-500 rounded-r-full shadow-md shadow-indigo-500" />
                          )}

                          <div className="flex items-center gap-3 pl-1">
                            <div
                              className={`p-2.5 rounded-xl border shadow-inner ${
                                isActive
                                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 group-hover:text-white group-hover:border-slate-700'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>

                            <div>
                              <p className={`text-xs font-extrabold ${isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                                {item.label}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                                {item.desc}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {item.badge !== undefined && (
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full shadow-md ${item.badgeColor}`}
                              >
                                {item.badge}
                              </span>
                            )}
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-indigo-400 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* User Profile Card at Bottom */}
            <div className="p-4 bg-slate-950 border-t border-slate-800/90 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-black shadow-md">
                  {userSession.name[0]}
                </div>
                <div className="truncate max-w-[140px]">
                  <p className="text-xs font-bold text-white truncate">{userSession.name}</p>
                  <p className="text-[10px] font-mono text-emerald-400 font-semibold uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {role === 'warden' ? 'Chief Warden' : role === 'college_admin' ? 'Admin Desk' : 'Student'}
                  </p>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-2.5 bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-400 rounded-xl border border-slate-800 hover:border-red-500/40 transition-colors"
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