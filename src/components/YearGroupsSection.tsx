import React, { useState } from 'react';
import {
  Users,
  Lock,
  MessageSquare,
  Send,
  ShieldCheck,
  AlertTriangle,
  Bot,
  User,
  Clock,
  Sparkles,
  CheckCircle2,
  Bell,
  School
} from 'lucide-react';
import { YearGroupMessage, UserAuthSession, Role } from '../types';

interface YearGroupsSectionProps {
  messages: YearGroupMessage[];
  onSendMessage: (yearGroup: 1 | 2 | 3 | 4, text: string) => void;
  userSession: UserAuthSession;
  role: Role;
}

export const YearGroupsSection: React.FC<YearGroupsSectionProps> = ({
  messages,
  onSendMessage,
  userSession,
  role
}) => {
  const studentYear = (userSession.year && userSession.year >= 1 && userSession.year <= 4
    ? userSession.year
    : 1) as 1 | 2 | 3 | 4;

  // Student is locked to their own year; Warden/Admin can switch
  const [selectedGroup, setSelectedGroup] = useState<1 | 2 | 3 | 4>(
    role === 'student' ? studentYear : 1
  );

  const [inputMessage, setInputMessage] = useState('');

  const yearTitles = {
    1: '1st Year Freshers Group',
    2: '2nd Year Sophomores Group',
    3: '3rd Year Juniors Group',
    4: '4th Year Seniors Group'
  };

  const yearTimings = {
    1: 'Mess: 07:00 PM - 08:15 PM • Biometric Cutoff: 08:30 PM',
    2: 'Mess: 08:15 PM - 09:30 PM • Biometric Cutoff: 09:30 PM',
    3: 'Mess: 08:15 PM - 09:30 PM • Biometric Cutoff: 09:30 PM',
    4: 'Mess: 08:15 PM - 09:30 PM • Biometric Cutoff: 09:30 PM'
  };

  // Only Warden can post
  const canPostMessage = role === 'warden';

  // Active messages (Students see only their year)
  const activeYearGroup = role === 'student' ? studentYear : selectedGroup;
  const currentGroupMessages = messages.filter((m) => m.yearGroup === activeYearGroup);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !canPostMessage) return;
    onSendMessage(activeYearGroup, inputMessage.trim());
    setInputMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
              <Users className="w-3.5 h-3.5" />
              {role === 'student' ? `${studentYear}${studentYear === 1 ? 'st' : studentYear === 2 ? 'nd' : studentYear === 3 ? 'rd' : 'th'} Year Community` : 'Hostel Year Groups Hub'}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {role === 'student'
                ? yearTitles[studentYear]
                : 'Hostel Academic Year Groups'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {role === 'student'
                ? `Official notices and missed biometric attendance updates for ${studentYear}${studentYear === 1 ? 'st' : studentYear === 2 ? 'nd' : studentYear === 3 ? 'rd' : 'th'} Year.`
                : 'Missed biometric notices are routed automatically to respective year groups.'}
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              {role === 'college_admin' ? (
                <School className="w-5 h-5 text-amber-400" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-white">Your Portal Role:</p>
              <p className="text-xs text-indigo-400 font-semibold">
                {role === 'warden'
                  ? 'Chief Warden Office (Full Posting Access)'
                  : role === 'college_admin'
                  ? 'Administration (View-Only Master Access)'
                  : `${studentYear} Year Student Community`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 Year Selection Tabs: ONLY FOR WARDEN & ADMIN (Hidden for Students) */}
      {(role === 'warden' || role === 'college_admin') && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([1, 2, 3, 4] as const).map((yr) => {
            const isSelected = selectedGroup === yr;

            return (
              <button
                key={yr}
                onClick={() => setSelectedGroup(yr)}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-extrabold text-white">
                    {yr === 1 ? '1st Year' : yr === 2 ? '2nd Year' : yr === 3 ? '3rd Year' : '4th Year'}
                  </span>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
                  {yr === 1 ? 'Freshers Community' : 'Senior Community'}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Group Chat Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
        {/* Group Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {yearTitles[activeYearGroup]}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                <Clock className="w-3 h-3 inline mr-1 text-indigo-400" />
                {yearTimings[activeYearGroup]}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            Total Notices: <span className="font-bold text-white">{currentGroupMessages.length}</span>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[450px]">
          {currentGroupMessages.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-semibold">No notices or missed attendance records in this group.</p>
              <p className="text-xs">Missed biometric logs for {yearTitles[activeYearGroup]} will appear here.</p>
            </div>
          ) : (
            currentGroupMessages.map((msg) => {
              const isSystem = msg.senderRole === 'System Automation' || msg.isAutomatedMissedNotice;
              const isWarden = msg.senderRole === 'warden';

              return (
                <div
                  key={msg.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isSystem
                      ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                      : isWarden
                      ? 'bg-indigo-950/30 border-indigo-500/40 text-indigo-100'
                      : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isSystem ? (
                        <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      ) : isWarden ? (
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <span className="text-xs font-bold text-white">{msg.senderName}</span>

                      {isSystem && (
                        <span className="text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full">
                          Biometric Missed Alert
                        </span>
                      )}

                      {isWarden && (
                        <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                          Chief Warden Office
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>

                  {msg.flaggedStudentName && (
                    <div className="mt-2.5 pt-2 border-t border-rose-500/20 flex flex-wrap items-center justify-between text-[11px] text-rose-300 font-mono gap-1">
                      <span>
                        👤 Student: <strong>{msg.flaggedStudentName}</strong> | 🏢 Room: <strong>{msg.flaggedStudentRoom || 'Hostel'}</strong>
                      </span>
                      <span className="bg-rose-500/20 px-2 py-0.5 rounded text-rose-400 font-bold">Report to Warden</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Input Message Form */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          {role === 'warden' ? (
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Post official announcement to ${yearTitles[activeYearGroup]}...`}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Post Notice</span>
              </button>
            </form>
          ) : (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3 text-xs text-slate-400">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Official Notice Board:</strong> {role === 'college_admin' ? 'Administration has View-Only access.' : 'Only Chief Warden Office can post announcements here.'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};