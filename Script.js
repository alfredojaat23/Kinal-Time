/* ============================================================
   KINAL — VIAJE EN EL TIEMPO
   script.js
   ============================================================ */

// ============================================================
// 1. NAVBAR MÓVIL
// ============================================================
const navToggle = document.getElementById('navToggle');
const navLinks  = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Cerrar menú al hacer clic en un link
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});


// ============================================================
// 2. CONTADOR ANIMADO DE ESTADÍSTICAS
// ============================================================
function animateCounter(el, target, duration = 1800) {
  let start = 0;
  const step = Math.ceil(target / (duration / 16));
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = start.toLocaleString();
    if (start >= target) clearInterval(timer);
  }, 16);
}

// Disparar cuando la stats-bar entra en viewport
const statsBar = document.querySelector('.stats-bar');
let countersStarted = false;

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !countersStarted) {
      countersStarted = true;
      document.querySelectorAll('.stat-num').forEach(el => {
        const target = parseInt(el.dataset.target, 10);
        animateCounter(el, target);
      });
    }
  });
}, { threshold: 0.3 });

if (statsBar) statsObserver.observe(statsBar);


// ============================================================
// 3. ANIMACIONES AL HACER SCROLL (fade-in)
// ============================================================
const fadeEls = document.querySelectorAll(
  '.era-card, .forum-post, .gallery-item, .rating-dashboard, .comp-grid, .forum-new-post'
);

fadeEls.forEach(el => el.classList.add('fade-in'));

const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach(el => fadeObserver.observe(el));


// ============================================================
// 4. FILTRO DE GALERÍA
// ============================================================
const galleryFilters = document.querySelectorAll('.gallery-filter');
const galleryItems   = document.querySelectorAll('.gallery-item');

galleryFilters.forEach(btn => {
  btn.addEventListener('click', () => {
    galleryFilters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    galleryItems.forEach(item => {
      if (filter === 'all' || item.dataset.era === filter) {
        item.classList.remove('filtered-out');
      } else {
        item.classList.add('filtered-out');
      }
    });
  });
});


// ============================================================
// 5. SISTEMA DE ESTRELLAS (formulario del foro)
// ============================================================
const starBtns   = document.querySelectorAll('.star-btn');
const postRating = document.getElementById('postRating');

starBtns.forEach(btn => {
  btn.addEventListener('mouseover', () => {
    const val = parseInt(btn.dataset.val);
    starBtns.forEach(s => {
      s.classList.toggle('active', parseInt(s.dataset.val) <= val);
    });
  });

  btn.addEventListener('click', () => {
    const val = btn.dataset.val;
    postRating.value = val;
    starBtns.forEach(s => {
      s.classList.toggle('active', parseInt(s.dataset.val) <= parseInt(val));
    });
  });
});

document.getElementById('starInput').addEventListener('mouseleave', () => {
  const selected = parseInt(postRating.value);
  starBtns.forEach(s => {
    s.classList.toggle('active', parseInt(s.dataset.val) <= selected);
  });
});


// ============================================================
// 6. PUBLICAR COMENTARIO EN EL FORO
// ============================================================
const submitPost = document.getElementById('submitPost');

