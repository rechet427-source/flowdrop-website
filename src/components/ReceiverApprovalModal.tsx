import React from 'react';
import { AlertCircle, Check, HardDrive, ShieldCheck, X, File, Image, Film, Music, Archive } from 'lucide-react';
import { TransferRequestNotification } from '../types';
import { formatBytes } from '../lib/crypto';

interface ReceiverApprovalModalProps {
  request: TransferRequestNotification | null;
  onAccept: (request: TransferRequestNotification) => void;
  onReject: (request: TransferRequestNotification) => void;
}

export const ReceiverApprovalModal: React.FC<ReceiverApprovalModalProps> = ({
  request,
  onAccept,
  onReject
}) => {
  if (!request) return null;

  // Realistic mock estimated available disk space on current volume
  const estimatedFreeSpace = 48.6 * 1024 * 1024 * 1024; // 48.6 GB
  const hasSufficientSpace = estimatedFreeSpace > request.totalBytes;

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4 text-sky-500" />;
    if (type.startsWith('video/')) return <Film className="w-4 h-4 text-purple-500" />;
    if (type.startsWith('audio/')) return <Music className="w-4 h-4 text-emerald-500" />;
    if (type.includes('zip') || type.includes('tar') || type.includes('archive')) {
      return <Archive className="w-4 h-4 text-amber-500" />;
    }
    return <File className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Incoming Transfer</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                From <span className="font-semibold text-slate-900 dark:text-slate-200">{request.sender.name}</span> ({request.sender.platform === 'windows' ? 'Windows PC' : 'Android Phone'})
              </p>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <div>
              <span className="text-slate-400">Files to receive</span>
              <p className="font-semibold text-sm">{request.files.length} {request.files.length === 1 ? 'file' : 'files'}</p>
            </div>
            <div className="text-right">
              <span className="text-slate-400">Total size</span>
              <p className="font-semibold text-sm font-mono">{formatBytes(request.totalBytes)}</p>
            </div>
          </div>

          {/* List of Files */}
          <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
            {request.files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  <span className="truncate font-medium">{file.name}</span>
                </div>
                <span className="font-mono text-slate-400 shrink-0">{formatBytes(file.size)}</span>
              </div>
            ))}
          </div>

          {/* Storage Check */}
          <div className="flex items-center justify-between text-xs px-1 text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-4 h-4" />
              <span>Available storage: <span className="font-mono">{formatBytes(estimatedFreeSpace)}</span></span>
            </div>
            {hasSufficientSpace ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Sufficient</span>
            ) : (
              <span className="text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Low Space
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex gap-3">
          <button
            onClick={() => onReject(request)}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Decline
          </button>
          <button
            onClick={() => onAccept(request)}
            disabled={!hasSufficientSpace}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Accept & Receive
          </button>
        </div>
      </div>
    </div>
  );
};
