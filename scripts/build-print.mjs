const clean = value => String(value ?? '').replace(/\s+/g,' ').trim();
const escape = value => String(value).replace(/[&<>"']/g,character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

function text(node) {
  if (!node) return '';
  const copy = node.cloneNode(true);
  copy.querySelectorAll('svg,.sr-only').forEach(child => child.remove());
  copy.querySelectorAll('br').forEach(child => child.replaceWith(' '));
  copy.querySelectorAll('strong,span').forEach(child => child.after(' '));
  return clean(copy.textContent);
}

function technologyCard(item) {
  return `<article class="recruiter-skill"><h3>${escape(item.title)}</h3><p>${escape(item.skills)}</p></article>`;
}

function labeledSkills(items) {
  return items.map(item => `<strong>${escape(item.title)}:</strong> ${escape(item.body)}`).join(' · ');
}

function experienceItem(job,bullets) {
  return `<li class="recruiter-job"><div class="recruiter-job-heading"><h3>${escape(job.company)}</h3><span class="recruiter-job-period">${escape(job.period)} · ${escape(job.country)}</span></div><p class="recruiter-job-role">${escape(job.role)}</p><ul>${bullets.map(bullet => `<li>${escape(bullet)}</li>`).join('')}</ul></li>`;
}

// El perfil, las tecnologías y los datos de trayectoria se reutilizan del CV completo.
export function createRecruiterMarkup(page,copy,webURL) {
  const get = selector => text(page.querySelector(selector));
  const profile = [...page.querySelectorAll('.profile-summary > p')]
    .map(paragraph => `<p>${paragraph.innerHTML}</p>`).join('');
  const photo = page.querySelector('.portrait img');
  const location = page.querySelector('.location');
  const contacts = [location,...page.querySelectorAll('.contact-strip a')];
  const specialties = [...page.querySelectorAll('.specialty')].map(node => ({
    title:text(node.querySelector('h3')),
    skills:[...node.querySelectorAll('.tech-list li')].map(text).join(' · '),
    ecosystems:[...node.querySelectorAll('.ecosystem')].map(ecosystem => ({
      title:text(ecosystem.querySelector('strong')),body:text(ecosystem.querySelector('span'))
    }))
  }));
  const shared = [...page.querySelectorAll('.shared-grid > div[data-print-technology]')].map(node => ({
    title:text(node.querySelector('dt')),body:text(node.querySelector('dd'))
  }));
  const jobs = [...page.querySelectorAll('.job')].map(node => ({
    company:text(node.querySelector('h3')),
    period:text(node.querySelector('.job-period > span')),
    country:text(node.querySelector('.job-country')),
    role:text(node.querySelector('.job-role'))
  }));
  if(copy.jobBullets.length !== jobs.length) throw new Error('Actualizar los resúmenes de impresión para que coincidan con la experiencia confirmada.');
  if(specialties.length !== 3) throw new Error('El CV resumido debe conservar las tres especialidades.');
  const ecosystems = specialties.flatMap(item => item.ecosystems).filter(item => item.body);
  const link = node => `<a href="${escape(node.getAttribute('href'))}">${escape(text(node))}</a>`;
  return `<header class="recruiter-header"><div><p class="overline">${escape(copy.experience)}</p><h1>${escape(get('#nombre'))}</h1><p class="recruiter-role">${escape(get('.role'))}</p><p class="recruiter-focus">${[...page.querySelectorAll('.focus-skill')].map(node => escape(text(node))).join(' · ')}</p></div><img class="recruiter-photo" src="${escape(photo.getAttribute('src'))}" alt="${escape(photo.alt)}" width="853" height="1280"></header>
    <div class="recruiter-contact">${contacts.map(link).join('')}</div>
    <section class="recruiter-section"><h2>${escape(copy.profileTitle)}</h2>${profile}</section>
    <section class="recruiter-section"><h2>${escape(copy.skillsTitle)}</h2><div class="recruiter-skills">${specialties.map(technologyCard).join('')}</div><p class="recruiter-ecosystems">${labeledSkills(ecosystems)}</p><p class="recruiter-other-skills">${labeledSkills(shared)}</p></section>
    <section class="recruiter-section"><h2>${escape(copy.experienceTitle)}</h2><ol class="recruiter-jobs">${jobs.map((job,index) => experienceItem(job,copy.jobBullets[index])).join('')}</ol></section>
    <section class="recruiter-section"><h2>${escape(copy.educationTitle)}</h2><div class="recruiter-education"><div><h3>${escape(get('.education h3'))}</h3><p>${escape(get('.education > p:last-child'))} · ${escape(get('.education .overline'))}</p></div><div><p>${[...page.querySelectorAll('.language')].map(node => escape(text(node))).join(' · ')}</p></div></div></section>
    <div class="print-references"><p class="print-web-link"><a href="${escape(webURL)}">${escape(copy.webLink)}</a></p>
    <p class="print-portfolio"><strong>${escape(get('.portfolio-name'))}</strong> · ${escape(get('#portfolio-link .portfolio-status'))}</p></div>`;
}
