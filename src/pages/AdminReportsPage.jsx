import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdministratorSession } from '../services/adminAuth.js';
import {
  listAdminReports,
  removeReportedListing,
  removeReportedProfile,
  updateAdminReport,
} from '../services/adminReports.js';

const statusLabels = {
  OPEN: 'Aberta',
  UNDER_REVIEW: 'Em análise',
  RESOLVED: 'Resolvida',
  DISMISSED: 'Arquivada',
};

const statusTones = {
  OPEN: 'pink',
  UNDER_REVIEW: 'purple',
  RESOLVED: 'green',
  DISMISSED: 'neutral',
};

const categoryLabels = {
  FRAUD: 'Fraude ou golpe',
  HARASSMENT: 'Assédio ou ameaça',
  INAPPROPRIATE_CONTENT: 'Conteúdo inadequado',
  SAFETY: 'Segurança',
  OTHER: 'Outro motivo',
};

export function AdminReportsPage({ search, refresh, onNotice }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], total: 0 });
  const [selectedId, setSelectedId] = useState('');
  const [status, setStatus] = useState('OPEN');
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);
  const [retry, setRetry] = useState(0);

  const selected = result.items.find((report) => report.id === selectedId);
  const pageCount = Math.max(1, Math.ceil(result.total / 25));
  const permissions = getAdministratorSession()?.permissions || [];
  const canRemoveProfile = permissions.includes('VIEW_REPORTS') && permissions.includes('MANAGE_USERS');
  const canRemoveListing = permissions.includes('VIEW_REPORTS') && permissions.includes('MODERATE_LISTINGS');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    listAdminReports({
      search,
      status: statusFilter,
      page,
      limit: 25,
      signal: controller.signal,
    }).then((data) => {
      setResult(data);
      setSelectedId((current) => (
        data.items.some((report) => report.id === current)
          ? current
          : data.items[0]?.id || ''
      ));
    }).catch((requestError) => {
      if (requestError.name !== 'AbortError') setError(requestError.message);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [search, statusFilter, page, refresh, retry]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (!selected) return;
    setStatus(selected.status);
    setAdminNote(selected.adminNote || '');
  }, [selectedId, selected?.status, selected?.adminNote]);

  async function saveReport() {
    if (!selected) return;
    setSaving(true);
    setActionError('');
    try {
      const updated = await updateAdminReport(selected.id, { status, adminNote });
      setResult((current) => ({
        ...current,
        items: current.items.map((item) => item.id === updated.id ? updated : item),
      }));
      onNotice(`Denúncia atualizada para ${statusLabels[updated.status].toLocaleLowerCase('pt-BR')}.`);
    } catch (saveError) {
      setActionError(saveError.message || 'Não foi possível atualizar a denúncia.');
    } finally {
      setSaving(false);
    }
  }

  async function removeTarget(kind) {
    if (!selected || selected.status !== 'UNDER_REVIEW') return;
    const removingListing = kind === 'listing';
    const targetName = removingListing ? selected.listing?.title : selected.targetUser.name;
    const question = removingListing
      ? `Retirar o anúncio "${targetName}" da plataforma? A ação não pode ser desfeita.`
      : `Desativar permanentemente o perfil de ${targetName} e retirar seus anúncios? A ação não pode ser desfeita.`;
    if (!window.confirm(question)) return;

    setSaving(true);
    setActionError('');
    try {
      await updateAdminReport(selected.id, { status: 'UNDER_REVIEW', adminNote });
      const updated = removingListing
        ? await removeReportedListing(selected.id)
        : await removeReportedProfile(selected.id);
      setResult((current) => ({
        ...current,
        items: current.items.map((item) => item.id === updated.id
          ? { ...item, status: updated.status, updatedAt: updated.updatedAt }
          : item),
      }));
      setStatus(updated.status);
      onNotice(removingListing
        ? 'Anúncio retirado e denúncia resolvida.'
        : 'Perfil desativado, anúncios retirados e denúncia resolvida.');
    } catch (removeError) {
      setActionError(removeError.message || 'Não foi possível concluir a remoção.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-reports-layout">
      <section className="admin-panel admin-reports-list">
        <div className="admin-panel-heading">
          <div><h2>Fila de denúncias</h2><p>{result.total.toLocaleString('pt-BR')} registros encontrados</p></div>
          <select
            aria-label="Filtrar denúncias por situação"
            onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}
            value={statusFilter}
          >
            <option value="">Todas as situações</option>
            {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        {loading && <p className="admin-empty" role="status">Consultando denúncias…</p>}
        {!loading && error && <div className="admin-api-error" role="alert"><span>{error}</span><button className="admin-outline-button" onClick={() => setRetry((current) => current + 1)} type="button">Tentar novamente</button></div>}
        {!loading && !error && !result.items.length && <p className="admin-empty">Nenhuma denúncia encontrada.</p>}
        {!loading && !error && result.items.map((report) => (
          <button
            aria-pressed={report.id === selectedId}
            className={`admin-report-row${report.id === selectedId ? ' active' : ''}`}
            key={report.id}
            onClick={() => setSelectedId(report.id)}
            type="button"
          >
            <span className="admin-report-alert">!</span>
            <span className="admin-report-row-copy">
              <strong>{categoryLabels[report.category] || report.category}</strong>
              <small>{report.targetUser.name}{report.listing ? ` · ${report.listing.title}` : ''}</small>
              <small>{new Date(report.createdAt).toLocaleString('pt-BR')}</small>
            </span>
            <span className={`admin-badge ${statusTones[report.status]}`}>{statusLabels[report.status] || report.status}</span>
          </button>
        ))}
        <div className="admin-table-footer">
          <span>Página {page} de {pageCount}</span>
          <div>
            <button disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)} type="button">Anterior</button>
            <button disabled={page >= pageCount || loading} onClick={() => setPage((current) => current + 1)} type="button">Próxima</button>
          </div>
        </div>
      </section>

      <section className="admin-panel admin-report-detail">
        {!selected ? <div className="admin-empty">Selecione uma denúncia para consultar os detalhes.</div> : <>
          <div className="admin-panel-heading">
            <div><h2>Detalhes da denúncia</h2><p>Protocolo {selected.id}</p></div>
            <span className={`admin-badge ${statusTones[selected.status]}`}>{statusLabels[selected.status]}</span>
          </div>
          <div className="admin-report-person">
            <span><small>Denunciado</small><strong>{selected.targetUser.name}</strong><small>{selected.targetUser.email}</small></span>
            {selected.listing && <span><small>Anúncio relacionado</small><strong>{selected.listing.title}</strong><small>{selected.listing.id}</small></span>}
            <span><small>Denunciante</small><strong>{selected.reporter.name}</strong><small>{selected.reporter.email}</small></span>
          </div>
          <div className="admin-report-description">
            <span>{categoryLabels[selected.category] || selected.category}</span>
            <p>{selected.description}</p>
            <time>Recebida em {new Date(selected.createdAt).toLocaleString('pt-BR')}</time>
          </div>
          <label className="admin-report-field">Situação
            <select onChange={(event) => setStatus(event.target.value)} value={status}>
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="admin-report-field">Anotação interna
            <textarea
              maxLength={2000}
              onChange={(event) => setAdminNote(event.target.value)}
              placeholder="Registre o encaminhamento ou contexto interno da análise."
              rows={4}
              value={adminNote}
            />
          </label>
          {selected.adminNote && <p className="admin-report-previous-note"><strong>Anotação salva:</strong> {selected.adminNote}</p>}
          <button className="admin-primary-button" disabled={saving} onClick={saveReport} type="button">
            {saving ? 'Salvando…' : 'Salvar atualização'}
          </button>
          {selected.status !== 'UNDER_REVIEW'
            ? <p className="admin-report-action-hint">Marque a denúncia como “Em análise” e salve para habilitar ações de remoção.</p>
            : <>
              {canRemoveListing && selected.listing && <button className="admin-outline-button admin-report-remove" disabled={saving} onClick={() => removeTarget('listing')} type="button">Retirar anúncio</button>}
              {canRemoveProfile && <button className="admin-outline-button admin-report-remove" disabled={saving} onClick={() => removeTarget('profile')} type="button">Desativar perfil e anúncios</button>}
              {!canRemoveListing && selected.listing && <p className="admin-report-action-hint">A permissão VIEW_REPORTS + MODERATE_LISTINGS é necessária para retirar anúncios.</p>}
              {!canRemoveProfile && <p className="admin-report-action-hint">A permissão VIEW_REPORTS + MANAGE_USERS é necessária para desativar perfis.</p>}
            </>}
          {actionError && <p className="admin-api-error" role="alert">{actionError}</p>}
          <Link className="admin-report-profile-link" to={`/usuarios/${selected.targetUser.id}`}>Abrir perfil do denunciado</Link>
        </>}
      </section>
    </div>
  );
}
