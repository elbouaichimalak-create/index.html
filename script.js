document.addEventListener('DOMContentLoaded', function () {
  // Year footer
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Theme (dark mode) with persistence
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;
  const storedTheme = localStorage.getItem('eduvoyage_theme');
  if(storedTheme) root.setAttribute('data-theme', storedTheme);
  updateThemeButton();

  if(themeToggle){
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      if(next === 'dark') root.setAttribute('data-theme', 'dark');
      else root.removeAttribute('data-theme');
      localStorage.setItem('eduvoyage_theme', next === 'dark' ? 'dark' : 'light');
      updateThemeButton();
    });
  }
  function updateThemeButton(){
    const isDark = root.getAttribute('data-theme') === 'dark';
    if(themeToggle){
      themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      themeToggle.textContent = isDark ? '☀️' : '🌙';
      themeToggle.title = isDark ? 'Revenir au mode clair' : 'Passer en mode sombre';
    }
  }

  // Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  if(navToggle && mainNav){
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.style.display === 'flex';
      mainNav.style.display = isOpen ? 'none' : 'flex';
      navToggle.setAttribute('aria-expanded', String(!isOpen));
    });
  }

  // Smooth scroll (internal anchors)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e){
      const target = document.querySelector(this.getAttribute('href'));
      if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth',block:'start'}); if(window.innerWidth<900 && mainNav) mainNav.style.display='none'; }
    });
  });

  // Form visual feedback (existing)
  document.querySelectorAll('form').forEach(f => {
    f.addEventListener('submit', e => {
      e.preventDefault();
      const btn = f.querySelector('button[type="submit"]');
      if(!btn) return;
      btn.textContent='Envoyé (visuel)';
      btn.disabled=true;
      setTimeout(()=>{
        btn.textContent='Envoyer (visuel)';
        btn.disabled=false;
        f.reset();
      },1400);
    });
  });

  // Intersection Observer for reveal animations + trigger counters
  const reveals = document.querySelectorAll('.reveal');
  const options = {threshold: 0.12};
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        // if it's a counter container, start counters
        if(entry.target.querySelectorAll){
          const counts = entry.target.querySelectorAll('.count[data-target]');
          counts.forEach(startCounter);
        }
        obs.unobserve(entry.target);
      }
    });
  }, options);
  reveals.forEach(r => observer.observe(r));

  // Counter function
  function startCounter(el){
    if(el.dataset.started) return;
    el.dataset.started = "true";
    const target = +el.getAttribute('data-target');
    const duration = 1400;
    const frame = 20;
    const totalFrames = Math.round(duration / frame);
    let frameCount = 0;
    const easeOutQuad = t => t*(2-t);
    const counter = setInterval(() => {
      frameCount++;
      const progress = easeOutQuad(frameCount / totalFrames);
      const val = Math.round(target * progress);
      el.textContent = val;
      if(frameCount === totalFrames){
        clearInterval(counter);
        el.textContent = target;
      }
    }, frame);
  }

  // Back to top button
  const backBtn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    if(window.scrollY > 400) backBtn.classList.add('show'); else backBtn.classList.remove('show');
  });
  backBtn.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

  // Lightbox gallery
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbClose = document.getElementById('lightbox-close');
  const lbCaption = document.getElementById('lightbox-caption');

  galleryItems.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const src = btn.getAttribute('data-src');
      const alt = btn.querySelector('img')?.alt || '';
      lbImg.src = src;
      lbImg.alt = alt;
      lbCaption.textContent = alt;
      lightbox.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    });
  });
  function closeLightbox(){
    lightbox.setAttribute('aria-hidden','true');
    lbImg.src = '';
    document.body.style.overflow = '';
  }
  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if(e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape' && lightbox.getAttribute('aria-hidden') === 'false') closeLightbox(); });

  // Initialize Leaflet map — 6 projets Afrique & Asie
  try{
    const map = L.map('map', {zoomControl:true}).setView([5.0,20.0],2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap contributors'}).addTo(map);

    const projects = [
      {name:'Projet Soleil — Mali', coords:[12.6392,-8.0029], info:'En cours — 150 enfants', link:'https://example.com/donate?project=mali'},
      {name:'École Avenir — Madagascar', coords:[-18.8792,47.5079], info:'Terminé — 80 enfants', link:'https://example.com/donate?project=madagascar'},
      {name:'Classe Espoir — Burkina Faso', coords:[12.3714,-1.5197], info:'Prévu — 100 enfants', link:'https://example.com/donate?project=burkina'},
      {name:'Cartable Solidaire — Sénégal', coords:[14.4974,-14.4524], info:'En cours — 200 enfants', link:'https://example.com/donate?project=senegal'},
      {name:'Apprendre Ensemble — Népal', coords:[28.3949,84.1240], info:'En cours — 90 enfants', link:'https://example.com/donate?project=nepal'},
      {name:'Éveil & Savoir — Bangladesh', coords:[23.6850,90.3563], info:'Terminé — 140 enfants', link:'https://example.com/donate?project=bangladesh'}
    ];

    projects.forEach(p => {
      const marker = L.circleMarker(p.coords,{radius:8,fillColor:'#ff6f91',color:'#ff6f91',weight:1,fillOpacity:0.9}).addTo(map);
      marker.bindPopup(`<strong>${p.name}</strong><br>${p.info}<br><a href="${p.link}" target="_blank">Faire un don</a>`);
    });
  }catch(err){console.warn('Impossible d\'initialiser la carte Leaflet :',err);}

  // Accessibility: allow keyboard to open gallery items (Enter)
  galleryItems.forEach(btn=>{
    btn.setAttribute('tabindex','0');
    btn.addEventListener('keydown', e => { if(e.key === 'Enter') btn.click(); });
  });

  // Make sure clickable widgets have focus styles (simple)
  document.querySelectorAll('button,a,input,textarea').forEach(el=>{
    el.addEventListener('focus', () => el.classList.add('focused'));
    el.addEventListener('blur', () => el.classList.remove('focused'));
  });

});
