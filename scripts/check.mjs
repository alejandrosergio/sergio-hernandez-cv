import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
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
  assert.match(document.querySelector('.shared-grid').textContent,/MongoDB/);
  assert.equal(document.querySelector('.job:nth-child(2) .job-period > span').textContent,'2023 – 2025');
  assert.equal(document.querySelector('.language-spanish strong').textContent,language === 'es' ? 'Nativo' : 'Native');
  assert.doesNotMatch(document.querySelector('main').textContent,/\bPHP\b|Bootstrap|\bSenior\b|Spring Boot|\bJava\b|comercialicé|commercialized|sold|entrega a cliente/iu);
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
assert.equal(script.trim().split('\n').length,1);
const zip = unzipSync(new Uint8Array(await readFile(path.join(dist,'descargas/CV_Sergio_Hernandez_HTML_CSS_JS.zip'))));
assert.deepEqual(Buffer.from(zip['script.js']),Buffer.from(script));
assert.ok(zip['src/script.js'] && zip['src/locales/en.json'] && zip['en/index.html']);
assert.ok(zip['public/favicon.svg'] && zip['public/flags/us.svg'] && zip['public/images/sergio-hernandez.jpeg']);
console.log('Passed: bilingual static SEO, offline download and interaction regressions with and without storage.');
