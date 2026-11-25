import { useLayoutEffect, useRef } from 'react';

// Animações de entrada das páginas, com a Web Animations API (não remonta
// nenhum componente, então nada perde o estado):
//
// - Primeiro carregamento: a moldura (header do site, menu lateral, barra
//   superior) aparece primeiro e, em seguida, os blocos de conteúdo surgem em
//   cascata, um depois do outro. Na home, os textos e a busca do topo também
//   entram em sequência.
// - Trocas de página seguintes: só o conteúdo entra com um fade rápido; nas
//   telas com painel, menu lateral e barra superior ficam parados.
//
// Quem pede menos movimento no sistema não vê nenhuma das duas.

const EASE = 'cubic-bezier(.2, .8, .2, 1)';
const CONTENT_IN = [
  { opacity: 0, transform: 'translateY(8px)' },
  { opacity: 1, transform: 'none' },
];
const BLOCK_IN = [
  { opacity: 0, transform: 'translateY(16px)' },
  { opacity: 1, transform: 'none' },
];
const CHROME_IN = [{ opacity: 0 }, { opacity: 1 }];
const SIDEBAR_IN = [
  { opacity: 0, transform: 'translateX(-12px)' },
  { opacity: 1, transform: 'none' },
];

const INTRO_CHROME_MS = 420;
const INTRO_BLOCK_MS = 560;
const INTRO_FIRST_BLOCK_DELAY = 120;
const INTRO_STAGGER = 70;
const INTRO_MAX_BLOCKS = 10;
// Elementos do topo da home que entram em sequência dentro do primeiro bloco.
const HERO_ITEMS = '.hero-content > *';

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// O conteúdo da página atual: o que vem depois da barra superior nas telas com
// painel, ou a página inteira abaixo do header do site nas demais.
function contentRoots() {
  const panelContent = document.querySelectorAll('.app-shell .dashboard-topbar ~ *');
  return [...(panelContent.length ? panelContent : document.querySelectorAll('.app-shell > main > *'))];
}

// Desce pelos invólucros de um filho só (ex.: a área de rolagem do painel, que
// tem um único <div> dentro) até chegar numa lista de blocos para a cascata.
function blocksOf(roots) {
  let blocks = roots;
  for (let depth = 0; depth < 4 && blocks.length === 1 && blocks[0].children.length > 0; depth += 1) {
    blocks = [...blocks[0].children];
  }
  return blocks.filter((element) => element.getClientRects().length > 0);
}

function playIntro() {
  const animations = [];
  const chrome = document.querySelectorAll('.app-shell .site-header, .app-shell .dashboard-topbar');
  chrome.forEach((element) => {
    animations.push(element.animate(CHROME_IN, { duration: INTRO_CHROME_MS, easing: 'ease', fill: 'backwards' }));
  });
  document.querySelectorAll('.app-shell .dashboard-sidebar').forEach((element) => {
    animations.push(element.animate(SIDEBAR_IN, { duration: INTRO_CHROME_MS, easing: EASE, fill: 'backwards' }));
  });

  const blocks = blocksOf(contentRoots()).slice(0, INTRO_MAX_BLOCKS);
  const heroItems = [...document.querySelectorAll(HERO_ITEMS)];
  let delay = INTRO_FIRST_BLOCK_DELAY;
  blocks.forEach((block) => {
    const heroInside = heroItems.filter((item) => block.contains(item));
    if (heroInside.length) {
      // O topo da home: cada texto e a busca entram um depois do outro.
      heroInside.forEach((item) => {
        animations.push(item.animate(BLOCK_IN, { duration: INTRO_BLOCK_MS, delay, easing: EASE, fill: 'backwards' }));
        delay += INTRO_STAGGER + 30;
      });
      return;
    }
    animations.push(block.animate(BLOCK_IN, { duration: INTRO_BLOCK_MS, delay, easing: EASE, fill: 'backwards' }));
    delay += INTRO_STAGGER;
  });
  return animations;
}

function playPageChange() {
  return contentRoots().map((element) => element.animate(CONTENT_IN, { duration: 260, easing: EASE }));
}

export function usePageTransition(pathname) {
  const running = useRef([]);
  const lastPathname = useRef(null);

  useLayoutEffect(() => {
    // Mesmo caminho = não houve navegação (ex.: o StrictMode do React roda o
    // efeito duas vezes em desenvolvimento); não reinicia a animação em curso.
    if (lastPathname.current === pathname) return;
    const isFirst = lastPathname.current === null;
    lastPathname.current = pathname;
    if (prefersReducedMotion() || typeof Element === 'undefined' || !Element.prototype.animate) return;

    running.current.forEach((animation) => animation.cancel());
    running.current = isFirst ? playIntro() : playPageChange();
  }, [pathname]);
}
