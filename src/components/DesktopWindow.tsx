import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  ArrowLeftRight, 
  Clock, 
  Settings as SettingsIcon, 
  Upload, 
  Download, 
  FolderPlus, 
  Plus, 
  Smartphone, 
  Laptop, 
  Check, 
  X, 
  Copy, 
  RefreshCw, 
  Trash2, 
  Eye, 
  ShieldCheck, 
  Wifi, 
  Globe, 
  HardDrive,
  FileText,
  Image as ImageIcon,
  Film,
  Archive,
  Scan,
  QrCode
} from 'lucide-react';
import QRCode from 'qrcode';
import { Logo } from './Logo';
import { TransferEngine } from '../lib/transferEngine';
import { ActiveSession, DiscoveredDevice, FileTransferItem, HistoryRecord, Platform } from '../types';
import { formatBytes, formatEta, formatSpeed } from '../lib/crypto';

interface DesktopWindowProps {
  engine: TransferEngine;
  onOpenScanner: () => void;
  onPreviewItem: (item: any) => void;
  isStandalone?: boolean;
}

export const DesktopWindow: React.FC<DesktopWindowProps> = ({
  engine,
  onOpenScanner,
  onPreviewItem,
  isStandalone = false
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'transfers' | 'history' | 'settings'>('home');
  const [pairingMode, setPairingMode] = useState<'qr' | 'pin'>('qr');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [pinCode, setPinCode] = useState<string>('647291');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [selectedPeer, setSelectedPeer] = useState<string>('My Phone');

  // Mobile sub-view on Home: allows toggling between Dropzone/Files and QR code pairing easily
  const [mobileHomeView, setMobileHomeView] = useState<'share' | 'pair'>('share');

  // Top "Sent" indicator pill: stateful, dismissible, auto-hides after 2 seconds
  const [recentStatusNotification, setRecentStatusNotification] = useState<{
    text: string;
    type: 'success' | 'cancelled';
  } | null>(null);

  // Active sessions & history from engine
  const [sessions, setSessions] = useState<ActiveSession[]>(engine.getActiveSessions());
  const [history, setHistory] = useState<HistoryRecord[]>(engine.getHistory());
  const [historyFilter, setHistoryFilter] = useState<'all' | 'Sent' | 'Received' | 'Cancelled'>('all');

  // Input refs for file & folder picking
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const activeSessionFileInputRef = useRef<HTMLInputElement | null>(null);

  // Settings state
  const [deviceName, setDeviceName] = useState<string>('Work PC (Windows)');
  const [downloadFolder, setDownloadFolder] = useState<string>('C:\\Users\\User\\Downloads\\FlowDrop');
  const [encryptionEnabled, setEncryptionEnabled] = useState<boolean>(true);
  const [autoAcceptTrusted, setAutoAcceptTrusted] = useState<boolean>(false);

  // Nearby devices
  const nearbyDevices: DiscoveredDevice[] = [
    { id: 'dev-phone-1', name: 'My Phone', platform: 'android', ip: '192.168.1.104', mode: 'local', lastSeen: Date.now() },
    { id: 'dev-phone-2', name: "Emma's Phone", platform: 'android', ip: '192.168.1.112', mode: 'local', lastSeen: Date.now() },
    { id: 'dev-pc-2', name: 'Work PC', platform: 'windows', ip: '192.168.1.145', mode: 'local', lastSeen: Date.now() }
  ];

  // Subscribe to engine updates
  useEffect(() => {
    const unsubscribe = engine.subscribe(() => {
      const active = engine.getActiveSessions();
      setSessions([...active]);
      setHistory([...engine.getHistory()]);

      // Check if a session just completed
      const justFinished = active.find(s => s.state === 'completed');
      if (justFinished) {
        setRecentStatusNotification({ text: 'Sent', type: 'success' });
      }
    });
    return () => {
      unsubscribe();
    };
  }, [engine]);

  // Auto-dismiss top status notification after 2 seconds
  useEffect(() => {
    if (!recentStatusNotification) return;
    const timer = setTimeout(() => {
      setRecentStatusNotification(null);
    }, 2000);
    return () => clearTimeout(timer);
  }, [recentStatusNotification]);

  // Generate pairing QR code with FlowDrop styling
  useEffect(() => {
    generatePairingCode();
  }, []);

  const generatePairingCode = async () => {
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    setPinCode(randomPin);
    const payload = JSON.stringify({
      app: 'flowdrop',
      v: '2.4.0',
      pin: randomPin,
      id: 'pc-windows-main',
      name: deviceName,
      platform: 'windows',
      exp: Date.now() + 600000
    });

    try {
      const url = await QRCode.toDataURL(payload, {
        width: 320,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error('QR code generation error:', err);
    }
  };

  const copyPin = () => {
    navigator.clipboard.writeText(pinCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Handle files selected via file input or drag-and-drop
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);

    const activeSession = sessions.find(s => s.state === 'sending' || s.state === 'receiving');
    if (activeSession) {
      // CRITICAL REQUIREMENT: Add files while transferring!
      engine.addFilesToActiveSession(activeSession.sessionId, fileArray);
    } else {
      // Create new session with selected peer
      const peer = nearbyDevices.find(d => d.name === selectedPeer) || nearbyDevices[0];
      engine.createSendSession(peer, fileArray);
    }
  };

  // Add files specifically to an existing active session
  const handleAddFilesToActiveSession = (sessionId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    engine.addFilesToActiveSession(sessionId, Array.from(files));
  };

  // Drag and drop handlers
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const onDragLeave = () => {
    setIsDraggingOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  // Active files across sessions
  const activeSessionList = sessions.filter(s => s.state === 'sending' || s.state === 'receiving');
  const allActiveFiles = activeSessionList.flatMap(s => s.files.map(f => ({ ...f, sessionId: s.sessionId })));

  const filteredHistory = history.filter(h => {
    if (historyFilter === 'all') return true;
    return h.state === historyFilter;
  });

  return (
    <div className={`flex flex-col bg-slate-100/90 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans select-none overflow-hidden ${
      isStandalone ? 'w-full h-screen' : 'w-full h-full rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800'
    }`}>
      {/* Hidden file pickers */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files)}
      />
      <input
        type="file"
        ref={folderInputRef}
        multiple
        // @ts-ignore
        webkitdirectory=""
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files)}
      />
      <input
        type="file"
        ref={activeSessionFileInputRef}
        multiple
        className="hidden"
        onChange={(e) => {
          if (activeSessionList.length > 0) {
            handleAddFilesToActiveSession(activeSessionList[0].sessionId, e.target.files);
          }
        }}
      />

      {/* Sleek Window Header Bar */}
      <div className="hidden sm:flex items-center justify-between px-4 py-2 bg-white/95 dark:bg-slate-900 border-b border-slate-200/70 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">FlowDrop Desktop</span>
          <span className="text-[10px] text-slate-400 font-mono">v2.4.0 • Local Wi-Fi Ready</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
        </div>
      </div>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar - Hidden on mobile, clean width on desktop */}
        <aside className="hidden md:flex w-48 lg:w-52 bg-white dark:bg-slate-900 border-r border-slate-200/70 dark:border-slate-800 flex-col p-3 shrink-0">
          <nav className="space-y-1 flex-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab('transfers')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'transfers'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <ArrowLeftRight className="w-4 h-4" />
                <span>Transfers</span>
              </div>
              {allActiveFiles.length > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-blue-600 text-white">
                  {allActiveFiles.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>History</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>

          {/* Quick status footer in sidebar */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px]">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <div className="min-w-0 truncate">
                <p className="font-semibold truncate">{deviceName}</p>
                <p className="text-[10px] text-slate-400">Offline & LAN Direct</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Content View - Has 100% full width on mobile! */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/70 dark:bg-slate-950 pb-20 md:pb-6">
          {activeTab === 'home' && (
            <div className="max-w-6xl mx-auto space-y-5">
              {/* Mobile segment switcher between Sharing and Pairing */}
              <div className="lg:hidden flex items-center p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl mb-3">
                <button
                  onClick={() => setMobileHomeView('share')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    mobileHomeView === 'share'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Share Files
                </button>
                <button
                  onClick={() => setMobileHomeView('pair')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    mobileHomeView === 'pair'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR & PIN</span>
                </button>
              </div>

              {/* 2-Column Grid on Desktop, Clean Stacking on Mobile */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Share files, Drag and drop, nearby devices, active transfers */}
                <div className={`lg:col-span-7 space-y-5 ${mobileHomeView === 'pair' ? 'max-lg:hidden' : ''}`}>
                  {/* Header row with Title and dismissible status notification */}
                  <div className="flex items-center justify-between gap-3">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                      Share files
                    </h1>

                    {/* Top status indicator pill: Dismissible, auto-disappears after 2s */}
                    {recentStatusNotification && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 rounded-full text-xs font-semibold text-emerald-800 dark:text-emerald-200 animate-slide-up">
                        <Check className="w-3.5 h-3.5" />
                        <span>{recentStatusNotification.text}</span>
                        <button
                          type="button"
                          onClick={() => setRecentStatusNotification(null)}
                          className="text-emerald-800 hover:text-emerald-950 dark:text-emerald-200 dark:hover:text-white ml-1 p-0.5 rounded cursor-pointer"
                          aria-label="Dismiss status"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Primary Actions: Send Files & Receive (Clean 2-column, never squished!) */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Upload className="w-4 h-4 shrink-0" />
                      <span>Send Files</span>
                    </button>

                    <button
                      onClick={onOpenScanner}
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 active:scale-[0.98] text-slate-800 dark:text-slate-100 font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Download className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>Receive</span>
                    </button>
                  </div>

                  {/* Drag and Drop Zone */}
                  <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      isDraggingOver
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.01]'
                        : 'border-blue-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shadow-inner">
                      <FolderPlus className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Drop files or folders
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      No size limit • Encrypted end-to-end
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          folderInputRef.current?.click();
                        }}
                        className="px-3 py-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                      >
                        Select Folder
                      </button>
                    </div>

                    <div className="absolute right-4 top-4 w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Nearby Devices */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span>Nearby devices</span>
                      <button onClick={onOpenScanner} className="text-blue-600 hover:underline flex items-center gap-1 font-medium cursor-pointer">
                        <Scan className="w-3.5 h-3.5" /> Scan QR
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {nearbyDevices.map((dev) => (
                        <button
                          key={dev.id}
                          onClick={() => setSelectedPeer(dev.name)}
                          className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            selectedPeer === dev.name
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-sm'
                              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-700 dark:text-slate-300">
                            {dev.platform === 'android' ? (
                              <Smartphone className="w-4 h-4" />
                            ) : (
                              <Laptop className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">{dev.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="text-[10px] text-slate-400 truncate">{dev.platform}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Transfers with "+ Add files" button */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>Active transfers</span>
                        {allActiveFiles.length > 0 && (
                          <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-[10px] font-mono flex items-center justify-center font-bold">
                            {allActiveFiles.length}
                          </span>
                        )}
                      </h3>

                      {/* CRITICAL REQUIREMENT: "+ Add files" during active transfers! */}
                      <button
                        onClick={() => activeSessionFileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add files
                      </button>
                    </div>

                    {allActiveFiles.length === 0 ? (
                      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-400">
                        No transfers currently in progress. Send files or scan a code to start.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {allActiveFiles.map((file) => (
                          <div
                            key={file.id}
                            className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col gap-2"
                          >
                            <div className="flex items-center gap-3">
                              {/* Thumbnail / File icon */}
                              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 overflow-hidden">
                                {file.previewUrl ? (
                                  <img src={file.previewUrl} alt={file.name} className="w-10 h-10 object-cover" />
                                ) : file.type.startsWith('video/') ? (
                                  <Film className="w-5 h-5 text-purple-500" />
                                ) : file.type.includes('zip') ? (
                                  <Archive className="w-5 h-5 text-amber-500" />
                                ) : (
                                  <FileText className="w-5 h-5 text-blue-500" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">{file.name}</p>
                                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 ml-2">{file.progress}%</span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                  <span>{formatBytes(file.size)}</span>
                                  <span>•</span>
                                  <span className="capitalize text-blue-600 dark:text-blue-400">{file.state}</span>
                                  {file.speed > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="font-mono">{formatSpeed(file.speed)}</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Working cancel button */}
                              <button
                                onClick={() => engine.cancelFile(file.sessionId, file.id)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                title="Cancel transfer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-blue-600 h-full rounded-full transition-all duration-200"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent History snippet matching mockup */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span>History</span>
                      <button onClick={() => setActiveTab('history')} className="text-blue-600 hover:underline cursor-pointer">
                        View all
                      </button>
                    </div>

                    <div className="space-y-2">
                      {history.slice(0, 2).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => onPreviewItem(item)}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              item.state === 'Sent'
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {item.state === 'Sent' ? <Upload className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold truncate">
                                <span className="font-bold mr-1">{item.state}</span>
                                {item.name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {formatBytes(item.size)} • {item.peerName}
                              </p>
                            </div>
                          </div>
                          <div className="text-slate-400">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: QR and PIN Pairing Panel (Visible on desktop OR when mobile toggles to pair) */}
                <div className={`lg:col-span-5 ${mobileHomeView === 'share' ? 'max-lg:hidden' : ''}`}>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col items-center text-center">
                    {/* Segmented Switch: QR / PIN */}
                    <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full mb-6">
                      <button
                        onClick={() => setPairingMode('qr')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          pairingMode === 'qr'
                            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        QR Code
                      </button>
                      <button
                        onClick={() => setPairingMode('pin')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          pairingMode === 'pin'
                            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        PIN
                      </button>
                    </div>

                    {pairingMode === 'qr' ? (
                      <>
                        {/* High-Contrast QR Code with FlowDrop Central Logo */}
                        <div className="relative p-3 bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 max-w-[280px] mx-auto">
                          {qrDataUrl && (
                            <img
                              src={qrDataUrl}
                              alt="FlowDrop QR Code"
                              className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
                            />
                          )}
                          {/* Center Logo in QR */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-md p-1 border border-slate-100 flex items-center justify-center">
                              <Logo size="sm" showText={false} />
                            </div>
                          </div>
                        </div>

                        {/* Numeric PIN below QR with spaced numbers and Copy button matching mockup */}
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                          <span className="font-mono text-lg font-bold tracking-[0.25em] text-slate-800 dark:text-slate-100 pl-1">
                            {pinCode.split('').join(' ')}
                          </span>
                          <button
                            onClick={copyPin}
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 transition-colors ml-2 cursor-pointer"
                            title="Copy PIN"
                          >
                            {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>

                        <p className="text-xs text-slate-400 mt-3">
                          Scan with your Android camera or enter the PIN
                        </p>
                      </>
                    ) : (
                      /* PIN Mode */
                      <div className="w-full space-y-4 py-4">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Your Device PIN</span>
                          <div className="text-3xl font-mono font-bold tracking-[0.3em] text-blue-600 dark:text-blue-400 my-2">
                            {pinCode.split('').join(' ')}
                          </div>
                          <button
                            onClick={copyPin}
                            className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold hover:underline mt-2 cursor-pointer"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? 'Copied' : 'Copy PIN'}</span>
                          </button>
                        </div>

                        <button
                          onClick={generatePairingCode}
                          className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Regenerate PIN
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transfers Tab */}
          {activeTab === 'transfers' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Transfer Queue</h2>
                  <p className="text-xs text-slate-400">Manage ongoing and queued files</p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add more files
                </button>
              </div>

              {sessions.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
                  <ArrowLeftRight className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-500" />
                  <p className="text-sm font-semibold">No active transfer sessions</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                          {session.direction === 'send' ? <Upload className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold">
                            {session.direction === 'send' ? 'Sending to' : 'Receiving from'} {session.peer.name}
                          </h4>
                          <p className="text-xs text-slate-400 font-mono">
                            {formatBytes(session.transferredBytes)} of {formatBytes(session.totalBytes)} • {session.files.length} items
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => engine.cancelSession(session.sessionId)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Cancel Session
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${session.progress}%` }}
                      />
                    </div>

                    {/* File List in Session */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
                      {session.files.map((file) => (
                        <div key={file.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className="truncate font-medium">{file.name}</span>
                            <span className="text-[10px] text-slate-400 shrink-0 font-mono">({formatBytes(file.size)})</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-mono text-slate-500">{file.progress}%</span>
                            <button
                              onClick={() => engine.cancelFile(session.sessionId, file.id)}
                              className="text-slate-400 hover:text-rose-500 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Transfer History</h2>
                  <p className="text-xs text-slate-400">All local sent and received transfers</p>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={() => engine.clearHistory()}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear History
                  </button>
                )}
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                {(['all', 'Sent', 'Received', 'Cancelled'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setHistoryFilter(filter)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                      historyFilter === filter
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {filteredHistory.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-500" />
                  <p className="text-sm font-semibold">No history entries found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          item.state === 'Sent'
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : item.state === 'Received'
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600'
                        }`}>
                          {item.state === 'Sent' ? <Upload className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold truncate text-slate-900 dark:text-slate-100">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {formatBytes(item.size)} • {item.peerName} • {new Date(item.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onPreviewItem(item)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 cursor-pointer"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => engine.deleteHistoryItem(item.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl font-bold">Preferences</h2>
                <p className="text-xs text-slate-400">Configure FlowDrop Windows client</p>
              </div>

              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl space-y-5 shadow-sm text-xs">
                <div>
                  <label className="block font-bold mb-1.5">Device Name</label>
                  <input
                    type="text"
                    value={deviceName}
                    onChange={(e) => {
                      setDeviceName(e.target.value);
                      engine.setDeviceInfo('pc-windows-main', e.target.value, 'windows');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1.5">Default Save Location</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={downloadFolder}
                      onChange={(e) => setDownloadFolder(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                    />
                    <button className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-semibold hover:bg-slate-200 cursor-pointer">
                      Browse
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="font-bold">End-to-End Encryption</p>
                    <p className="text-[11px] text-slate-400">Enforce AES-256-GCM authenticated cipher on all streams</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={encryptionEnabled}
                    onChange={(e) => setEncryptionEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="font-bold">Auto-Accept Trusted Devices</p>
                    <p className="text-[11px] text-slate-400">Bypass confirmation prompt for known paired phones</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoAcceptTrusted}
                    onChange={(e) => setAutoAcceptTrusted(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </div>
              </div>

              {/* Version & Security badge */}
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-bold">FlowDrop Windows v2.4.0</p>
                    <p className="text-[10px] text-blue-600/80 dark:text-blue-300/70">Tauri 2 Rust Core • Zero Cloud Storage</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Mobile Bottom Navigation Bar (md:hidden) so mobile has clean, full-width content! */}
        <nav className="md:hidden absolute bottom-0 left-0 right-0 z-30 flex items-center justify-around py-2.5 px-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-colors cursor-pointer ${
              activeTab === 'home'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab('transfers')}
            className={`relative flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-colors cursor-pointer ${
              activeTab === 'transfers'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ArrowLeftRight className="w-5 h-5" />
            <span>Transfers</span>
            {allActiveFiles.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white font-mono text-[9px] flex items-center justify-center font-bold">
                {allActiveFiles.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>History</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
