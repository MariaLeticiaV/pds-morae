import { useLayoutEffect, useRef } from 'react';

// Entrada suave do conteúdo a cada troca de página. Nas telas com painel, só o
// que vem depois do cabeçalho (.dashboard-topbar) anima: menu lateral e
// cabeçalho ficam parados. Nas demais, anima a página inteira abaixo do header
// do site. Usa a Web Animations API, então não remonta nenhum componente e
// nada perde o estado. Quem pede menos movimento no sistema não vê a animação.
const KEYFRAMES = [
  { opacity: 0, transform: 'translateY(8px)' },
  { opacity: 1, transform: 'none' },
];
const TIMING = { duration: 260, easing: 'cubic-bezier(.2, .8, .2, 1)' };

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function usePageTransition(pathname) {
  const running = useRef([]);

  useLayoutEffect(() => {
    if (prefersReducedMotion() || typeof Element === 'undefined' || !Element.prototype.animate) return;

    running.current.forEach((animation) => animation.cancel());
    const panelContent = document.querySelectorAll('.app-shell .dashboard-topbar ~ *');
    const targets = panelContent.length
      ? panelContent
      : document.querySelectorAll('.app-shell > main > *');
    running.current = [...targets].map((element) => element.animate(KEYFRAMES, TIMING));
  }, [pathname]);
}
