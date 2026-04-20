// ── MOON PHASE ──
function getMoonPhase() {
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const lunarCycle = 29.530588853;
  const now = new Date();
  const elapsed = (now - knownNewMoon) / (1000 * 60 * 60 * 24);
  const phase = ((elapsed % lunarCycle) + lunarCycle) % lunarCycle;
  const illumination = Math.round((1 - Math.cos((phase / lunarCycle) * 2 * Math.PI)) / 2 * 100);

  let emoji, name;
  if (phase < 1.85)       { emoji = '🌑'; name = 'New Moon'; }
  else if (phase < 7.38)  { emoji = '🌒'; name = 'Waxing Crescent'; }
  else if (phase < 9.22)  { emoji = '🌓'; name = 'First Quarter'; }
  else if (phase < 14.77) { emoji = '🌔'; name = 'Waxing Gibbous'; }
  else if (phase < 16.61) { emoji = '🌕'; name = 'Full Moon'; }
  else if (phase < 22.15) { emoji = '🌖'; name = 'Waning Gibbous'; }
  else if (phase < 23.99) { emoji = '🌗'; name = 'Last Quarter'; }
  else if (phase < 29.53) { emoji = '🌘'; name = 'Waning Crescent'; }
  else                    { emoji = '🌑'; name = 'New Moon'; }

  return { emoji, name, illumination, phase };
}

function renderMoon() {
  const tracker = document.getElementById('moon-tracker');
  if (!tracker) return;
  const { emoji, name, illumination } = getMoonPhase();
  tracker.querySelector('.moon-emoji').textContent = emoji;
  tracker.querySelector('.moon-phase-name').textContent = name;
  tracker.querySelector('.moon-illumination').textContent = `${illumination}% lit`;
}

renderMoon();

