import translations from 'cv:translations';
import { createCursorDetail } from './cursor.js';
import { createContactTooltips } from './tooltips.js';

// Preferencias compatibles con las versiones anteriores y con almacenamiento bloqueado.
const preferences = {
  read(key, fallback = null) {
    try {
      const value = localStorage.getItem(`sergio-cv-${key}`);
      if (value === null) return fallback;
      try { return JSON.parse(value); } catch { return value; }
    } catch { return fallback; }
  },
  write(key, value) {
    try { localStorage.setItem(`sergio-cv-${key}`, typeof value === 'string' ? value : JSON.stringify(value)); } catch { /* Opcional. */ }
  },
  remove(key) {
    try { localStorage.removeItem(`sergio-cv-${key}`); } catch { /* Opcional. */ }
  }
};

const root = document.documentElement;
const byId = id => document.getElementById(id);
const ui = Object.fromEntries([
  'theme-toggle','theme-label','language-toggle','language-label','language-status',
  'accessibility-toggle','accessibility-panel','accessibility-close','accessibility-reset',
  'text-size','text-size-value','text-decrease','text-increase','contrast-toggle','motion-toggle','spacing-toggle',
  'print-cv','print-help','print-open','back-to-top',
  'print-chooser','print-chooser-close','print-web','print-recruiter',
  'portfolio-link','portfolio-notice'
].map(id => [id, byId(id)]));
const media = {
  dark: matchMedia('(prefers-color-scheme: dark)'),
  motion: matchMedia('(prefers-reduced-motion: reduce)')
};
const savedTheme = preferences.read('theme');
const savedLanguage = preferences.read('language', 'es');
const savedAccessibility = preferences.read('accessibility', {});
const accessibilitySaved = savedAccessibility && typeof savedAccessibility === 'object' ? savedAccessibility : {};
const clampTextSize = value => Math.min(200, Math.max(100, Math.round(value / 10) * 10));
const state = {
  language: root.lang === 'en' || savedLanguage === 'en' ? 'en' : 'es',
  chosenTheme: ['light','dark'].includes(savedTheme) ? savedTheme : null,
  motionPreference: typeof accessibilitySaved.reducedMotion === 'boolean' ? accessibilitySaved.reducedMotion : null,
  accessibility: {
    textSize: typeof accessibilitySaved.textSize === 'number' && Number.isFinite(accessibilitySaved.textSize) ? clampTextSize(accessibilitySaved.textSize) : 100,
    highContrast: accessibilitySaved.highContrast === true,
    readingSpacing: accessibilitySaved.readingSpacing === true,
    reducedMotion: typeof accessibilitySaved.reducedMotion === 'boolean' ? accessibilitySaved.reducedMotion : media.motion.matches
  }
};
const cursorDetail = createCursorDetail({
  motionMedia:media.motion,
  isDisabled:() => state.accessibility.reducedMotion || state.accessibility.highContrast
});
const themeCopy = {
  es: { light:'Modo claro', dark:'Modo oscuro', lightAction:'Activar modo claro', darkAction:'Activar modo oscuro' },
  en: { light:'Light mode', dark:'Dark mode', lightAction:'Switch to light mode', darkAction:'Switch to dark mode' }
};
const localizedNodes = translations.flatMap(entry => [...document.querySelectorAll(entry.selector)].map(node => ({node, entry})));
const themeColor = document.querySelector('meta[name="theme-color"]');
const portraitURL = new URL(document.querySelector('.portrait img').getAttribute('src'),document.baseURI).href;
const tooltips = createContactTooltips();
let noticeTimer;

function clearPortfolioNotice() {
  clearTimeout(noticeTimer);
  ui['portfolio-notice'].textContent = '';
}

function applyTheme() {
  const theme = state.chosenTheme || (media.dark.matches ? 'dark' : 'light');
  const isDark = theme === 'dark';
  const copy = themeCopy[state.language];
  const action = isDark ? copy.lightAction : copy.darkAction;
  root.dataset.theme = theme;
  if (ui['theme-toggle']) {
    ui['theme-toggle'].setAttribute('aria-pressed', String(isDark));
    ui['theme-toggle'].setAttribute('aria-label', action);
    ui['theme-toggle'].title = action;
    ui['theme-label'].textContent = isDark ? copy.light : copy.dark;
  }
  if (themeColor) themeColor.content = state.accessibility.highContrast ? '#000000' : (isDark ? '#091523' : '#0078d4');
}

