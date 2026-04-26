// ── STARFIELD & CONSTELLATIONS ──
(function () {
  const canvas = document.getElementById('star-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [], time = 0, lastFrame = 0;
  let bgCanvas, bgCtx;
  let isMobile = false;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CONSTELLATIONS = [
    {
      name: 'URSA MAJOR',
      pts: [[0.08,0.12],[0.14,0.09],[0.20,0.08],[0.26,0.11],[0.30,0.18],[0.37,0.23],[0.42,0.20]],
      lines: [[0,1],[1,2],[2,3],[3,0],[3,4],[4,5],[5,6]]
    },
    {
      name: 'ORION',
      pts: [[0.60,0.08],[0.68,0.06],[0.60,0.16],[0.64,0.16],[0.68,0.16],[0.58,0.26],[0.70,0.24],[0.64,0.10]],
      lines: [[0,2],[1,4],[2,3],[3,4],[2,5],[4,6],[0,7],[1,7],[7,2]]
    },
    {
      name: 'CASSIOPEIA',
      pts: [[0.76,0.06],[0.80,0.03],[0.85,0.07],[0.89,0.03],[0.93,0.07]],
      lines: [[0,1],[1,2],[2,3],[3,4]]
    },
    {
      name: 'AQUARIUS',
      pts: [[0.50,0.52],[0.54,0.47],[0.58,0.50],[0.62,0.46],[0.57,0.57],[0.52,0.63],[0.62,0.61],[0.55,0.54]],
      lines: [[0,1],[1,2],[2,3],[0,7],[7,4],[4,5],[4,6]]
    },
    {
      name: 'LEO',
      pts: [[0.18,0.52],[0.22,0.47],[0.27,0.45],[0.29,0.50],[0.27,0.56],[0.21,0.58],[0.34,0.48]],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[3,6]]
    },
    {
      name: 'SCORPIUS',
      pts: [[0.80,0.52],[0.78,0.47],[0.76,0.44],[0.74,0.49],[0.72,0.55],[0.70,0.61],[0.68,0.67],[0.70,0.72],[0.74,0.70]],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]]
    },
    {
      name: 'SOUTHERN CROSS',
      pts: [[0.35,0.75],[0.35,0.85],[0.30,0.80],[0.40,0.80]],
      lines: [[0,1],[2,3]]
    }
  ];

  // Pre-render the static nebula background once per resize
  function buildBg() {
    bgCanvas = document.createElement('canvas');
    bgCanvas.width = canvas.width;
    bgCanvas.height = canvas.height;
    bgCtx = bgCanvas.getContext('2d');
    bgCtx.fillStyle = '#04060e';
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    const neb = bgCtx.createRadialGradient(
      bgCanvas.width * 0.5, bgCanvas.height * 0.3, 0,
      bgCanvas.width * 0.5, bgCanvas.height * 0.3, bgCanvas.width * 0.6
    );
    neb.addColorStop(0, 'rgba(10,20,40,0.6)');
    neb.addColorStop(0.4, 'rgba(6,14,28,0.3)');
    neb.addColorStop(1, 'transparent');
    bgCtx.fillStyle = neb;
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    isMobile = canvas.width < 768;
    buildBg();
    buildStars();
  }

  function buildStars() {
    stars = [];
    const maxCount = isMobile ? 180 : 600;
    const density = isMobile ? 7000 : 3000;
    const count = Math.min(maxCount, Math.floor(canvas.width * canvas.height / density));
    for (let i = 0; i < count; i++) {
      const roll = Math.random();
      stars.push({
        x: Math.random(), y: Math.random(),
        size: roll < 0.04 ? 1.6 : roll < 0.18 ? 1.0 : 0.5,
        base: Math.random() * 0.45 + 0.1,
        speed: Math.random() * 0.008 + 0.002,
        offset: Math.random() * Math.PI * 2,
        warm: Math.random() < 0.08
      });
    }
  }

  function drawStars() {
    const w = canvas.width, h = canvas.height;
    stars.forEach(s => {
      const alpha = s.base + Math.sin(time * s.speed * 60 + s.offset) * 0.25;
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.size, 0, Math.PI * 2);
      ctx.fillStyle = s.warm
        ? `rgba(255,215,160,${Math.max(0.05, alpha)})`
        : `rgba(220,232,255,${Math.max(0.05, alpha)})`;
      ctx.fill();
    });
  }

  // Simplified: removed per-frame createRadialGradient (major perf win)
  function drawConstellations() {
    const w = canvas.width, h = canvas.height;
    const pulse = Math.sin(time * 0.25) * 0.1 + 0.9;

    CONSTELLATIONS.forEach(c => {
      const pts = c.pts.map(([x, y]) => [x * w, y * h]);

      ctx.save();
      ctx.strokeStyle = `rgba(77,184,212,${0.18 * pulse})`;
      ctx.lineWidth = 0.6;
      ctx.setLineDash([4, 8]);
      c.lines.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(pts[a][0], pts[a][1]);
        ctx.lineTo(pts[b][0], pts[b][1]);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.restore();

      pts.forEach(([x, y], i) => {
        const twinkle = Math.sin(time * 1.2 + i * 1.7) * 0.2 + 0.8;
        // Soft glow — simple filled circle instead of createRadialGradient
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160,220,255,${0.1 * twinkle * pulse})`;
        ctx.fill();
        // Core dot
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210,240,255,${0.85 * twinkle * pulse})`;
        ctx.fill();
      });

      // Labels only on desktop
      const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
      const cy = Math.min(...pts.map(p => p[1])) - 14;
      ctx.fillStyle = `rgba(77,184,212,${0.22 * pulse})`;
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(c.name, cx, cy);
    });
  }

  function animate(ts) {
    requestAnimationFrame(animate);
    // Cap at ~30fps to reduce GPU/CPU load
    if (ts - lastFrame < 32) return;
    lastFrame = ts;

    ctx.drawImage(bgCanvas, 0, 0); // blit pre-rendered background
    time += 0.016;
    drawStars();
    if (!isMobile) drawConstellations();
  }

  resize();
  window.addEventListener('resize', resize);

  if (reducedMotion) {
    // Static frame only — respect user system preference
    ctx.drawImage(bgCanvas, 0, 0);
    drawStars();
  } else {
    requestAnimationFrame(animate);
  }
})();

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
  let lastHeroFrame = 0;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    buildTree();
  };

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

  function heroAnimate(ts) {
    requestAnimationFrame(heroAnimate);
    if (ts - lastHeroFrame < 32) return; // ~30fps cap
    lastHeroFrame = ts;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    time += 0.012;

    const cx = canvas.width / 2;
    const cy = canvas.height * 0.5;
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, canvas.height * 0.55);
    grd.addColorStop(0, 'rgba(14, 85, 112, 0.09)');
    grd.addColorStop(0.5, 'rgba(0, 200, 150, 0.03)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
      } else {
        const isJadeBranch = b.depth <= 3;
        ctx.strokeStyle = isJadeBranch
          ? `rgba(0, 200, 150, ${alpha * pulse})`
          : `rgba(77, 184, 212, ${alpha * pulse})`;
      }
      ctx.stroke();
    });

    dropletTimer++;
    if (dropletTimer > 28) { spawnDroplet(); dropletTimer = 0; }

    droplets = droplets.filter(d => d.opacity > 0.02);
    droplets.forEach(d => {
      d.trail.push({ x: d.x, y: d.y });
      if (d.trail.length > 8) d.trail.shift();

      d.vy += 0.06;
      d.y += d.vy;
      d.x += d.vx;
      d.opacity -= 0.006;

      if (d.y > canvas.height) { d.opacity = 0; return; }

      d.trail.forEach((pt, i) => {
        const a = (i / d.trail.length) * d.opacity * 0.4;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, d.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = d.isJade ? `rgba(0,200,150,${a})` : `rgba(77,184,212,${a})`;
        ctx.fill();
      });

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fillStyle = d.isJade
        ? `rgba(0,200,150,${d.opacity})`
        : `rgba(77,184,212,${d.opacity})`;
      ctx.fill();
    });

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
      ctx.fill();
    });
  }

  resize();
  requestAnimationFrame(heroAnimate);
  window.addEventListener('resize', resize);
}

// ── PAGE TREE: scale SVG to full document height ──
(function () {
  const svg = document.getElementById('page-tree-svg');
  const div = document.getElementById('page-tree');
  if (!svg || !div) return;

  function resize() {
    div.style.height = '0';
    const pageH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const pageW = window.innerWidth || 1;
    div.style.height = pageH + 'px';
    const svgH = Math.ceil((pageH / pageW) * 1200) + 100;
    svg.setAttribute('viewBox', '0 -30 1200 ' + svgH);
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('load', resize);
})();

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

window.addEventListener('scroll', () => {
  if (window.scrollY < 10) showNav();
});

document.querySelector('.nav-toggle')?.addEventListener('click', () => {
  document.querySelector('.nav-links')?.classList.toggle('open');
  showNav();
});

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
