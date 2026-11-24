import { useRef, useState } from 'react';
import {
  MAX_LISTING_PHOTOS,
  addListingPhotos,
  removeListingPhoto,
  reorderListingPhotos,
  validateImageFile,
} from '../services/api.js';
import './ListingPhotoManager.css';

// Status em que foto nova manda o anúncio de volta para a moderação.
const REVIEW_ON_NEW_PHOTO = new Set(['APPROVED', 'ARCHIVED']);
const IN_MODERATION = new Set(['PENDING', 'IN_REVIEW']);

// Painel do dono do anúncio: adicionar, remover e reordenar as fotos. A
// primeira foto é a capa mostrada na busca. Cada ação já salva no servidor.
// onChange recebe { status, photos } com o estado novo do anúncio.
export function ListingPhotoManager({ listingId, status, photos, onChange }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const remaining = MAX_LISTING_PHOTOS - photos.length;

  async function run(action, successMessage) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await action();
      onChange(result);
      setNotice(
        REVIEW_ON_NEW_PHOTO.has(status) && result.status === 'PENDING'
          ? `${successMessage} O anúncio voltou para a moderação e sai da busca até ser aprovado.`
          : successMessage,
      );
    } catch (failure) {
      setError(failure.message || 'Não foi possível atualizar as fotos.');
    } finally {
      setBusy(false);
    }
  }

  function chooseFiles(event) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;
    if (files.length > remaining) {
      setError(remaining === 0
        ? 'O anúncio já tem 10 fotos. Remova alguma antes de adicionar outras.'
        : `Você pode adicionar mais ${remaining} foto${remaining === 1 ? '' : 's'}.`);
      return;
    }
    const problem = files.map(validateImageFile).find(Boolean);
    if (problem) {
      setError(problem);
      return;
    }
    if (
      REVIEW_ON_NEW_PHOTO.has(status) &&
      !window.confirm('Fotos novas passam pela moderação: o anúncio sai da busca até ser aprovado de novo. Continuar?')
    ) {
      return;
    }
    run(
      () => addListingPhotos(listingId, files),
      files.length === 1 ? 'Foto adicionada.' : `${files.length} fotos adicionadas.`,
    );
  }

  function move(index, offset) {
    const order = photos.map((photo) => photo.id);
    const [moved] = order.splice(index, 1);
    order.splice(index + offset, 0, moved);
    run(
      () => reorderListingPhotos(listingId, order),
      index + offset === 0 ? 'Capa do anúncio atualizada.' : 'Ordem das fotos atualizada.',
    );
  }

  function remove(photo) {
    if (!window.confirm('Remover esta foto do anúncio?')) return;
    run(() => removeListingPhoto(listingId, photo.id), 'Foto removida.');
  }

  return (
    <section className="listing-photo-manager" aria-label="Gerenciar fotos do anúncio">
      <header>
        <div>
          <h2>Fotos do anúncio</h2>
          <p>{photos.length}/{MAX_LISTING_PHOTOS} fotos · a primeira é a capa</p>
        </div>
        <button type="button" onClick={() => input.current?.click()} disabled={busy || remaining === 0}>
          {busy ? 'Salvando…' : 'Adicionar fotos'}
        </button>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={chooseFiles}
        />
      </header>
      {IN_MODERATION.has(status) && <p className="listing-photo-review" role="note">Anúncio em moderação: ele volta para a busca quando for aprovado.</p>}
      {REVIEW_ON_NEW_PHOTO.has(status) && <p className="listing-photo-hint listing-photo-hint-top">Adicionar fotos devolve o anúncio para a moderação. Remover e reordenar não.</p>}
      <ol className="listing-photo-grid">
        {photos.map((photo, index) => (
          <li key={photo.id ?? photo.url}>
            <img src={photo.url} alt={`Foto ${index + 1} do anúncio`} />
            {index === 0 && <span className="listing-photo-cover">Capa</span>}
            <div className="listing-photo-actions">
              <button type="button" onClick={() => move(index, -1)} disabled={busy || index === 0} aria-label={`Mover foto ${index + 1} para a esquerda`}>‹</button>
              <button type="button" onClick={() => remove(photo)} disabled={busy || photos.length === 1} aria-label={`Remover foto ${index + 1}`} title={photos.length === 1 ? 'O anúncio precisa ter ao menos uma foto' : undefined}>×</button>
              <button type="button" onClick={() => move(index, 1)} disabled={busy || index === photos.length - 1} aria-label={`Mover foto ${index + 1} para a direita`}>›</button>
            </div>
          </li>
        ))}
      </ol>
      <p className="listing-photo-hint">JPEG, PNG ou WEBP de até 5 MB cada.</p>
      {notice && <p className="listing-photo-status" role="status">{notice}</p>}
      {error && <p className="listing-photo-error" role="alert">{error}</p>}
    </section>
  );
}
