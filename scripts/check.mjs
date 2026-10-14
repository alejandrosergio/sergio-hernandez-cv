import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';
import { unzipSync } from 'fflate';
import { PDFDocument, PDFName, PDFString, PDFHexString } from 'pdf-lib';

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
  assert.equal(document.querySelectorAll('.print-option').length,2);
  assert.ok(document.querySelector('#web-print-link').closest('.print-only'));
  assert.equal(document.querySelectorAll('.recruiter-job').length,4);
  assert.equal(document.querySelector('#recruiter-print').querySelectorAll('.recruiter-skill').length,3);
  for (const [variant,name] of [['web','Web'],['recruiter','Reclutador']]) {
    const link = document.getElementById(`download-${variant}-pdf`);
    assert.match(link.href,new RegExp(`/descargas/CV_Sergio_Hernandez_${name}_${language.toUpperCase()}\\.pdf\\?v=`));
    assert.equal(link.getAttribute('download'),`CV_Sergio_Hernandez_${name}_${language.toUpperCase()}.pdf`);
  }
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
    assert.equal(focused,page.getElementById('download-web-pdf'));
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
    assert.equal(new URL(page.getElementById('download-recruiter-pdf').href).pathname,`/descargas/CV_Sergio_Hernandez_Reclutador_${language === 'es' ? 'EN' : 'ES'}.pdf`);
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
for (const language of ['es','en']) {
  for (const variant of ['Web','Reclutador']) {
    const bytes = await readFile(path.join(dist,`descargas/CV_Sergio_Hernandez_${variant}_${language.toUpperCase()}.pdf`));
    const pdf = await PDFDocument.load(bytes);
    assert.ok(pdf.getPageCount() > 0);
    if (variant === 'Reclutador') assert.equal(pdf.getPageCount(),1);
    const webURL = `${origin}/${language === 'en' ? 'en/' : ''}`;
    for (const page of pdf.getPages()) {
      const annotations = page.node.Annots();
      assert.ok(annotations);
      const urls = annotations.asArray().flatMap(ref => {
        const annotation = pdf.context.lookup(ref);
        const action = annotation.lookup(PDFName.of('A'));
        const uri = action?.lookup(PDFName.of('URI'));
        return uri instanceof PDFString || uri instanceof PDFHexString ? [uri.decodeText()] : [];
      });
      assert.ok(urls.includes(webURL),`${variant} ${language}: missing clickable website link`);
    }
  }
}
const zip = unzipSync(new Uint8Array(await readFile(path.join(dist,'descargas/CV_Sergio_Hernandez_HTML_CSS_JS.zip'))));
assert.deepEqual(Buffer.from(zip['script.js']),Buffer.from(script));
assert.ok(zip['src/script.js'] && zip['src/locales/en.json'] && zip['en/index.html']);
assert.ok(zip['public/favicon.svg'] && zip['public/flags/us.svg'] && zip['public/images/sergio-hernandez.jpeg']);
for (const language of ['ES','EN']) for (const variant of ['Web','Reclutador']) assert.ok(zip[`descargas/CV_Sergio_Hernandez_${variant}_${language}.pdf`]);
console.log('Passed: bilingual SEO, both print variants, keyboard access, downloads and clickable PDF website links.');
