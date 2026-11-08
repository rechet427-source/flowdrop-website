import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Laptop, 
  Smartphone, 
  ShieldCheck, 
  Wifi, 
  Zap, 
  FileCheck, 
  Lock, 
  Copy, 
  Check, 
  ExternalLink,
  Layers,
  HelpCircle,
  FileText,
  Moon,
  Sun,
  Github,
  QrCode,
  HardDrive,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Logo } from './components/Logo';
import { ReleaseNotesModal } from './components/ReleaseNotesModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { TermsModal } from './components/TermsModal';
import { SupportModal } from './components/SupportModal';

export type Platform = 'windows' | 'android';

export default function App() {
  const [detectedOs, setDetectedOs] = useState<Platform>('windows');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Modal dialog states
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);

  const releaseVersion = '2.4.0';
  const releaseDate = 'November 2026';
  const githubRepo = 'https://github.com/flowdrop/flowdrop';

  const downloadInfo = {
    windows: {
      name: 'FlowDrop for Windows',
      filename: `FlowDrop-Setup-v${releaseVersion}.exe`,
      size: '14.8 MB',
      sha256: '7c98f24a2ef93c5d8063d81b857dc4b9b9101f3531bfa2b8743111b7a2d64f02',
      requirements: 'Windows 10 / 11 (64-bit)',
      // Direct GitHub Releases asset link
      url: `${githubRepo}/releases/download/v${releaseVersion}/FlowDrop-Setup-v${releaseVersion}.exe`
    },
    android: {
      name: 'FlowDrop for Android',
      filename: `FlowDrop-v${releaseVersion}.apk`,
      size: '18.2 MB',
      sha256: 'c1b48325a7d3298ec5b2fb66a26df084bfb8ff4e20986756858e72c8ea4598d1',
      requirements: 'Android 8.0 (Oreo) or higher',
      // Direct GitHub Releases asset link
      url: `${githubRepo}/releases/download/v${releaseVersion}/FlowDrop-v${releaseVersion}.apk`
    }
  };

  // Sync theme with DOM
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Automatic operating system detection
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/android/i.test(userAgent)) {
      setDetectedOs('android');
    } else {
      setDetectedOs('windows');
    }
  }, []);

  const copyChecksum = (hash: string, platform: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(platform);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const primaryDownload = downloadInfo[detectedOs];
  const secondaryDownload = detectedOs === 'windows' ? downloadInfo.android : downloadInfo.windows;
  const secondaryOs: Platform = detectedOs === 'windows' ? 'android' : 'windows';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 overflow-x-hidden w-full max-w-full">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <a href="#top" className="flex items-center shrink-0">
            <Logo size="md" showText={true} />
          </a>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap">Features</a>
            <a href="#compatibility" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap">Compatibility</a>
            <a href="#verification" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap">Checksums</a>
            <button onClick={() => setIsReleaseNotesOpen(true)} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap cursor-pointer">
              Release Notes
            </button>
            <button onClick={() => setIsSupportOpen(true)} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap cursor-pointer">
              Setup Guide
            </button>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href={githubRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="View on GitHub"
            >
              <Github className="w-4 h-4" />
            </a>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <a
              href={primaryDownload.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 sm:px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/20 whitespace-nowrap flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Download</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="top" className="relative pt-10 pb-16 sm:pt-20 sm:pb-28 overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/50 via-white to-slate-50 dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950 w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center w-full">
          {/* Version and Security Kicker */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-4 sm:mb-6 rounded-full bg-blue-100/70 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold max-w-full">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Version {releaseVersion} Officially Released • GitHub Releases Verified</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 sm:mb-6 break-words max-w-3xl mx-auto px-1">
            Secure cross-platform file sharing without cloud middlemen.
          </h1>

          <p className="text-xs sm:text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            Transfer unlimited files and whole folders between Android and Windows at maximum local Wi-Fi speeds or via encrypted peer-to-peer relay. No store sign-in or account required.
          </p>

          {/* Primary Auto-Detected Download CTA */}
          <div className="max-w-xl mx-auto flex flex-col items-center gap-4 w-full px-2">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
              <a
                href={primaryDownload.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold text-xs sm:text-base shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2.5 whitespace-nowrap"
              >
                {detectedOs === 'windows' ? (
                  <Laptop className="w-4 sm:w-5 h-4 sm:h-5 shrink-0" />
                ) : (
                  <Smartphone className="w-4 sm:w-5 h-4 sm:h-5 shrink-0" />
                )}
                <span>Download for {detectedOs === 'windows' ? 'Windows (.exe)' : 'Android (.apk)'}</span>
              </a>

              <a
                href={`${githubRepo}/releases`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap cursor-pointer"
              >
                <span>GitHub Releases</span>
                <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
              </a>
            </div>

            {/* Platform detection notice & quick details */}
            <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <span>Auto-detected: <strong className="text-slate-700 dark:text-slate-200 capitalize">{detectedOs}</strong></span>
              <span>•</span>
              <span>{primaryDownload.size}</span>
              <span>•</span>
              <span className="truncate">{primaryDownload.requirements}</span>
            </div>
          </div>

          {/* Alternate Platform Installer Card */}
          <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800 max-w-lg mx-auto flex items-center justify-between text-xs text-left bg-white/80 dark:bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 w-full">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
              <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                {secondaryOs === 'windows' ? <Laptop className="w-4 h-4 text-blue-600" /> : <Smartphone className="w-4 h-4 text-emerald-600" />}
              </div>
              <div className="min-w-0">
                <p className="font-bold truncate">{secondaryDownload.name}</p>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-mono truncate">{secondaryDownload.size} • {secondaryDownload.requirements}</p>
              </div>
            </div>

            <a
              href={secondaryDownload.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-200 text-xs shrink-0 transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Get {secondaryOs === 'windows' ? '.exe' : '.apk'}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Core Architectural Features */}
      <section id="features" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight mb-2 sm:mb-3">
            Engineered for high-volume, secure transfers.
          </h2>
          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400">
            FlowDrop combines Tauri 2 native operating system integration with end-to-end cryptographic integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-2">Dynamic Queue Engine</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 flex-1">
              Add more files and folders anytime while a transfer session is active without restarting, terminating, or corrupting in-flight chunks.
            </p>
            <div className="text-xs font-semibold text-blue-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>Zero transfer interruption</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Wifi className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-2">Local Wi-Fi Offline Transfer</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 flex-1">
              Transfer files directly over your local Wi-Fi router or hotspot without touching the internet. Unlimited transfer bandwidth at wire speeds.
            </p>
            <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>Up to 80+ MB/s Wi-Fi speeds</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-2">AES-256-GCM Encryption</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 flex-1">
              Every chunk is encrypted with fresh symmetric keys and authenticated nonces. Peer identity is verified via ephemeral QR or 6-digit PIN codes.
            </p>
            <div className="text-xs font-semibold text-purple-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>Zero plaintext logging</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cross-Platform Compatibility Matrix */}
      <section id="compatibility" className="py-14 sm:py-20 bg-white dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800 w-full overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 w-full">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight mb-2">
              Cross-Platform Connectivity Matrix
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Honest technical specifications for offline and internet modes between Android and Windows.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 w-full">
            <table className="w-full text-xs text-left min-w-[500px]">
              <thead className="bg-slate-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">Device Combination</th>
                  <th className="p-3.5">Offline Wi-Fi LAN</th>
                  <th className="p-3.5">Direct P2P WebRTC</th>
                  <th className="p-3.5">Encrypted Relay Fallback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="p-3.5 font-semibold flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                    Android ↔ Android
                  </td>
                  <td className="p-3.5 text-emerald-600 font-semibold">✓ Wi-Fi Direct / Local IP</td>
                  <td className="p-3.5 text-emerald-600 font-semibold">✓ Supported</td>
                  <td className="p-3.5 text-emerald-600 font-semibold">✓ TLS Ephemeral Stream</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-blue-600 shrink-0" />
                    Android ↔ Windows
                  </td>
                  <td className="p-3.5 text-emerald-600 font-semibold">✓ Subnet TCP Stream</td>
                  <td className="p-3.5 text-emerald-600 font-semibold">✓ Supported</td>
                  <td className="p-3.5 text-emerald-600 font-semibold">✓ TLS Ephemeral Stream</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-blue-600 shrink-0" />
                    Windows ↔ Windows
                  </td>
                  <td className="p-3.5 text-emerald-600 font-semibold">✓ LAN Direct Socket</td>
                  <td className="p-3.5 text-emerald-600 font-semibold">✓ Supported</td>
                  <td className="p-3.5 text-emerald-600 font-semibold">✓ TLS Ephemeral Stream</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Package Verification & Checksums */}
      <section id="verification" className="py-14 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 w-full">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <FileCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <h3 className="text-sm sm:text-base font-bold">Cryptographic Package Verification</h3>
            </div>
            <button
              onClick={() => setIsReleaseNotesOpen(true)}
              className="text-xs text-blue-600 hover:underline font-semibold self-start sm:self-auto cursor-pointer"
            >
              View Full Release Notes
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
            Verify the integrity of downloaded binaries before installation using standard SHA-256 tools (`certutil -hashfile` on Windows or `sha256sum` on Android/Linux).
          </p>

          <div className="space-y-3 font-mono text-xs w-full">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                  Windows Installer (.exe)
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-500 break-all block">
                  {downloadInfo.windows.sha256}
                </span>
              </div>
              <button
                onClick={() => copyChecksum(downloadInfo.windows.sha256, 'windows')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[11px] font-sans font-medium flex items-center gap-1 shrink-0 self-start sm:self-auto cursor-pointer"
              >
                {copiedHash === 'windows' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHash === 'windows' ? 'Copied' : 'Copy Hash'}</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                  Android Release Package (.apk)
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-500 break-all block">
                  {downloadInfo.android.sha256}
                </span>
              </div>
              <button
                onClick={() => copyChecksum(downloadInfo.android.sha256, 'android')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[11px] font-sans font-medium flex items-center gap-1 shrink-0 self-start sm:self-auto cursor-pointer"
              >
                {copiedHash === 'android' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHash === 'android' ? 'Copied' : 'Copy Hash'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 sm:py-12 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 w-full overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" showText={true} />
            <span className="text-[11px] text-slate-400">© 2026 FlowDrop Project. Open security architecture.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] sm:text-xs">
            <button onClick={() => setIsReleaseNotesOpen(true)} className="hover:text-blue-600 transition-colors cursor-pointer">
              Release Notes
            </button>
            <button onClick={() => setIsPrivacyOpen(true)} className="hover:text-blue-600 transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <button onClick={() => setIsTermsOpen(true)} className="hover:text-blue-600 transition-colors cursor-pointer">
              Terms of Service
            </button>
            <button onClick={() => setIsSupportOpen(true)} className="hover:text-blue-600 transition-colors cursor-pointer">
              Setup Guide
            </button>
            <a href={githubRepo} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ReleaseNotesModal
        isOpen={isReleaseNotesOpen}
        onClose={() => setIsReleaseNotesOpen(false)}
      />
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </div>
  );
}
