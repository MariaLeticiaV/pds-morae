import { io } from 'socket.io-client';
import { getApiUrl } from './api.js';

// Eventos emitidos pelo backend no namespace /chat (SocketChatNotifier).
export const CHAT_SOCKET_EVENTS = {
  newMessage: 'message:new',
  messagesRead: 'chat:read',
};

// Abre a conexão em tempo real do chat, autenticada com o token de acesso.
// O backend coloca o socket na sala do usuário e envia para ele as mensagens
// novas e as confirmações de leitura das conversas de que participa.
//
// handlers: { onMessage, onRead, onStatusChange }
// onStatusChange recebe 'connecting' | 'connected' | 'reconnecting' | 'unauthorized'.
// Devolve uma função que encerra a conexão.
export function connectChatSocket(token, handlers = {}) {
  const { onMessage, onRead, onStatusChange } = handlers;
  const socket = io(`${getApiUrl()}/chat`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  let wasConnected = false;
  let unauthorized = false;
  onStatusChange?.('connecting');

  socket.on('connect', () => {
    onStatusChange?.('connected', { reconnected: wasConnected });
    wasConnected = true;
  });
  // O gateway emite "error" com UNAUTHORIZED e derruba a conexão quando o
  // token é inválido ou expirou; não adianta tentar de novo com o mesmo token.
  socket.on('error', (payload) => {
    if (payload?.code === 'UNAUTHORIZED') {
      unauthorized = true;
      onStatusChange?.('unauthorized');
      socket.disconnect();
    }
  });
  socket.on('disconnect', (reason) => {
    // "io client disconnect" é o encerramento pedido por nós (ao sair da página).
    if (reason === 'io client disconnect' || unauthorized) return;
    onStatusChange?.('reconnecting');
    // Quando o servidor encerra a conexão, o socket.io não reconecta sozinho.
    if (reason === 'io server disconnect') socket.connect();
  });
  socket.on('connect_error', () => {
    if (!unauthorized) onStatusChange?.('reconnecting');
  });

  socket.on(CHAT_SOCKET_EVENTS.newMessage, (message) => onMessage?.(message));
  socket.on(CHAT_SOCKET_EVENTS.messagesRead, (event) => onRead?.(event));

  return () => {
    socket.removeAllListeners();
    socket.disconnect();
  };
}
