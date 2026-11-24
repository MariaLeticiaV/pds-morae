import { DashboardSidebar } from '../components/DashboardSidebar.jsx';
import { AccountMenu } from '../components/AccountMenu.jsx';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LineIcon } from '../components/LineIcon.jsx';
import {
  getAccessToken,
  getApiUrl,
  getApprovedListing,
  getChat,
  listChatMessages,
  listChats,
  markChatAsRead,
  sendChatMessage,
  startDirectChat,
} from '../services/api.js';
import { connectChatSocket } from '../services/chatSocket.js';
import { getUserSession } from '../services/userAuth.js';
import './MessagesPage.css';

const filters = ['Todas', 'Não lidas', 'Diretas', 'Grupos'];
const CHATS_PAGE_SIZE = 30;
const MESSAGES_PAGE_SIZE = 30;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const socketStatusLabels = {
  connecting: 'Conectando…',
  connected: 'Tempo real ativo',
  reconnecting: 'Reconectando…',
  unauthorized: 'Sessão expirada',
};

const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });
const longDateFormatter = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function dayDistance(iso) {
  return Math.round((startOfDay(new Date()) - startOfDay(new Date(iso))) / 86_400_000);
}

function formatListTime(iso) {
  if (!iso) return '';
  const distance = dayDistance(iso);
  if (distance === 0) return timeFormatter.format(new Date(iso));
  if (distance === 1) return 'Ontem';
  return shortDateFormatter.format(new Date(iso));
}

function formatDayLabel(iso) {
  const distance = dayDistance(iso);
  if (distance === 0) return 'Hoje';
  if (distance === 1) return 'Ontem';
  return longDateFormatter.format(new Date(iso));
}

function byActivityDesc(a, b) {
  return Date.parse(b.lastActivityAt) - Date.parse(a.lastActivityAt);
}

function byCreatedAsc(a, b) {
  return Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.id.localeCompare(b.id);
}

// Junta mensagens sem repetir ids e mantém a ordem cronológica.
function mergeMessages(current, incoming) {
  const map = new Map(current.map((message) => [message.id, message]));
  incoming.forEach((message) => map.set(message.id, { ...map.get(message.id), ...message }));
  return [...map.values()].sort(byCreatedAsc);
}

function upsertChat(chats, chat) {
  const others = chats.filter((item) => item.id !== chat.id);
  return [...others, chat].sort(byActivityDesc);
}

function otherParticipants(chat, myId) {
  return chat.participants.filter((participant) => participant.userId !== myId);
}

function chatTitle(chat, myId) {
  if (chat.type === 'GROUP') return chat.name || 'Grupo';
  return otherParticipants(chat, myId)[0]?.name || 'Conversa';
}

function chatSubtitle(chat) {
  return chat.type === 'GROUP' ? `Grupo · ${chat.participants.length} participantes` : 'Conversa direta';
}

function messagePreview(message, myId) {
  if (!message) return 'Nenhuma mensagem ainda.';
  const prefix = message.senderId === myId ? 'Você: ' : '';
  if (message.content) return `${prefix}${message.content}`;
  return `${prefix}Compartilhou um anúncio`;
}

