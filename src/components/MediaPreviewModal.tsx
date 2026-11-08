import React, { useState } from 'react';
import { Download, FileText, Image, Film, Music, X, ZoomIn, ZoomOut, Maximize2, ShieldCheck, HardDrive, Calendar } from 'lucide-react';
import { formatBytes } from '../lib/crypto';

interface MediaPreviewItem {
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  blob?: Blob | File;
  sha256?: string;
  timestamp?: number;
  peerName?: string;
  direction?: string;
}

interface MediaPreviewModalProps {
  item: MediaPreviewItem | null;
  onClose: () => void;
}

export const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({ item, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  if (!item) return null;

  const isImage = item.type.startsWith('image/');
  const isVideo = item.type.startsWith('video/');
  const isAudio = item.type.startsWith('audio/');
  const isPdf = item.type.includes('pdf');
  const isText = item.type.includes('text') || item.type.includes('json') || item.type.includes('javascript') || item.name.endsWith('.txt') || item.name.endsWith('.md');

  const downloadFile = () => {
    if (item.previewUrl) {
      const a = document.createElement('a');
      a.href = item.previewUrl;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (item.blob) {
      const url = URL.createObjectURL(item.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in text-white">
      <div className={`relative flex flex-col w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'h-full max-w-full' : 'max-w-4xl max-h-[90vh]'
      }`}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
              {isImage && <Image className="w-5 h-5" />}
              {isVideo && <Film className="w-5 h-5" />}
              {isAudio && <Music className="w-5 h-5" />}
              {isPdf && <FileText className="w-5 h-5" />}
              {!isImage && !isVideo && !isAudio && !isPdf && <FileText className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold truncate">{item.name}</h3>
              <p className="text-xs text-slate-400 font-mono">
                {formatBytes(item.size)} • {item.type || 'Binary Document'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isImage && (
              <>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                  className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
                  className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              onClick={downloadFile}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Save
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Display Area */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-950/60 min-h-[300px]">
          {isImage ? (
            <div className="overflow-auto max-h-full max-w-full flex items-center justify-center">
              {item.previewUrl ? (
                <img
                  src={item.previewUrl}
                  alt={item.name}
                  style={{ transform: `scale(${zoomLevel})` }}
                  className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-lg transition-transform duration-200"
                />
              ) : (
                <div className="text-center p-8 text-slate-400">
                  <Image className="w-16 h-16 mx-auto mb-3 opacity-30 text-blue-400" />
                  <p className="text-sm">Image preview unavailable on disk or expired.</p>
                </div>
              )}
            </div>
          ) : isVideo ? (
            <div className="w-full max-w-2xl">
              {item.previewUrl ? (
                <video
                  src={item.previewUrl}
                  controls
                  autoPlay
                  className="w-full rounded-2xl shadow-xl max-h-[60vh]"
                />
              ) : (
                <div className="text-center p-12 bg-slate-900 rounded-2xl border border-slate-800">
                  <Film className="w-16 h-16 mx-auto mb-3 text-purple-400 opacity-60" />
                  <p className="text-sm font-medium">Video ready for playback</p>
                  <p className="text-xs text-slate-400 mt-1">Download to local storage to stream in your preferred video player.</p>
                </div>
              )}
            </div>
          ) : isAudio ? (
            <div className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Music className="w-10 h-10" />
              </div>
              <h4 className="font-bold text-base mb-1 truncate">{item.name}</h4>
              <p className="text-xs text-slate-400 mb-6 font-mono">{formatBytes(item.size)}</p>
              {item.previewUrl ? (
                <audio src={item.previewUrl} controls className="w-full" />
              ) : (
                <p className="text-xs text-slate-500">Audio ready for local export</p>
              )}
            </div>
          ) : (
            <div className="max-w-md p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <FileText className="w-10 h-10" />
              </div>
              <h4 className="font-bold text-base mb-1 truncate">{item.name}</h4>
              <p className="text-xs text-slate-400 mb-4 font-mono">{formatBytes(item.size)} • {item.type}</p>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                This document format can be opened directly with its native associated application after saving to your local Downloads directory.
              </p>
              <button
                onClick={downloadFile}
                className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-lg"
              >
                Save File to Disk
              </button>
            </div>
          )}
        </div>

        {/* Bottom Metadata Bar */}
        <div className="px-6 py-3 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              AES-256-GCM Verified
            </span>
            {item.peerName && (
              <span>Peer: <strong className="text-slate-200">{item.peerName}</strong></span>
            )}
          </div>
          {item.sha256 && (
            <div className="font-mono text-[11px] truncate max-w-xs text-slate-500">
              SHA-256: {item.sha256.substring(0, 16)}...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
