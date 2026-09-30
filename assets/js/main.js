(function(){
'use strict';

// Onmiddellijk alles zichtbaar op mobiel (zie .mobile-reveal in style.css)
if(window.innerWidth <= 960 || ('ontouchstart' in window)){
  document.documentElement.classList.add('mobile-reveal');
}

// Nav scroll
const nav=document.getElementById('nav');
const onScroll=()=>nav.classList.toggle('scrolled',window.scrollY>20);
window.addEventListener('scroll',onScroll,{passive:true});onScroll();

// Burger
const burger=document.getElementById('burger');
const navLinks=document.getElementById('navLinks');
burger.addEventListener('click',()=>{
  burger.classList.toggle('active');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  burger.classList.remove('active');navLinks.classList.remove('open');
}));

// Active nav item: on click and while scrolling through sections
const spyLinks=Array.from(navLinks.querySelectorAll('a[href^="#"]:not(.nav-cta)'));
const spyItems=spyLinks
  .map(a=>({link:a,section:document.querySelector(a.getAttribute('href'))}))
  .filter(it=>it.section);
let spyLockUntil=0;
function setActiveNav(link){
  spyLinks.forEach(a=>{
    const on=a===link;
    a.classList.toggle('active',on);
    if(on)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');
  });
}
function updateActiveNav(){
  if(Date.now()<spyLockUntil)return;
  const line=nav.offsetHeight+window.innerHeight*0.3;
  let current=null;
  spyItems.forEach(it=>{
    if(it.section.getBoundingClientRect().top<=line)current=it.link;
  });
  // At the very bottom of the page, the last section is active
  if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-2&&spyItems.length){
    current=spyItems[spyItems.length-1].link;
  }
  setActiveNav(current);
}
spyItems.forEach(it=>it.link.addEventListener('click',()=>{
  setActiveNav(it.link);
  // Keep the clicked item active while the smooth scroll passes other sections
  spyLockUntil=Date.now()+1000;
  setTimeout(updateActiveNav,1050);
}));
// Other links to a section (CTA, buttons, footer) highlight their nav item too
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  if(spyLinks.includes(a))return;
  const it=spyItems.find(x=>x.link.getAttribute('href')===a.getAttribute('href'));
  if(!it)return;
  a.addEventListener('click',()=>{
    setActiveNav(it.link);spyLockUntil=Date.now()+1000;setTimeout(updateActiveNav,1050);
  });
});
let spyTick=false;
window.addEventListener('scroll',()=>{
  if(spyTick)return;spyTick=true;
  requestAnimationFrame(()=>{spyTick=false;updateActiveNav();});
},{passive:true});
window.addEventListener('resize',updateActiveNav);
window.addEventListener('load',updateActiveNav);
updateActiveNav();

// Subtle reveal on scroll
const io=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
},{threshold:0,rootMargin:'0px 0px 0px 0px'});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// Fallback: force reveal elements that are already visible on load
function checkVisible(){
  document.querySelectorAll('.reveal:not(.in)').forEach(el=>{
    const r=el.getBoundingClientRect();
    if(r.top < window.innerHeight && r.bottom > 0){
      el.classList.add('in');
    }
  });
}
checkVisible();
setTimeout(checkVisible,300);
// Hard fallback: show everything after 800ms in case observer fails (iOS Safari)
setTimeout(()=>{
  document.querySelectorAll('.reveal:not(.in)').forEach(el=>el.classList.add('in'));
},800);

// Service rows: pre-fill contact form "Dienst" select
document.querySelectorAll('.service-row[data-service]').forEach(row=>{
  row.addEventListener('click',()=>{
    const svc=row.dataset.service;
    const sel=document.querySelector('.contact-form select');
    if(sel){
      Array.from(sel.options).forEach(opt=>{
        if(opt.value===svc||opt.textContent.trim()===svc)sel.value=opt.value||opt.textContent.trim();
      });
    }
  });
});

// Hero line-by-line reveal
const heroLines=document.querySelectorAll('#heroTitle .reveal-text');
heroLines.forEach(el=>el.classList.add('js'));
const startHero=()=>{
  heroLines.forEach((el,i)=>setTimeout(()=>el.classList.add('in'),100+i*110));
};
if(document.readyState==='complete'||document.readyState==='interactive'){
  requestAnimationFrame(startHero);
}else{
  window.addEventListener('DOMContentLoaded',startHero);
}
// Extra fallback for hero on slow mobile
setTimeout(startHero,500);

// Custom cursor (desktop, fine pointer)
const dot=document.getElementById('cursorDot');
const ring=document.getElementById('cursorRing');
const fine=window.matchMedia('(pointer:fine)').matches;
if(fine && dot && ring){
  let mx=window.innerWidth/2,my=window.innerHeight/2,rx=mx,ry=my;
  document.addEventListener('mousemove',e=>{
    mx=e.clientX;my=e.clientY;
    dot.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;
  });
  function loop(){
    rx+=(mx-rx)*.18;ry+=(my-ry)*.18;
    ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  }
  loop();
  document.querySelectorAll('a,button,.work-item,.service-row').forEach(el=>{
    el.addEventListener('mouseenter',()=>{dot.classList.add('hover');ring.classList.add('hover')});
    el.addEventListener('mouseleave',()=>{dot.classList.remove('hover');ring.classList.remove('hover')});
  });
  document.addEventListener('mouseleave',()=>{dot.style.opacity='0';ring.style.opacity='0'});
  document.addEventListener('mouseenter',()=>{dot.style.opacity='1';ring.style.opacity='1'});
}else if(dot && ring){
  dot.style.display='none';ring.style.display='none';
}

const contactForm = document.getElementById('contact-form');
if(contactForm){
  contactForm.addEventListener('submit', async function(e){
    e.preventDefault();
    const btn = this.querySelector('button[type="submit"]');
    const result = document.getElementById('form-result');
    btn.disabled = true;
    btn.textContent = 'Bezig…';
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(this)
      });
      const data = await res.json();
      if(data.success){
        result.className = 'form-result is-visible is-success';
        result.textContent = 'Bericht verstuurd! We nemen zo snel mogelijk contact met je op.';
        this.reset();
        btn.textContent = 'Verstuurd ✓';
      } else {
        throw new Error(data.message || 'Fout');
      }
    } catch(err){
      result.style.display = 'block';
      result.style.color = '#e53935';
      result.textContent = 'Er liep iets mis. Probeer opnieuw of mail ons rechtstreeks op vonckxperformance@gmail.com.';
      btn.disabled = false;
      btn.innerHTML = 'Verstuur <span class="arr"></span>';
    }
  });
}

})();
