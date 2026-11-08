import React from 'react';
import { X, FileText, CheckCircle } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold">Terms of Service</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <section className="space-y-1.5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">1. Permitted Use</h3>
            <p>
              FlowDrop is provided as a secure utility for personal and organizational file sharing between authorized devices. Users are responsible for ensuring they possess the right to distribute transferred media.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">2. Open Software Architecture</h3>
            <p>
              The application is distributed as signed standalone binaries for Windows (.exe) and Android (.apk). No warranty or liability is assumed for network interruptions, disk quotas, or unverified hardware configurations.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">3. Network Conduct</h3>
            <p>
              The signaling and relay servers are provided for legitimate connection coordination. Automated abuse, denial-of-service, or unauthorized exploitation of relay bandwidth is strictly prohibited and subject to automated IP rate limiting.
            </p>
          </section>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
