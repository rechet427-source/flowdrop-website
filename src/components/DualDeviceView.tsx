import React from 'react';
import { DesktopWindow } from './DesktopWindow';
import { MobileWindow } from './MobileWindow';
import { TransferEngine } from '../lib/transferEngine';
import { Laptop, Smartphone, ArrowRightLeft, ShieldCheck, Wifi } from 'lucide-react';

interface DualDeviceViewProps {
  engineDesktop: TransferEngine;
  engineMobile: TransferEngine;
  onOpenScanner: () => void;
  onPreviewItem: (item: any) => void;
}

export const DualDeviceView: React.FC<DualDeviceViewProps> = ({
  engineDesktop,
  engineMobile,
  onOpenScanner,
  onPreviewItem
}) => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-4">
      {/* Top Banner explaining the dual live testing capability */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 bg-gradient-to-r from-blue-600/10 via-sky-500/10 to-transparent border border-blue-200/60 dark:border-blue-900/50 rounded-2xl text-xs text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">
              Live Interoperability Test Environment (Windows ↔ Android)
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              Drop or add files on either side. Watch live chunk streaming, backpressure, and on-the-fly queue additions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            Local Subnet: 192.168.1.0/24
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            AES-256-GCM E2EE
          </span>
        </div>
      </div>

      {/* Side-by-Side Windows & Android */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left: Windows Desktop Client */}
        <div className="xl:col-span-8 flex flex-col gap-2">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-blue-600" />
              Windows Client (Tauri 2 Desktop)
            </span>
            <span className="font-mono text-[11px]">192.168.1.145</span>
          </div>

          <div className="h-[740px] w-full">
            <DesktopWindow
              engine={engineDesktop}
              onOpenScanner={onOpenScanner}
              onPreviewItem={onPreviewItem}
              isStandalone={false}
            />
          </div>
        </div>

        {/* Right: Android Phone Client */}
        <div className="xl:col-span-4 flex flex-col gap-2 items-center">
          <div className="flex items-center justify-between w-full max-w-[360px] px-2 text-xs font-bold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              Android Client (Pixel / Galaxy)
            </span>
            <span className="font-mono text-[11px]">192.168.1.104</span>
          </div>

          <div className="h-[740px] w-full flex justify-center">
            <MobileWindow
              engine={engineMobile}
              onOpenScanner={onOpenScanner}
              onPreviewItem={onPreviewItem}
              isStandalone={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