function photoSource(photoUrl) {
  if (!photoUrl) return null;
  if (/^https?:\/\//i.test(photoUrl)) return photoUrl;
  return `${getApiUrl()}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
}

function Avatar({ name, photoUrl, large = false }) {
  const source = photoSource(photoUrl);
  const initial = (name || '?').trim().charAt(0).toLocaleUpperCase('pt-BR') || '?';
  return (
    <span className={`message-avatar${large ? ' large' : ''}`} aria-hidden="true">
      {source ? <img src={source} alt="" /> : <span className="message-avatar-initial">{initial}</span>}
    </span>
  );
}

function ListingCard({ listingId, title }) {
  return (
    <Link className="message-listing-card" to={`/imoveis/${encodeURIComponent(listingId)}`}>
      <LineIcon name="home" size={16} />
      <span><small>Anúncio</small><strong>{title || 'Ver anúncio'}</strong></span>
    </Link>
  );
}

function MessageBubble({ message, mine, readByOthers, senderName, listingTitle, onRetry }) {
  return (
    <div className={`message-row${mine ? ' sent' : ' received'}`}>
      <div className={`message-bubble${message.status === 'failed' ? ' failed' : ''}`}>
        {senderName && <span className="message-sender">{senderName}</span>}
        {message.listingId && <ListingCard listingId={message.listingId} title={listingTitle} />}
        {message.content && <p>{message.content}</p>}
        <span className="message-meta">
          <time dateTime={message.createdAt}>{timeFormatter.format(new Date(message.createdAt))}</time>
          {mine && message.status === 'sending' && <span className="message-status" title="Enviando">◷</span>}
          {mine && !message.status && (
            <span className={`message-status${readByOthers ? ' read' : ''}`} title={readByOthers ? 'Lida' : 'Enviada'}>
              {readByOthers ? '✓✓' : '✓'}
            </span>
          )}
        </span>
        {message.status === 'failed' && (
          <button type="button" className="message-retry" onClick={onRetry}>Não enviada. Tentar novamente</button>
        )}
      </div>
    </div>
  );
}

export function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const session = getUserSession();
  const token = getAccessToken();
  const myId = session?.userId ?? null;
  const isAuthenticated = Boolean(myId && token);
  const displayName = session?.name || 'Visitante';
  const avatarInitial = displayName.charAt(0).toLocaleUpperCase('pt-BR');

  const [chats, setChats] = useState([]);
  const [chatsCursor, setChatsCursor] = useState(null);
  const [chatsState, setChatsState] = useState({ status: isAuthenticated ? 'loading' : 'idle', error: '' });
  const [activeId, setActiveId] = useState(null);
  const [threads, setThreads] = useState({});
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [socketStatus, setSocketStatus] = useState(isAuthenticated ? 'connecting' : 'idle');
  const [notice, setNotice] = useState('');
  // Anúncio de onde o usuário veio: vai anexado à primeira mensagem enviada.
  const [listingContext, setListingContext] = useState(null);
  const [listingTitles, setListingTitles] = useState({});

  const activeIdRef = useRef(null);
  const chatsRef = useRef([]);
  const messagesRef = useRef(null);
  const scrollRestoreRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const requestedListingsRef = useRef(new Set());

  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);
  useEffect(() => { chatsRef.current = chats; }, [chats]);

  const activeChat = chats.find((chat) => chat.id === activeId) ?? null;
  const activeThread = activeId ? threads[activeId] : null;

  const updateChat = useCallback((chatId, update) => {
    setChats((current) => current.map((chat) => (chat.id === chatId ? update(chat) : chat)).sort(byActivityDesc));
  }, []);

  const markAsRead = useCallback((chatId) => {
    updateChat(chatId, (chat) => ({ ...chat, unreadCount: 0 }));
    markChatAsRead(chatId).catch(() => {
      // A contagem volta a ser corrigida na próxima carga da lista.
    });
  }, [updateChat]);

  const loadChats = useCallback(async ({ append = false } = {}) => {
    if (!append) setChatsState((state) => ({ ...state, status: state.status === 'ready' ? 'ready' : 'loading' }));
    try {
      const page = await listChats({ cursor: append ? chatsCursor : undefined, limit: CHATS_PAGE_SIZE });
      setChats((current) => {
        const merged = append ? current : current.filter((chat) => !page.items.some((item) => item.id === chat.id));
        return page.items.reduce(upsertChat, merged);
      });
      setChatsCursor(page.nextCursor);
      setChatsState({ status: 'ready', error: '' });
    } catch (error) {
      setChatsState({ status: 'error', error: error.message || 'Não foi possível carregar suas conversas.' });
    }
  }, [chatsCursor]);

  const loadMessages = useCallback(async (chatId, { older = false } = {}) => {
    const cursor = older ? threads[chatId]?.nextCursor : undefined;
    setThreads((current) => ({
      ...current,
      [chatId]: { items: [], nextCursor: null, ...current[chatId], status: older ? 'loading-older' : (current[chatId]?.items?.length ? 'ready' : 'loading'), error: '' },
    }));
    try {
      const page = await listChatMessages(chatId, { cursor, limit: MESSAGES_PAGE_SIZE });
      if (older && messagesRef.current) {
        scrollRestoreRef.current = messagesRef.current.scrollHeight - messagesRef.current.scrollTop;
      }
      setThreads((current) => {
        const previous = current[chatId] ?? { items: [], nextCursor: null };
        return {
          ...current,
          [chatId]: {
            items: mergeMessages(previous.items, page.items),
            // Só a primeira página (a mais recente) define se há mais antigas
            // quando ainda não carregamos nenhuma antes.
            nextCursor: older || !previous.loadedOnce ? page.nextCursor : previous.nextCursor,
            loadedOnce: true,
            status: 'ready',
            error: '',
          },
        };
      });
    } catch (error) {
      setThreads((current) => ({
        ...current,
        [chatId]: { items: [], nextCursor: null, ...current[chatId], status: 'error', error: error.message || 'Não foi possível carregar as mensagens.' },
      }));
    }
  }, [threads]);

  // Primeira carga da lista de conversas.
  useEffect(() => {
    if (!isAuthenticated) return;
    loadChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Links de outras telas: ?conversa=<id>, ou ?contato=<userId>&anuncio=<listingId>&imovel=<título>.
  const requestedChatId = searchParams.get('conversa');
  const requestedContactId = searchParams.get('contato');
  const requestedListingId = searchParams.get('anuncio');
  const requestedListingTitle = searchParams.get('imovel');
  const requestedContactName = searchParams.get('nome');

  useEffect(() => {
    if (!isAuthenticated) return;
    if (requestedChatId) {
      setActiveId(requestedChatId);
      if (!chatsRef.current.some((chat) => chat.id === requestedChatId)) {
        getChat(requestedChatId)
          .then((chat) => setChats((current) => upsertChat(current, chat)))
          .catch((error) => setNotice(error.message || 'Não foi possível abrir esta conversa.'));
      }
      return;
    }
    if (!requestedContactId && !requestedListingId) return;

    const listingId = requestedListingId && UUID_PATTERN.test(requestedListingId) ? requestedListingId : null;
    const targetUserId = requestedContactId && UUID_PATTERN.test(requestedContactId) ? requestedContactId : null;
    if (!listingId && !targetUserId) {
      setNotice(`${requestedContactName || 'Este contato'} faz parte da demonstração e não tem uma conta no Moraê para conversar.`);
      setSearchParams({}, { replace: true });
      return;
    }
    if (targetUserId === myId) {
      setNotice('Este anúncio é seu. As mensagens dos interessados aparecem aqui quando eles escreverem.');
      setSearchParams({}, { replace: true });
      return;
    }

    let cancelled = false;
    // Com o contato informado, a conversa é com ele (ex.: proprietário falando
    // com um interessado); sem contato, com o anunciante do anúncio.
    startDirectChat(targetUserId ? { targetUserId } : { listingId })
      .then((chat) => {
        if (cancelled) return;
        setChats((current) => upsertChat(current, chat));
        setActiveId(chat.id);
        if (listingId) {
          setListingContext({ chatId: chat.id, listingId, title: requestedListingTitle || '' });
          if (requestedListingTitle) setListingTitles((current) => ({ ...current, [listingId]: requestedListingTitle }));
        }
        setSearchParams({ conversa: chat.id }, { replace: true });
      })
      .catch((error) => {
        if (!cancelled) setNotice(error.message || 'Não foi possível iniciar a conversa.');
      });
    return () => { cancelled = true; };
  }, [isAuthenticated, myId, requestedChatId, requestedContactId, requestedListingId, requestedListingTitle, requestedContactName, setSearchParams]);

  // Sem conversa pedida pela URL, abre a mais recente.
  useEffect(() => {
    if (activeId || requestedChatId || requestedContactId || requestedListingId) return;
    if (chats.length) setActiveId(chats[0].id);
  }, [activeId, chats, requestedChatId, requestedContactId, requestedListingId]);

  // Ao abrir uma conversa: carrega o histórico e marca como lida.
  useEffect(() => {
    if (!activeId || !isAuthenticated) return;
    stickToBottomRef.current = true;
    if (!threads[activeId]?.loadedOnce) loadMessages(activeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, isAuthenticated]);

  useEffect(() => {
    if (activeChat?.unreadCount > 0 && document.visibilityState === 'visible') markAsRead(activeChat.id);
  }, [activeChat?.id, activeChat?.unreadCount, markAsRead]);

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState !== 'visible') return;
      const chat = chatsRef.current.find((item) => item.id === activeIdRef.current);
      if (chat?.unreadCount > 0) markAsRead(chat.id);
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [markAsRead]);

  // Tempo real: mensagens novas e confirmações de leitura.
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    return connectChatSocket(token, {
      onStatusChange: (status, details) => {
        setSocketStatus(status);
        // Depois de uma queda, busca o que chegou enquanto estava desconectado.
        if (status === 'connected' && details?.reconnected) {
          loadChats();
          if (activeIdRef.current) loadMessages(activeIdRef.current);
        }
      },
      onMessage: (message) => {
        if (!message?.chatId || !message?.id) return;
        setThreads((current) => (current[message.chatId]
          ? { ...current, [message.chatId]: { ...current[message.chatId], items: mergeMessages(current[message.chatId].items, [message]) } }
          : current));

        const known = chatsRef.current.some((chat) => chat.id === message.chatId);
        if (!known) {
          getChat(message.chatId).then((chat) => setChats((current) => upsertChat(current, chat))).catch(() => {});
          return;
        }
        const isActiveAndVisible = message.chatId === activeIdRef.current && document.visibilityState === 'visible';
        updateChat(message.chatId, (chat) => ({
          ...chat,
          lastMessage: message,
          lastActivityAt: message.createdAt,
          unreadCount: isActiveAndVisible ? chat.unreadCount : chat.unreadCount + 1,
        }));
        if (isActiveAndVisible) markChatAsRead(message.chatId).catch(() => {});
      },
      onRead: (event) => {
        if (!event?.chatId || !event?.userId) return;
        updateChat(event.chatId, (chat) => ({
          ...chat,
          participants: chat.participants.map((participant) => (participant.userId === event.userId
            ? { ...participant, lastReadAt: event.readAt }
            : participant)),
        }));
      },
    });
    // loadChats/loadMessages mudam a cada render; a conexão deve durar a página toda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token, updateChat]);

  // Busca o título dos anúncios citados nas mensagens.
  useEffect(() => {
    const ids = new Set((activeThread?.items ?? []).map((message) => message.listingId).filter(Boolean));
    ids.forEach((listingId) => {
      if (listingTitles[listingId] !== undefined || requestedListingsRef.current.has(listingId)) return;
      requestedListingsRef.current.add(listingId);
      getApprovedListing(listingId)
        .then((listing) => setListingTitles((current) => ({ ...current, [listingId]: listing.title })))
        .catch(() => setListingTitles((current) => ({ ...current, [listingId]: '' })));
    });
  }, [activeThread?.items, listingTitles]);

  // Rolagem: mantém a posição ao carregar mensagens antigas e desce para as novas.
  useLayoutEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    if (scrollRestoreRef.current !== null) {
      container.scrollTop = container.scrollHeight - scrollRestoreRef.current;
      scrollRestoreRef.current = null;
    } else if (stickToBottomRef.current) {
      container.scrollTop = container.scrollHeight;
    }
  }, [activeThread?.items, activeId]);

  function handleMessagesScroll() {
    const container = messagesRef.current;
    if (!container) return;
    stickToBottomRef.current = container.scrollHeight - container.scrollTop - container.clientHeight < 80;
  }

  async function deliver(chatId, pending) {
    try {
      const saved = await sendChatMessage(chatId, { content: pending.content, listingId: pending.listingId });
      setThreads((current) => {
        const thread = current[chatId] ?? { items: [], nextCursor: null };
        return {
          ...current,
          [chatId]: { ...thread, items: mergeMessages(thread.items.filter((message) => message.id !== pending.id), [saved]) },
        };
      });
      updateChat(chatId, (chat) => ({ ...chat, lastMessage: saved, lastActivityAt: saved.createdAt }));
      if (pending.listingId) setListingContext((context) => (context?.chatId === chatId ? null : context));
    } catch (error) {
      setThreads((current) => {
        const thread = current[chatId];
        if (!thread) return current;
        return {
          ...current,
          [chatId]: { ...thread, items: thread.items.map((message) => (message.id === pending.id ? { ...message, status: 'failed' } : message)) },
        };
      });
      setNotice(error.message || 'Não foi possível enviar a mensagem.');
    }
  }

  function handleSend(event) {
    event.preventDefault();
    const content = draft.trim();
    if (!activeChat || !content) return;
    const attachListing = listingContext?.chatId === activeChat.id ? listingContext.listingId : null;
    const pending = {
      id: `pendente-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      chatId: activeChat.id,
      senderId: myId,
      content,
      listingId: attachListing,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };
    stickToBottomRef.current = true;
    setThreads((current) => {
      const thread = current[activeChat.id] ?? { items: [], nextCursor: null, loadedOnce: true, status: 'ready' };
      return { ...current, [activeChat.id]: { ...thread, items: [...thread.items, pending] } };
    });
    setDraft('');
    setNotice('');
    deliver(activeChat.id, pending);
  }

  function retry(message) {
    setThreads((current) => {
      const thread = current[message.chatId];
      return {
        ...current,
        [message.chatId]: { ...thread, items: thread.items.map((item) => (item.id === message.id ? { ...item, status: 'sending' } : item)) },
      };
    });
    deliver(message.chatId, message);
  }

  function selectConversation(chatId) {
    setActiveId(chatId);
    setNotice('');
    if (searchParams.toString()) setSearchParams({ conversa: chatId }, { replace: true });
  }

  const visibleChats = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR');
    return chats.filter((chat) => {
      const matchesFilter = activeFilter === 'Todas'
        || (activeFilter === 'Não lidas' && chat.unreadCount > 0)
        || (activeFilter === 'Diretas' && chat.type === 'DIRECT')
        || (activeFilter === 'Grupos' && chat.type === 'GROUP');
      if (!matchesFilter) return false;
      if (!query) return true;
      const haystack = `${chatTitle(chat, myId)} ${chat.lastMessage?.content ?? ''}`.toLocaleLowerCase('pt-BR');
      return haystack.includes(query);
    });
  }, [chats, activeFilter, search, myId]);

  const participantNames = useMemo(
    () => Object.fromEntries((activeChat?.participants ?? []).map((participant) => [participant.userId, participant.name])),
    [activeChat],
  );
  const othersInActiveChat = activeChat ? otherParticipants(activeChat, myId) : [];

  function isReadByOthers(message) {
    if (!othersInActiveChat.length) return false;
    return othersInActiveChat.every((participant) => participant.lastReadAt && Date.parse(participant.lastReadAt) >= Date.parse(message.createdAt));
  }

  function renderMessages() {
    if (!activeThread || activeThread.status === 'loading') return <p className="chat-placeholder" role="status">Carregando mensagens…</p>;
    if (activeThread.status === 'error' && !activeThread.items.length) {
      return <p className="chat-placeholder" role="alert">{activeThread.error} <button type="button" onClick={() => loadMessages(activeId)}>Tentar novamente</button></p>;
    }
    const rows = [];
    if (activeThread.nextCursor) {
      rows.push(
        <button key="older" type="button" className="chat-load-older" disabled={activeThread.status === 'loading-older'} onClick={() => loadMessages(activeId, { older: true })}>
          {activeThread.status === 'loading-older' ? 'Carregando…' : 'Carregar mensagens anteriores'}
        </button>,
      );
    }
    if (!activeThread.items.length) {
      rows.push(<p key="empty" className="chat-placeholder">Nenhuma mensagem ainda. Envie a primeira!</p>);
    }
    let lastDay = null;
    activeThread.items.forEach((message) => {
      const day = new Date(message.createdAt).toDateString();
      if (day !== lastDay) {
        rows.push(<div key={`dia-${day}`} className="chat-day-separator"><span>{formatDayLabel(message.createdAt)}</span></div>);
        lastDay = day;
      }
      const mine = message.senderId === myId;
      rows.push(
        <MessageBubble
          key={message.id}
          message={message}
          mine={mine}
          readByOthers={mine && isReadByOthers(message)}
          senderName={!mine && activeChat?.type === 'GROUP' ? participantNames[message.senderId] : null}
          listingTitle={message.listingId ? listingTitles[message.listingId] : null}
          onRetry={() => retry(message)}
        />,
      );
    });
    return rows;
  }

  if (!isAuthenticated) {
    return (
      <div className="messages-dashboard">
        <DashboardSidebar active="messages" />
        <main className="messages-main">
          <div className="messages-content">
            <section className="messages-login-required">
              <LineIcon name="message" size={34} />
              <h1>Suas mensagens</h1>
              <p>Entre na sua conta para conversar com estudantes e anunciantes em tempo real.</p>
              <Link to="/login">Entrar</Link>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="messages-dashboard">
      <DashboardSidebar active="messages" />

      <main className="messages-main">
        <header className="dashboard-topbar messages-topbar">
          <label className="messages-global-search"><LineIcon name="search" size={21} /><input placeholder="Buscar por cidade, bairro, universidade..." aria-label="Buscar por cidade, bairro ou universidade" /></label>
          <div className="messages-top-actions"><span className={`messages-connection is-${socketStatus}`} role="status"><i />{socketStatusLabels[socketStatus]}</span><span className="messages-divider" /><AccountMenu className="messages-profile-trigger"><span className="messages-user-avatar">{avatarInitial}</span><span>Olá, {displayName}</span><span className="messages-chevron" /></AccountMenu></div>
        </header>

        <div className="messages-content">
          {notice && <p className="messages-notice" role="alert">{notice}<button type="button" aria-label="Fechar aviso" onClick={() => setNotice('')}>×</button></p>}
          {socketStatus === 'unauthorized' && <p className="messages-notice" role="alert">Sua sessão expirou. <Link to="/login">Entre novamente</Link> para receber mensagens em tempo real.</p>}
          <section className="messages-workspace" aria-label="Conversas">
            <aside className="conversation-list-panel">
              <div className="conversation-filters" role="tablist" aria-label="Filtrar conversas">{filters.map((filter) => <button key={filter} role="tab" aria-selected={activeFilter === filter} className={activeFilter === filter ? 'active' : ''} type="button" onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div>
              <label className="conversation-search"><LineIcon name="search" size={20} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar conversa..." aria-label="Buscar conversa" /></label>
              <div className="conversation-items">
                {chatsState.status === 'loading' && !chats.length && <p className="empty-conversations" role="status">Carregando conversas…</p>}
                {chatsState.status === 'error' && <p className="empty-conversations" role="alert">{chatsState.error} <button type="button" onClick={() => loadChats()}>Tentar novamente</button></p>}
                {chatsState.status === 'ready' && !visibleChats.length && (
                  <p className="empty-conversations">{chats.length ? 'Nenhuma conversa encontrada.' : 'Você ainda não tem conversas. Abra um anúncio ou um perfil e clique em "Enviar mensagem".'}</p>
                )}
                {visibleChats.map((chat) => {
                  const title = chatTitle(chat, myId);
                  const photo = chat.type === 'DIRECT' ? otherParticipants(chat, myId)[0]?.photoUrl : null;
                  return (
                    <button type="button" key={chat.id} className={`conversation-item${activeId === chat.id ? ' active' : ''}${chat.unreadCount > 0 ? ' unread' : ''}`} onClick={() => selectConversation(chat.id)}>
                      <Avatar name={title} photoUrl={photo} />
                      <span className="conversation-copy"><strong>{title}</strong><small>{messagePreview(chat.lastMessage, myId)}</small></span>
                      <span className="conversation-meta"><time dateTime={chat.lastActivityAt}>{formatListTime(chat.lastMessage?.createdAt ?? chat.lastActivityAt)}</time>{chat.unreadCount > 0 && <b aria-label={`${chat.unreadCount} não lidas`}>{chat.unreadCount > 99 ? '99+' : chat.unreadCount}</b>}</span>
                    </button>
                  );
                })}
                {chatsCursor && chatsState.status === 'ready' && <button type="button" className="conversation-load-more" onClick={() => loadChats({ append: true })}>Carregar mais conversas</button>}
              </div>
            </aside>

            {activeChat ? (
              <section className="chat-panel" aria-label={`Conversa com ${chatTitle(activeChat, myId)}`}>
                <header className="chat-header">
                  <Avatar name={chatTitle(activeChat, myId)} photoUrl={activeChat.type === 'DIRECT' ? othersInActiveChat[0]?.photoUrl : null} large />
                  <div>
                    <strong>{chatTitle(activeChat, myId)}</strong>
                    <small>{chatSubtitle(activeChat)}</small>
                  </div>
                  {activeChat.type === 'DIRECT' && othersInActiveChat[0] && <Link className="chat-profile-link" to={`/usuarios/${encodeURIComponent(othersInActiveChat[0].userId)}`}>Ver perfil</Link>}
                </header>
                <div className="chat-messages" aria-live="polite" ref={messagesRef} onScroll={handleMessagesScroll}>{renderMessages()}</div>
                {listingContext?.chatId === activeChat.id && (
                  <div className="chat-listing-context">
                    <ListingCard listingId={listingContext.listingId} title={listingContext.title} />
                    <span>Será enviado junto com sua próxima mensagem.</span>
                    <button type="button" aria-label="Não anexar o anúncio" onClick={() => setListingContext(null)}>×</button>
                  </div>
                )}
                <form className="chat-composer" onSubmit={handleSend}>
                  <div className="composer-field">
                    <button type="button" aria-label="Inserir emoji" onClick={() => setDraft((value) => `${value}${value ? ' ' : ''}😊`)}><LineIcon name="smile" size={22} /></button>
                    <input value={draft} maxLength={10000} onChange={(event) => setDraft(event.target.value)} placeholder="Digite sua mensagem..." aria-label="Digite sua mensagem" />
                  </div>
                  <button className="send-button" type="submit" aria-label="Enviar mensagem" disabled={!draft.trim()}><LineIcon name="send" size={26} /></button>
                </form>
              </section>
            ) : (
              <section className="chat-panel chat-panel-empty">
                <p className="chat-placeholder">{chatsState.status === 'loading' ? 'Carregando…' : 'Selecione uma conversa para começar.'}</p>
              </section>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
