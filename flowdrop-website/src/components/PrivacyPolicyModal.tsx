import React from 'react';
import { X, ShieldCheck, ServerOff } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold">FlowDrop Privacy Policy</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center gap-3">
            <ServerOff className="w-6 h-6 text-emerald-600 shrink-0" />
            <p className="font-semibold text-xs">
              Zero Plaintext Storage: FlowDrop servers never store, inspect, log, or index your transferred files or personal metadata.
            </p>
          </div>

          <section className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">1. Local & Peer-to-Peer Data Flow</h3>
            <p>
              When both devices reside on the same Wi-Fi router or subnet, file transfers travel directly over local socket connections. No data leaves your private local network.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">2. End-to-End Encryption</h3>
            <p>
              Files transferred over the internet use WebRTC data channels or temporary streaming relays protected by authenticated AES-256-GCM encryption. Encryption keys are generated locally in ephemeral device memory and are never transmitted to our servers or embedded in unauthenticated URLs.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">3. Ephemeral Signaling</h3>
            <p>
              Pairing PINs and QR codes expire automatically after 10 minutes. Session tokens and device identifiers are held solely in temporary server memory and purged immediately upon connection termination.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">4. No Tracking or Advertising</h3>
            <p>
              FlowDrop contains zero third-party telemetry beacons, advertising trackers, or fingerprinting scripts. We do not sell or collect personal data.
            </p>
          </section>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
