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

// Las tecnologías y los datos de trayectoria tienen una única fuente: el CV completo.
export function createRecruiterMarkup(page,copy,webURL) {
  const get = selector => text(page.querySelector(selector));
  const photo = page.querySelector('.portrait img');
  const location = page.querySelector('.location');
  const contacts = [location,...page.querySelectorAll('.contact-strip a')];
  const specialties = [...page.querySelectorAll('.specialty')].map(node => ({
    title:text(node.querySelector('h3')),
    skills:[...node.querySelectorAll('.tech-list li')].map(text).join(' · '),
    ecosystem:text(node.querySelector('.ecosystem'))
  }));
  const shared = [...page.querySelectorAll('.shared-grid > div')].map(node => ({
    title:text(node.querySelector('dt')),body:text(node.querySelector('dd'))
  }));
  const jobs = [...page.querySelectorAll('.job')].map(node => ({
    company:text(node.querySelector('h3')),
    period:text(node.querySelector('.job-period > span')),
    country:text(node.querySelector('.job-country')),
    role:text(node.querySelector('.job-role'))
  }));
  if(copy.jobBullets.length !== jobs.length) throw new Error('Update recruiter summaries to match the confirmed experience.');
  if(specialties.length !== 3) throw new Error('The print summary must preserve the three specialties.');
  const link = node => `<a href="${escape(node.getAttribute('href'))}">${escape(text(node))}</a>`;
  return `<header class="recruiter-header"><div><p class="overline">${escape(copy.experience)}</p><h1>${escape(get('#nombre'))}</h1><p class="recruiter-role">${escape(get('.role'))}</p><p class="recruiter-focus">${[...page.querySelectorAll('.focus-skill')].map(node => escape(text(node))).join(' · ')}</p></div><img class="recruiter-photo" src="${escape(photo.getAttribute('src'))}" alt="${escape(photo.alt)}" width="853" height="1280"></header>
    <div class="recruiter-contact">${contacts.map(link).join('')}</div>
    <section class="recruiter-section"><h2>${escape(copy.profileTitle)}</h2><p>${escape(copy.summary)}</p></section>
    <section class="recruiter-section"><h2>${escape(copy.skillsTitle)}</h2><div class="recruiter-skills">${specialties.map(item => `<article class="recruiter-skill"><h3>${escape(item.title)}</h3><p>${escape(item.skills)}</p>${item.ecosystem ? `<p>${escape(item.ecosystem)}</p>` : ''}</article>`).join('')}</div><p class="recruiter-other-skills">${shared.map(item => `<strong>${escape(item.title)}:</strong> ${escape(item.body)}`).join(' ')}</p></section>
    <section class="recruiter-section"><h2>${escape(copy.experienceTitle)}</h2><ol class="recruiter-jobs">${jobs.map((job,index) => `<li class="recruiter-job"><div class="recruiter-job-heading"><h3>${escape(job.company)}</h3><span class="recruiter-job-period">${escape(job.period)} · ${escape(job.country)}</span></div><p class="recruiter-job-role">${escape(job.role)}</p><ul>${copy.jobBullets[index].map(bullet => `<li>${escape(bullet)}</li>`).join('')}</ul></li>`).join('')}</ol></section>
    <section class="recruiter-section"><h2>${escape(copy.educationTitle)}</h2><div class="recruiter-education"><div><h3>${escape(get('.education h3'))}</h3><p>${escape(get('.education > p:last-child'))} · ${escape(get('.education .overline'))}</p></div><div><p>${[...page.querySelectorAll('.language')].map(node => escape(text(node))).join(' · ')}</p></div></div></section>
    <p class="print-web-link"><a href="${escape(webURL)}">${escape(copy.webLink)}</a></p>`;
}
