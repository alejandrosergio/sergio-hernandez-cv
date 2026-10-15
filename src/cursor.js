// El halo acompaña al ratón sin sustituir el cursor ni interferir con los controles.
export function createCursorDetail({motionMedia, isDisabled}) {
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const forcedColors = matchMedia('(forced-colors: active)');
  let halo = null;
  let enabled = false;
  let printing = false;
  let pending = false;
  let frame = null;
  let x = 0;
  let y = 0;

  function hide() {
    if (pending && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame);
    pending = false;
    frame = null;
    if (halo) halo.hidden = true;
  }

  function refresh() {
    enabled = finePointer.matches && !motionMedia.matches && !forcedColors.matches && !isDisabled() && !printing && document.visibilityState !== 'hidden';
    if (!enabled) hide();
  }

  document.addEventListener('pointermove', event => {
    if (!enabled || event.pointerType !== 'mouse') { hide(); return; }
    x = event.clientX;
    y = event.clientY;
    if (pending) return;
    pending = true;
    // Se dibuja una vez por fotograma con la posición más reciente, sin bucle continuo.
    frame = requestAnimationFrame(() => {
      pending = false;
      frame = null;
      if (!enabled) return;
      if (!halo) {
        halo = document.createElement('span');
        halo.className = 'cursor-halo no-print';
        halo.setAttribute('aria-hidden', 'true');
        document.body.append(halo);
      }
      halo.style.transform = `translate3d(${x - 11}px,${y - 11}px,0)`;
      halo.hidden = false;
    });
  }, {passive:true});
  document.addEventListener('pointerout', event => { if (!event.relatedTarget) hide(); }, {passive:true});
  document.addEventListener('pointercancel', hide, {passive:true});
  document.addEventListener('keydown', hide);
  document.addEventListener('visibilitychange', () => { hide(); refresh(); });
  window.addEventListener('blur', hide);
  window.addEventListener('beforeprint', () => { printing = true; refresh(); });
  window.addEventListener('afterprint', () => { printing = false; refresh(); });
  for (const media of [finePointer, motionMedia, forcedColors]) media.addEventListener('change', refresh);
  refresh();
  return {refresh};
}
