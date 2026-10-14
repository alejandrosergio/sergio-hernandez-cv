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
  assert.match(document.title,/Full Stack/);
  assert.ok(schema.mainEntity.knowsAbout.some(skill=>skill.includes('Identity')));
  assert.doesNotMatch(schema.mainEntity.knowsAbout.join(' '),/Oracle|PL\/SQL|microservicios|microservices|Python/iu);
  assert.equal(document.querySelector('meta[property="og:description"]').content,document.querySelector('meta[name="description"]').content);
  assert.equal(document.querySelector('meta[property="og:title"]').content,document.title);
  assert.match(document.querySelector('.shared-grid').textContent,/MongoDB/);
  assert.equal(document.querySelector('.job:nth-child(1) .job-period > span').textContent,'2025–2027');
  assert.equal(document.querySelectorAll('.job-contract,.recruiter-job-contract').length,0);
  assert.doesNotMatch(document.querySelector('body').textContent,/Periodo de contrato|Contract term/iu);
  const placeholder=document.getElementById('portfolio-link');
  assert.equal(placeholder.getAttribute('aria-disabled'),'true');
  assert.equal(placeholder.getAttribute('href'),null);
  assert.equal(document.querySelector('.job:nth-child(2) .job-period > span').textContent,'2023 – 2025');
  assert.equal(document.querySelector('.language-spanish strong').textContent,language === 'es' ? 'Nativo' : 'Native');
  assert.doesNotMatch(document.querySelector('main').textContent,/\bPHP\b|Bootstrap|\bSenior\b|comercialicé|commercialized|sold|entrega a cliente/iu);
  assert.doesNotMatch(document.querySelector('#tecnologias').textContent,/\bJava\b|Spring Boot|Oracle|PL\/SQL|microservicios|microservices/iu);
  for(const name of ['Java','Spring Boot','Angular','micro']){assert.ok(document.querySelector('.job:nth-child(4)').textContent.toLowerCase().includes(name.toLowerCase()));assert.ok(document.querySelector('.recruiter-job:nth-child(4)').textContent.toLowerCase().includes(name.toLowerCase()));}
  const offered = document.querySelector('#tecnologias');
  assert.ok(offered.textContent.includes('Identity'));
  assert.equal(offered.querySelectorAll('#power-apps').length,1);
  assert.equal(offered.querySelectorAll('#power-canvas,#power-model-driven').length,0);
  assert.match(document.querySelector('.profile-summary').textContent,/full stack/i);
  assert.doesNotMatch(document.querySelector('.profile-summary').textContent,/analista y desarrollador|software analyst and developer|backend/iu);
  assert.doesNotMatch(document.querySelector('#recruiter-print .recruiter-section').textContent,/backend/iu);
  assert.equal(document.querySelectorAll('#brand-tagline').length,0);
  assert.match(document.getElementById('copyright').textContent,/Copyright © 2026.*Alejandro’sTech/);
  assert.doesNotMatch(offered.textContent,/Python/iu);
  const coming=language==='es'?'Próximamente':'Coming soon';
  for(const node of document.querySelectorAll('.print-portfolio')){assert.ok(node.textContent.includes('Alejandro’sTech'));assert.ok(node.textContent.includes(coming));assert.equal(node.querySelectorAll('a[href]').length,0);}
  assert.equal(document.querySelectorAll('.print-portfolio').length,2);
  assert.equal(document.querySelectorAll('.print-option').length,2);
  assert.equal(document.querySelectorAll('.print-option-actions button').length,2);
  assert.equal(document.querySelectorAll('.print-option-actions a').length,0);
  assert.ok(document.querySelector('#web-print-link').closest('.print-only'));
  assert.equal(document.querySelectorAll('.recruiter-job').length,4);
  assert.deepEqual([...document.querySelectorAll('.recruiter-contact a')].map(link => link.getAttribute('href')),[document.querySelector('.location'),...document.querySelectorAll('.contact-strip a')].map(link => link.getAttribute('href')), 'Print preserves every contact URL exactly');
  assert.equal(document.querySelector('#recruiter-print').querySelectorAll('.recruiter-skill').length,3);
  assert.equal(document.querySelectorAll('a[href*=".pdf"],a[download$=".pdf"],[id^="download-"][id$="-pdf"]').length,0);
  assert.doesNotMatch(document.getElementById('print-chooser').textContent,/\bPDF\b/iu);
  const printSkills = document.querySelector('#recruiter-print .recruiter-section:nth-of-type(2)');
  const normalize = value => value.replace(/\s+/g,' ').trim();
  for (const node of document.querySelectorAll('.specialty .tech-list li,.specialty .ecosystem span,.shared-grid [data-print-technology] dd')) {
    assert.ok(normalize(printSkills.textContent).includes(normalize(node.textContent)),`Print summary omits confirmed skills: ${node.textContent}`);
  }
  for(const skill of ['ASP.NET Core','Web API','Entity Framework Core','LINQ','PCF','RPA']){assert.ok(document.querySelector('#tecnologias').textContent.includes(skill));assert.ok(printSkills.textContent.includes(skill));}
  const webURL = `${origin}/${language === 'en' ? 'en/' : ''}`;
  assert.equal(document.getElementById('web-print-link').href,webURL);
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
      getComputedStyle:()=>({position:'relative'}),requestAnimationFrame:callback=>callback()};
    vm.runInNewContext(script,context,{timeout:2000});
    const click = id => page.getElementById(id).dispatchEvent(new window.Event('click',{bubbles:true}));
    const change = (id,checked) => {const node=page.getElementById(id);node.checked=checked;node.dispatchEvent(new window.Event('change',{bubbles:true}));};
    assert.equal(page.documentElement.lang,language);
    click('language-toggle');
    assert.equal(page.documentElement.lang,language === 'es' ? 'en' : 'es');
    assert.equal(page.querySelector('.language-spanish strong').textContent,language === 'es' ? 'Native' : 'Nativo');
    click('language-toggle');
    assert.equal(page.documentElement.lang,language);
    assert.equal(new URL(page.getElementById('language-flag').src).pathname,language === 'es' ? '/flags/us.svg' : '/flags/es.svg');
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
    assert.equal(focused,page.getElementById('print-web'));
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
    assert.equal(page.getElementById('web-print-link').href,switchedURL);
    assert.equal(page.querySelector('#recruiter-print .print-web-link a').href,switchedURL);
    assert.equal(page.querySelector('.recruiter-photo').src,new URL(page.querySelector('.portrait img').getAttribute('src'),page.baseURI).href);
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
console.log('Passed: bilingual SEO, both print variants, complete technology list, keyboard access and print-only website links.');
