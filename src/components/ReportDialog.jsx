import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAccessToken, submitReport } from '../services/api.js';
import './ReportDialog.css';

const categories = [
  ['FRAUD', 'Fraude ou tentativa de golpe'],
  ['HARASSMENT', 'Assédio ou ameaça'],
  ['INAPPROPRIATE_CONTENT', 'Conteúdo inadequado'],
  ['SAFETY', 'Risco à segurança'],
  ['OTHER', 'Outro motivo'],
];

export function ReportDialog({ targetUserId, listingId, targetName, listingTitle, onClose }) {
  const [category, setCategory] = useState('OTHER');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const descriptionLength = description.trim().length;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await submitReport({
        ...(listingId ? { listingId } : { targetUserId }),
        category,
        description,
      });
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível registrar a denúncia.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="report-dialog-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section aria-labelledby="report-dialog-title" aria-modal="true" className="report-dialog" role="dialog">
        <button aria-label="Fechar" className="report-dialog-close" onClick={onClose} type="button">×</button>
        {submitted ? <>
          <span className="report-dialog-icon success" aria-hidden="true">✓</span>
          <h2 id="report-dialog-title">Denúncia registrada</h2>
          <p>Obrigado por ajudar a manter a Moraê segura. A equipe de moderação vai analisar o relato.</p>
          <button className="report-dialog-submit" onClick={onClose} type="button">Concluir</button>
        </> : !getAccessToken() ? <>
          <span className="report-dialog-icon" aria-hidden="true">!</span>
          <h2 id="report-dialog-title">Entre para denunciar</h2>
          <p>É necessário acessar sua conta para enviar um relato sobre {listingTitle || targetName || 'este perfil'}.</p>
          <Link className="report-dialog-submit" to="/login" onClick={onClose}>Entrar</Link>
        </> : <>
          <span className="report-dialog-icon" aria-hidden="true">!</span>
          <h2 id="report-dialog-title">Denunciar {listingTitle ? 'anúncio' : 'perfil'}</h2>
          <p>O relato será enviado de forma privada à equipe de moderação.</p>
          <form onSubmit={handleSubmit}>
            <label>Motivo
              <select onChange={(event) => setCategory(event.target.value)} value={category}>
                {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>O que aconteceu?
              <textarea
                maxLength={2000}
                minLength={20}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Descreva os fatos com clareza. Evite incluir dados pessoais sensíveis."
                rows={5}
                value={description}
              />
              <small>{descriptionLength}/2.000 · mínimo de 20 caracteres</small>
            </label>
            {error && <p className="report-dialog-error" role="alert">{error}</p>}
            <button className="report-dialog-submit" disabled={loading || descriptionLength < 20} type="submit">
              {loading ? 'Enviando…' : 'Enviar denúncia'}
            </button>
          </form>
        </>}
      </section>
    </div>
  );
}
