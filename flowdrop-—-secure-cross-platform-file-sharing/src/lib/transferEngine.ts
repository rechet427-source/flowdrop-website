import { ActiveSession, FileTransferItem, HistoryRecord, Platform, TransferState } from '../types';
import { computeSHA256, encryptChunk, formatBytes, formatEta, formatSpeed, generateIV, generateSessionKey, sanitizeFilename } from './crypto';

const CHUNK_SIZE = 64 * 1024; // 64 KB chunks for smooth backpressure and responsiveness

export class TransferEngine {
  private activeSessions: Map<string, ActiveSession> = new Map();
  private ws: WebSocket | null = null;
  private listeners: Set<() => void> = new Set();
  private history: HistoryRecord[] = [];
  private currentDeviceId: string;
  private currentDeviceName: string;
  private currentPlatform: Platform;
  private isProcessing: boolean = false;
  private sessionKeys: Map<string, CryptoKey> = new Map();

  constructor(deviceId: string, deviceName: string, platform: Platform) {
    this.currentDeviceId = deviceId;
    this.currentDeviceName = deviceName;
    this.currentPlatform = platform;
    this.loadHistory();
    this.initWebSocket();
  }

  public setDeviceInfo(deviceId: string, deviceName: string, platform: Platform) {
    this.currentDeviceId = deviceId;
    this.currentDeviceName = deviceName;
    this.currentPlatform = platform;
  }

  private loadHistory() {
    try {
      const stored = localStorage.getItem('flowdrop_transfer_history');
      if (stored) {
        this.history = JSON.parse(stored);
      }
    } catch (e) {
      this.history = [];
    }
  }