function applyAccessibility() {
  tooltips.hide();
  const settings = state.accessibility;
  root.style.fontSize = `${settings.textSize}%`;
  root.dataset.contrast = settings.highContrast ? 'high' : 'normal';
  root.dataset.motion = settings.reducedMotion ? 'reduced' : 'full';
  root.dataset.readingSpacing = settings.readingSpacing ? 'wide' : 'normal';
  ui['text-size'].value = String(settings.textSize);
  ui['text-size'].setAttribute('aria-valuetext', `${settings.textSize} ${state.language === 'es' ? 'por ciento' : 'percent'}`);
  ui['text-size-value'].value = `${settings.textSize}%`;
  ui['text-decrease'].disabled = settings.textSize <= 100;
  ui['text-increase'].disabled = settings.textSize >= 200;
  ui['contrast-toggle'].checked = settings.highContrast;
  ui['motion-toggle'].checked = settings.reducedMotion;
  ui['spacing-toggle'].checked = settings.readingSpacing;
  cursorDetail.refresh();
  applyTheme();
}

function saveAccessibility() {
  const {textSize, highContrast, readingSpacing} = state.accessibility;
  const saved = {textSize, highContrast, readingSpacing};
  if (state.motionPreference !== null) saved.reducedMotion = state.motionPreference;
  preferences.write('accessibility', saved);
}

function closeAccessibility(returnFocus = true) {
  if (ui['accessibility-panel'].hidden) return;
  tooltips.hide();
  ui['accessibility-panel'].hidden = true;
  ui['accessibility-toggle'].setAttribute('aria-expanded', 'false');
  if (returnFocus) ui['accessibility-toggle'].focus({preventScroll:true});
}

function updateLanguageURL() {
  // Las copias descargables siguen funcionando sin servidor.
  if (!['http:','https:'].includes(location.protocol) || !/^\/(?:en\/)?(?:index\.html)?$/.test(location.pathname)) return;
  try { history.replaceState(null, '', `${state.language === 'en' ? '/en/' : '/'}${location.search}${location.hash}`); } catch { /* El visor puede bloquear el historial. */ }
}

function applyLanguage(language, announce = false) {
  tooltips.hide();
  clearPortfolioNotice();
  state.language = language === 'en' ? 'en' : 'es';
  root.lang = state.language;
  localizedNodes.forEach(({node, entry}) => {
    const value = entry[state.language];
    if (entry.attribute) node.setAttribute(entry.attribute, value);
    else if (entry.format === 'html') node.innerHTML = value;
    else node.textContent = value;
  });
  const target = state.language === 'es' ? 'en' : 'es';
  const action = target === 'en' ? 'Switch to English' : 'Cambiar a Español';
  ui['language-toggle'].lang = target;
  ui['language-toggle'].title = action;
  ui['language-toggle'].setAttribute('aria-label', action);
  ui['language-label'].textContent = target === 'en' ? 'English' : 'Español';
  updateLanguageURL();
  if (ui['print-open']) ui['print-open'].href = location.href;
  const completePhoto = document.querySelector('.complete-photo');
  if (completePhoto) completePhoto.src = portraitURL;
  applyAccessibility();
  if (announce) ui['language-status'].textContent = state.language === 'es' ? 'Idioma cambiado a Español.' : 'Language changed to English.';
}

function initTheme() {
  ui['theme-toggle'].hidden = false;
  ui['theme-toggle'].addEventListener('click', () => {
    state.chosenTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    preferences.write('theme', state.chosenTheme);
  });
  media.dark.addEventListener('change', () => { if (!state.chosenTheme) applyTheme(); });
}

