import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Trash2,
  Send,
  Building,
  Info,
  Clock
} from 'lucide-react';
import { AlertNotice, BlockName, Role } from '../types';

interface AlertsSectionProps {
  alerts: AlertNotice[];
  onAddAlert: (newAlert: Omit<AlertNotice, 'id' | 'timestamp' | 'active'>) => void;
  onToggleAlertStatus: (id: string) => void;
  role: Role;
}

export const AlertsSection: React.FC<AlertsSectionProps> = ({
  alerts,
  onAddAlert,
  onToggleAlertStatus,
  role
}) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'Urgent' | 'Mess' | 'Maintenance' | 'General'>('Urgent');
  const [targetBlock, setTargetBlock] = useState<BlockName | 'All'>('All');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    onAddAlert({
      title,
      message,
      category,
      targetBlock,
      createdBy: role === 'warden' ? 'Chief Warden Office' : 'Hostel Prefect'
    });

    setTitle('');
    setMessage('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                <Bell className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white">Hostel Emergency & Notice Broadcast</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Official notifications for water supply, power outages, mess timing changes & emergency alerts.
            </p>
          </div>

          {role === 'warden' && (
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              Broadcast Emergency Alert
            </button>
          )}
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-4">
        {alerts.map((notice) => {
          const isUrgent = notice.category === 'Urgent';
          const isMess = notice.category === 'Mess';

          return (
            <div
              key={notice.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-lg transition-all ${
                isUrgent
                  ? 'border-red-500/50 bg-gradient-to-r from-red-950/20 via-slate-900 to-slate-900'
                  : isMess
                  ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isUrgent
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                          : isMess
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      }`}
                    >
                      {notice.category} Notice
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      Target: {notice.targetBlock === 'All' ? 'All Hostel Blocks' : `${notice.targetBlock} Block`}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-2">{notice.title}</h3>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notice.message}</p>

                  <div className="mt-3 flex items-center space-x-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {notice.timestamp}
                    </span>
                    <span>•</span>
                    <span>Issued by: {notice.createdBy}</span>
                  </div>
                </div>

                {role === 'warden' && (
                  <button
                    onClick={() => onToggleAlertStatus(notice.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold self-start transition-colors ${
                      notice.active
                        ? 'bg-slate-800 text-slate-400 hover:text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {notice.active ? 'Dismiss / Archive' : 'Reactivate'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Warden New Alert Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-red-400" />
              Broadcast Urgent Emergency Alert
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Send instant notice banner to all hostellers in Tagore, Tilak & Subhash blocks.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alert Title:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 💧 Emergency Water Maintenance at 3 PM"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Urgent">🚨 Urgent Emergency</option>
                    <option value="Mess">🍲 Mess Update</option>
                    <option value="Maintenance">⚡ Maintenance Cut</option>
                    <option value="General">📢 General Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Block:</label>
                  <select
                    value={targetBlock}
                    onChange={(e) => setTargetBlock(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="All">All Hostel Blocks</option>
                    <option value="Tagore">Tagore Block Only</option>
                    <option value="Tilak">Tilak Block Only</option>
                    <option value="Subhash">Subhash Block Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notice Message:</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Type clear instructions for students..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg"
                >
                  Broadcast Alert Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
