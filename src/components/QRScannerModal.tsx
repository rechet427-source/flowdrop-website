import React, { useEffect, useRef, useState } from 'react';
import { Camera, Flashlight, FlashlightOff, Image as ImageIcon, KeyRound, X, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
  onEnterPin: (pin: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  onEnterPin,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [torchSupported, setTorchSupported] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [showPinInput, setShowPinInput] = useState<boolean>(false);
  const [pinValue, setPinValue] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setErrorMessage('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera hardware API is not supported on this browser or platform.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      // Check flashlight (torch) capability
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;
        if (capabilities.torch) {
          setTorchSupported(true);
        }
      }

      startScanLoop();
    } catch (err: any) {
      console.error('Camera initialization error:', err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Camera access was denied. Please grant camera permission in your browser or system settings, or enter the 6-digit PIN manually.');
      } else {
        setErrorMessage(err.message || 'Unable to access camera hardware.');
      }
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsTorchOn(false);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextState = !isTorchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextState }]
      });
      setIsTorchOn(nextState);
    } catch (e) {
      console.warn('Torch toggle failed:', e);
    }
  };

  const startScanLoop = () => {
    const scan = () => {
      if (!videoRef.current || !canvasRef.current || videoRef.current.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(scan);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          stopCamera();
          onScanSuccess(code.data);
          onClose();
          return;
        }
      }

      animFrameRef.current = requestAnimationFrame(scan);
    };

    animFrameRef.current = requestAnimationFrame(scan);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            stopCamera();
            onScanSuccess(code.data);
            onClose();
          } else {
            alert('No valid FlowDrop QR code was detected in the uploaded image.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleManualPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = pinValue.replace(/\D/g, '');
    if (cleaned.length !== 6) {
      setPinError('Please enter a valid 6-digit numeric PIN.');
      return;
    }
    stopCamera();
    onEnterPin(cleaned);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 text-white">
      {/* Hidden offscreen canvas for decoding */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Top Header / Safe Area Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all backdrop-blur-md"
          aria-label="Close scanner"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <h2 className="text-base font-semibold tracking-wide text-white drop-shadow">
          Scan to connect
        </h2>

        {torchSupported ? (
          <button
            onClick={toggleTorch}
            className={`p-2.5 rounded-full transition-all backdrop-blur-md active:scale-95 ${
              isTorchOn ? 'bg-amber-400 text-slate-900' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            aria-label="Toggle flashlight"
          >
            {isTorchOn ? <Flashlight className="w-5 h-5" /> : <FlashlightOff className="w-5 h-5" />}
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* Live Video Feed or Permission Denied View */}
      {hasPermission === false ? (
        <div className="flex flex-col items-center justify-center max-w-sm px-6 text-center z-10">
          <div className="w-16 h-16 mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Camera Unavailable</h3>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            {errorMessage}
          </p>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => setShowPinInput(true)}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              Enter 6-Digit PIN
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              Select QR from Photos
            </button>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
          />

          {/* Scanner Viewfinder Overlay */}
          <div className="relative z-10 w-72 h-72 sm:w-80 sm:h-80 border-2 border-transparent">
            {/* Viewfinder Corners (Cyan matching FlowDrop brand) */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-sky-400 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-sky-400 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-sky-400 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-sky-400 rounded-br-2xl" />

            {/* Subtle Scanning Radar Animation Bar */}
            <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_12px_rgba(56,189,248,0.8)] animate-pulse top-1/2 -translate-y-1/2" />
          </div>

          {/* Prompt under viewfinder */}
          <div className="absolute bottom-28 z-10 text-center px-4">
            <p className="text-xs sm:text-sm font-medium text-white/90 drop-shadow bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">
              Point your camera at the FlowDrop QR code
            </p>
          </div>
        </div>
      )}

      {/* Bottom Floating Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-4 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs font-medium backdrop-blur-md"
        >
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <span>Album</span>
        </button>

        <button
          onClick={() => setShowPinInput(true)}
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs font-medium backdrop-blur-md"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <KeyRound className="w-5 h-5" />
          </div>
          <span>Enter PIN</span>
        </button>
      </div>

      {/* Manual PIN Entry Dialog Overlay */}
      {showPinInput && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Pair with PIN</h3>
              <button
                onClick={() => setShowPinInput(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Enter the 6-digit numeric PIN shown on the sender or receiver's screen.
            </p>

            <form onSubmit={handleManualPinSubmit}>
              <div className="mb-4">
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  placeholder="• • • • • •"
                  value={pinValue}
                  onChange={(e) => {
                    setPinValue(e.target.value.replace(/\D/g, ''));
                    setPinError('');
                  }}
                  className="w-full text-center text-2xl font-mono tracking-[0.5em] py-3 px-4 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-white placeholder:text-slate-600"
                />
                {pinError && (
                  <p className="text-xs text-rose-400 mt-2 font-medium">{pinError}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinInput(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={pinValue.length !== 6}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                >
                  Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
