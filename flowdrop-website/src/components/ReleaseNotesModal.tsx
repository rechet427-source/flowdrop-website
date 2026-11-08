import React from 'react';
import { X, CheckCircle, Tag } from 'lucide-react';

interface ReleaseNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReleaseNotesModal: React.FC<ReleaseNotesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold">Release Notes & Version Log</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed">
          {/* Version 2.4.0 (Current) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold font-mono text-xs">
                  v2.4.0
                </span>
                <span className="font-semibold text-slate-500">Official Production Release</span>
              </div>
              <span className="text-slate-400">November 2026</span>
            </div>

            <p className="text-slate-600 dark:text-slate-300">
              FlowDrop v2.4.0 introduces the dynamic active transfer queue, allowing files and folders to be appended during an active streaming transfer session without interruption or restarts.
            </p>

            <div className="space-y-1.5 pl-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Add files while transferring:</strong> Seamlessly select and append additional files or folders to active sessions.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Tauri 2 Android & Windows Architecture:</strong> High-speed native Rust I/O and zero memory overflow streaming.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Hardware Camera QR Scanner:</strong> Instant hardware scanner with flashlight toggle and 6-digit PIN fallback.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Media Previews:</strong> Preview sent and received photos, videos, audio, and documents prior to saving.</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-[11px] text-slate-500 space-y-1">
              <div className="break-all">Windows SHA-256: 7c98f24a2ef93c5d8063d81b857dc4b9b9101f3531bfa2b8743111b7a2d64f02</div>
              <div className="break-all">Android SHA-256: c1b48325a7d3298ec5b2fb66a26df084bfb8ff4e20986756858e72c8ea4598d1</div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Version 2.3.1 */}
          <div className="space-y-2 opacity-80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold font-mono text-xs">
                  v2.3.1
                </span>
                <span className="font-semibold text-slate-500">Maintenance Update</span>
              </div>
              <span className="text-slate-400">October 2026</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-500">
              <li>Hardened AES-256-GCM chunk bounds and verified nonces per stream.</li>
              <li>Fixed local socket reconnects when resuming from device standby.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