function initAccessibility() {
  ui['accessibility-toggle'].hidden = false;
  ui['accessibility-toggle'].addEventListener('click', () => {
    if (!ui['accessibility-panel'].hidden) { closeAccessibility(); return; }
    ui['accessibility-panel'].hidden = false;
    ui['accessibility-toggle'].setAttribute('aria-expanded', 'true');
    ui['accessibility-close'].focus({preventScroll:true});
  });
  ui['accessibility-close'].addEventListener('click', () => closeAccessibility());
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !ui['accessibility-panel'].hidden) { event.preventDefault(); closeAccessibility(); }
  });
  document.addEventListener('click', event => {
    if (!ui['accessibility-panel'].hidden && !ui['accessibility-panel'].contains(event.target) && !ui['accessibility-toggle'].contains(event.target)) closeAccessibility(false);
  });
  const changeSize = value => {
    const size = Number(value);
    if (!Number.isFinite(size)) return;
    state.accessibility.textSize = clampTextSize(size);
    applyAccessibility();
    saveAccessibility();
  };
  ui['text-size'].addEventListener('input', () => changeSize(ui['text-size'].value));
  ui['text-decrease'].addEventListener('click', () => changeSize(state.accessibility.textSize - 10));
  ui['text-increase'].addEventListener('click', () => changeSize(state.accessibility.textSize + 10));
  for (const [id, property] of [['contrast-toggle','highContrast'],['motion-toggle','reducedMotion'],['spacing-toggle','readingSpacing']]) {
    ui[id].addEventListener('change', () => {
      state.accessibility[property] = ui[id].checked;
      if (property === 'reducedMotion') state.motionPreference = ui[id].checked;
      applyAccessibility();
      saveAccessibility();
    });
  }
  ui['accessibility-reset'].addEventListener('click', () => {
    Object.assign(state.accessibility, {textSize:100, highContrast:false, readingSpacing:false, reducedMotion:media.motion.matches});
    state.motionPreference = null;
    preferences.remove('accessibility');
    applyAccessibility();
  });
  media.motion.addEventListener('change', event => {
    if (state.motionPreference === null) { state.accessibility.reducedMotion = event.matches; applyAccessibility(); }
  });
}

function initLanguage() {
  applyLanguage(state.language);
  ui['language-toggle'].hidden = false;
  ui['language-toggle'].addEventListener('click', () => {
    applyLanguage(state.language === 'es' ? 'en' : 'es', true);
    preferences.write('language', state.language);
  });
}

function initPrinting() {
  const variants = ['recruiter','web'];
  let printStarted = false;
  const requestedVariant = new URL(location.href).searchParams.get('cv');
  if (variants.includes(requestedVariant)) root.dataset.printVariant = requestedVariant;
  let inertBackground = [];

  // Restaurar exactamente el estado previo del fondo al cerrar el diálogo modal.
  function closeChooser(returnFocus = true) {
    tooltips.hide();
    ui['print-chooser'].hidden = true;
    ui['print-cv'].setAttribute('aria-expanded','false');
    inertBackground.forEach(([node,inert]) => {node.inert = inert;});
    inertBackground = [];
    root.removeAttribute('data-print-chooser-open');
    if (returnFocus) ui['print-cv'].focus({preventScroll:true});
  }

  function openChooser() {
    clearPortfolioNotice();
    tooltips.hide();
    closeAccessibility(false);
    if (!ui['print-chooser'].hidden) {closeChooser();return;}
    ui['print-chooser'].hidden = false;
    ui['print-cv'].setAttribute('aria-expanded','true');
    root.dataset.printChooserOpen = 'true';
    inertBackground = [...document.body.children].filter(node => node !== ui['print-chooser'] && node.id !== 'help-tooltip' && node.tagName !== 'SCRIPT').map(node => [node,node.inert]);
    inertBackground.forEach(([node]) => {node.inert = true;});
    // Si el texto está ampliado, el botón enfocado también debe quedar visible dentro del panel.
    ui[`print-${variants[0]}`].focus();
  }

  // El mismo flujo imprime ambas versiones y conserva el enlace de respaldo del visor.
  function printVariant(variant) {
    root.dataset.printVariant = variant;
    const fallbackURL = new URL(location.href);
    fallbackURL.searchParams.set('cv',variant);
    ui['print-open'].href = fallbackURL.href;
    closeChooser();
    printStarted = false;
    try { window.focus(); window.print(); } catch { /* Algunos visores bloquean el diálogo. */ }
    if (!printStarted) ui['print-help'].hidden = false;
  }

  window.addEventListener('beforeprint', () => {
    printStarted = true;
    closeAccessibility(false);
    closeChooser(false);
    ui['print-help'].hidden = true;
  });
  window.addEventListener('afterprint', () => {delete root.dataset.printVariant;});
  ui['print-cv'].hidden = false;
  ui['print-cv'].addEventListener('click', openChooser);
  ui['print-chooser-close'].addEventListener('click', () => closeChooser());
  ui['print-chooser'].addEventListener('click', event => {if (event.target === ui['print-chooser']) closeChooser();});
  document.addEventListener('keydown', event => {
    if (ui['print-chooser'].hidden) return;
    if (event.key === 'Escape') {event.preventDefault();closeChooser();return;}
    if (event.key !== 'Tab') return;
    const controls = [...ui['print-chooser'].querySelectorAll('a[href],button')];
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {event.preventDefault();last.focus();}
    else if (!event.shiftKey && document.activeElement === last) {event.preventDefault();first.focus();}
  });
  for (const variant of variants) ui[`print-${variant}`].addEventListener('click', () => printVariant(variant));
}

