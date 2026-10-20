import { readFile, writeFile, mkdir, readdir, cp, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { build, transform } from 'esbuild';
import { minify } from 'html-minifier-terser';
import { parseHTML } from 'linkedom';
import { zipSync } from 'fflate';
import { createRecruiterMarkup } from './build-print.mjs';

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
// La fotografía del perfil define también las dimensiones y la versión de sus vistas previas.
const portrait = document.querySelector('.portrait img');
const portraitPath = portrait.getAttribute('src');
const portraitDimensions = {width:portrait.getAttribute('width'),height:portrait.getAttribute('height')};
const portraitVersion = hash(await readFile(path.join(dist,portraitPath)));
const portraitURL = `${origin}/${portraitPath}?v=${portraitVersion}`;
const english = JSON.parse(await read('src/locales/en.json'));
const recruiterSource = await read('src/recruiter.json');
const recruiterCopy = JSON.parse(recruiterSource);
const englishTitle = english.find(entry => entry.selector === 'title').text;
const englishDescription = english.find(entry => entry.selector === 'meta[name="description"]').text;
const description = document.querySelector('meta[name="description"]').content;
const resourceAttributes = ['href','src'];

// Se cuentan meses entre los límites acordados, sin duplicar el mes de cambio de empresa.
const monthNames = {
  es:['ene.','feb.','mar.','abr.','may.','jun.','jul.','ago.','sept.','oct.','nov.','dic.'],
  en:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
};
function parseMonth(value) {
  if (!/^\d{4}-(?:0[1-9]|1[0-2])$/.test(value ?? '')) throw new Error(`Mes de experiencia no válido: ${value}`);
  const [year,month] = value.split('-').map(Number);
  return {year,month,ordinal:year * 12 + month};
}
function durationText(total,language) {
  const units = language === 'es' ? [['año','años'],['mes','meses']] : [['year','years'],['month','months']];
  return [Math.floor(total / 12),total % 12]
    .map((count,index) => count ? `${count} ${units[index][count === 1 ? 0 : 1]}` : '')
    .filter(Boolean).join(language === 'es' ? ' y ' : ' and ');
}
for (const [index,job] of [...document.querySelectorAll('.job')].entries()) {
  const start = parseMonth(job.getAttribute('data-start'));
  const end = parseMonth(job.getAttribute('data-end'));
  const total = end.ordinal - start.ordinal;
  if (total <= 0) throw new Error(`Periodo de experiencia no válido: ${job.querySelector('h3').textContent}`);
  for (const className of ['job-dates','job-duration']) {
    const value = language => className === 'job-duration' ? durationText(total,language) : [start,end].map(({year,month}) => `${monthNames[language][month - 1]} ${year}`).join(' – ');
    job.querySelector(`.${className}`).textContent = value('es');
    english.push({selector:`.job:nth-child(${index + 1}) .${className}`,text:value('en')});
  }
}

// La publicación en /en/ y la copia autónoma usan el mismo recorrido de recursos.
function updateResources(page,resolve) {
  for (const node of page.querySelectorAll(resourceAttributes.map(attribute => `[${attribute}]`).join(','))) {
    for (const attribute of resourceAttributes) {
      const value = node.getAttribute(attribute);
      if (value) node.setAttribute(attribute,resolve(value));
    }
  }
}

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
addLocalizedMeta('property','og:locale:alternate','en_US','es_CO');
addLocalizedMeta('property','og:site_name','Sergio Hernández | Currículum profesional','Sergio Hernández | Professional CV');
for (const [key,value] of Object.entries({
  'og:type':'profile',
  'og:image':portraitURL,'og:image:width':portraitDimensions.width,'og:image:height':portraitDimensions.height,
  'og:image:alt':'Sergio Alejandro Hernández Patiño'
})) document.head.append(element('meta',{property:key,content:value}));
document.head.append(element('meta',{name:'twitter:card',content:'summary'}));
document.head.append(element('meta',{name:'twitter:image',content:portraitURL}));
document.head.append(element('meta',{name:'twitter:image:alt',content:'Sergio Alejandro Hernández Patiño'}));
addLocalizedMeta('name','twitter:title',document.title,englishTitle);
addLocalizedMeta('name','twitter:description',description,englishDescription);

// El SEO toma las competencias ofrecidas del contenido visible, sin otra lista que mantener.
function offeredTechnologies(page) {
  const normalize = value => value.replace(/\s+/g,' ').trim().replace(/\.$/,'');
  const terms = [
    ...[...page.querySelectorAll('.specialty h3')].flatMap(node => node.textContent.split(/\s+&\s+/)),
    ...[...page.querySelectorAll('.specialty .tech-list li,.specialty .ecosystem strong')].map(node => node.textContent),
    ...[...page.querySelectorAll('.specialty .ecosystem span,.shared-grid [data-print-technology] dd')].flatMap(node => node.textContent.split(/\s*[·,]\s*|\s+(?:y|and)\s+/))
  ].map(normalize).filter(Boolean);
  return [...new Map(terms.map(term => [term.toLocaleLowerCase(),term])).values()];
}

function profileSchema(page,language) {
  return {
    '@context':'https://schema.org', '@type':'ProfilePage', '@id':`${urls[language]}#profile`,
    url:urls[language], inLanguage:language,
    name:language === 'es' ? 'Currículum de Sergio Alejandro Hernández Patiño' : 'Sergio Alejandro Hernández Patiño — Professional CV',
    mainEntity:{
      '@type':'Person', '@id':`${origin}/#person`, name:'Sergio Alejandro Hernández Patiño', alternateName:'Sergio Hernández',
      jobTitle:page.querySelector('.role').textContent.trim(),
      description:language === 'es' ? description : englishDescription,
      image:portraitURL, url:urls[language],
      sameAs:['https://www.linkedin.com/in/sergio-alejandro-hernandez-patino/','https://github.com/alejandrosergio'],
      homeLocation:{'@type':'Place',name:'Cali, Colombia'}, knowsLanguage:['es','en'],
      knowsAbout:offeredTechnologies(page)
    }
  };
}

function valueOf(node, entry) {
  return entry.attribute ? node.getAttribute(entry.attribute) : ('html' in entry ? node.innerHTML : node.textContent);
}
const translations = english.map(entry => {
  const nodes = [...document.querySelectorAll(entry.selector)];
  if (!nodes.length) throw new Error(`No existe el destino de traducción: ${entry.selector}`);
  const es = valueOf(nodes[0],entry);
  if (nodes.some(node => valueOf(node,entry) !== es)) throw new Error(`Hay textos en español distintos bajo el selector ${entry.selector}`);
  return {selector:entry.selector, ...(entry.attribute ? {attribute:entry.attribute} : {}), format:'html' in entry ? 'html' : 'text', es, en:entry.html ?? entry.text};
});
const {document:englishProfile} = parseHTML(document.toString());
applyTranslations(englishProfile,'en');
const schemas = {es:JSON.stringify(profileSchema(document,'es')),en:JSON.stringify(profileSchema(englishProfile,'en'))};
document.head.append(element('script',{id:'profile-schema',type:'application/ld+json'},schemas.es));
translations.push({selector:'#profile-schema',format:'text',...schemas});
const recruiterMarkup = {es:createRecruiterMarkup(document,recruiterCopy.es,urls.es),en:createRecruiterMarkup(englishProfile,recruiterCopy.en,urls.en)};
const recruiterPrint = element('section',{id:'recruiter-print',class:'recruiter-resume'});
recruiterPrint.innerHTML = recruiterMarkup.es;
document.body.insertBefore(recruiterPrint,document.getElementById('print-chooser'));
translations.push({selector:'#recruiter-print',format:'html',...recruiterMarkup});
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
// Retirar las descargas generadas por la versión anterior del proyecto.
for (const variant of ['Web','Reclutador']) for (const language of ['ES','EN']) {
  await unlink(path.join(dist,`descargas/CV_Sergio_Hernandez_${variant}_${language}.pdf`)).catch(error => {
    if (error.code !== 'ENOENT') throw error;
  });
}
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
  const action = target === 'en' ? 'Switch to English' : 'Cambiar a Español';
  button.setAttribute('lang',target);
  button.setAttribute('title',action);
  button.setAttribute('aria-label',action);
  page.getElementById('language-label').textContent = target === 'en' ? 'English' : 'Español';
}

