// Simple realtime client for WebSocket/SSE-like updates
// Uses VITE_WS_URL if provided, otherwise attempts to derive from VITE_BACKEND_URL

const baseWSUrl = (() => {
  const be = import.meta.env.VITE_BACKEND_URL;
  const wsFromBE = be ? be.replace(/^http(s?):\/\//i, (_, s) => (s ? 'wss://' : 'ws://')) + '/ws' : null;
  return import.meta.env.VITE_WS_URL || wsFromBE || 'ws://localhost:3000/ws';
})();

const mask = (v) => {
  if (!v) return '';
  if (v.length <= 6) return '*'.repeat(v.length);
  return v.slice(0, 3) + '***' + v.slice(-3);
};

const buildWSUrl = () => {
  try {
    const url = new URL(baseWSUrl);
    const appendToken = String(import.meta.env.VITE_WS_APPEND_TOKEN ?? 'true').toLowerCase() !== 'false';
    if (appendToken) {
      const token = (localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token') || '').trim();
      if (token && !url.searchParams.get(import.meta.env.VITE_WS_TOKEN_PARAM || 'token')) {
        const param = import.meta.env.VITE_WS_TOKEN_PARAM || 'token';
        url.searchParams.set(param, token);
      }
    }
    // Helpful metadata for server logs (no PII)
    url.searchParams.set('client', 'farmnex-frontend');
    url.searchParams.set('v', '1');
    return url.toString();
  } catch (e) {
    return baseWSUrl;
  }
};

const getProtocols = () => {
  const val = import.meta.env.VITE_WS_PROTOCOLS;
  if (!val) return undefined;
  return val.split(',').map(s => s.trim()).filter(Boolean);
};

class RealtimeClient {
  constructor() {
    this.ws = null;
    this.sse = null;
    this.connected = false;
    this.mode = 'off'; // 'ws' | 'sse' | 'off'
    this.reconnectAttempts = 0;
    this.maxReconnectDelay = 15000; // 15s
    this.listeners = new Map(); // eventType -> Set<fn>
    this.statusListeners = new Set();
    this.queue = [];
  }

  notifyStatus() {
    for (const fn of this.statusListeners) {
      try { fn({ connected: this.connected, url: this.lastUrl || baseWSUrl, mode: this.mode }); } catch {}
    }
  }

  onStatusChange(fn) {
    this.statusListeners.add(fn);
    // Emit immediate status
    try { fn({ connected: this.connected, url: this.lastUrl || baseWSUrl, mode: this.mode }); } catch {}
    return () => this.statusListeners.delete(fn);
  }

  subscribe(eventTypes, handler) {
    const topics = Array.isArray(eventTypes) ? eventTypes : [eventTypes || '*'];
    topics.forEach((t) => {
      if (!this.listeners.has(t)) this.listeners.set(t, new Set());
      this.listeners.get(t).add(handler);
    });
    return () => {
      topics.forEach((t) => {
        const set = this.listeners.get(t);
        if (set) {
          set.delete(handler);
          if (set.size === 0) this.listeners.delete(t);
        }
      });
    };
  }

  emit(event) {
    const type = event?.type || '*';
    const deliver = (t) => {
      const set = this.listeners.get(t);
      if (set) {
        for (const fn of set) {
          try { fn(event); } catch (e) { /* noop */ }
        }
      }
    };
    deliver(type);
    deliver('*');
  }

  connect() {
    // Prefer WS; if WS fails multiple times, fall back to SSE
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const urlStr = buildWSUrl();
    this.lastUrl = urlStr;
    try {
      const urlObj = new URL(urlStr);
      const tokenParam = urlObj.searchParams.get(import.meta.env.VITE_WS_TOKEN_PARAM || 'token');
      console.log('[Realtime] connecting WS', urlObj.origin + urlObj.pathname + '?token=' + (tokenParam ? mask(tokenParam) : ''));
    } catch {}

    try {
      const protocols = getProtocols();
      this.ws = protocols ? new WebSocket(urlStr, protocols) : new WebSocket(urlStr);
    } catch (e) {
      console.warn('[Realtime] failed to construct WebSocket:', e?.message);
      this.trySSEFallback();
      return;
    }

    this.ws.onopen = () => {
      this.connected = true;
      this.mode = 'ws';
      this.reconnectAttempts = 0;
      console.log('[Realtime] connected WS');
      this.notifyStatus();
      while (this.queue.length) {
        const msg = this.queue.shift();
        try { this.ws.send(JSON.stringify(msg)); } catch { }
      }
    };

    this.ws.onmessage = (evt) => {
      let data;
      try {
        data = JSON.parse(evt.data);
      } catch {
        data = { type: 'message', payload: evt.data };
      }
      const type = data?.type || 'message';
      this.emit({ type, payload: data?.payload ?? data, raw: data });
    };

    this.ws.onerror = (err) => {
      console.warn('[Realtime] WS error', err);
    };

    this.ws.onclose = (evt) => {
      this.connected = false;
      this.mode = 'off';
      console.warn('[Realtime] WS closed', { code: evt?.code, reason: evt?.reason });
      this.notifyStatus();
      const hasSSE = !!import.meta.env.VITE_SSE_URL;
      if (hasSSE && this.reconnectAttempts >= 3) {
        this.trySSEFallback();
      } else {
        this.scheduleReconnect();
      }
    };
  }

  trySSEFallback() {
    if (this.sse) return; // already trying
    const base = import.meta.env.VITE_SSE_URL; // only attempt SSE if explicitly configured
    if (!base) {
      console.log('[Realtime] SSE URL not configured; staying on polling');
      return;
    }
    let sseUrl;
    try {
      const u = new URL(base);
      const appendToken = String(import.meta.env.VITE_SSE_APPEND_TOKEN ?? 'true').toLowerCase() !== 'false';
      if (appendToken) {
        const token = (localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token') || '').trim();
        if (token && !u.searchParams.get(import.meta.env.VITE_SSE_TOKEN_PARAM || 'token')) {
          u.searchParams.set(import.meta.env.VITE_SSE_TOKEN_PARAM || 'token', token);
        }
      }
      u.searchParams.set('client', 'farmnex-frontend');
      u.searchParams.set('v', '1');
      sseUrl = u.toString();
    } catch {
      sseUrl = base;
    }

    try {
      console.log('[Realtime] trying SSE', sseUrl.replace(/token=[^&]+/, 'token=***'));
      const useCreds = String(import.meta.env.VITE_SSE_WITH_CREDENTIALS ?? 'false').toLowerCase() === 'true';
      const es = new EventSource(sseUrl, useCreds ? { withCredentials: true } : undefined);
      this.sse = es;

      es.onopen = () => {
        this.connected = true;
        this.mode = 'sse';
        this.reconnectAttempts = 0;
        console.log('[Realtime] connected SSE');
        this.notifyStatus();
      };

      es.onmessage = (evt) => {
        let data;
        try {
          data = JSON.parse(evt.data);
        } catch {
          data = { type: 'message', payload: evt.data };
        }
        const type = data?.type || 'message';
        this.emit({ type, payload: data?.payload ?? data, raw: data });
      };

      es.onerror = () => {
        console.warn('[Realtime] SSE error/closed; will not retry without explicit refresh');
        this.connected = false;
        this.mode = 'off';
        this.notifyStatus();
        this.sse?.close?.();
        this.sse = null;
      };
    } catch (e) {
      console.warn('[Realtime] SSE not available:', e?.message);
    }
  }

  scheduleReconnect() {
    this.reconnectAttempts += 1;
    const delay = Math.min(1000 * 2 ** Math.min(this.reconnectAttempts, 4), this.maxReconnectDelay);
    console.log('[Realtime] reconnect in', delay, 'ms (attempt', this.reconnectAttempts, ')');
    setTimeout(() => this.connect(), delay);
  }

  // Optional: send if backend expects identification/subscriptions
  send(msg) {
    const payload = typeof msg === 'string' ? { type: 'message', payload: msg } : msg;
    if (this.connected && this.ws?.readyState === WebSocket.OPEN) {
      try { this.ws.send(JSON.stringify(payload)); } catch {}
    } else {
      this.queue.push(payload);
    }
  }
}

export const realtime = new RealtimeClient();
export default realtime;
