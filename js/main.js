// ── PARTICLE SYSTEM (FFX pyrefly meets ocean depth) ──
const canvas = document.getElementById('hero-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrame;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x = Math.random() * canvas.width;
      this.y = initial ? Math.random() * canvas.height : canvas.height + 10;
      this.size = Math.random() * 2.5 + 0.5;
      this.speedY = Math.random() * 0.4 + 0.15;
      this.speedX = (Math.random() - 0.5) * 0.2;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.maxOpacity = this.opacity;
      this.phase = Math.random() * Math.PI * 2;
      this.waveAmp = Math.random() * 0.8 + 0.2;
      this.waveFreq = Math.random() * 0.015 + 0.008;
      this.isJade = Math.random() > 0.65;
      this.color = this.isJade ? '#00c896' : '#4db8d4';
      this.life = 0;
      this.maxLife = (canvas.height + 20) / this.speedY;
    }

    update() {
      this.life++;
      this.phase += this.waveFreq;
      this.x += Math.sin(this.phase) * this.waveAmp + this.speedX;
      this.y -= this.speedY;

      const progress = this.life / this.maxLife;
      if (progress < 0.1) {
        this.opacity = (progress / 0.1) * this.maxOpacity;
      } else if (progress > 0.7) {
        this.opacity = ((1 - progress) / 0.3) * this.maxOpacity;
      } else {
        this.opacity = this.maxOpacity;
      }

      if (this.y < -10) this.reset();
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = this.size * 6;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const init = () => {
    resize();
    const count = Math.floor((canvas.width * canvas.height) / 12000);
    particles = Array.from({ length: count }, () => new Particle());
  };

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Deep water gradient overlay
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.7
    );
    gradient.addColorStop(0, 'rgba(14, 85, 112, 0.08)');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => { p.update(); p.draw(); });
    animFrame = requestAnimationFrame(animate);
  };

  init();
  animate();
  window.addEventListener('resize', () => { init(); });
}

// ── NAVIGATION ──
const nav = document.querySelector('nav');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav?.classList.add('scrolled');
  } else {
    nav?.classList.remove('scrolled');
  }
});

navToggle?.addEventListener('click', () => {
  navLinks?.classList.toggle('open');
});

navLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── ACTIVE NAV LINK ──
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ── SCROLL REVEAL ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── NEWSLETTER FORM ──
const newsletterForms = document.querySelectorAll('.newsletter-form');
newsletterForms.forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const btn = form.querySelector('button');
    if (!input?.value) return;

    btn.textContent = 'Joined';
    btn.style.background = '#009e78';
    input.value = '';
    input.placeholder = 'Welcome to the current.';
    input.disabled = true;
    btn.disabled = true;
  });
});

// ── CONTACT FORM ──
const contactForm = document.getElementById('contact-form');
contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = contactForm.querySelector('button[type="submit"]');
  btn.textContent = 'Message Sent';
  btn.style.background = 'var(--ocean)';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Send Message';
    btn.style.background = '';
    btn.disabled = false;
    contactForm.reset();
  }, 3000);
});