const assetTypes = new Map([
  ['favicon.svg','image/svg+xml'],['flags/us.svg','image/svg+xml'],['flags/es.svg','image/svg+xml'],
  ['images/sergio-hernandez.jpeg','image/jpeg'],['images/sh-logo.svg','image/svg+xml']
]);
const assetContents = new Map(await Promise.all([...assetTypes.keys()].map(async file => [file,await readFile(path.join(dist,file))])));
const embeddedAssets = new Map([...assetTypes].map(([file,mime]) => [file,`data:${mime};base64,${assetContents.get(file).toString('base64')}`]));
// El cambio de idioma solo alterna la visibilidad de banderas ya disponibles, también sin red.
for (const flag of document.querySelectorAll('.language-flags img')) flag.setAttribute('src',embeddedAssets.get(flag.getAttribute('src')));
const versionedResources = [
  ['link[rel="icon"]','href','favicon.svg',hash(assetContents.get('favicon.svg'))],
  ['.monogram img','src','images/sh-logo.svg',hash(assetContents.get('images/sh-logo.svg'))],
  ['link[rel="stylesheet"]','href','styles.css',hash(stylesheet)],
  ['script[src]','src','script.js',hash(javascript)],
  ['.portrait img','src',portraitPath,portraitVersion],
  ['.recruiter-photo','src',portraitPath,portraitVersion]
];
const spanishTemplate = document.toString();
for (const language of ['es','en']) {
  const {document:page} = parseHTML(spanishTemplate);
  applyTranslations(page,language);
  for (const [selector,attribute,file,version] of versionedResources) page.querySelector(selector).setAttribute(attribute,`${file}?v=${version}`);
  if (language === 'en') {
    updateResources(page,value => /^(?:styles\.css|script\.js|favicon\.svg|flags\/|images\/)/.test(value) ? `../${value}` : value);
  }
  await writeFile(path.join(dist,language === 'es' ? 'index.html' : 'en/index.html'),await minify(page.toString(),htmlOptions));
}

