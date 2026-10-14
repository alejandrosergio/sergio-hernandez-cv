import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument } from 'pdfkit';

const clean = value => String(value ?? '').replace(/[\u2010-\u2015]/g,'-').replace(/\s+/g,' ').trim();
const escape = value => String(value).replace(/[&<>"']/g,character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
function text(node) {
  if (!node) return '';
  const copy = node.cloneNode(true);
  copy.querySelectorAll('svg,.sr-only').forEach(child => child.remove());
  copy.querySelectorAll('br').forEach(child => child.replaceWith(' '));
  copy.querySelectorAll('strong,span').forEach(child => child.after(' '));
  return clean(copy.textContent);
}
function modelOf(page) {
  const get = selector => text(page.querySelector(selector));
  return {
    name:get('#nombre'), role:get('.role'), eyebrow:get('.eyebrow'), value:get('.value-line'),
    focus:[...page.querySelectorAll('.focus-skill')].map(text).join(' · '),
    location:{text:get('.location'),url:page.querySelector('.location').href},
    photo:{src:page.querySelector('.portrait img').getAttribute('src'),alt:page.querySelector('.portrait img').alt},
    summaries:[...page.querySelectorAll('.profile-summary p')].map(text),
    experienceNote:`${get('.experience-number')} ${get('.experience-note p')}`,
    contacts:[...page.querySelectorAll('.contact-strip a')].map(node => ({text:text(node),url:node.href})),
    highlights:[...page.querySelectorAll('.recruiter-highlights li')].map(node => ({label:text(node.querySelector('.highlight-kicker')),title:text(node.querySelector('strong')),body:text(node.querySelector('p'))})),
    technologyTitle:get('#titulo-tecnologias'), sharedTitle:get('.shared-stack > h3'),
    specialties:[...page.querySelectorAll('.specialty')].map(node => ({label:text(node.querySelector('.overline')),title:text(node.querySelector('h3')),body:text(node.querySelector('.specialty-content > p')),skills:[...node.querySelectorAll('.tech-list li')].map(text).join(' · '),ecosystem:text(node.querySelector('.ecosystem'))})),
    shared:[...page.querySelectorAll('.shared-grid > div')].map(node => ({title:text(node.querySelector('dt')),body:text(node.querySelector('dd'))})),
    experienceTitle:get('#titulo-experiencia'),
    lifecycle:{label:get('.delivery-story .overline'),title:get('.delivery-story h3'),body:get('.delivery-story > p:last-child'),stages:[...page.querySelectorAll('.delivery-stages strong')].map(text)},
    jobs:[...page.querySelectorAll('.job')].map(node => ({company:text(node.querySelector('h3')),period:text(node.querySelector('.job-period > span')),country:text(node.querySelector('.job-country')),role:text(node.querySelector('.job-role')),bullets:[...node.querySelectorAll('.job-details li')].map(text)})),
    educationTitle:get('#titulo-formacion'),
    education:{period:get('.education .overline'),title:get('.education h3'),institution:get('.education > p:last-child')},
    languages:[...page.querySelectorAll('.language')].map(node => text(node)).join(' · ')
  };
}

export function createRecruiterMarkup(page,copy,webURL) {
  const model = modelOf(page);
  if(copy.jobBullets.length !== model.jobs.length) throw new Error('Update recruiter summaries to match the confirmed experience.');
  const link = item => `<a href="${escape(item.url)}">${escape(item.text)}</a>`;
  return `<header class="recruiter-header"><div><p class="overline">${escape(copy.experience)}</p><h1>${escape(model.name)}</h1><p class="recruiter-role">${escape(model.role)}</p><p class="recruiter-focus">${escape(model.focus)}</p></div><img class="recruiter-photo" src="${escape(model.photo.src)}" alt="${escape(model.photo.alt)}" width="853" height="1280"></header>
    <div class="recruiter-contact">${[model.location,...model.contacts].map(link).join('')}</div>
    <section class="recruiter-section"><h2>${escape(copy.profileTitle)}</h2><p>${escape(copy.summary)}</p><p>${escape(copy.lifecycle)}</p></section>
    <section class="recruiter-section"><h2>${escape(copy.skillsTitle)}</h2><div class="recruiter-skills">${copy.specialties.map(item => `<article class="recruiter-skill"><h3>${escape(item.title)}</h3><p>${escape(item.skills)}</p></article>`).join('')}</div><p class="recruiter-other-skills">${escape(copy.otherSkills)}</p></section>
    <section class="recruiter-section"><h2>${escape(copy.experienceTitle)}</h2><ol class="recruiter-jobs">${model.jobs.map((job,index) => `<li class="recruiter-job"><div class="recruiter-job-heading"><h3>${escape(job.company)}</h3><span class="recruiter-job-period">${escape(job.period)} · ${escape(job.country)}</span></div><p class="recruiter-job-role">${escape(job.role)}</p><ul>${copy.jobBullets[index].map(bullet => `<li>${escape(bullet)}</li>`).join('')}</ul></li>`).join('')}</ol></section>
    <section class="recruiter-section"><h2>${escape(copy.educationTitle)}</h2><div class="recruiter-education"><div><h3>${escape(model.education.title)}</h3><p>${escape(model.education.institution)} · ${escape(model.education.period)}</p></div><div><p>${escape(model.languages)}</p></div></div></section>
    <p class="pdf-web-link"><a href="${escape(webURL)}">${escape(copy.webLink)}</a></p>`;
}

async function renderPDF(model,copy,variant,language,photo,webURL,filename) {
  const doc = new PDFDocument({size:'A4',margin:36,bufferPages:true,info:{Title:`Sergio Hernández - ${variant === 'web' ? 'CV Web' : 'CV Reclutador'} (${language.toUpperCase()})`,Author:model.name,Subject:language === 'es' ? 'Currículum profesional' : 'Professional curriculum vitae',Keywords:'.NET, Power Platform, AI, software, ALM'}});
  const chunks = [];
  const finished = new Promise((resolve,reject) => {doc.on('data',chunk => chunks.push(chunk));doc.on('end',()=>resolve(Buffer.concat(chunks)));doc.on('error',reject);});
  const M = 36, W = doc.page.width - 2*M, H = doc.page.height, bottom = H - 72;
  const navy = '#102d52', blue = '#0067b8', ink = '#263747', muted = '#52657c', line = '#dce6f2';
  const bodySize = variant === 'recruiter' ? 9.6 : 9.5;
  let y = M;
  const measure = (value,width=W,size=bodySize,bold=false) => doc.font(bold?'Helvetica-Bold':'Helvetica').fontSize(size).heightOfString(clean(value),{width,lineGap:2});
  const write = (value,x,top,width=W,size=bodySize,color=ink,bold=false,options={}) => {
    const content = clean(value);
    const height = measure(content,width,size,bold);
    doc.font(bold?'Helvetica-Bold':'Helvetica').fontSize(size).fillColor(color).text(content,x,top,{width,lineGap:2,...options});
    return height;
  };
  const rule = (top,x=M,width=W) => doc.save().strokeColor(line).lineWidth(.6).moveTo(x,top).lineTo(x+width,top).stroke().restore();
  const newPage = () => {
    doc.addPage();y = M;
    y += write(model.name,M,y,W,13,navy,true)+3;
    y += write(model.role,M,y,W,9,muted)+7;
    rule(y);y += 13;
  };
  const ensure = height => {if(y+height > bottom)newPage();};
  const section = (title,following=30) => {ensure(24+following);y += 9;y += write(title,M,y,W,12,navy,true)+6;};
  const paragraph = (value,size=bodySize,color=ink,gap=5) => {const height=measure(value,W,size);ensure(height+gap);y += write(value,M,y,W,size,color)+gap;};
  const columns = (items,count=3,compact=false) => {
    const gap=10,width=(W-gap*(count-1))/count,padding=9;
    const heights=items.map(item => measure(item.title,width-2*padding,10.5,true)+measure(item.body,width-2*padding,compact?9:bodySize)+2*padding+6);
    const height=Math.max(...heights);ensure(height+8);
    items.forEach((item,index)=>{
      const x=M+index*(width+gap);
      doc.save().roundedRect(x,y,width,height,4).fillAndStroke('#f6f9fe',line).restore();
      doc.save().strokeColor(blue).lineWidth(2).moveTo(x+4,y).lineTo(x+width-4,y).stroke().restore();
      let top=y+padding;top+=write(item.title,x+padding,top,width-2*padding,10.5,blue,true)+6;
      write(item.body,x+padding,top,width-2*padding,compact?9:bodySize);
    });y+=height+8;
  };
  const drawJobs = jobs => {
    for(const job of jobs){
      const height=measure(job.company,W-145,11,true)+measure(job.role,W,9.2,true)+job.bullets.reduce((sum,bullet)=>sum+measure(bullet,W-13,bodySize)+3,0)+16;
      ensure(height);
      const headerHeight=write(job.company,M,y,W-145,11,navy,true);
      write(`${job.period} · ${job.country}`,M+W-145,y+1,145,8.5,muted,false,{align:'right'});
      y+=headerHeight+3;y+=write(job.role,M,y,W,9.2,ink,true)+3;
      for(const bullet of job.bullets){
        write('•',M+2,y,10,bodySize,blue);
        y+=write(bullet,M+13,y,W-13,bodySize)+3;
      }
      y+=6;
    }
  };

  doc.save().fillColor('#0078d4').rect(M,y,W,3).fill().restore();y+=14;
  y+=write(variant==='recruiter'?copy.experience:model.eyebrow,M,y,W-90,8.5,blue,true)+6;
  const imageTop=y;
  y+=write(model.name,M,y,W-90,24,navy,true)+7;
  y+=write(model.role,M,y,W-90,12,navy,true)+6;
  y+=write(model.focus,M,y,W-90,10,blue,true)+4;
  doc.save().roundedRect(M+W-68,imageTop,68,85,5).clip();
  doc.image(photo,M+W-68,imageTop,{cover:[68,85],align:'center',valign:'top'});doc.restore();
  y=Math.max(y,imageTop+85)+10;
  const contactItems=[model.location,...model.contacts];
  let contactX=M,contactY=y;
  for(const item of contactItems){
    doc.font('Helvetica').fontSize(8.5);
    const width=doc.widthOfString(clean(item.text))+13;
    if(contactX+width > M+W){contactX=M;contactY+=14;}
    write(item.text,contactX,contactY,width-13,8.5,muted,false,{link:item.url,underline:true,lineBreak:false});contactX+=width;
  }
  y=contactY+20;rule(y);y+=5;

  if(variant==='recruiter'){
    section(copy.profileTitle);paragraph(copy.summary);paragraph(copy.lifecycle,9.2,muted,2);
    section(copy.skillsTitle,80);
    columns(copy.specialties.map(item=>({title:item.title,body:item.skills})),3,true);
    paragraph(copy.otherSkills,8.8,muted,1);
    section(copy.experienceTitle,60);
    drawJobs(model.jobs.map((job,index)=>({...job,bullets:copy.jobBullets[index]})));
  }else{
    paragraph(model.experienceNote,9,blue,5);
    paragraph(model.value,13,navy,8);
    model.summaries.forEach(value=>paragraph(value));
    columns(model.highlights.map(item=>({title:`${item.label}: ${item.title}`,body:item.body})),3,true);
    const specialtyWidth=(W-20)/3,innerWidth=specialtyWidth-18;
    const specialtyHeight=Math.max(...model.specialties.map(item=>measure(item.label,innerWidth,7.5)+measure(item.title,innerWidth,10.5,true)+measure(item.body,innerWidth,9.2)+measure(item.skills,innerWidth,8.7,true)+(item.ecosystem?measure(item.ecosystem,innerWidth,8.4):0)+37));
    section(model.technologyTitle,specialtyHeight);
    ensure(specialtyHeight+8);
    model.specialties.forEach((item,index)=>{
      const x=M+index*(specialtyWidth+10);
      doc.save().roundedRect(x,y,specialtyWidth,specialtyHeight,4).fillAndStroke('#f6f9fe',line).restore();
      doc.save().strokeColor(blue).lineWidth(2).moveTo(x+4,y).lineTo(x+specialtyWidth-4,y).stroke().restore();
      let top=y+9;top+=write(item.label,x+9,top,innerWidth,7.5,muted)+3;
      top+=write(item.title,x+9,top,innerWidth,10.5,blue,true)+5;
      top+=write(item.body,x+9,top,innerWidth,9.2)+5;
      top+=write(item.skills,x+9,top,innerWidth,8.7,navy,true)+4;
      if(item.ecosystem)write(item.ecosystem,x+9,top,innerWidth,8.4,muted);
    });
    y+=specialtyHeight+8;
    section(model.sharedTitle,80);
    for(let index=0;index<model.shared.length;index+=2)columns(model.shared.slice(index,index+2).map(item=>({title:item.title,body:item.body})),2,true);
    section(model.experienceTitle,85);
    paragraph(`${model.lifecycle.label}: ${model.lifecycle.title}`,11,navy,5);
    paragraph(model.lifecycle.body);
    paragraph(model.lifecycle.stages.join(' · '),8.7,muted,8);
    drawJobs(model.jobs);
  }
  const educationWidth=W*.67,languageX=M+educationWidth+16;
  const educationBlockHeight=Math.max(measure(model.education.title,educationWidth,10,true)+4+measure(`${model.education.institution} · ${model.education.period}`,educationWidth,9),measure(model.languages,W-educationWidth-16,9.3,true));
  section(variant==='recruiter'?copy.educationTitle:model.educationTitle,educationBlockHeight);
  const leftHeight=write(model.education.title,M,y,educationWidth,10,navy,true)+4;
  const educationHeight=write(`${model.education.institution} · ${model.education.period}`,M,y+leftHeight,educationWidth,9,muted);
  const languageHeight=write(model.languages,languageX,y,W-educationWidth-16,9.3,ink,true);
  y+=Math.max(leftHeight+educationHeight,languageHeight);

  const range=doc.bufferedPageRange();
  for(let index=range.start;index<range.start+range.count;index++){
    doc.switchToPage(index);rule(H-55);
    write(copy.webLink,M,H-44,W-40,8.7,blue,true,{link:webURL,underline:true,lineBreak:false,height:18});
    write(webURL,M,H-30,W-40,7.5,muted,false,{link:webURL,lineBreak:false,height:16});
    write(`${index+1}/${range.count}`,M+W-35,H-43,35,8,muted,false,{align:'right',lineBreak:false,height:18});
  }
  doc.end();
  const bytes=await finished;
  await writeFile(filename,bytes);
  if(variant==='recruiter' && range.count!==1)throw new Error(`Recruiter CV must be one readable page (${language}: ${range.count} pages).`);
  return {file:path.basename(filename),pages:range.count,bytes:bytes.length};
}

export async function generatePdfs({pages,copy,photo,outputDirectory,urls}) {
  const results=[];
  for(const language of ['es','en']){
    const model=modelOf(pages[language]);
    for(const variant of ['web','recruiter']){
      const filename=`CV_Sergio_Hernandez_${variant==='web'?'Web':'Reclutador'}_${language.toUpperCase()}.pdf`;
      results.push(await renderPDF(model,copy[language],variant,language,photo,urls[language],path.join(outputDirectory,filename)));
    }
  }
  return results;
}
