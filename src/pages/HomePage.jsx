import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();
  const [campus, setCampus] = useState('UFAL - A.C. Simões');
  const [housingType, setHousingType] = useState('República');
  const [budget, setBudget] = useState('850');

  function handleSearch(event) {
    event.preventDefault();
    const params = new URLSearchParams({ campus, tipo: housingType, orcamento: budget });
    navigate(`/buscar?${params.toString()}`);
  }

  return (
    <>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="hero-content">
          <p className="eyebrow">Moradia estudantil em Maceió</p>
          <h1 id="home-title">Encontre o lugar ideal para morar e divida com quem combina com você.</h1>
          <p className="hero-description">A plataforma segura de moradia universitária que conecta estudantes a repúblicas, vagas compartilhadas e imóveis verificados perto da sua faculdade.</p>
          <form className="search-bar" onSubmit={handleSearch}>
            <label className="search-field">
              <span>Universidade / campus</span>
              <select value={campus} onChange={(event) => setCampus(event.target.value)}>
                <option>UFAL - A.C. Simões</option>
                <option>UFAL - Campus Arapiraca</option>
                <option>CESMAC</option>
                <option>UNCISAL</option>
                <option>Outro campus</option>
              </select>
            </label>
            <label className="search-field">
              <span>Tipo de moradia</span>
              <select value={housingType} onChange={(event) => setHousingType(event.target.value)}>
                <option>República</option>
                <option>Quarto individual</option>
                <option>Quarto compartilhado</option>
                <option>Imóvel inteiro</option>
                <option>Qualquer tipo</option>
              </select>
            </label>
            <label className="search-field budget-field">
              <span>Orçamento máximo</span>
              <select value={budget} onChange={(event) => setBudget(event.target.value)}>
                <option value="500">Até R$ 500</option>
                <option value="850">Até R$ 850</option>
                <option value="1200">Até R$ 1.200</option>
                <option value="2000">Até R$ 2.000</option>
                <option value="">Sem limite definido</option>
              </select>
            </label>
            <button className="search-button" type="submit"><span aria-hidden="true">⌕</span> Procurar vagas</button>
          </form>
        </div>
        <span className="hero-orbit orbit-one" aria-hidden="true" />
        <span className="hero-orbit orbit-two" aria-hidden="true" />
      </section>

      <section className="audience-section" id="como-funciona" aria-labelledby="audience-title">
        <p className="eyebrow">Um espaço para cada etapa</p>
        <h2 id="audience-title">Como você deseja usar a Moraê?</h2>
        <div className="audience-grid">
          <article className="audience-card student-card">
            <div className="card-heading"><span className="card-icon" aria-hidden="true">🎓</span><h3>Quero buscar minha vaga</h3></div>
            <p>Encontre quarto individual, vaga em república ou apartamento compartilhado perto da universidade.</p>
            <Link to="/cadastro?perfil=estudante">Criar perfil de buscador <span aria-hidden="true">→</span></Link>
          </article>
          <article className="audience-card host-card">
            <div className="card-heading"><span className="card-icon" aria-hidden="true">🏡</span><h3>Ofertar vaga em casa</h3></div>
            <p>Já tem uma república ou apê alugado? Encontre um novo colega de quarto compatível com sua rotina.</p>
            <Link to="/cadastro?perfil=ofertante">Anunciar minha vaga <span aria-hidden="true">→</span></Link>
          </article>
          <article className="audience-card owner-card">
            <div className="card-heading"><span className="card-icon" aria-hidden="true">🔑</span><h3>Sou proprietário</h3></div>
            <p>Anuncie seu imóvel para estudantes com mais praticidade e encontre pessoas interessadas em Maceió.</p>
            <Link to="/cadastro?perfil=proprietario">Anunciar imóvel inteiro <span aria-hidden="true">→</span></Link>
          </article>
        </div>
      </section>
    </>
  );
}
