import React, { useState, useEffect, useMemo } from 'react';
import { Header, AppViewMode } from './components/Header';
import { DesktopWindow } from './components/DesktopWindow';
import { MobileWindow } from './components/MobileWindow';
import { DualDeviceView } from './components/DualDeviceView';
import { LandingPage } from './components/website/LandingPage';
import { QRScannerModal } from './components/QRScannerModal';
import { MediaPreviewModal } from './components/MediaPreviewModal';
import { ReceiverApprovalModal } from './components/ReceiverApprovalModal';
import { TransferBadges } from './components/TransferBadges';
import { ReleaseNotesModal } from './components/website/ReleaseNotesModal';
import { PrivacyPolicyModal } from './components/website/PrivacyPolicyModal';
import { TermsModal } from './components/website/TermsModal';
import { SupportModal } from './components/website/SupportModal';
import { TransferEngine } from './lib/transferEngine';
import { TransferRequestNotification } from './types';

export default function App() {
  const [viewMode, setViewMode] = useState<AppViewMode>('desktop');
  
  // Default to clean, crisp light theme matching the mockup unless saved otherwise
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('flowdrop_theme');
    if (saved) return saved === 'dark';
    return false;
  });

  // Modal states
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  const [incomingRequest, setIncomingRequest] = useState<TransferRequestNotification | null>(null);
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);

  // Initialize transfer engines for Desktop and Mobile simulation
  const engineDesktop = useMemo(() => {
    return new TransferEngine('pc-windows-main', 'Work PC (Windows)', 'windows');
  }, []);

  const engineMobile = useMemo(() => {
    return new TransferEngine('dev-phone-main', 'My Phone (Android)', 'android');
  }, []);

  // Theme synchronization with document.documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('flowdrop_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Handle successful QR scan
  const handleScanSuccess = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.app === 'flowdrop') {
        alert(`Successfully paired with ${parsed.name} (${parsed.platform}) via QR code!`);
        setViewMode('desktop');
      } else {
        alert(`Scanned QR Code data: ${data}`);
      }
    } catch (e) {
      alert(`Scanned QR Code data: ${data}`);
    }
  };

  const handleEnterPin = (pin: string) => {
    alert(`Connected to device with PIN: ${pin}`);
    setViewMode('desktop');
  };

  const handleAcceptRequest = (request: TransferRequestNotification) => {
    engineMobile.createSendSession(
      { id: request.sender.id, name: request.sender.name, platform: request.sender.platform },
      request.files
    );
    setIncomingRequest(null);
  };

  const handleRejectRequest = (request: TransferRequestNotification) => {
    setIncomingRequest(null);
  };

  // Collect active sessions across engines for floating badges
  const [allSessions, setAllSessions] = useState(() => [
    ...engineDesktop.getActiveSessions(),
    ...engineMobile.getActiveSessions()
  ]);

  useEffect(() => {
    const unsub1 = engineDesktop.subscribe(() => {
      setAllSessions([
        ...engineDesktop.getActiveSessions(),
        ...engineMobile.getActiveSessions()
      ]);
    });
    const unsub2 = engineMobile.subscribe(() => {
      setAllSessions([
        ...engineDesktop.getActiveSessions(),
        ...engineMobile.getActiveSessions()
      ]);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [engineDesktop, engineMobile]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header & View Mode Switcher */}
      <Header
        viewMode={viewMode}
        onSelectViewMode={setViewMode}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {viewMode === 'website' && (
          <LandingPage
            onLaunchApp={() => setViewMode('desktop')}
            onOpenReleaseNotes={() => setIsReleaseNotesOpen(true)}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
            onOpenTerms={() => setIsTermsOpen(true)}
            onOpenSupport={() => setIsSupportOpen(true)}
          />
        )}

        {viewMode === 'desktop' && (
          <div className="flex-1 p-2 sm:p-4 md:p-6 max-w-7xl mx-auto w-full flex items-stretch">
            <div className="w-full min-h-[calc(100vh-6rem)] sm:h-[calc(100vh-6rem)] flex flex-col">
              <DesktopWindow
                engine={engineDesktop}
                onOpenScanner={() => setIsScannerOpen(true)}
                onPreviewItem={setPreviewItem}
                isStandalone={false}
              />
            </div>
          </div>
        )}

        {viewMode === 'mobile' && (
          <div className="flex-1 p-3 sm:p-6 flex items-center justify-center">
            <div className="w-full max-w-[360px] h-[740px] max-h-[90vh]">
              <MobileWindow
                engine={engineMobile}
                onOpenScanner={() => setIsScannerOpen(true)}
                onPreviewItem={setPreviewItem}
                isStandalone={false}
              />
            </div>
          </div>
        )}

        {viewMode === 'dual' && (
          <div className="flex-1 p-3 sm:p-6">
            <DualDeviceView
              engineDesktop={engineDesktop}
              engineMobile={engineMobile}
              onOpenScanner={() => setIsScannerOpen(true)}
              onPreviewItem={setPreviewItem}
            />
          </div>
        )}
      </main>

      {/* Floating Animated Transfer Badges: auto-dismisses after 2s, working X button */}
      <TransferBadges
        sessions={allSessions}
        onOpenTransfers={() => {
          if (viewMode === 'website') setViewMode('desktop');
        }}
        onDismissBadge={(sessionId) => {
          // Handled reliably by TransferBadges state
        }}
      />

      {/* Real Camera QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        onEnterPin={handleEnterPin}
      />

      {/* Media Preview Modal */}
      <MediaPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />

      {/* Receiver Approval Modal */}
      <ReceiverApprovalModal
        request={incomingRequest}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
      />

      {/* Website Auxiliary Modals */}
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