submitPost.addEventListener('click', () => {
  const name   = document.getElementById('postName').value.trim();
  const role   = document.getElementById('postRole').value;
  const era    = document.getElementById('postEra').value;
  const text   = document.getElementById('postText').value.trim();
  const rating = parseInt(document.getElementById('postRating').value);

  // Validaciones
  if (!name) { showToast('⚠️ Escribí tu nombre'); return; }
  if (!role) { showToast('⚠️ Seleccioná tu rol'); return; }
  if (!text) { showToast('⚠️ Escribí tu experiencia'); return; }
  if (rating === 0) { showToast('⚠️ Seleccioná una calificación'); return; }

  // Crear el post
  const post = buildPost({ name, role, era, text, rating });

  const container = document.getElementById('forumPosts');
  container.insertBefore(post, container.firstChild);

  // Animar entrada
  setTimeout(() => post.classList.add('visible'), 10);

  // Limpiar formulario
  document.getElementById('postName').value   = '';
  document.getElementById('postRole').value   = '';
  document.getElementById('postEra').value    = '';
  document.getElementById('postText').value   = '';
  document.getElementById('postRating').value = '0';
  starBtns.forEach(s => s.classList.remove('active'));

  // Actualizar calificación general
  updateOverallRating(rating);

  showToast('✅ ¡Tu experiencia fue publicada!');

  // Scroll suave al nuevo post
  setTimeout(() => post.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
});


// Construir elemento HTML de un post nuevo
function buildPost({ name, role, era, text, rating }) {
  const roleConfig = {
    'ex-alumno': { label: 'Ex-alumno/a',      badge: 'badge-ex',  avClass: 'av-purple' },
    'estudiante': { label: 'Estudiante',       badge: 'badge-est', avClass: 'av-teal'   },
    'familiar':  { label: 'Familiar',          badge: 'badge-fam', avClass: 'av-amber'  },
    'docente':   { label: 'Docente',           badge: 'badge-doc', avClass: 'av-coral'  },
    'visitante': { label: 'Visitante',         badge: 'badge-vis', avClass: 'av-coral'  },
  };

  const eraLabel = {
    '80s':    'Era: 80s–90s',
    '2000s':  'Era: 2000s–2010s',
    'actual': 'Era: Actual',
    'sin-era': '',
  };

  const cfg = roleConfig[role] || { label: role, badge: 'badge-vis', avClass: 'av-coral' };
  const initials = name.split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('');
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  const eraText = eraLabel[era] || '';

  const div = document.createElement('div');
  div.className = 'forum-post fade-in';
  div.dataset.role = role;

  div.innerHTML = `
    <div class="post-avatar ${cfg.avClass}">${initials}</div>
    <div class="post-body">
      <div class="post-meta">
        <span class="post-name">${escapeHtml(name)}</span>
        <span class="post-badge ${cfg.badge}">${cfg.label}</span>
        ${eraText ? `<span class="post-era">${eraText}</span>` : ''}
        <span class="post-time">Ahora mismo</span>
      </div>
      <p class="post-text">${escapeHtml(text)}</p>
      <div class="post-stars">${stars}</div>
    </div>
  `;

  return div;
}


// ============================================================
// 7. FILTRO DEL FORO
// ============================================================
const forumFilters = document.querySelectorAll('.forum-filter');
const forumEmpty   = document.getElementById('forumEmpty');

forumFilters.forEach(btn => {
  btn.addEventListener('click', () => {
    forumFilters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    const posts  = document.querySelectorAll('.forum-post');
    let visible  = 0;

    posts.forEach(post => {
      const show = filter === 'all' || post.dataset.role === filter;
      post.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    forumEmpty.classList.toggle('hidden', visible > 0);
  });
});


// ============================================================
// 8. CALIFICACIÓN GENERAL (actualizar con nuevos votos)
// ============================================================
let totalRatings = 146;
let totalSum     = Math.round(4.7 * 146); // suma inicial simulada

function updateOverallRating(newRating) {
  totalRatings++;
  totalSum += newRating;
  const avg = (totalSum / totalRatings).toFixed(1);

  document.getElementById('ratingScore').textContent = avg;
  document.getElementById('ratingTotal').textContent = `Basado en ${totalRatings} calificaciones`;

  // Actualizar estrellas display
  const fullStars = Math.round(parseFloat(avg));
  document.getElementById('ratingStarsDisplay').textContent =
    '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
}


// ============================================================
// 9. COMPARADOR DE ÉPOCAS
// ============================================================
const eraData = {
  pasado: {
    label:  'Los inicios (80s–90s)',
    icon:   '🏫',
    imgText: 'Imagen de los inicios',
    detalles: [
      ['Tecnología',    'Pizarras y primeras PCs'],
      ['Laboratorios',  '1 laboratorio básico'],
      ['Carreras',      '2–3 especialidades'],
      ['Conectividad',  'Sin internet'],
    ]
  },
  crecimiento: {
    label:  'Crecimiento (2000s–2010s)',
    icon:   '💻',
    imgText: 'Imagen de la expansión',
    detalles: [
      ['Tecnología',    'PCs, internet y redes'],
      ['Laboratorios',  'Múltiples laboratorios'],
      ['Carreras',      '8–10 especialidades'],
      ['Conectividad',  'Internet por cable'],
    ]
  },
  actual: {
    label:  'Actualidad (2020s)',
    icon:   '🚀',
    imgText: 'Imagen actual',
    detalles: [
      ['Tecnología',    'IA, cloud, desarrollo web'],
      ['Laboratorios',  'Labs de última generación'],
      ['Carreras',      '15+ especialidades'],
      ['Conectividad',  'Fibra óptica y WiFi'],
    ]
  }
};

function renderPanel(panelId, eraKey) {
  const panel = document.getElementById(panelId);
  const data  = eraData[eraKey];
  if (!panel || !data) return;

  panel.querySelector('.comp-era-label').textContent = data.label;

  const imgBox = panel.querySelector('.comp-image-box');
  imgBox.innerHTML = `
    <div class="placeholder-inner">
      <span class="placeholder-icon" style="font-size:40px; color: rgba(255,255,255,0.4)">${data.icon}</span>
      <span class="placeholder-text" style="font-size:13px; color: rgba(255,255,255,0.4)">${data.imgText}</span>
    </div>
  `;

  const details = panel.querySelector('.comp-details');
  details.innerHTML = data.detalles.map(([key, val]) => `
    <div class="comp-detail-row">
      <span>${key}</span>
      <span>${val}</span>
    </div>
  `).join('');
}

document.getElementById('eraA').addEventListener('change', function () {
  renderPanel('panelA', this.value);
});

document.getElementById('eraB').addEventListener('change', function () {
  renderPanel('panelB', this.value);
});

// Render inicial
renderPanel('panelA', document.getElementById('eraA').value);
renderPanel('panelB', document.getElementById('eraB').value);


// ============================================================
// 10. TOAST NOTIFICATION
// ============================================================
let toastTimer = null;

function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.remove('hidden');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
}


// ============================================================
// 11. UTILIDADES
// ============================================================
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}