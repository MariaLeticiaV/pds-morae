import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo.jsx';
import { LineIcon } from '../components/LineIcon.jsx';
import './MessagesPage.css';

const initialConversations = [
  {
    id: 'maria', name: 'Maria Letícia', role: 'Proprietária', time: '10:20', online: true, unread: 1,
    preview: 'Sim, ainda está disponível a casa.',
    messages: [
      { id: 1, fromMe: true, text: 'Oi, boa tarde, sou estudante da UFAL estou à procura de uma vaga ou casa para alugar, gostaria de mais informações sobre a casa.', time: '22:30' },
      { id: 2, fromMe: false, text: 'Olá, desculpe a demora. A casa tem 2 quartos com uma suíte e fica localizada no Village.', time: '22:32' },
      { id: 3, fromMe: true, text: 'Poderia me enviar mais fotos da casa e também informações sobre as regras da casa.', time: '22:35' },
      { id: 4, fromMe: true, text: 'Oi de novo, ainda está disponível?', time: '10:00' },
      { id: 5, fromMe: false, text: 'Sim, ainda está disponível a casa.', time: '10:20' },
    ],
  },
  { id: 'user-2', name: 'Usuário 2', role: 'Estudante', time: 'Ontem', online: false, unread: 0, preview: 'Perfeito! Já te envio mais informações.', messages: [{ id: 1, fromMe: false, text: 'Perfeito! Já te envio mais informações.', time: 'Ontem' }] },
  { id: 'user-3', name: 'Usuário 3', role: 'Estudante', time: '10/09', online: false, unread: 1, preview: 'Olá, sua solicitação foi recebida e está...', messages: [{ id: 1, fromMe: false, text: 'Olá, sua solicitação foi recebida e está sendo analisada.', time: '10/09' }] },
  { id: 'user-4', name: 'Usuário 4', role: 'Proprietária', time: '07/09', online: false, unread: 0, preview: 'Obrigada por entrar em contato!', messages: [{ id: 1, fromMe: false, text: 'Obrigada por entrar em contato!', time: '07/09' }] },
  { id: 'user-5', name: 'Usuário 5', role: 'Estudante', time: '03/09', online: false, unread: 0, preview: 'Consegue me informar se ainda está...', messages: [{ id: 1, fromMe: true, text: 'Consegue me informar se ainda está disponível?', time: '03/09' }] },
  { id: 'support', name: 'Equipe Moraê', role: 'Suporte', time: '02/09', online: false, unread: 0, preview: 'Dica: Mantenha seu perfil sempre atu...', messages: [{ id: 1, fromMe: false, text: 'Dica: mantenha seu perfil sempre atualizado para encontrar moradias que combinam com você.', time: '02/09' }] },
];

const filters = ['Todas', 'Proprietários', 'Estudantes', 'Suporte'];

function Avatar({ conversation, large = false }) {
  return conversation.id === 'support'
    ? <span className={`message-avatar message-avatar-logo${large ? ' large' : ''}`}><img src="/assets/morae-symbol.png" alt="" /></span>
    : <span className={`message-avatar${large ? ' large' : ''}`} aria-label={`Avatar de ${conversation.name}`}><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="17" r="8" /><path d="M7 44c.7-11 7-17 17-17s16.3 6 17 17" /></svg></span>;
}

function MessageBubble({ message }) {
  return <div className={`message-row${message.fromMe ? ' sent' : ' received'}`}><div className="message-bubble">{message.attachment && <span className="message-attachment"><LineIcon name="paperclip" size={15} />{message.attachment}</span>}{message.text && <p>{message.text}</p>}<time>{message.time}</time></div></div>;
}

