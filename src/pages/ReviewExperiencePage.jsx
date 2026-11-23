import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DashboardSidebar } from '../components/DashboardSidebar.jsx';
import { LineIcon } from '../components/LineIcon.jsx';
import {
  getAccessToken,
  getEligibleReviewContracts,
  submitHousingReview,
} from '../services/api.js';
import './ReviewExperiencePage.css';

const criteria = [
  { key: 'cleanliness', label: 'Limpeza', description: 'Conservação e higiene dos espaços.' },
  { key: 'condition', label: 'Estrutura e conforto', description: 'Condições do imóvel e dos itens oferecidos.' },
  { key: 'location', label: 'Localização', description: 'Acesso a transporte, serviços e universidade.' },
  { key: 'communication', label: 'Comunicação', description: 'Disponibilidade e respeito nos combinados.' },
  { key: 'value', label: 'Custo-benefício', description: 'Relação entre preço e experiência.' },
  { key: 'overall', label: 'Experiência geral', description: 'Sua avaliação geral da moradia.' },
];

const emptyRatings = Object.fromEntries(criteria.map(({ key }) => [key, 0]));

export function ReviewExperiencePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [eligibleContracts, setEligibleContracts] = useState([]);
  const [loading, setLoading] = useState(Boolean(getAccessToken()));
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [ratings, setRatings] = useState(emptyRatings);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedReview, setSubmittedReview] = useState(null);
  const authenticated = Boolean(getAccessToken());
  const selectedContractId = searchParams.get('contrato');
  const selectedContract = eligibleContracts.find(({ contractId }) => contractId === selectedContractId);

  useEffect(() => {
    if (!authenticated) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    getEligibleReviewContracts()
      .then((contracts) => {
        if (!cancelled) setEligibleContracts(contracts);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.message || 'Não foi possível consultar os contratos elegíveis.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [authenticated]);

  useEffect(() => {
    setRatings(emptyRatings);
    setComment('');
    setFormError('');
  }, [selectedContractId]);

  async function submitReview(event) {
    event.preventDefault();
    if (!selectedContract) return;
    setFormError('');
    setSubmitting(true);
    try {
      const review = await submitHousingReview({
        contractId: selectedContract.contractId,
        ...ratings,
        comment,
      });
      setSubmittedReview({ ...review, ownerName: selectedContract.ownerName });
      setEligibleContracts((current) => current.filter(
        ({ contractId }) => contractId !== selectedContract.contractId,
      ));
      setSearchParams({});
    } catch (error) {
      setFormError(error.message || 'Não foi possível publicar sua avaliação.');
    } finally {
      setSubmitting(false);
    }
  }

  const allRatingsProvided = criteria.every(({ key }) => ratings[key] >= 1 && ratings[key] <= 5);
  const commentLength = comment.trim().length;

  return <div className="review-experience-shell">
    <DashboardSidebar active="reviews" />
    <main className="review-experience-main">
      <header className="review-experience-header">
        <Link to="/buscar">← Voltar à busca</Link>
        <span>Moraê · Avaliações</span>
      </header>
      <div className="review-experience-content">
        <section className="review-experience-hero">
          <span className="review-experience-icon"><LineIcon name="star" size={27} /></span>
          <div>
            <p>Experiência real, opinião útil</p>
            <h1>Avalie uma moradia</h1>
            <span>Compartilhe uma experiência de locação comprovada e ajude outros estudantes.</span>
          </div>
        </section>

        {!authenticated ? <section className="review-state-card">
          <h2>Entre na sua conta</h2>
          <p>É necessário autenticar-se para consultar seus contratos e publicar uma avaliação.</p>
          <Link className="review-primary-action" to="/login">Entrar</Link>
        </section> : loading ? <section className="review-state-card" role="status">Consultando contratos elegíveis…</section>
          : loadError ? <section className="review-state-card" role="alert">{loadError}</section>
            : submittedReview ? <section className="review-state-card review-success" role="status">
              <span>✓</span>
              <h2>Avaliação publicada</h2>
              <p>Sua avaliação de <strong>{submittedReview.listingTitle}</strong> foi registrada e já está disponível no perfil de {submittedReview.ownerName}.</p>
              <Link to={`/usuarios/${submittedReview.reviewedUserId}`}>Ver avaliações no perfil</Link>
              <button type="button" onClick={() => setSubmittedReview(null)}>Avaliar outra moradia</button>
            </section> : !eligibleContracts.length ? <section className="review-state-card">
              <h2>Nenhuma avaliação disponível</h2>
              <p>Você poderá avaliar depois que uma locação iniciada vinculada à sua conta estiver ativa ou encerrada. Cada contrato permite uma avaliação.</p>
              <Link to="/proprietario/contratos">Consultar contratos</Link>
            </section> : selectedContract ? <section className="review-form-card">
              <button className="review-back-button" type="button" onClick={() => setSearchParams({})}>← Escolher outro contrato</button>
              <div className="review-property-summary">
                <span><LineIcon name="home" size={22} /></span>
                <div>
                  <h2>{selectedContract.listingTitle}</h2>
                  <p>{selectedContract.neighborhood} · Anunciado por {selectedContract.ownerName}</p>
                  <small>Início do contrato: {new Date(`${selectedContract.startsAt}T12:00:00`).toLocaleDateString('pt-BR')}</small>
                </div>
              </div>
              <form onSubmit={submitReview}>
                <fieldset className="review-criteria">
                  <legend>Como foi sua experiência?</legend>
                  {criteria.map(({ key, label, description }) => <div className="review-criterion" key={key}>
                    <div><strong>{label}</strong><small>{description}</small></div>
                    <div className="review-rating-buttons" role="group" aria-label={`Nota para ${label}`}>
                      {Array.from({ length: 5 }, (_, index) => {
                        const value = index + 1;
                        return <button
                          key={value}
                          type="button"
                          className={value <= ratings[key] ? 'selected' : ''}
                          aria-label={`${value} de 5 estrelas para ${label}`}
                          aria-pressed={ratings[key] === value}
                          onClick={() => setRatings((current) => ({ ...current, [key]: value }))}
                        >★</button>;
                      })}
                    </div>
                  </div>)}
                </fieldset>
                <label className="review-comment-field">Conte como foi
                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    minLength={20}
                    maxLength={1000}
                    rows={5}
                    placeholder="Descreva sua experiência de forma respeitosa e objetiva (mínimo 20 caracteres)."
                  />
                  <small>{commentLength}/1.000 caracteres · mínimo de 20</small>
                </label>
                <aside className="review-rules">
                  <strong>Antes de publicar</strong>
                  <ul>
                    <li>Apenas o inquilino de um contrato iniciado pode avaliar.</li>
                    <li>Uma avaliação por contrato; depois de publicada, não pode ser editada.</li>
                    <li>Não inclua dados pessoais, acusações ou conteúdo ofensivo. A avaliação fica pública no perfil do anunciante.</li>
                  </ul>
                </aside>
                {formError && <p className="review-form-error" role="alert">{formError}</p>}
                <button className="review-primary-action" type="submit" disabled={!allRatingsProvided || commentLength < 20 || submitting}>
                  {submitting ? 'Publicando…' : 'Publicar avaliação'}
                </button>
              </form>
            </section> : <section className="review-contract-list">
              <h2>Escolha uma experiência elegível</h2>
              <p>Somente contratos iniciados e ativos ou encerrados podem receber avaliação.</p>
              {eligibleContracts.map((contract) => <article key={contract.contractId}>
                <div><strong>{contract.listingTitle}</strong><span>{contract.neighborhood} · {contract.ownerName}</span></div>
                <Link to={`/avaliar-moradia?contrato=${encodeURIComponent(contract.contractId)}`}>Avaliar <LineIcon name="arrow" size={16} /></Link>
              </article>)}
            </section>}
      </div>
    </main>
  </div>;
}
