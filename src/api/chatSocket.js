import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { getApiBaseUrl } from './auth';

function getSocketBaseUrl() {
  const apiBaseUrl = String(getApiBaseUrl() || '').replace(/\/$/, '');
  if (!apiBaseUrl || apiBaseUrl.includes('현재')) return 'http://localhost:8080';
  return apiBaseUrl.replace(/\/api$/, '');
}

function normalizeSocketMessage(value) {
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return null;
  }
}

export function createChatSocketClient({ getAccessToken, onMessage, onStatus, roomId }) {
  if (!roomId) return null;

  let client;
  client = new Client({
    beforeConnect: async () => {
      const token = await getAccessToken?.();
      client.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    },
    debug: () => {},
    reconnectDelay: 5000,
    webSocketFactory: () => new SockJS(`${getSocketBaseUrl()}/ws`),
    onConnect: () => {
      onStatus?.('connected');
      client.subscribe(`/topic/chat/rooms/${roomId}`, (frame) => {
        const message = normalizeSocketMessage(frame.body);
        if (message) onMessage?.(message);
      });
    },
    onDisconnect: () => onStatus?.('disconnected'),
    onStompError: (frame) => {
      onStatus?.('error', frame.headers?.message || 'STOMP error');
    },
    onWebSocketClose: () => onStatus?.('disconnected'),
    onWebSocketError: () => onStatus?.('error', 'WebSocket error'),
  });

  client.activate();
  return client;
}

export function publishChatMessage(client, roomId, body) {
  if (!client?.connected || !roomId) {
    throw new Error('채팅 서버에 연결되지 않았습니다.');
  }

  client.publish({
    body: JSON.stringify({
      content: body.content || '',
      mediaUrl: body.mediaUrl || null,
      messageType: body.messageType || 'TEXT',
      replyToId: body.replyToId || null,
    }),
    destination: `/app/chat/rooms/${roomId}/send`,
  });
}