export function MessagesPage() {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState('maria');
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [attachment, setAttachment] = useState(null);
  const activeConversation = conversations.find((conversation) => conversation.id === activeId) ?? conversations[0];
  const visibleConversations = useMemo(() => conversations.filter((conversation) => {
    const matchesFilter = activeFilter === 'Todas'
      || (activeFilter === 'Proprietários' && conversation.role === 'Proprietária')
      || (activeFilter === 'Estudantes' && conversation.role === 'Estudante')
      || (activeFilter === 'Suporte' && conversation.role === 'Suporte');
    const query = search.trim().toLocaleLowerCase('pt-BR');
    return matchesFilter && (!query || `${conversation.name} ${conversation.role} ${conversation.preview}`.toLocaleLowerCase('pt-BR').includes(query));
  }), [conversations, activeFilter, search]);

  function selectConversation(id) {
    setActiveId(id);
    setConversations((current) => current.map((conversation) => conversation.id === id ? { ...conversation, unread: 0 } : conversation));
  }

  function sendMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text && !attachment) return;
    const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date());
    const newMessage = { id: Date.now(), fromMe: true, text, time, attachment: attachment?.name };
    setConversations((current) => current.map((conversation) => conversation.id === activeId
      ? { ...conversation, messages: [...conversation.messages, newMessage], preview: text || `📎 ${attachment.name}`, time, unread: 0 }
      : conversation));
    setDraft('');
    setAttachment(null);
  }

  return (
    <div className="messages-dashboard">
      <aside className="dashboard-sidebar messages-sidebar">
        <Link className="dashboard-brand" to="/" aria-label="Moraê, página inicial"><Logo /></Link>
        <nav className="dashboard-nav" aria-label="Menu do estudante">
          <Link to="/"><LineIcon name="home" />Início</Link>
          <Link className="selected" to="/mensagens"><LineIcon name="message" />Minhas Mensagens</Link>
          <Link to="/buscar"><LineIcon name="heart" />Meus Favoritos</Link>
          <Link to="/perfil"><LineIcon name="user" />Meu Perfil</Link>
        </nav>
        <span className="sidebar-version">Moraê · Maceió, AL</span>
      </aside>

      <main className="messages-main">
        <header className="dashboard-topbar messages-topbar">
          <label className="messages-global-search"><LineIcon name="search" size={21} /><input placeholder="Buscar por cidade, bairro, universidade..." aria-label="Buscar por cidade, bairro ou universidade" /></label>
          <div className="messages-top-actions"><button type="button" aria-label="Notificações"><LineIcon name="bell" size={21} /></button><span className="messages-divider" /><span className="messages-user-avatar">A</span><span>Olá, Aluno</span><span className="messages-chevron" /></div>
        </header>

        <div className="messages-content">
          <section className="messages-hero">
            <div className="messages-hero-copy"><LineIcon name="message" size={62} /><div><h1>Minhas Mensagens</h1><p>Converse com estudantes, proprietários e acompanhe suas conversas.</p></div></div>
            <div className="messages-hero-art"><img src="/assets/morae-symbol.png" alt="" /><p>Boas conversas<br />levam a grandes<br />moradias! <span>♡</span></p></div>
            <span className="messages-orbit messages-orbit-green" /><span className="messages-orbit messages-orbit-pink" />
          </section>

          <section className="messages-workspace" aria-label="Conversas">
            <aside className="conversation-list-panel">
              <div className="conversation-filters" role="tablist" aria-label="Filtrar conversas">{filters.map((filter) => <button key={filter} role="tab" aria-selected={activeFilter === filter} className={activeFilter === filter ? 'active' : ''} type="button" onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div>
              <label className="conversation-search"><LineIcon name="search" size={20} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar conversa..." aria-label="Buscar conversa" /></label>
              <div className="conversation-items">{visibleConversations.length ? visibleConversations.map((conversation) => <button type="button" key={conversation.id} className={`conversation-item${activeId === conversation.id ? ' active' : ''}`} onClick={() => selectConversation(conversation.id)}><Avatar conversation={conversation} /><span className="conversation-copy"><strong>{conversation.name}{conversation.online && <i className="online-dot" />}</strong><small>{conversation.preview}</small></span><span className="conversation-meta"><time>{conversation.time}</time>{conversation.unread > 0 && <b>{conversation.unread}</b>}</span></button>) : <p className="empty-conversations">Nenhuma conversa encontrada.</p>}</div>
            </aside>

            <section className="chat-panel" aria-label={`Conversa com ${activeConversation.name}`}>
              <header className="chat-header"><Avatar conversation={activeConversation} large /><div><strong>{activeConversation.name}{activeConversation.online && <i className="online-dot" />}</strong><small>{activeConversation.role}</small></div></header>
              <div className="chat-messages" aria-live="polite">{activeConversation.messages.map((message) => <MessageBubble key={message.id} message={message} />)}</div>
              <form className="chat-composer" onSubmit={sendMessage}>
                <div className="composer-field"><button type="button" aria-label="Inserir emoji" onClick={() => setDraft((value) => `${value}${value ? ' ' : ''}😊`)}><LineIcon name="smile" size={22} /></button><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={attachment ? `Anexar: ${attachment.name}` : 'Digite sua mensagem...'} aria-label="Digite sua mensagem" /><label className="attachment-button" aria-label="Anexar arquivo"><LineIcon name="paperclip" size={24} /><input type="file" onChange={(event) => setAttachment(event.target.files?.[0] ?? null)} /></label></div>
                <button className="send-button" type="submit" aria-label="Enviar mensagem"><LineIcon name="send" size={26} /></button>
              </form>
            </section>
          </section>
        </div>
      </main>
    </div>
  );
}
