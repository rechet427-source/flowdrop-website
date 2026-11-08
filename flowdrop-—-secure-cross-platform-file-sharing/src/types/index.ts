export type Platform = 'windows' | 'android';

export type ConnectionMode = 'local' | 'direct' | 'relay';

export type TransferState = 
  | 'queued' 
  | 'negotiating' 
  | 'sending' 
  | 'receiving' 
  | 'paused' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'rejected';

export type TransferDirection = 'send' | 'receive';

export interface FileTransferItem {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number; // 0 - 100
  transferredBytes: number;
  speed: number; // bytes per sec
  eta: number; // remaining seconds
  state: TransferState;
  direction: TransferDirection;
  blob?: Blob | File;
  previewUrl?: string;
  sha256?: string;
  peerDevice: string;
  peerPlatform: Platform;
  error?: string;
  addedAt: number;
  completedAt?: number;
  relativePath?: string;
}

export interface ActiveSession {
  sessionId: string;
  direction: TransferDirection;
  peer: {
    id: string;
    name: string;
    platform: Platform;
  };
  mode: ConnectionMode;
  files: FileTransferItem[];
  totalBytes: number;
  transferredBytes: number;
  progress: number;
  speed: number;
  state: TransferState;
  createdAt: number;
}

export interface HistoryRecord {
  id: string;
  name: string;
  size: number;
  type: string;
  direction: TransferDirection;
  state: 'Sent' | 'Received' | 'Failed' | 'Cancelled' | 'Rejected';
  peerName: string;
  peerPlatform: Platform;
  timestamp: number;
  sha256?: string;
  previewUrl?: string;
  canRetry?: boolean;
}

export interface DiscoveredDevice {
  id: string;
  name: string;
  platform: Platform;
  ip: string;
  mode: 'local' | 'online';
  lastSeen: number;
  isTrusted?: boolean;
}

export interface AppSettings {
  deviceName: string;
  platform: Platform;
  visibility: 'everyone' | 'contacts' | 'hidden';
  downloadFolder: string;
  autoAcceptTrusted: boolean;
  maxConcurrency: number;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  encryptAll: boolean;
}

export interface PairingData {
  pin: string;
  sessionId: string;
  expiresAt: number;
  qrPayload: string;
}

export interface TransferRequestNotification {
  requestId: string;
  sender: {
    id: string;
    name: string;
    platform: Platform;
  };
  files: {
    name: string;
    size: number;
    type: string;
  }[];
  totalBytes: number;
  timestamp: number;
}
