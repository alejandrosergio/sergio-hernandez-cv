const clean = value => String(value ?? '').replace(/\s+/g,' ').trim();
const escape = value => String(value).replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function text(node) {
  if (!node) return '';
  const copy = node.cloneNode(true);
  copy.querySelectorAll('svg,.sr-only').forEach(n => n.remove());
  copy.querySelectorAll('br').forEach(n => n.replaceWith(' '));
  copy.querySelectorAll('strong,span').forEach(n => n.after(' '));
  return clean(copy.textContent);
}
function section(key,title,content) {
  return `<section class="print-section print-section--${key}" data-print-section="${key}"><h2>${escape(title)}</h2>${content}</section>`;
}
function experienceItem(job,bullets) {
  // El DOM sigue la lectura: empresa, cargo, periodo, país, duración y viñetas.
  return `<li class="print-job"><h3>${escape(job.company)}</h3><p class="print-job-role">${escape(job.role)}</p><p class="print-job-meta"><span class="print-job-period">${escape(job.period)}</span> | <span class="print-job-country">${escape(job.country)}</span> | <span class="print-job-duration">${escape(job.duration)}</span></p><ul>${bullets.map(b => `<li>${escape(b)}</li>`).join('')}</ul></li>`;
}
function fullSkills(page) {
  const specialties = [...page.querySelectorAll('.specialty')].map(node => {
    const description = text(node.querySelector('.specialty-content > p'));
    const skills = [...node.querySelectorAll('.tech-list li')].map(text).join(', ');
    const ecosystems = [...node.querySelectorAll('.ecosystem')].map(n => `<p><strong>${escape(text(n.querySelector('strong')))}:</strong> ${escape(text(n.querySelector('span')))}</p>`).join('');
    return `<article class="print-skill"><h3>${escape(text(node.querySelector('h3')))}</h3><p>${escape(description)}</p><p>${escape(skills)}.</p>${ecosystems}</article>`;
  }).join('');
  const shared = [...page.querySelectorAll('.shared-grid > div')].map(n => `<div><dt>${escape(text(n.querySelector('dt')))}</dt><dd>${escape(text(n.querySelector('dd')))}</dd></div>`).join('');
  return `${specialties}<article class="print-shared"><h3>${escape(text(page.querySelector('.shared-stack > h3')))}</h3><dl>${shared}</dl></article>`;
}
// Ambas impresiones reutilizan identidad, perfil, cargos, fechas y formación de la web.
// Solo la selección de competencias y las viñetas breves tienen una fuente resumida propia.
export function createPrintMarkup(page,copy,webURL,variant) {
  const get = selector => text(page.querySelector(selector));
  const complete = variant === 'web';
  const profile = [...page.querySelectorAll('.profile-summary > p')].map(p => `<p>${p.innerHTML}</p>`).join('');
  const photo = page.querySelector('.portrait img');
  const contacts = [page.querySelector('.location'),...page.querySelectorAll('.contact-strip a')];
  const link = n => `<a href="${escape(n.getAttribute('href'))}">${escape(text(n))}</a>`;
  const jobs = [...page.querySelectorAll('.job')].map(n => ({
    company:text(n.querySelector('h3')),role:text(n.querySelector('.job-role')),
    period:text(n.querySelector('.job-dates')),country:text(n.querySelector('.job-country')),
    duration:text(n.querySelector('.job-duration')),bullets:[...n.querySelectorAll('.job-details li')].map(text)
  }));
  if (copy.jobBullets.length !== jobs.length) throw new Error('Los resúmenes deben coincidir con las empresas confirmadas.');
  const skills = complete ? fullSkills(page) : copy.skillGroups.map(g => `<article class="print-skill"><h3>${escape(g.title)}</h3><p>${escape(g.body)}</p></article>`).join('');
  const education = `<article class="print-education"><h3>${escape(get('.education h3'))}</h3><p>${escape(get('.education > p:last-child'))} | ${escape(get('.education .overline'))}</p></article><p class="print-languages">${[...page.querySelectorAll('.language')].map(n => escape(text(n))).join(' | ')}</p>`;
  return `<header class="print-header${complete ? ' print-header--photo' : ''}"><div class="print-identity"><h1>${escape(get('#nombre'))}</h1><p class="print-role">${escape(get('.role'))}</p><p class="print-focus">${[...page.querySelectorAll('.focus-skill')].map(n => escape(text(n))).join(' · ')}</p><p class="print-experience">${escape(copy.experience)}</p></div>${complete ? `<img class="complete-photo" src="${escape(photo.getAttribute('src'))}" alt="${escape(photo.alt)}" width="${escape(photo.getAttribute('width'))}" height="${escape(photo.getAttribute('height'))}">` : ''}</header>
    <div class="print-contact">${contacts.map(link).join(' ')}</div>
    ${section('profile',copy.profileTitle,profile)}
    ${section('experience',copy.experienceTitle,`<ol class="print-jobs">${jobs.map((job,i) => experienceItem(job,complete ? job.bullets : copy.jobBullets[i])).join('')}</ol>`)}
    ${section('skills',copy.skillsTitle,skills)}
    ${section('education',copy.educationTitle,education)}
    <p class="print-web-link"><a href="${escape(webURL)}">${escape(copy.webLink)}</a></p>`;
}
