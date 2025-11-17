document.addEventListener('DOMContentLoaded', function () {
// year footer
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');
navToggle.addEventListener('click', () => {
mainNav.style.display = (mainNav.style.display==='flex') ? 'none' : 'flex';
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
a.addEventListener('click', function(e){
const target = document.querySelector(this.getAttribute('href'));
if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'}); if(window.innerWidth<900) mainNav.style.display='none';}
});
});

// Form visual feedback
document.querySelectorAll('form').forEach(f => {
f.addEventListener('submit', e => {
e.preventDefault();
const btn = f.querySelector('button[type="submit"]');
btn.textContent='Envoyé (visuel)';
btn.disabled=true;
setTimeout(()=>{
btn.textContent='Envoyer (visuel)';
btn.disabled=false;
f.reset();
},1400);
});
});

// Leaflet map — 6 projets Afrique & Asie
try{
const map = L.map('map').setView([5.0,20.0],2);
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
});
