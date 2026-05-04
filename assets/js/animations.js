export function initAnimations() {
  const targets = document.querySelectorAll('[data-observe]');
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(el => {
    // Stagger automático: irmãos com [data-observe] recebem delay incremental
    const siblings = Array.from(
      el.parentNode.querySelectorAll('[data-observe]')
    );
    const i = siblings.indexOf(el);
    if (i > 0) el.style.setProperty('--delay', `${i * 90}ms`);

    el.classList.add('observe-enter');
    observer.observe(el);
  });
}
