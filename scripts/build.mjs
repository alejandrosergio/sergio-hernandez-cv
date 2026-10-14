import { readFile, writeFile, mkdir, readdir, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { build, transform } from 'esbuild';
import { minify } from 'html-minifier-terser';
import { parseHTML } from 'linkedom';
import { zipSync } from 'fflate';

const site = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(site, 'dist');
const origin = 'https://sergio-hernandez-cv.alejosergio3000.chatgpt.site';
await mkdir(dist,{recursive:true});
for (const asset of ['favicon.svg','flags','images']) await cp(path.join(site,'public',asset),path.join(dist,asset),{recursive:true});
const urls = {es:`${origin}/`, en:`${origin}/en/`};
const read = relative => readFile(path.join(site, relative), 'utf8');
const hash = content => createHash('sha256').update(content).digest('hex').slice(0,12);
const htmlOptions = {collapseWhitespace:true, removeComments:true, removeAttributeQuotes:true, useShortDoctype:true, minifyCSS:false, minifyJS:false};
const spanishSource = await read('src/index.html');
const {document} = parseHTML(spanishSource);
const english = JSON.parse(await read('src/locales/en.json'));
const englishTitle = english.find(entry => entry.selector === 'title').text;
const englishDescription = english.find(entry => entry.selector === 'meta[name="description"]').text;
const description = document.querySelector('meta[name="description"]').content;

function element(tag, attributes, text) {
  const node = document.createElement(tag);
  Object.entries(attributes).forEach(([name,value]) => node.setAttribute(name,value));
  if (text !== undefined) node.textContent = text;
  return node;
}

function addLocalizedMeta(attribute, key, es, en) {
  document.head.append(element('meta', {[attribute]:key, content:es}));
  english.push({selector:`meta[${attribute}="${key}"]`, attribute:'content', text:en});
}

document.head.append(element('meta',{name:'author',content:'Sergio Alejandro Hernández Patiño'}));
document.head.append(element('meta',{name:'robots',content:'index,follow,max-image-preview:large'}));
document.head.append(element('link',{rel:'canonical',href:urls.es}));
english.push({selector:'link[rel="canonical"]',attribute:'href',text:urls.en});
for (const [language,url] of [...Object.entries(urls),['x-default',urls.es]]) {
  document.head.append(element('link',{rel:'alternate',hreflang:language,href:url}));
}
addLocalizedMeta('property','og:title',document.title,englishTitle);
addLocalizedMeta('property','og:description',description,englishDescription);
addLocalizedMeta('property','og:url',urls.es,urls.en);
addLocalizedMeta('property','og:locale','es_CO','en_US');
for (const [key,value] of Object.entries({
  'og:type':'profile','og:site_name':'Sergio Hernández | Currículum profesional',
  'og:image':`${origin}/images/sergio-hernandez.jpeg`,'og:image:width':'853','og:image:height':'1280',
  'og:image:alt':'Sergio Alejandro Hernández Patiño'
})) document.head.append(element('meta',{property:key,content:value}));
document.head.append(element('meta',{name:'twitter:card',content:'summary'}));
document.head.append(element('meta',{name:'twitter:image',content:`${origin}/images/sergio-hernandez.jpeg`}));
addLocalizedMeta('name','twitter:title',document.title,englishTitle);
addLocalizedMeta('name','twitter:description',description,englishDescription);

function profileSchema(language) {
  return {
    '@context':'https://schema.org', '@type':'ProfilePage', '@id':`${urls[language]}#profile`,
    url:urls[language], inLanguage:language,
    name:language === 'es' ? 'Currículum de Sergio Alejandro Hernández Patiño' : 'Sergio Alejandro Hernández Patiño — Professional CV',
    mainEntity:{
      '@type':'Person', '@id':`${origin}/#person`, name:'Sergio Alejandro Hernández Patiño', alternateName:'Sergio Hernández',
      jobTitle:language === 'es' ? 'Analista y Desarrollador de Software' : 'Software Analyst and Developer',
      description:language === 'es' ? description : englishDescription,
      image:`${origin}/images/sergio-hernandez.jpeg`, url:urls[language],
      sameAs:['https://www.linkedin.com/in/sergio-alejandro-hernandez-patino/','https://github.com/alejandrosergio'],
      homeLocation:{'@type':'Place',name:'Cali, Colombia'}, knowsLanguage:['es','en'],
      knowsAbout:['C#','.NET','Microsoft Power Platform','Microsoft 365','Azure','Artificial intelligence','REST APIs','SQL Server','MySQL','MongoDB','Application lifecycle management']
    }
  };
}
document.head.append(element('script',{id:'profile-schema',type:'application/ld+json'},JSON.stringify(profileSchema('es'))));
english.push({selector:'#profile-schema',text:JSON.stringify(profileSchema('en'))});

function valueOf(node, entry) {
  return entry.attribute ? node.getAttribute(entry.attribute) : ('html' in entry ? node.innerHTML : node.textContent);
}
const translations = english.map(entry => {
  const nodes = [...document.querySelectorAll(entry.selector)];
  if (!nodes.length) throw new Error(`Missing translation target: ${entry.selector}`);
  const es = valueOf(nodes[0],entry);
  if (nodes.some(node => valueOf(node,entry) !== es)) throw new Error(`Different Spanish values share ${entry.selector}`);
  return {selector:entry.selector, ...(entry.attribute ? {attribute:entry.attribute} : {}), format:'html' in entry ? 'html' : 'text', es, en:entry.html ?? entry.text};
});
const javascriptBuild = await build({
  absWorkingDir:site, entryPoints:['src/script.js'], write:false, bundle:true, minify:true,
  format:'iife', platform:'browser', target:'es2020', charset:'utf8', legalComments:'none',
  plugins:[{name:'cv-localization',setup(context) {
    context.onResolve({filter:/^cv:translations$/},() => ({path:'translations',namespace:'cv'}));
    context.onLoad({filter:/.*/,namespace:'cv'},() => ({contents:JSON.stringify(translations),loader:'json'}));
  }}]
});
const javascript = javascriptBuild.outputFiles[0].text;
const stylesheet = (await transform(await read('src/styles.css'),{loader:'css',minify:true,charset:'utf8',target:['chrome120','edge120','firefox120','safari17'],legalComments:'none'})).code;
await mkdir(path.join(dist,'en'),{recursive:true});
await mkdir(path.join(dist,'descargas'),{recursive:true});
await writeFile(path.join(dist,'script.js'),javascript);
await writeFile(path.join(dist,'styles.css'),stylesheet);

function applyTranslations(page, language) {
  translations.forEach(entry => page.querySelectorAll(entry.selector).forEach(node => {
    const value = entry[language];
    if (entry.attribute) node.setAttribute(entry.attribute,value);
    else if (entry.format === 'html') node.innerHTML = value;
    else node.textContent = value;
  }));
  page.documentElement.lang = language;
  const target = language === 'es' ? 'en' : 'es';
  const button = page.getElementById('language-toggle');
  const action = target === 'en' ? 'Switch to English' : 'Cambiar a español';
  button.setAttribute('lang',target);
  button.setAttribute('title',action);
  button.setAttribute('aria-label',action);
  page.getElementById('language-label').textContent = target === 'en' ? 'English' : 'Español';
  page.getElementById('language-flag').setAttribute('src',`flags/${target === 'en' ? 'us' : 'es'}.svg`);
}

const spanishTemplate = document.toString();
for (const language of ['es','en']) {
  const {document:page} = parseHTML(spanishTemplate);
  applyTranslations(page,language);
  page.querySelector('link[rel="stylesheet"]').href = `styles.css?v=${hash(stylesheet)}`;
  page.querySelector('script[src]').src = `script.js?v=${hash(javascript)}`;
  page.querySelector('.portrait img').src = `images/sergio-hernandez.jpeg?v=${hash(await readFile(path.join(site,'public/images/sergio-hernandez.jpeg')))}`;
  if (language === 'en') {
    for (const node of page.querySelectorAll('[href],[src],[data-flag-en],[data-flag-es]')) {
      for (const attribute of ['href','src','data-flag-en','data-flag-es']) {
        const value = node.getAttribute(attribute);
        if (value && /^(?:styles\.css|script\.js|favicon\.svg|flags\/|images\/)/.test(value)) node.setAttribute(attribute,`../${value}`);
      }
    }
  }
  await writeFile(path.join(dist,language === 'es' ? 'index.html' : 'en/index.html'),await minify(page.toString(),htmlOptions));
}

const alternateLinks = Object.entries(urls).map(([lang,url]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${url}"/>`).join('') + `<xhtml:link rel="alternate" hreflang="x-default" href="${urls.es}"/>`;
const lastModified = new Date().toISOString().slice(0,10);
await writeFile(path.join(dist,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${Object.values(urls).map(url => `<url><loc>${url}</loc><lastmod>${lastModified}</lastmod>${alternateLinks}</url>`).join('')}</urlset>`);
await writeFile(path.join(dist,'robots.txt'),`User-agent: *\nAllow: /\nDisallow: /descargas/\nSitemap: ${origin}/sitemap.xml\n`);

// Una sola copia autónoma, con el mismo comportamiento y todos los recursos incorporados.
const {document:download} = parseHTML(spanishTemplate);
download.querySelector('link[rel="stylesheet"]').replaceWith(element('style',{},stylesheet));
download.querySelector('script[src]').remove();
download.querySelector('meta[name="robots"]').content = 'noindex,nofollow';
const embeddedAssets = new Map();
for (const [file,mime] of [['favicon.svg','image/svg+xml'],['flags/us.svg','image/svg+xml'],['flags/es.svg','image/svg+xml'],['images/sergio-hernandez.jpeg','image/jpeg']]) {
  embeddedAssets.set(file,`data:${mime};base64,${(await readFile(path.join(dist,file))).toString('base64')}`);
}
for (const node of download.querySelectorAll('[href],[src],[data-flag-en],[data-flag-es]')) {
  for (const attribute of ['href','src','data-flag-en','data-flag-es']) {
    const value = node.getAttribute(attribute);
    if (embeddedAssets.has(value)) node.setAttribute(attribute,embeddedAssets.get(value));
  }
}
download.body.append(element('script',{},javascript));
await writeFile(path.join(dist,'descargas/CV_Sergio_Hernandez.html'),await minify(download.toString(),htmlOptions));

const files = {};
async function addZipFile(relative, name = relative) {
  files[name] = new Uint8Array(await readFile(path.join(site,relative)));
}
async function addZipDirectory(relative, name = relative) {
  for (const entry of await readdir(path.join(site,relative),{withFileTypes:true})) {
    if (entry.isDirectory()) await addZipDirectory(`${relative}/${entry.name}`,`${name}/${entry.name}`);
    else await addZipFile(`${relative}/${entry.name}`,`${name}/${entry.name}`);
  }
}
for (const file of ['index.html','styles.css','script.js','favicon.svg','robots.txt','sitemap.xml']) await addZipFile(`dist/${file}`,file);
for (const directory of ['flags','images','en']) await addZipDirectory(`dist/${directory}`,directory);
await addZipFile('dist/descargas/CV_Sergio_Hernandez.html','CV_Sergio_Hernandez.html');
for (const file of ['LEEME.md','package.json','pnpm-lock.yaml','pnpm-workspace.yaml']) await addZipFile(file);
await addZipDirectory('src');
await addZipDirectory('scripts');
await addZipDirectory('public');
await writeFile(path.join(dist,'descargas/CV_Sergio_Hernandez_HTML_CSS_JS.zip'),zipSync(files,{level:9}));
console.log(JSON.stringify({pages:['/','/en/'],javascriptBytes:Buffer.byteLength(javascript),cssBytes:Buffer.byteLength(stylesheet),zipFiles:Object.keys(files).length}));
