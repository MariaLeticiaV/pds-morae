import { Link, useLocation } from 'react-router-dom';

const titles = {
  '/buscar': 'Encontre sua próxima moradia',
  '/anunciar': 'Anuncie seu imóvel ou vaga',
  '/login': 'Acesse sua conta',
};

export function PlaceholderPage() {
  const { pathname } = useLocation();
  return (
    <section className="placeholder-page">
      <p className="eyebrow">Moraê · Maceió</p>
      <h1>{titles[pathname] ?? 'Esta tela está sendo preparada'}</h1>
      <p>Esta página faz parte da estrutura inicial. A equipe vai implementar os fluxos a partir das telas em <code>docs/prototipo/</code>.</p>
      <Link className="button button-primary" to="/">Voltar ao início</Link>
    </section>
  );
}
