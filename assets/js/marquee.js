export function initMarquee() {
  const track = document.querySelector('.clients-track');
  if (!track) return;

  Array.from(track.children).forEach(item => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
}