const alternateLinks = Object.entries(urls).map(([lang,url]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${url}"/>`).join('') + `<xhtml:link rel="alternate" hreflang="x-default" href="${urls.es}"/>`;
// No se publica lastmod sin una fecha verificable de actualización del contenido.
await writeFile(path.join(dist,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${Object.values(urls).map(url => `<url><loc>${url}</loc>${alternateLinks}</url>`).join('')}</urlset>`);
await writeFile(path.join(dist,'robots.txt'),`User-agent: *\nAllow: /\nDisallow: /descargas/\nSitemap: ${origin}/sitemap.xml\n`);

// Una sola copia autónoma, con el mismo comportamiento y todos los recursos incorporados.
const {document:download} = parseHTML(spanishTemplate);
download.querySelector('link[rel="stylesheet"]').replaceWith(element('style',{},stylesheet));
download.querySelector('script[src]').remove();
download.querySelector('meta[name="robots"]').content = 'noindex,nofollow';
updateResources(download,value => embeddedAssets.get(value) ?? value);
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
console.log(JSON.stringify({pages:['/','/en/'],printVariants:['web','recruiter'],javascriptBytes:Buffer.byteLength(javascript),cssBytes:Buffer.byteLength(stylesheet),zipFiles:Object.keys(files).length}));
