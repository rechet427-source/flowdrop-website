import React from 'react';
import { X, HelpCircle, Laptop, Smartphone, Wifi } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold">FlowDrop Support & Setup Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          {/* Windows Installation Guide */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Laptop className="w-4 h-4 text-blue-600" />
              Windows Installation (.exe)
            </h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Download <strong>FlowDrop-Setup-v2.4.0.exe</strong> from the official website or GitHub Releases.</li>
              <li>Double-click the installer. If Windows SmartScreen prompts "Windows protected your PC", click <em>More info</em> then <em>Run anyway</em>.</li>
              <li>Follow the installer prompt to complete setup. A desktop shortcut will be generated.</li>
            </ol>
          </div>

          {/* Android Installation Guide */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              Android Direct APK Installation (.apk)
            </h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Download <strong>FlowDrop-v2.4.0.apk</strong> directly in your mobile browser or from GitHub Releases.</li>
              <li>Tap the notification or open your Files / Downloads app and tap the APK.</li>
              <li>If prompted "For your security, your phone is not allowed to install unknown apps from this source", tap <em>Settings</em> and toggle <em>Allow from this source</em>.</li>
              <li>Tap <em>Install</em>. You do not need Google Play services to run FlowDrop.</li>
            </ol>
          </div>

          {/* Troubleshooting Local Wi-Fi */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Wifi className="w-4 h-4 text-purple-600" />
              Offline Wi-Fi Troubleshooting
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ensure both your Android device and Windows PC are connected to the same Wi-Fi network or mobile hotspot.</li>
              <li>Verify that "AP Isolation" or "Client Isolation" is disabled on your guest Wi-Fi router.</li>
              <li>If discovery does not appear immediately, use the <strong>QR Code or 6-digit PIN</strong> to pair instantly.</li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
