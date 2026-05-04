export function initNav() {
  const toggle = document.querySelector('.menu-toggle');
  const nav    = document.querySelector('.nav');
  const header = document.querySelector('.site-header');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });

    // Fecha o menu ao clicar em um link de navegação (mobile UX)
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menu');
      });
    });
  }

  if (header) {
    const syncScrolled = () =>
      header.classList.toggle('is-scrolled', window.scrollY > 50);

    window.addEventListener('scroll', syncScrolled, { passive: true });
    syncScrolled(); // estado inicial
  }
}
