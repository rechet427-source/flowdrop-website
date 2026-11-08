import React, { useEffect, useState, useRef } from 'react';
import { ArrowUp, ArrowDown, Check, X, Ban, AlertCircle } from 'lucide-react';
import { ActiveSession } from '../types';

interface TransferBadgesProps {
  sessions: ActiveSession[];
  onOpenTransfers: () => void;
  onDismissBadge?: (sessionId: string) => void;
}

export const TransferBadges: React.FC<TransferBadgesProps> = ({
  sessions,
  onOpenTransfers,
  onDismissBadge
}) => {
  // Local set of dismissed session IDs so dismissal is instant and reliable
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  // Track the timestamp when a session entered a finished state (completed, cancelled, rejected)
  const finishTimestampsRef = useRef<Map<string, number>>(new Map());

  // Filter sessions that have not been dismissed
  const activeOrRecent = sessions.filter(
    s => !dismissedIds.has(s.sessionId) && (
      s.state === 'sending' || 
      s.state === 'receiving' || 
      s.state === 'completed' || 
      s.state === 'cancelled' ||
      s.state === 'rejected' ||
      s.state === 'failed'
    )
  );

  const handleDismiss = (sessionId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setDismissedIds(prev => new Set(prev).add(sessionId));
    if (onDismissBadge) {
      onDismissBadge(sessionId);
    }
  };

  // AUTO-DISMISS AFTER 2 SECONDS (2000ms) for completed, cancelled, rejected, or failed notifications
  useEffect(() => {
    const now = Date.now();
    const timers: NodeJS.Timeout[] = [];

    activeOrRecent.forEach(session => {
      const isFinished = session.state === 'completed' || 
                         session.state === 'cancelled' || 
                         session.state === 'rejected' || 
                         session.state === 'failed';

      if (isFinished) {
        if (!finishTimestampsRef.current.has(session.sessionId)) {
          finishTimestampsRef.current.set(session.sessionId, now);
        }

        const finishedAt = finishTimestampsRef.current.get(session.sessionId) || now;
        const elapsed = now - finishedAt;
        const remainingTime = Math.max(0, 2000 - elapsed);

        const timer = setTimeout(() => {
          handleDismiss(session.sessionId);
        }, remainingTime);

        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [activeOrRecent]);

  if (activeOrRecent.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 sm:bottom-6 sm:right-6 max-sm:bottom-20 max-sm:left-4 max-sm:right-4 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-auto">
      {activeOrRecent.slice(0, 2).map((session) => {
        const isSending = session.direction === 'send';
        const isCompleted = session.state === 'completed';
        const isCancelled = session.state === 'cancelled';
        const isRejected = session.state === 'rejected';
        const isFailed = session.state === 'failed';

        // 1. COMPLETED (Sent / Received)
        if (isCompleted) {
          return (
            <div
              key={session.sessionId}
              onClick={onOpenTransfers}
              className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/90 border border-emerald-300 dark:border-emerald-700 rounded-2xl shadow-xl shadow-emerald-900/10 cursor-pointer animate-slide-up transition-all hover:scale-[1.01]"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0 pr-1 flex-1">
                <p className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                  {isSending ? 'Sent' : 'Received'}
                </p>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 truncate">
                  {session.files.length} {session.files.length === 1 ? 'file' : 'files'} to {session.peer.name}
                </p>
              </div>

              {/* Working X dismissal button */}
              <button
                type="button"
                onClick={(e) => handleDismiss(session.sessionId, e)}
                className="p-1.5 rounded-lg hover:bg-emerald-200/60 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 transition-colors ml-auto cursor-pointer"
                title="Dismiss"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        }

        // 2. CANCELLED / REJECTED / FAILED
        if (isCancelled || isRejected || isFailed) {
          return (
            <div
              key={session.sessionId}
              onClick={onOpenTransfers}
              className="flex items-center gap-3 px-4 py-3 bg-rose-50 dark:bg-rose-950/90 border border-rose-300 dark:border-rose-700 rounded-2xl shadow-xl shadow-rose-900/10 cursor-pointer animate-slide-up transition-all hover:scale-[1.01]"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Ban className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0 pr-1 flex-1">
                <p className="text-xs font-bold text-rose-950 dark:text-rose-100">
                  {isCancelled ? 'Cancelled' : isRejected ? 'Rejected' : 'Transfer Failed'}
                </p>
                <p className="text-[11px] text-rose-800 dark:text-rose-300 truncate">
                  Transfer with {session.peer.name} stopped
                </p>
              </div>

              {/* Working X dismissal button */}
              <button
                type="button"
                onClick={(e) => handleDismiss(session.sessionId, e)}
                className="p-1.5 rounded-lg hover:bg-rose-200/60 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-300 transition-colors ml-auto cursor-pointer"
                title="Dismiss"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        }

        // 3. ACTIVE (Sending... / Receiving...)
        return (
          <div
            key={session.sessionId}
            onClick={onOpenTransfers}
            className="flex flex-col gap-2 p-3.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 rounded-2xl shadow-xl shadow-blue-500/15 cursor-pointer animate-slide-up hover:scale-[1.01] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
                {isSending ? (
                  <ArrowUp className="w-5 h-5 animate-bounce-subtle" />
                ) : (
                  <ArrowDown className="w-5 h-5 animate-bounce-subtle" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {isSending ? 'Sending…' : 'Receiving…'}
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                    {session.progress}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {session.files.length} {session.files.length === 1 ? 'file' : 'files'} • {session.peer.name}
                </p>
              </div>

              {/* Working X button even while active */}
              <button
                type="button"
                onClick={(e) => handleDismiss(session.sessionId, e)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="Hide notification"
                aria-label="Hide notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${session.progress}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