  private saveHistory() {
    try {
      localStorage.setItem('flowdrop_transfer_history', JSON.stringify(this.history.slice(0, 100)));
    } catch (e) {
      console.warn('Could not save history to localStorage', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.ws?.send(JSON.stringify({
          type: 'REGISTER_DEVICE',
          payload: {
            id: this.currentDeviceId,
            name: this.currentDeviceName,
            platform: this.currentPlatform
          }
        }));
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleIncomingMessage(msg);
        } catch (e) {
          console.error('Error handling WS message:', e);
        }
      };

      this.ws.onclose = () => {
        // Auto-reconnect after 3s
        setTimeout(() => this.initWebSocket(), 3000);
      };
    } catch (err) {
      console.warn('WebSocket connection not ready:', err);
    }
  }

  private handleIncomingMessage(msg: any) {
    const { type, payload } = msg;

    if (type === 'TRANSFER_CONTROL_EVENT') {
      const { sessionId, action, fileId, reason } = payload;
      const session = this.activeSessions.get(sessionId);
      if (session) {
        if (action === 'CANCEL_SESSION') {
          session.state = 'cancelled';
          session.files.forEach(f => {
            if (f.state === 'sending' || f.state === 'receiving' || f.state === 'queued') {
              f.state = 'cancelled';
              this.addHistoryRecord(f, 'Cancelled');
            }
          });
          this.notify();
        } else if (action === 'CANCEL_FILE' && fileId) {
          const file = session.files.find(f => f.id === fileId);
          if (file) {
            file.state = 'cancelled';
            this.addHistoryRecord(file, 'Cancelled');
            this.notify();
          }
        } else if (action === 'REJECT') {
          session.state = 'rejected';
          session.files.forEach(f => {
            f.state = 'rejected';
            this.addHistoryRecord(f, 'Rejected');
          });
          this.notify();
        }
      }
    } else if (type === 'RELAY_CHUNK_DELIVERED') {
      this.handleReceivedChunk(payload);
    }
  }

  private handleReceivedChunk(payload: any) {
    const { sessionId, fileId, chunkIndex, totalChunks } = payload;
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const file = session.files.find(f => f.id === fileId);
    if (!file || file.state === 'cancelled') return;

    file.state = 'receiving';
    file.progress = Math.min(100, Math.round(((chunkIndex + 1) / totalChunks) * 100));
    file.transferredBytes = Math.min(file.size, (chunkIndex + 1) * CHUNK_SIZE);

    if (chunkIndex + 1 >= totalChunks) {
      file.state = 'completed';
      file.completedAt = Date.now();
      file.progress = 100;
      this.addHistoryRecord(file, 'Received');
    }

    this.recalculateSession(session);
    this.notify();
  }

  public getActiveSessions(): ActiveSession[] {
    return Array.from(this.activeSessions.values());
  }

  public getHistory(): HistoryRecord[] {
    return this.history;
  }

  public clearHistory() {
    this.history = [];
    this.saveHistory();
    this.notify();
  }

  public deleteHistoryItem(id: string) {
    this.history = this.history.filter(h => h.id !== id);
    this.saveHistory();
    this.notify();
  }

  public addHistoryRecord(file: FileTransferItem, status: 'Sent' | 'Received' | 'Failed' | 'Cancelled' | 'Rejected') {
    const record: HistoryRecord = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      direction: file.direction,
      state: status,
      peerName: file.peerDevice,
      peerPlatform: file.peerPlatform,
      timestamp: Date.now(),
      sha256: file.sha256,
      previewUrl: file.previewUrl,
      canRetry: status === 'Failed' || status === 'Cancelled'
    };

    // Prepend to history
    this.history.unshift(record);
    this.saveHistory();
    this.notify();
  }

  /**
   * Start a new sending session with initial files
   */
  public async createSendSession(
    peer: { id: string; name: string; platform: Platform },
    rawFiles: (File | { name: string; size: number; type: string; blob?: Blob })[]
  ): Promise<ActiveSession> {
    const sessionId = crypto.randomUUID();
    const sessionKey = await generateSessionKey();
    this.sessionKeys.set(sessionId, sessionKey);

    const fileItems: FileTransferItem[] = [];

    for (const f of rawFiles) {
      const isRealFile = f instanceof File || (f as any).blob;
      const blob = isRealFile ? ((f as any).blob || f) : new Blob([new ArrayBuffer(Math.min(f.size, 1024 * 1024))]);
      
      let previewUrl = '';
      if (f.type.startsWith('image/')) {
        try {
          previewUrl = URL.createObjectURL(blob);
        } catch (e) {}
      }

      fileItems.push({
        id: crypto.randomUUID(),
        name: sanitizeFilename(f.name),
        size: f.size,
        type: f.type || 'application/octet-stream',
        progress: 0,
        transferredBytes: 0,
        speed: 0,
        eta: 0,
        state: 'queued',
        direction: 'send',
        blob,
        previewUrl,
        peerDevice: peer.name,
        peerPlatform: peer.platform,
        addedAt: Date.now()
      });
    }

    const session: ActiveSession = {
      sessionId,
      direction: 'send',
      peer,
      mode: 'direct',
      files: fileItems,
      totalBytes: fileItems.reduce((acc, curr) => acc + curr.size, 0),
      transferredBytes: 0,
      progress: 0,
      speed: 0,
      state: 'sending',
      createdAt: Date.now()
    };

    this.activeSessions.set(sessionId, session);
    this.notify();

    // Start streaming transfer pipeline
    this.processTransferQueue(session);

    return session;
  }

  /**
   * CRITICAL REQUIREMENT: Add files while transfer is already active!
   * Appends files to the existing queue without restarting or interrupting current in-flight transfers.
   */
  public async addFilesToActiveSession(
    sessionId: string,
    rawFiles: (File | { name: string; size: number; type: string; blob?: Blob })[]
  ): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    const newItems: FileTransferItem[] = [];

    for (const f of rawFiles) {
      const isRealFile = f instanceof File || (f as any).blob;
      const blob = isRealFile ? ((f as any).blob || f) : new Blob([new ArrayBuffer(Math.min(f.size, 1024 * 1024))]);
      
      let previewUrl = '';
      if (f.type.startsWith('image/')) {
        try {
          previewUrl = URL.createObjectURL(blob);
        } catch (e) {}
      }

      newItems.push({
        id: crypto.randomUUID(),
        name: sanitizeFilename(f.name),
        size: f.size,
        type: f.type || 'application/octet-stream',
        progress: 0,
        transferredBytes: 0,
        speed: 0,
        eta: 0,
        state: 'queued',
        direction: session.direction,
        blob,
        previewUrl,
        peerDevice: session.peer.name,
        peerPlatform: session.peer.platform,
        addedAt: Date.now()
      });
    }

    // Append to existing files array
    session.files.push(...newItems);
    this.recalculateSession(session);
    this.notify();

    // If queue is idle or needs processing, ensure runner is triggered
    if (session.state === 'completed' || session.state === 'paused') {
      session.state = 'sending';
      this.processTransferQueue(session);
    }

    return true;
  }

  /**
   * Cancel an individual file in a session
   */
  public cancelFile(sessionId: string, fileId: string) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const file = session.files.find(f => f.id === fileId);
    if (file && (file.state === 'sending' || file.state === 'queued' || file.state === 'receiving')) {
      file.state = 'cancelled';
      this.addHistoryRecord(file, 'Cancelled');

      // Send cancel control message to peer
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'TRANSFER_CONTROL',
          payload: {
            sessionId,
            action: 'CANCEL_FILE',
            fileId,
            reason: 'User cancelled single file'
          }
        }));
      }

      this.recalculateSession(session);
      this.notify();
    }
  }

  /**
   * Cancel an entire session
   */
  public cancelSession(sessionId: string) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.state = 'cancelled';
    session.files.forEach(f => {
      if (f.state === 'sending' || f.state === 'queued' || f.state === 'receiving') {
        f.state = 'cancelled';
        this.addHistoryRecord(f, 'Cancelled');
      }
    });

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'TRANSFER_CONTROL',
        payload: {
          sessionId,
          action: 'CANCEL_SESSION',
          reason: 'User cancelled active session'
        }
      }));
    }

    this.notify();
  }

  /**
   * Retry a failed or cancelled file
   */
  public retryFile(recordId: string) {
    const historyItem = this.history.find(h => h.id === recordId);
    if (!historyItem) return;

    this.createSendSession(
      { id: crypto.randomUUID(), name: historyItem.peerName, platform: historyItem.peerPlatform },
      [{
        name: historyItem.name,
        size: historyItem.size,
        type: historyItem.type
      }]
    );
  }

  private recalculateSession(session: ActiveSession) {
    session.totalBytes = session.files.reduce((acc, f) => acc + f.size, 0);
    session.transferredBytes = session.files.reduce((acc, f) => acc + f.transferredBytes, 0);
    session.progress = session.totalBytes > 0 
      ? Math.min(100, Math.round((session.transferredBytes / session.totalBytes) * 100))
      : 0;

    const allFinished = session.files.every(f => 
      f.state === 'completed' || f.state === 'cancelled' || f.state === 'failed' || f.state === 'rejected'
    );

    if (allFinished && session.files.length > 0) {
      const anySuccess = session.files.some(f => f.state === 'completed');
      session.state = anySuccess ? 'completed' : 'cancelled';
    }
  }

  /**
   * Streaming chunk processor with backpressure & AES-GCM simulation
   */
  private async processTransferQueue(session: ActiveSession) {
    for (const file of session.files) {
      if (file.state !== 'queued') continue;
      if (session.state === 'cancelled' || session.state === 'paused') break;

      file.state = 'sending';
      this.notify();

      const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));
      let currentChunk = 0;
      let lastTime = Date.now();
      let lastBytes = 0;

      // Simulated network throughput with realistic speed (e.g. 15-45 MB/s local, 3-8 MB/s relay)
      const targetChunkDurationMs = 25; // ~2.5 MB/s per file chunk tick in browser runtime

      while (currentChunk < totalChunks) {
        if ((file.state as TransferState) === 'cancelled' || (session.state as TransferState) === 'cancelled') {
          break;
        }

        // Simulate chunk slice + encryption
        const iv = generateIV();
        currentChunk++;
        file.transferredBytes = Math.min(file.size, currentChunk * CHUNK_SIZE);
        file.progress = Math.min(100, Math.round((file.transferredBytes / file.size) * 100));

        // Speed & ETA calculations
        const now = Date.now();
        const deltaSec = (now - lastTime) / 1000;
        if (deltaSec >= 0.2) {
          const deltaBytes = file.transferredBytes - lastBytes;
          const currentSpeed = deltaBytes / deltaSec;
          file.speed = Math.round(currentSpeed);
          session.speed = file.speed;

          const remainingBytes = file.size - file.transferredBytes;
          file.eta = file.speed > 0 ? Math.ceil(remainingBytes / file.speed) : 0;

          lastTime = now;
          lastBytes = file.transferredBytes;
        }

        this.recalculateSession(session);
        this.notify();

        // Forward chunk via WebSocket if connected
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            type: 'RELAY_CHUNK',
            payload: {
              sessionId: session.sessionId,
              fileId: file.id,
              chunkIndex: currentChunk - 1,
              totalChunks,
              iv: Array.from(iv)
            }
          }));
        }

        // Controlled tick for smooth UI updates
        await new Promise(res => setTimeout(res, targetChunkDurationMs));
      }

      if ((file.state as TransferState) !== 'cancelled' && (session.state as TransferState) !== 'cancelled') {
        file.state = 'completed';
        file.completedAt = Date.now();
        file.progress = 100;
        file.speed = 0;
        file.eta = 0;
        this.addHistoryRecord(file, 'Sent');
      }

      this.recalculateSession(session);
      this.notify();
    }
  }
}
