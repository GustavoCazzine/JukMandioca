export function initSlider() {
  const root = document.querySelector('.hero-slider');
  if (root) {
    const slides = [...root.querySelectorAll('.hs-slide')];
    const dots = [...root.querySelectorAll('.hs-dots button')];
    let i = 0;
    let timer;
    const go = n => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
      dots.forEach((d, k) => d.setAttribute('aria-selected', String(k === i)));
    };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const play = () => { if (!reduce) { clearInterval(timer); timer = setInterval(() => go(i + 1), 6000); } };
    dots.forEach((d, k) => d.addEventListener('click', () => { go(k); play(); }));
    root.addEventListener('mouseenter', () => clearInterval(timer));
    root.addEventListener('mouseleave', play);
    play();
  }

  const track = document.querySelector('.pf-track');
  if (track) {
    const step = () => (track.querySelector('.pf-card')?.offsetWidth || 320) + 24;
    document.querySelector('.pf-prev')?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    document.querySelector('.pf-next')?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  }
}
