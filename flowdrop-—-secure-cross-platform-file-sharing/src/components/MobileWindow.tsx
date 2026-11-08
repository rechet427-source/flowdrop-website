import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  ArrowLeftRight, 
  Clock, 
  Settings as SettingsIcon, 
  Upload, 
  Download, 
  Plus, 
  Laptop, 
  Smartphone, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Scan, 
  Trash2, 
  Eye, 
  Wifi, 
  Battery, 
  Signal, 
  ShieldCheck, 
  Film, 
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { Logo } from './Logo';
import { TransferEngine } from '../lib/transferEngine';
import { ActiveSession, DiscoveredDevice, HistoryRecord } from '../types';
import { formatBytes, formatEta, formatSpeed } from '../lib/crypto';

interface MobileWindowProps {
  engine: TransferEngine;
  onOpenScanner: () => void;
  onPreviewItem: (item: any) => void;
  isStandalone?: boolean;
}

export const MobileWindow: React.FC<MobileWindowProps> = ({
  engine,
  onOpenScanner,
  onPreviewItem,
  isStandalone = false
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'transfers' | 'history' | 'settings'>('home');
  const [activeSessionViewId, setActiveSessionViewId] = useState<string | null>(null);

  const [sessions, setSessions] = useState<ActiveSession[]>(engine.getActiveSessions());
  const [history, setHistory] = useState<HistoryRecord[]>(engine.getHistory());

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const addFilesToActiveInputRef = useRef<HTMLInputElement | null>(null);

  // Settings
  const [deviceName, setDeviceName] = useState<string>('My Phone (Android)');

  // Sample curated recent files matching the mockup imagery
  const sampleRecentFiles = [
    {
      name: 'Vacation.mp4',
      size: 1.2 * 1024 * 1024 * 1024,
      type: 'video/mp4',
      preview: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&q=80'
    },
    {
      name: 'Beach_Coast.jpg',
      size: 8.4 * 1024 * 1024,
      type: 'image/jpeg',
      preview: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&q=80'
    },
    {
      name: 'Flower_Macro.jpg',
      size: 6.2 * 1024 * 1024,
      type: 'image/jpeg',
      preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80'
    }
  ];

  // Subscribe to engine
  useEffect(() => {
    const unsubscribe = engine.subscribe(() => {
      const active = engine.getActiveSessions();
      setSessions([...active]);
      setHistory([...engine.getHistory()]);

      // If viewing a session that finished/cancelled, keep viewing or adapt
      if (activeSessionViewId && !active.some(s => s.sessionId === activeSessionViewId)) {
        // stay or clear
      }
    });
    return () => {
      unsubscribe();
    };
  }, [engine, activeSessionViewId]);

  const activeSendingSession = sessions.find(s => s.direction === 'send' && (s.state === 'sending' || s.state === 'queued'));

  const handleFileSelection = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const peer = { id: 'dev-pc-2', name: 'Work PC', platform: 'windows' as const };
    engine.createSendSession(peer, Array.from(files));
    setActiveTab('transfers');
  };

  const handleAddFilesToActiveSession = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const targetSession = sessions.find(s => s.sessionId === activeSessionViewId) || activeSendingSession;
    if (targetSession) {
      engine.addFilesToActiveSession(targetSession.sessionId, Array.from(files));
    }
  };

  const currentViewSession = sessions.find(s => s.sessionId === activeSessionViewId) || activeSendingSession;

  return (
    <div className={`flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans select-none overflow-hidden ${
      isStandalone ? 'w-full h-screen max-w-md mx-auto shadow-2xl' : 'w-full h-full max-w-[360px] mx-auto rounded-[40px] shadow-2xl border-[6px] border-slate-800 dark:border-slate-800'
    }`}>
      {/* Hidden file pickers */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        className="hidden"
        onChange={(e) => handleFileSelection(e.target.files)}
      />
      <input
        type="file"
        ref={addFilesToActiveInputRef}
        multiple
        className="hidden"
        onChange={(e) => handleAddFilesToActiveSession(e.target.files)}
      />

      {/* Android Status Bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
        <span>10:24</span>
        {/* Notch / Camera cutout */}
        <div className="w-4 h-4 rounded-full bg-slate-800 dark:bg-slate-700 mx-auto" />
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* View Switch: Active Transfer Full-Screen View vs Normal Tabs */}
      {currentViewSession && activeTab === 'transfers' ? (
        /* Pixel-matched second phone screen: "Sending 3 files" */
        <div className="flex-1 flex flex-col p-5 overflow-y-auto">
          {/* Top nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setActiveTab('home')}
              className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Pill status badge matching mockup */}
            <div className="px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 shadow-sm">
              <Upload className="w-3 h-3" />
              <span>Sending…</span>
            </div>

            <div className="w-8" />
          </div>

          {/* Media Thumbnails Row matching mockup */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto py-2">
            {currentViewSession.files.map((file, idx) => (
              <div
                key={file.id}
                className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                {file.previewUrl ? (
                  <img src={file.previewUrl} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-mono">
                    <FileText className="w-6 h-6 text-blue-500" />
                  </div>
                )}
                <span className="absolute bottom-1 right-1 text-[9px] bg-black/60 text-white font-mono px-1 rounded">
                  {file.progress}%
                </span>
              </div>
            ))}

            {/* Add more button in the horizontal strip matching mockup */}
            <button
              onClick={() => addFilesToActiveInputRef.current?.click()}
              className="w-20 h-20 rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex flex-col items-center justify-center shrink-0 hover:bg-blue-100/50 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          {/* Session Summary matching mockup: "Sending 3 files", "1.68 GB • 3.2 MB/s" */}
          <div className="space-y-1 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Sending {currentViewSession.files.length} files
              </h2>
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                {currentViewSession.progress}%
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {formatBytes(currentViewSession.totalBytes)} • {formatSpeed(currentViewSession.speed || 3.2 * 1024 * 1024)}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-8">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${currentViewSession.progress}%` }}
            />
          </div>

          {/* Actions: Add files & Cancel matching mockup */}
          <div className="mt-auto space-y-3">
            <button
              onClick={() => addFilesToActiveInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-2xl bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add files</span>
            </button>

            <button
              onClick={() => engine.cancelSession(currentViewSession.sessionId)}
              className="w-full py-3 px-4 rounded-2xl border border-rose-300 dark:border-rose-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        /* Normal Mobile Tabs */
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Mobile Header: Logo + Settings Icon */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800/60">
            <Logo size="sm" showText={true} />
            <button
              onClick={() => setActiveTab('settings')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Tab 1: Home View matching mockup */}
          {activeTab === 'home' && (
            <div className="p-5 space-y-5 flex-1 overflow-y-auto">
              {/* Primary Cards: Send and Receive */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                >
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="font-bold text-sm">Send</span>
                </button>

                <button
                  onClick={onOpenScanner}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 text-slate-800 dark:text-slate-100 shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-6 h-6 mb-2 text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-sm">Receive</span>
                </button>
              </div>

              {/* Nearby Devices Section matching mockup */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Nearby devices</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      const peer = { id: 'dev-pc-2', name: 'Work PC', platform: 'windows' as const };
                      engine.createSendSession(peer, [sampleRecentFiles[0]]);
                      setActiveTab('transfers');
                    }}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center hover:border-blue-400 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-1 text-slate-700 dark:text-slate-300">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">Work PC</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-slate-400">Windows</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      const peer = { id: 'dev-phone-1', name: 'My Phone', platform: 'android' as const };
                      engine.createSendSession(peer, [sampleRecentFiles[1]]);
                      setActiveTab('transfers');
                    }}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center hover:border-blue-400 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-1 text-slate-700 dark:text-slate-300">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">Android</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-slate-400">Online</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Files Section matching mockup */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Recent files</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {sampleRecentFiles.map((file, i) => (
                    <div
                      key={i}
                      onClick={() => onPreviewItem(file)}
                      className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Transfers List */}
          {activeTab === 'transfers' && (
            <div className="p-5 space-y-4 flex-1 overflow-y-auto">
              <h3 className="text-base font-bold">Active Transfers</h3>
              {sessions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  No active transfers. Tap Send to transfer files.
                </div>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s.sessionId}
                    onClick={() => setActiveSessionViewId(s.sessionId)}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{s.files.length} files • {s.peer.name}</span>
                      <span className="text-xs font-mono font-bold text-blue-600">{s.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${s.progress}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: History */}
          {activeTab === 'history' && (
            <div className="p-5 space-y-3 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold">Transfer History</h3>
                {history.length > 0 && (
                  <button onClick={() => engine.clearHistory()} className="text-xs text-rose-500 hover:underline">
                    Clear
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  No history recorded yet.
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {item.state} • {formatBytes(item.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => onPreviewItem(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 4: Settings */}
          {activeTab === 'settings' && (
            <div className="p-5 space-y-4 flex-1 overflow-y-auto text-xs">
              <h3 className="text-base font-bold">Settings</h3>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div>
                  <label className="block font-semibold mb-1">Device Name</label>
                  <input
                    type="text"
                    value={deviceName}
                    onChange={(e) => {
                      setDeviceName(e.target.value);
                      engine.setDeviceInfo('dev-phone-main', e.target.value, 'android');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="font-semibold">Platform</p>
                  <p className="text-slate-400">Android 14 (Tauri 2 Native)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Navigation Bar matching mockup */}
      <nav className="flex items-center justify-around py-3 px-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <button
          onClick={() => {
            setActiveSessionViewId(null);
            setActiveTab('home');
          }}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'home' && !activeSessionViewId
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            setActiveTab('transfers');
          }}
          className={`relative flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'transfers'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ArrowLeftRight className="w-5 h-5" />
          {sessions.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white font-mono text-[9px] flex items-center justify-center font-bold">
              {sessions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveSessionViewId(null);
            setActiveTab('history');
          }}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'history'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Clock className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            setActiveSessionViewId(null);
            setActiveTab('settings');
          }}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'settings'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </nav>

      {/* Android Gesture Bar */}
      <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2 shrink-0" />
    </div>
  );
};
