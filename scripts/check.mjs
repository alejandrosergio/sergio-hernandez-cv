import './check-cursor.mjs';
import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';
import { unzipSync } from 'fflate';

const dist = fileURLToPath(new URL('../dist/',import.meta.url));
const script = await readFile(path.join(dist,'script.js'),'utf8');
const origin = 'https://sergio-hernandez-cv.alejosergio3000.chatgpt.site';
const read = file => readFile(path.join(dist,file),'utf8');

for (const [file,language] of [['index.html','es'],['en/index.html','en']]) {
  const html = await read(file);
  const {document} = parseHTML(html);
  assert.equal(document.documentElement.lang,language);
  assert.equal(document.querySelector('link[rel="canonical"]').href,`${origin}/${language === 'en' ? 'en/' : ''}`);
  assert.equal(document.querySelector('meta[name="robots"]').content,'index,follow,max-image-preview:large');
  assert.equal(document.querySelectorAll('link[hreflang]').length,3);
  const schema = JSON.parse(document.getElementById('profile-schema').textContent);
  assert.equal(schema['@type'],'ProfilePage');
  assert.equal(schema.mainEntity.name,'Sergio Alejandro Hernández Patiño');
  assert.equal(schema.inLanguage,language);
  const profileRole = language === 'es' ? 'Desarrollador .NET y Power Platform' : '.NET and Power Platform Developer';
  assert.equal(document.querySelector('.role').textContent,profileRole);
  assert.equal(document.querySelector('#recruiter-print .print-role').textContent,profileRole);
  assert.equal(schema.mainEntity.jobTitle,profileRole);
  assert.equal(document.title,`Sergio Hernández | Power Platform · .NET · ${language === 'es' ? 'IA' : 'AI'}`);
  assert.ok(schema.mainEntity.knowsAbout.some(skill=>skill.includes('Identity')));
  assert.doesNotMatch(schema.mainEntity.knowsAbout.join(' '),/Oracle|PL\/SQL|microservicios|microservices|Python/iu);
  assert.equal(document.querySelector('meta[property="og:description"]').content,document.querySelector('meta[name="description"]').content);
  assert.equal(document.querySelector('meta[property="og:title"]').content,document.title);
  assert.match(document.querySelector('.shared-grid').textContent,/MongoDB/);
  const periods = language === 'es'
    ? ['mar. 2025 – oct. 2026','jun. 2023 – mar. 2025','mar. 2021 – jun. 2023','sept. 2020 – mar. 2021']
    : ['Mar 2025 – Oct 2026','Jun 2023 – Mar 2025','Mar 2021 – Jun 2023','Sep 2020 – Mar 2021'];
  const durations = language === 'es' ? ['1 año y 7 meses','1 año y 9 meses','2 años y 3 meses','6 meses'] : ['1 year and 7 months','1 year and 9 months','2 years and 3 months','6 months'];
  assert.deepEqual([...document.querySelectorAll('.job-dates')].map(node=>node.textContent),periods);
  assert.deepEqual([...document.querySelectorAll('.job-duration')].map(node=>node.textContent),durations);
  assert.deepEqual([...document.querySelectorAll('#recruiter-print .print-job-duration')].map(node=>node.textContent),durations);
  for (const [index,node] of [...document.querySelectorAll('#recruiter-print .print-job-period')].entries()) assert.ok(node.textContent.startsWith(periods[index]));
  assert.doesNotMatch(document.querySelector('#experiencia').textContent,/2027|Actualidad|Present/iu);
  const dynamizaticRole = language === 'es' ? 'Desarrollador Senior • Microsoft 365' : 'Senior Developer • Microsoft 365';
  assert.equal(document.querySelector('.job:nth-child(1) .job-role').textContent,dynamizaticRole);
  assert.equal(document.querySelector('#recruiter-print .print-job:nth-child(1) .print-job-role').textContent,dynamizaticRole);
  assert.equal(document.querySelectorAll('.job-contract,#recruiter-print .print-job-contract').length,0);
  assert.doesNotMatch(document.querySelector('body').textContent,/Periodo de contrato|Contract term/iu);
  const placeholder=document.getElementById('portfolio-link');
  assert.equal(placeholder.tagName,'BUTTON');
  assert.equal(placeholder.hasAttribute('disabled'),false);
  assert.equal(placeholder.hasAttribute('aria-disabled'),false);
  assert.equal(placeholder.getAttribute('href'),null);
  for (const button of document.querySelectorAll('button')) {
    assert.ok(button.getAttribute('title')?.trim(),`Falta la ayuda nativa del botón ${button.id}`);
    assert.equal(button.hasAttribute('data-tooltip'),false,'Los botones conservan el tooltip nativo');
  }
  assert.equal(document.querySelectorAll('[data-tooltip]').length,5);
  assert.ok([...document.querySelectorAll('[data-tooltip]')].every(node=>node.closest('.contact-strip')));
  assert.equal(document.querySelectorAll('.tech-list [data-tooltip],.tech-list [title],.tech-list [tabindex],[data-explain]').length,0);
  assert.equal(document.getElementById('help-tooltip').getAttribute('role'),'tooltip');
  assert.equal(document.querySelector('.language-spanish strong').textContent,language === 'es' ? 'Nativo' : 'Native');
  assert.doesNotMatch(document.querySelector('main').textContent,/\bPHP\b|Bootstrap|comercialicé|commercialized|sold|entrega a cliente/iu);
  assert.doesNotMatch(document.querySelector('#tecnologias').textContent,/\bJava\b|Spring Boot|Oracle|PL\/SQL|microservicios|microservices|Angular/iu);
  for(const name of ['Java','Spring Boot','Angular','micro']){assert.ok(document.querySelector('.job:nth-child(4)').textContent.toLowerCase().includes(name.toLowerCase()));assert.ok(document.querySelector('#recruiter-print .print-job:nth-child(4)').textContent.toLowerCase().includes(name.toLowerCase()));}
  const offered = document.querySelector('#tecnologias');
  assert.ok(offered.textContent.includes('Identity'));
  assert.equal(offered.querySelectorAll('#power-apps').length,1);
  assert.equal(offered.querySelectorAll('#power-canvas,#power-model-driven').length,0);
  assert.match(document.querySelector('.profile-summary').textContent,/full stack/i);
  assert.doesNotMatch(document.querySelector('.profile-summary').textContent,/analista y desarrollador|software analyst and developer|backend/iu);
  assert.doesNotMatch(document.querySelector('#recruiter-print .print-section').textContent,/backend/iu);
  assert.equal(document.querySelectorAll('#brand-tagline').length,0);
  assert.match(document.getElementById('copyright').textContent,/Copyright © 2026.*Alejandro’sTech/);
  assert.doesNotMatch(offered.textContent,/Python/iu);
  assert.equal(document.querySelectorAll('.print-portfolio').length,0);
  assert.equal(document.querySelectorAll('#recruiter-print img').length,0);
  assert.equal(document.querySelectorAll('#complete-print .complete-photo').length,1);
  assert.equal(document.querySelectorAll('.print-option').length,2);
  assert.equal(document.querySelectorAll('.print-option-actions button').length,2);
  assert.equal(document.querySelectorAll('.print-option-actions a').length,0);
  assert.equal(document.querySelectorAll('#recruiter-print .print-job').length,4);
  const contactURLs = [document.querySelector('.location'),...document.querySelectorAll('.contact-strip a:not(.no-print)')].map(link => link.getAttribute('href'));
  for (const print of document.querySelectorAll('.print-resume')) {
    assert.deepEqual([...print.querySelectorAll('.print-contact a')].map(link=>link.getAttribute('href')),contactURLs,'Las impresiones conservan todos los contactos salvo WhatsApp');
    assert.equal(print.querySelectorAll('a[href*="wa.me"],.contact-whatsapp').length,0);
    assert.doesNotMatch(print.textContent,/WhatsApp/i);
  }
  const phone = document.querySelector('.contact-phone');
  assert.equal(phone.getAttribute('href'),'tel:+573128560843');
  assert.equal(phone.textContent,'+57 312 856 0843');
  const whatsapp = document.querySelector('.contact-whatsapp');
  const chat = new URL(whatsapp.getAttribute('href'));
  assert.equal(chat.origin,'https://wa.me');
  assert.equal(chat.pathname,'/573128560843');
  assert.equal(chat.searchParams.get('text'),language === 'es'
    ? 'Hola Sergio, he visto tu CV y me gustaría conversar contigo sobre una oportunidad profesional.'
    : 'Hi Sergio, I’ve reviewed your résumé and would like to discuss a professional opportunity with you.');
  assert.equal(whatsapp.target,'_blank');
  assert.match(whatsapp.getAttribute('rel'),/noopener/);
  assert.match(whatsapp.getAttribute('rel'),/noreferrer/);
  assert.ok(whatsapp.classList.contains('no-print'));
  assert.ok(whatsapp.querySelector('svg'));
  assert.ok(whatsapp.textContent.includes('WhatsApp'));
  assert.equal(document.querySelector('#recruiter-print').querySelectorAll('.print-skill').length,4);
  assert.equal(document.querySelectorAll('a[href*=".pdf"],a[download$=".pdf"],[id^="download-"][id$="-pdf"]').length,0);
  assert.doesNotMatch(document.getElementById('print-chooser').textContent,/\bPDF\b/iu);
  const printSkills = document.querySelector('#recruiter-print [data-print-section="skills"]');
  const normalize = value => value.replace(/\s+/g,' ').trim();
  // El perfil se conserva completo, con sus párrafos y énfasis en ambos idiomas.
  assert.deepEqual(
    [...document.querySelectorAll('#recruiter-print .print-section:first-of-type > p')].map(node => normalize(node.innerHTML)),
    [...document.querySelectorAll('.profile-summary > p')].map(node => normalize(node.innerHTML)),
    'El CV resumido debe reutilizar el perfil completo de la web'
  );
  const completeSkills = document.querySelector('#complete-print [data-print-section="skills"]');
  for (const node of document.querySelectorAll('.specialty .tech-list li,.specialty .ecosystem span,.shared-grid dd')) {
    assert.ok(normalize(completeSkills.textContent).includes(normalize(node.textContent)), 'El completo conserva: '+node.textContent);
  }
  for (const skill of ['Power Apps','Dataverse','PCF','ALM','ASP.NET Core','Entity Framework Core','SQL Server','React','OAuth 2.0','Git/GitHub']) assert.ok(printSkills.textContent.includes(skill),skill);
  assert.doesNotMatch(printSkills.textContent,/Microsoft Copilot|ChatGPT|Claude|Gemini|Planner|Administration portals|Portales de administración/iu);
  const degree = language === 'es' ? 'Tecnólogo en Análisis y Desarrollo de Sistemas de Información (ADSI)' : 'Technology degree in Information Systems Analysis and Development (ADSI)';
  assert.equal(normalize(document.querySelector('.education h3').textContent),degree);
  for (const root of document.querySelectorAll('.print-resume')) {
    assert.deepEqual([...root.querySelectorAll('[data-print-section]')].map(n=>n.getAttribute('data-print-section')),['profile','experience','skills','education']);
    assert.equal(normalize(root.querySelector('.print-education h3').textContent),degree);
    assert.equal(root.querySelectorAll('.print-job').length,4);
    for (const [i,job] of [...root.querySelectorAll('.print-job')].entries()) {
      assert.deepEqual([...job.children].map(n=>n.tagName),['H3','P','P','UL']);
      assert.equal(job.querySelector('.print-job-period').textContent,periods[i]);
      assert.equal(job.querySelector('.print-job-duration').textContent,durations[i]);
    }
  }
  assert.deepEqual([...document.querySelectorAll('#complete-print .print-job ul')].map(n=>normalize(n.textContent)),[...document.querySelectorAll('.job-details')].map(n=>normalize(n.textContent)));
  assert.match(document.querySelector('.profile-summary').textContent,/React/);
  assert.doesNotMatch(document.querySelector('.profile-summary').textContent,/Angular/);
  const flags=[...document.querySelectorAll('.language-flags img')];
  assert.equal(flags.length,2);
  assert.ok(flags.every(flag=>flag.src.startsWith('data:image/svg+xml;base64,')),'Las banderas deben estar disponibles sin otra petición de red');
  const webURL = `${origin}/${language === 'en' ? 'en/' : ''}`;
  assert.equal(document.querySelector('#complete-print .print-web-link a').href,webURL);
  assert.equal(document.querySelector('#recruiter-print .print-web-link a').href,webURL);
  const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
  assert.equal(new Set(ids).size,ids.length);
  for (const node of document.querySelectorAll('[href],[src]')) {
    const resource = node.getAttribute('src') || node.getAttribute('href');
    if (!resource || resource.startsWith('#') || /^[a-z]+:/i.test(resource)) continue;
    await access(path.resolve(dist,path.dirname(file),resource.split('?')[0]));
  }

  // Regresión de controles y preferencias bloqueadas, sin un navegador real.
  for (const blockedStorage of [false,true]) {
    const {window:domWindow,document:page} = parseHTML(html);
    const location = new URL(`${origin}/${language === 'en' ? 'en/' : ''}`);
    Object.defineProperty(page,'baseURI',{value:location.href});
    const storage = new Map();
    const localStorage = {
      getItem:key => { if (blockedStorage) throw Error('Unavailable'); return storage.get(key) ?? null; },
      setItem:(key,value) => { if (blockedStorage) throw Error('Unavailable'); storage.set(key,value); },
      removeItem:key => { if (blockedStorage) throw Error('Unavailable'); storage.delete(key); }
    };
    const matchMedia = () => ({matches:false,addEventListener(){}});
    let focused = null;
    for (const node of page.querySelectorAll('button,a,input')) node.focus = () => {focused=node;};
    Object.defineProperty(page,'activeElement',{get:()=>focused});
    const windowEvents = new Map();
    const window = {
      Event:domWindow.Event,
      addEventListener:(type, callback) => windowEvents.set(type,[...(windowEvents.get(type) || []),callback])
    };
    const emitWindow = type => (windowEvents.get(type) || []).forEach(callback => callback(new window.Event(type)));
    window.scrollY = 0;
    window.scrollTo = ({top}) => {window.scrollY=top;emitWindow('scroll');};
    window.focus = () => {};
    window.print = () => emitWindow('beforeprint');
    const context = {document:page,window,localStorage,matchMedia,URL,location,
      history:{replaceState:(_,__,url) => {location.href=new URL(url,location.href).href;}},
      getComputedStyle:()=>({position:'relative'}),requestAnimationFrame:callback=>callback(),
      setTimeout:()=>0,clearTimeout:()=>{}};
    vm.runInNewContext(script,context,{timeout:2000});
    const flagSources=[...page.querySelectorAll('.language-flags img')].map(flag=>flag.src);
    const click = id => page.getElementById(id).dispatchEvent(new window.Event('click',{bubbles:true}));
    const change = (id,checked) => {const node=page.getElementById(id);node.checked=checked;node.dispatchEvent(new window.Event('change',{bubbles:true}));};
    assert.equal(page.documentElement.lang,language);
    const initialURL=location.href;
    click('portfolio-link');
    assert.equal(location.href,initialURL,'La marca sin URL real no debe provocar una navegación');
    assert.match(page.getElementById('portfolio-notice').textContent,language === 'es' ? /próximamente/i : /coming soon/i);
    click('language-toggle');
    assert.equal(page.getElementById('portfolio-notice').textContent,'');
    assert.equal(page.getElementById('language-toggle').title,language === 'es' ? 'Cambiar a Español' : 'Switch to English');
    assert.equal(page.documentElement.lang,language === 'es' ? 'en' : 'es');
    const switchedChat = new URL(page.querySelector('.contact-whatsapp').getAttribute('href'));
    assert.equal(switchedChat.searchParams.get('text'),language === 'es'
      ? 'Hi Sergio, I’ve reviewed your résumé and would like to discuss a professional opportunity with you.'
      : 'Hola Sergio, he visto tu CV y me gustaría conversar contigo sobre una oportunidad profesional.');
    assert.equal(page.querySelector('.contact-phone').getAttribute('href'),'tel:+573128560843');
    const switchedRole = language === 'es' ? '.NET and Power Platform Developer' : 'Desarrollador .NET y Power Platform';
    const switchedDuration = language === 'es' ? '1 year and 7 months' : '1 año y 7 meses';
    assert.equal(page.querySelector('.role').textContent,switchedRole);
    assert.equal(page.querySelector('#recruiter-print .print-role').textContent,switchedRole);
    assert.equal(page.querySelector('.job-duration').textContent,switchedDuration);
    assert.equal(page.querySelector('#recruiter-print .print-job-duration').textContent,switchedDuration);
    assert.deepEqual([...page.querySelectorAll('.language-flags img')].map(flag=>flag.src),flagSources,'Cambiar de idioma no debe cargar ni sustituir imágenes');
    assert.equal(page.querySelector('.language-spanish strong').textContent,language === 'es' ? 'Native' : 'Nativo');
    click('language-toggle');
    assert.equal(page.documentElement.lang,language);
    assert.deepEqual([...page.querySelectorAll('.language-flags img')].map(flag=>flag.src),flagSources);
    click('accessibility-toggle');
    assert.equal(page.getElementById('accessibility-panel').hidden,false);
    change('spacing-toggle',true);
    change('contrast-toggle',true);
    change('motion-toggle',true);
    assert.equal(page.documentElement.dataset.readingSpacing,'wide');
    assert.equal(page.documentElement.dataset.contrast,'high');
    assert.equal(page.documentElement.dataset.motion,'reduced');
    page.getElementById('text-size').value='200';
    page.getElementById('text-size').dispatchEvent(new window.Event('input'));
    assert.equal(page.documentElement.style.fontSize,'200%');
    click('print-cv');
    assert.equal(page.getElementById('accessibility-panel').hidden,true);
    assert.equal(page.getElementById('print-chooser').hidden,false);
    assert.equal(page.getElementById('print-cv').getAttribute('aria-expanded'),'true');
    assert.equal(focused,page.getElementById('print-recruiter'));
    assert.equal(page.querySelector('main').inert,true);
    click('print-chooser-close');
    assert.equal(page.getElementById('print-chooser').hidden,true);
    assert.equal(page.querySelector('main').inert,undefined);
    assert.equal(focused,page.getElementById('print-cv'));
    for (const variant of ['web','recruiter']) {
      click('print-cv');
      click(`print-${variant}`);
      assert.equal(page.documentElement.dataset.printVariant,variant);
      assert.equal(page.getElementById('print-chooser').hidden,true);
      emitWindow('afterprint');
      assert.equal(page.documentElement.dataset.printVariant,undefined);
    }
    window.print = () => {throw new Error('Print is blocked by the viewer');};
    click('print-cv');
    click('print-recruiter');
    assert.equal(page.getElementById('print-help').hidden,false);
    assert.equal(new URL(page.getElementById('print-open').href).searchParams.get('cv'),'recruiter');
    emitWindow('afterprint');
    window.print = () => emitWindow('beforeprint');
    click('print-cv');
    click('language-toggle');
    const switchedURL = `${origin}/${language === 'es' ? 'en/' : ''}`;
    assert.equal(page.querySelector('#complete-print .print-web-link a').href,switchedURL);
    assert.equal(page.querySelector('#recruiter-print .print-web-link a').href,switchedURL);
    assert.equal(page.querySelector('.complete-photo').src,new URL(page.querySelector('.portrait img').getAttribute('src'),page.baseURI).href);
    const escape = new window.Event('keydown');
    escape.key = 'Escape';
    page.dispatchEvent(escape);
    assert.equal(page.getElementById('print-chooser').hidden,true);
    click('language-toggle');
    click('accessibility-reset');
    assert.equal(page.documentElement.style.fontSize,'100%');
    assert.equal(page.documentElement.dataset.readingSpacing,'normal');
    window.scrollY=800;
    emitWindow('scroll');
    assert.equal(page.getElementById('back-to-top').hidden,false);
    click('back-to-top');
    assert.equal(window.scrollY,0);
    assert.equal(page.getElementById('back-to-top').hidden,true);
  }
}
const download = parseHTML(await read('descargas/CV_Sergio_Hernandez.html')).document;
assert.equal(download.querySelectorAll('script[src],link[rel="stylesheet"]').length,0);
assert.equal(download.querySelector('meta[name="robots"]').content,'noindex,nofollow');
assert.match(download.querySelector('.portrait img').src,/^data:image\/jpeg;base64,/);
assert.ok((await readdir(path.join(dist,'descargas'))).every(file => !file.endsWith('.pdf')));
const zip = unzipSync(new Uint8Array(await readFile(path.join(dist,'descargas/CV_Sergio_Hernandez_HTML_CSS_JS.zip'))));
assert.deepEqual(Buffer.from(zip['script.js']),Buffer.from(script));
assert.ok(zip['src/script.js'] && zip['src/locales/en.json'] && zip['en/index.html']);
assert.ok(zip['public/favicon.svg'] && zip['public/flags/us.svg'] && zip['public/images/sergio-hernandez.jpeg']);
assert.ok(Object.keys(zip).every(file => !file.endsWith('.pdf')));
console.log('Passed: bilingual SEO, both print variants, logical print reading order, full and selected skills, keyboard access and print-only website links.');