function initPortfolio() {
  // Hasta tener una URL real, el botón informa del estado sin simular una navegación.
  ui['portfolio-link'].addEventListener('click', () => {
    clearPortfolioNotice();
    ui['portfolio-notice'].textContent = ui['portfolio-link'].dataset.notice;
    noticeTimer = setTimeout(clearPortfolioNotice, 6500);
  });
  window.addEventListener('beforeprint', clearPortfolioNotice);
}

function initNavigation() {
  const links = [...document.querySelectorAll('.navigation a')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const header = document.querySelector('.site-header');
  const wordmark = document.querySelector('.wordmark');
  const setCurrentSection = id => links.forEach(link => {
    if (link.getAttribute('href') === `#${id}`) link.setAttribute('aria-current','location');
    else link.removeAttribute('aria-current');
  });
  const updateHeaderOffset = () => {
    root.style.scrollPaddingTop = `${getComputedStyle(header).position === 'sticky' ? header.offsetHeight + 24 : 24}px`;
  };
  updateHeaderOffset();
  if ('ResizeObserver' in window) new ResizeObserver(updateHeaderOffset).observe(header);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) setCurrentSection(visible[0].target.id);
    }, {rootMargin:'-125px 0px -55% 0px', threshold:0});
    sections.forEach(section => observer.observe(section));
  }
  const updateHash = id => { try { history.replaceState(null,'',`#${id}`); } catch { /* Opcional. */ } };
  [...links, wordmark, document.querySelector('.resume-footer a')].filter(Boolean).forEach(link => {
    link.addEventListener('click', event => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({behavior:state.accessibility.reducedMotion ? 'instant' : 'smooth', block:'start'});
      setCurrentSection(target.id);
      updateHash(target.id);
    });
  });
  const updateBackToTop = () => {
    const hide = window.scrollY < 320;
    if (hide && document.activeElement === ui['back-to-top']) wordmark.focus({preventScroll:true});
    ui['back-to-top'].hidden = hide;
  };
  let scrollFramePending = false;
  window.addEventListener('scroll', () => {
    if (scrollFramePending) return;
    scrollFramePending = true;
    requestAnimationFrame(() => { updateBackToTop(); scrollFramePending = false; });
  }, {passive:true});
  ui['back-to-top'].addEventListener('click', () => {
    closeAccessibility(false);
    wordmark.focus({preventScroll:true});
    window.scrollTo({top:0, behavior:state.accessibility.reducedMotion ? 'instant' : 'smooth'});
    setCurrentSection('perfil');
    updateHash('perfil');
  });
  updateBackToTop();
}

initTheme();
initAccessibility();
initLanguage();
initPrinting();
initPortfolio();
initNavigation();
