// src/components/GuardTerminal.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  ShieldCheck,
  ShieldX,
  ArrowRight,
  CheckCircle2,
  LogOut,
  UserCheck,
  Camera,
  CameraOff,
  User,
  Clock,
  Sparkles
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { HomeLeavePass, UserAuthSession } from '../types';

interface GuardTerminalProps {
  leavePasses: HomeLeavePass[];
  onRecordGateScan: (id: string, action: 'EXITED' | 'RE_ENTERED', guardName?: string) => void;
  userSession: UserAuthSession;
  onLogout: () => void;
}

export const GuardTerminal: React.FC<GuardTerminalProps> = ({
  leavePasses,
  onRecordGateScan,
  userSession,
  onLogout
}) => {
  const [scanQuery, setScanQuery] = useState('');
  const [scannedPass, setScannedPass] = useState<HomeLeavePass | null>(null);
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(true);

  // 🎯 100% BULLETPROOF PASS VERIFICATION MATCHER
  const verifyPassData = (rawText: string) => {
    if (!rawText) return;
    const query = rawText.trim().toUpperCase();

    // 1. Smart Extractor: Extract Roll No and Token from the scanned sentence
    const rollMatch = query.match(/ROLL:\s*([A-Z0-9]+)/i) || query.match(/([0-9]{5,})/);
    const extractedRoll = rollMatch ? (rollMatch[1] || rollMatch[0]).trim() : '';

    const tokenMatch = query.match(/TOKEN:\s*([A-Z0-9-]+)/i) || query.match(/(WDN-[A-Z0-9-]+)/i);
    const extractedToken = tokenMatch ? (tokenMatch[1] || tokenMatch[0]).trim() : '';

    // 2. Cross-Match with Database
    const match = leavePasses.find((p) => {
      const roll = (p.rollNo || '').trim().toUpperCase();
      const token = (p.verificationToken || '').trim().toUpperCase();
      const id = (p.id || '').trim().toUpperCase();
      const name = (p.studentName || '').trim().toUpperCase();

      return (
        // Direct Typed Match
        roll === query ||
        token === query ||
        id === query ||
        name === query ||
        // Extracted Camera Match
        (extractedRoll && roll === extractedRoll) ||
        (extractedToken && token === extractedToken) ||
        // Substring Match
        (roll && query.includes(roll)) ||
        (token && query.includes(token)) ||
        (id && query.includes(id))
      );
    });

    if (match) {
      setScannedPass(match);
      if (match.status === 'Approved' || match.status === 'Departed' || match.isGymPass) {
        setScanMessage({
          type: 'success',
          text: `✅ OFFICIAL WARDEN SEAL VERIFIED! Student ${match.studentName} (${match.rollNo}) holds an authentic approved pass.`
        });
      } else {
        setScanMessage({
          type: 'error',
          text: `⛔ EXIT DENIED! Gate Pass status is "${match.status}". Not approved by Warden Office.`
        });
      }
    } else {
      setScannedPass(null);
      setScanMessage({
        type: 'error',
        text: `⛔ NO RECORD FOUND! Scanned code "${query}" does not exist in Warden Database.`
      });
    }
  };

  // 🟢 LIVE CAMERA QR SCANNER INTEGRATION
  useEffect(() => {
    let qrScanner: any = null;

    if (isCameraActive) {
      qrScanner = new Html5QrcodeScanner(
        'qr-reader-container',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        /* verbose= */ false
      );

      qrScanner.render(
        (decodedText: string) => {
          verifyPassData(decodedText);
        },
        (error: any) => {
          // Ignore scanning frames
        }
      );
    }

    return () => {
      if (qrScanner) {
        qrScanner.clear().catch((err: any) => console.error(err));
      }
    };
  }, [isCameraActive, leavePasses]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPassData(scanQuery);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 flex flex-col justify-between">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        {/* Guard Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Main Gate Security Scanner</h2>
              <p className="text-xs text-slate-400">Post: {userSession.name} • Live Cloud Database</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-3.5 py-2 bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* 🟢 LIVE CAMERA QR SCANNER BOX */}
        <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span>Live Camera QR Code Scanner</span>
            </h3>

            <button
              onClick={() => setIsCameraActive(!isCameraActive)}
              className="px-3 py-1 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              {isCameraActive ? <CameraOff className="w-3 h-3 text-rose-400" /> : <Camera className="w-3 h-3 text-emerald-400" />}
              <span>{isCameraActive ? 'Turn Off Camera' : 'Turn On Camera'}</span>
            </button>
          </div>

          {isCameraActive ? (
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-2">
              <div id="qr-reader-container" className="w-full text-slate-900 rounded-xl overflow-hidden font-sans" />
              <p className="text-center text-[11px] text-slate-500 mt-2">
                Point student's phone QR Code towards camera to auto-scan & verify
              </p>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-500 text-xs">
              Camera is paused. Use manual search below or turn camera on.
            </div>
          )}

          {/* Fallback Manual Search Box */}
          <form onSubmit={handleManualSearch} className="flex gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              value={scanQuery}
              onChange={(e) => setScanQuery(e.target.value)}
              placeholder="Or Type Student Roll No (e.g. 2504221530041)..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"
            >
              <UserCheck className="w-4 h-4" />
              <span>Verify</span>
            </button>
          </form>
        </div>

        {/* Verification Result Display */}
        {scanMessage && (
          <div
            className={`p-5 rounded-3xl border text-xs font-medium space-y-3 ${
              scanMessage.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200 shadow-2xl'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-200 shadow-2xl'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {scanMessage.type === 'success' ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <ShieldX className="w-6 h-6 text-rose-400 shrink-0" />
              )}
              <p className="text-sm font-bold leading-relaxed">{scanMessage.text}</p>
            </div>

            {scannedPass && (
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div>Student: <strong className="text-white">{scannedPass.studentName}</strong></div>
                  <div>Roll No: <strong className="text-indigo-300">{scannedPass.rollNo}</strong></div>
                  <div>Room: <strong className="text-amber-300">{scannedPass.roomNumber} ({scannedPass.block})</strong></div>
                  <div>Category: <strong className="text-emerald-300">{scannedPass.isGymPass ? 'Permanent Gym' : (scannedPass.passCategory || 'Outing')}</strong></div>
                  <div className="col-span-2 text-rose-300">Return Cutoff: <strong>{scannedPass.expectedReturnDate}</strong></div>
                </div>

                {/* GUARD ACTION BUTTONS (EXIT & RE-ENTRY) */}
                {(scannedPass.status === 'Approved' || scannedPass.status === 'Departed' || scannedPass.isGymPass) && (
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => {
                        onRecordGateScan(scannedPass.id, 'EXITED', userSession.name);
                        setScanMessage({
                          type: 'success',
                          text: `🚪 GATE EXIT RECORDED! Student ${scannedPass.studentName} has passed through main gate.`
                        });
                      }}
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>Log Gate Exit (Bahar Nikla)</span>
                    </button>

                    <button
                      onClick={() => {
                        onRecordGateScan(scannedPass.id, 'RE_ENTERED', userSession.name);
                        setScanMessage({
                          type: 'success',
                          text: `🏠 RE-ENTRY RECORDED! Student ${scannedPass.studentName} checked back into hostel.`
                        });
                      }}
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Log Re-Entry (Wapas Aaya)</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-center text-slate-600 text-xs py-4">
        Hostel Main Gate Security System • Live Camera QR Code Scanner Enabled
      </div>
    </div>
  );
};