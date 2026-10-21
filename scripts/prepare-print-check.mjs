import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {parseHTML} from 'linkedom';

const root = fileURLToPath(new URL('../',import.meta.url));
const work = path.join(root,'tmp/pdfs');
await mkdir(work,{recursive:true});
await mkdir(path.join(root,'output/pdf'),{recursive:true});
const css = await readFile(path.join(root,'dist/styles.css'),'utf8');
const photo = 'data:image/jpeg;base64,'+(await readFile(path.join(root,'public/images/sergio-hernandez.jpeg'))).toString('base64');
const clean = value => value.replace(/\s+/g,' ').trim();
const cases = [];
for (const language of ['es','en']) {
  const source = await readFile(path.join(root,language === 'es' ? 'dist/index.html' : 'dist/en/index.html'),'utf8');
  for (const variant of ['web','recruiter']) {
    const {document} = parseHTML(source);
    document.documentElement.setAttribute('data-print-variant',variant);
    document.querySelectorAll('script').forEach(node => node.remove());
    const style = document.createElement('style');
    style.textContent = css;
    document.querySelector('link[rel="stylesheet"]').replaceWith(style);
    for (const image of document.querySelectorAll('img')) if(image.src.includes('sergio-hernandez.jpeg')) image.src = photo;
    const print = document.querySelector(variant === 'web' ? '#complete-print' : '#recruiter-print');
    const filename = `CV_Sergio_Hernandez_${variant === 'web' ? 'Completo' : 'Resumido'}_${language.toUpperCase()}.pdf`;
    const html = path.join(work,filename.replace('.pdf','.html'));
    // Es el DOM publicado con su CSS real de papel, sin otra maquetación para la prueba.
    await writeFile(html,document.toString());
    cases.push({
      filename,html,language,variant,pages:variant === 'web' ? 2 : 1,
      sections:[...print.querySelectorAll('[data-print-section] > h2')].map(n=>clean(n.textContent)),
      profile:[...print.querySelectorAll('[data-print-section="profile"] > p')].map(n=>clean(n.textContent)),
      jobs:[...print.querySelectorAll('.print-job')].map(n=>({
        company:clean(n.querySelector('h3').textContent),
        role:clean(n.querySelector('.print-job-role').textContent),
        period:clean(n.querySelector('.print-job-period').textContent),
        country:clean(n.querySelector('.print-job-country').textContent),
        duration:clean(n.querySelector('.print-job-duration').textContent),
        bullets:[...n.querySelectorAll('li')].map(b=>clean(b.textContent))
      })),
      skills:[...print.querySelectorAll('.print-skill')].map(n=>({
        title:clean(n.querySelector('h3').textContent),
        paragraphs:[...n.querySelectorAll('p')].map(p=>clean(p.textContent))
      })),
      degree:clean(print.querySelector('.print-education h3').textContent),
      links:[...print.querySelectorAll('a[href]')].map(n=>n.getAttribute('href'))
    });
  }
}
await writeFile(path.join(work,'expected.json'),JSON.stringify(cases,null,2)+'\n');
console.log(JSON.stringify({manifest:'tmp/pdfs/expected.json',cases:cases.map(c=>({pdf:c.filename,html:c.html}))}));