// ── TREE OF LIFE + WATER CANVAS ──
const canvas = document.getElementById('hero-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let branches = [];
  let droplets = [];
  let particles = [];
  let time = 0;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    buildTree();
  };

  // Build the tree branch data
  function buildTree() {
    branches = [];
    const cx = canvas.width / 2;
    const cy = canvas.height;
    const baseLen = canvas.height * 0.26;
    growBranch(cx, cy * 0.82, -Math.PI / 2, baseLen, 9, 8);
    growRoot(cx, cy * 0.82, Math.PI / 2, baseLen * 0.55, 7, 5);
  }

  function growBranch(x, y, angle, len, width, depth) {
    if (depth === 0 || len < 4) return;
    const ex = x + Math.cos(angle) * len;
    const ey = y + Math.sin(angle) * len;
    branches.push({ x1: x, y1: y, x2: ex, y2: ey, w: width, depth, isRoot: false });
    const spread = 0.38 + (8 - depth) * 0.04;
    growBranch(ex, ey, angle - spread, len * 0.67, width * 0.64, depth - 1);
    growBranch(ex, ey, angle + spread, len * 0.67, width * 0.64, depth - 1);
    if (depth > 4 && Math.random() > 0.45) {
      growBranch(ex, ey, angle + (Math.random() - 0.5) * 0.2, len * 0.5, width * 0.5, depth - 2);
    }
  }

  function growRoot(x, y, angle, len, width, depth) {
    if (depth === 0 || len < 4) return;
    const ex = x + Math.cos(angle) * len;
    const ey = Math.min(y + Math.sin(angle) * len, canvas.height - 5);
    branches.push({ x1: x, y1: y, x2: ex, y2: ey, w: width, depth, isRoot: true });
    const spread = 0.5 + (5 - depth) * 0.05;
    growRoot(ex, ey, angle - spread, len * 0.65, width * 0.65, depth - 1);
    growRoot(ex, ey, angle + spread, len * 0.65, width * 0.65, depth - 1);
  }

  // Spawn a droplet on a random branch endpoint
  function spawnDroplet() {
    const tips = branches.filter(b => b.depth <= 3 && !b.isRoot);
    if (!tips.length) return;
    const b = tips[Math.floor(Math.random() * tips.length)];
    droplets.push({
      x: b.x2, y: b.y2,
      vy: 0.4 + Math.random() * 0.6,
      vx: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2.2 + 1,
      opacity: 0.6 + Math.random() * 0.4,
      trail: [],
      isJade: Math.random() > 0.6,
    });
  }

  // Ambient rising particles
  function spawnParticle() {
    particles.push({
      x: Math.random() * canvas.width,
      y: canvas.height + 5,
      size: Math.random() * 1.8 + 0.4,
      vy: Math.random() * 0.35 + 0.1,
      vx: (Math.random() - 0.5) * 0.15,
      phase: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.4 + 0.08,
      isJade: Math.random() > 0.6,
    });
  }

  let dropletTimer = 0;
  let particleTimer = 0;

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    time += 0.012;

    // Subtle radial glow behind tree
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.5;
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, canvas.height * 0.55);
    grd.addColorStop(0, 'rgba(14, 85, 112, 0.09)');
    grd.addColorStop(0.5, 'rgba(0, 200, 150, 0.03)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw branches
    branches.forEach(b => {
      const pulse = Math.sin(time * 0.8 + b.depth * 0.5) * 0.3 + 0.7;
      const alpha = b.isRoot
        ? 0.12 + (b.depth / 5) * 0.1
        : 0.08 + (b.depth / 8) * 0.18;

      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.lineTo(b.x2, b.y2);
      ctx.lineWidth = Math.max(0.5, b.w * 0.9);
      ctx.lineCap = 'round';

      if (b.isRoot) {
        ctx.strokeStyle = `rgba(26, 127, 168, ${alpha * pulse})`;
        ctx.shadowBlur = b.w * 1.5;
        ctx.shadowColor = 'rgba(26, 127, 168, 0.3)';
      } else {
        const isJadeBranch = b.depth <= 3;
        ctx.strokeStyle = isJadeBranch
          ? `rgba(0, 200, 150, ${alpha * pulse})`
          : `rgba(77, 184, 212, ${alpha * pulse})`;
        ctx.shadowBlur = b.w * 2;
        ctx.shadowColor = isJadeBranch ? 'rgba(0, 200, 150, 0.2)' : 'rgba(77, 184, 212, 0.2)';
      }

      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Spawn droplets
    dropletTimer++;
    if (dropletTimer > 28) { spawnDroplet(); dropletTimer = 0; }

    // Update & draw droplets
    droplets = droplets.filter(d => d.opacity > 0.02);
    droplets.forEach(d => {
      d.trail.push({ x: d.x, y: d.y });
      if (d.trail.length > 8) d.trail.shift();

      d.vy += 0.06;
      d.y += d.vy;
      d.x += d.vx;
      d.opacity -= 0.006;

      if (d.y > canvas.height) { d.opacity = 0; return; }

      // Trail
      d.trail.forEach((pt, i) => {
        const a = (i / d.trail.length) * d.opacity * 0.4;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, d.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = d.isJade ? `rgba(0,200,150,${a})` : `rgba(77,184,212,${a})`;
        ctx.fill();
      });

      // Droplet head
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fillStyle = d.isJade
        ? `rgba(0,200,150,${d.opacity})`
        : `rgba(77,184,212,${d.opacity})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = d.isJade ? '#00c896' : '#4db8d4';
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Spawn & draw ambient particles
    particleTimer++;
    if (particleTimer > 12) { spawnParticle(); particleTimer = 0; }

    particles = particles.filter(p => p.y > -10);
    particles.forEach(p => {
      p.phase += 0.012;
      p.x += Math.sin(p.phase) * 0.4 + p.vx;
      p.y -= p.vy;
      const fadeEdge = p.y / canvas.height;
      const alpha = p.opacity * Math.min(1, fadeEdge * 5) * Math.min(1, (1 - fadeEdge) * 3);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.isJade ? `rgba(0,200,150,${alpha})` : `rgba(77,184,212,${alpha})`;
      ctx.shadowBlur = 4;
      ctx.shadowColor = p.isJade ? '#00c896' : '#4db8d4';
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    requestAnimationFrame(animate);
  }

  resize();
  animate();
  window.addEventListener('resize', resize);
}

// ── NAV AUTO-HIDE / HOVER REVEAL ──
const nav = document.querySelector('nav');
const navTrigger = document.querySelector('.nav-trigger');
let navTimeout;

function showNav() {
  clearTimeout(navTimeout);
  nav?.classList.add('nav-visible');
}

function hideNav() {
  navTimeout = setTimeout(() => {
    nav?.classList.remove('nav-visible');
  }, 600);
}

navTrigger?.addEventListener('mouseenter', showNav);
nav?.addEventListener('mouseenter', showNav);
nav?.addEventListener('mouseleave', hideNav);
navTrigger?.addEventListener('mouseleave', hideNav);

// Also show on scroll to top
window.addEventListener('scroll', () => {
  if (window.scrollY < 10) showNav();
});

// Mobile toggle
document.querySelector('.nav-toggle')?.addEventListener('click', () => {
  document.querySelector('.nav-links')?.classList.toggle('open');
  showNav();
});

// Active link
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  if (link.getAttribute('href') === currentPage) link.classList.add('active');
});

// ── SCROLL REVEAL ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── NEWSLETTER FORM ──
document.querySelectorAll('.newsletter-form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const btn = form.querySelector('button');
    if (!input?.value) return;
    btn.textContent = 'Joined ✓';
    btn.style.background = '#009e78';
    input.value = '';
    input.placeholder = 'Welcome to the current.';
    input.disabled = true;
    btn.disabled = true;
  });
});

// ── CONTACT FORM ──
const contactForm = document.getElementById('contact-form');
contactForm?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = contactForm.querySelector('button[type="submit"]');
  btn.textContent = 'Sent ✓';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Send Message';
    btn.disabled = false;
    contactForm.reset();
  }, 3000);
});
