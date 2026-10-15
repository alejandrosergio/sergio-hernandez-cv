// Solo los contactos usan una ayuda visual propia; los botones usan el tooltip del navegador.
export function createContactTooltips() {
  const tooltip = document.getElementById('help-tooltip');
  let active = null;
  let described = null;
  let showTimer;
  let hideTimer;
  let keyboard = false;
  let mode = '';
  let placementPending = false;
  const hasKeyboardFocus = () => mode === 'focus' && described === document.activeElement;

  function hide() {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    tooltip.hidden = true;
    if (described) {
      const ids = (described.getAttribute('aria-describedby') || '').split(/\s+/).filter(id => id && id !== tooltip.id);
      if (ids.length) described.setAttribute('aria-describedby', ids.join(' '));
      else described.removeAttribute('aria-describedby');
    }
    active = described = null;
    mode = '';
  }

  function place() {
    if (!active || tooltip.hidden) return;
    const anchor = active.getBoundingClientRect();
    const box = tooltip.getBoundingClientRect();
    const width = document.documentElement.clientWidth;
    const height = window.innerHeight;
    if (anchor.bottom < 0 || anchor.top > height) {
      // El foco puede llegar antes de que termine su desplazamiento automático.
      if (hasKeyboardFocus()) tooltip.style.visibility = 'hidden';
      else hide();
      return;
    }
    tooltip.style.visibility = '';
    const left = Math.max(8, Math.min(anchor.left + (anchor.width - box.width) / 2, width - box.width - 8));
    const top = anchor.top >= box.height + 16 ? anchor.top - box.height - 8 : anchor.bottom + 8;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${Math.max(8, Math.min(top, height - box.height - 8))}px`;
  }

  function show(target, origin = 'hover') {
    if (!target?.isConnected || target.closest('[hidden],[inert]') || !target.dataset.tooltip) return;
    hide();
    active = target;
    mode = origin;
    described = target;
    // Se mantiene fuera de los contenedores que pueden recortar su contenido.
    document.body.append(tooltip);
    tooltip.textContent = target.dataset.tooltip;
    tooltip.lang = target.lang || document.documentElement.lang;
    tooltip.hidden = false;
    place();
    if (!described) return;
    const ids = new Set((described.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
    ids.add(tooltip.id);
    described.setAttribute('aria-describedby', [...ids].join(' '));
  }

  const trigger = event => event.target.closest?.('.contact-strip a[data-tooltip]');
  document.addEventListener('pointerover', event => {
    if (event.pointerType === 'touch' || hasKeyboardFocus()) return;
    const target = trigger(event);
    if (!target || target.contains(event.relatedTarget)) return;
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    showTimer = setTimeout(() => {if (!hasKeyboardFocus()) show(target);}, 350);
  });
  document.addEventListener('pointerout', event => {
    const target = trigger(event);
    if (!target || target.contains(event.relatedTarget) || tooltip.contains(event.relatedTarget) || hasKeyboardFocus()) return;
    clearTimeout(showTimer);
    hideTimer = setTimeout(() => {if (!hasKeyboardFocus()) hide();}, 100);
  });
  tooltip.addEventListener('pointerenter', () => clearTimeout(hideTimer));
  tooltip.addEventListener('pointerleave', () => {if (!hasKeyboardFocus()) hide();});
  document.addEventListener('focusin', event => {
    const target = trigger(event);
    if (target && keyboard) show(target, 'focus');
  });
  document.addEventListener('focusout', event => {if (active?.contains(event.target)) hide();});
  document.addEventListener('pointerdown', event => {
    keyboard = false;
    if (!active?.contains(event.target) && !tooltip.contains(event.target)) hide();
  });
  document.addEventListener('click', hide);
  document.addEventListener('keydown', event => {
    keyboard = true;
    if (event.key === 'Escape') {hide();return;}
  });
  // El scroll automático del foco no borra una ayuda de teclado; se recoloca una vez por fotograma.
  function updatePlacement() {
    if (!hasKeyboardFocus()) {hide();return;}
    if (placementPending) return;
    placementPending = true;
    requestAnimationFrame(() => {placementPending = false;place();});
  }
  document.addEventListener('scroll', updatePlacement, {capture:true, passive:true});
  window.addEventListener('resize', updatePlacement);
  window.addEventListener('beforeprint', hide);
  return {hide};
}
