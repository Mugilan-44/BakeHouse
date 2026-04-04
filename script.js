/* ============================================================
   VENBA BAKES — script.js
   Interactivity: scroll reveal, header, carousel, menu overlay, mobile nav
   ============================================================ */

'use strict';

/* ── DOM references ─────────────────────────────────────────── */
const header       = document.getElementById('site-header');
const hamburger    = document.getElementById('hamburger');
const mobileNav    = document.getElementById('mobile-nav');
const menuOverlay  = document.getElementById('menu-overlay');
const menuCatBar   = document.getElementById('menu-cat-bar');
const reviewsTrack = document.getElementById('reviews-track');
const reviewsDots  = document.getElementById('reviews-dots');
const reviewsPrev  = document.getElementById('reviews-prev');
const reviewsNext  = document.getElementById('reviews-next');
const scrollTopBtn = document.getElementById('scroll-top');
const contactForm  = document.getElementById('contact-form');

/* ══════════════════════════════════════════════════════════════
   1. STICKY HEADER — becomes opaque on scroll
   ═════════════════════════════════════════════════════════════= */
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  // Scroll-to-top button visibility
  if (window.scrollY > 400) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }
}, { passive: true });

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ══════════════════════════════════════════════════════════════
   2. MOBILE HAMBURGER MENU
   ═════════════════════════════════════════════════════════════= */
hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('active');
  hamburger.setAttribute('aria-expanded', isOpen);
  if (isOpen) {
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
  } else {
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// Close mobile nav when a link is clicked
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ══════════════════════════════════════════════════════════════
   3. SCROLL REVEAL
   Uses IntersectionObserver to stagger-animate elements
   ═════════════════════════════════════════════════════════════= */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.reveal').forEach(el => {
  revealObserver.observe(el);
});

/* ══════════════════════════════════════════════════════════════
   4. REVIEWS CAROUSEL
   ═════════════════════════════════════════════════════════════= */
let reviewIndex    = 0;
let reviewsPerView = getReviewsPerView();
const totalReviews = reviewsTrack ? reviewsTrack.children.length : 0;
let autoplayTimer;

function getReviewsPerView() {
  if (window.innerWidth <= 480)  return 1;
  if (window.innerWidth <= 768)  return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

function maxReviewIndex() {
  return Math.max(0, totalReviews - reviewsPerView);
}

function buildDots() {
  if (!reviewsDots) return;
  reviewsDots.innerHTML = '';
  const total = maxReviewIndex() + 1;
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === reviewIndex ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to review group ${i + 1}`);
    dot.addEventListener('click', () => goToReview(i));
    reviewsDots.appendChild(dot);
  }
}

function goToReview(idx) {
  reviewIndex = Math.max(0, Math.min(idx, maxReviewIndex()));
  const cardWidth = reviewsTrack.children[0]?.offsetWidth ?? 0;
  const gap = 24;
  reviewsTrack.style.transform = `translateX(-${reviewIndex * (cardWidth + gap)}px)`;

  // Update dots
  document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === reviewIndex);
  });
}

function nextReview() {
  goToReview(reviewIndex >= maxReviewIndex() ? 0 : reviewIndex + 1);
}

function prevReview() {
  goToReview(reviewIndex <= 0 ? maxReviewIndex() : reviewIndex - 1);
}

function startAutoplay() {
  stopAutoplay();
  autoplayTimer = setInterval(nextReview, 4500);
}

function stopAutoplay() {
  if (autoplayTimer) clearInterval(autoplayTimer);
}

if (reviewsTrack) {
  buildDots();
  startAutoplay();
  reviewsNext?.addEventListener('click', () => { nextReview(); startAutoplay(); });
  reviewsPrev?.addEventListener('click', () => { prevReview(); startAutoplay(); });

  // Touch swipe support
  let touchStartX = 0;
  reviewsTrack.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    stopAutoplay();
  }, { passive: true });
  reviewsTrack.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      dx < 0 ? nextReview() : prevReview();
    }
    startAutoplay();
  }, { passive: true });

  // Pause on hover
  reviewsTrack.addEventListener('mouseenter', stopAutoplay);
  reviewsTrack.addEventListener('mouseleave', startAutoplay);
}

// Recalculate on resize
window.addEventListener('resize', () => {
  const newPerView = getReviewsPerView();
  if (newPerView !== reviewsPerView) {
    reviewsPerView = newPerView;
    reviewIndex = 0;
    buildDots();
    goToReview(0);
  }
}, { passive: true });

/* ══════════════════════════════════════════════════════════════
   5. FULL MENU OVERLAY
   ═════════════════════════════════════════════════════════════= */
function openMenuOverlay(tabId) {
  menuOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  menuOverlay.focus();

  if (tabId) {
    switchMenuSection(tabId);
  } else {
    switchMenuSection('pastries');
  }

  // Scroll menu to top
  menuOverlay.scrollTop = 0;

  // Trap focus in overlay
  trapFocus(menuOverlay);
}

function closeMenuOverlay() {
  menuOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// Expose to inline onclick
window.openMenuOverlay  = openMenuOverlay;
window.closeMenuOverlay = closeMenuOverlay;

// Category tab switching
function switchMenuSection(sectionId) {
  // Update tabs
  document.querySelectorAll('.menu-cat-tab').forEach(tab => {
    const isActive = tab.dataset.section === sectionId;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive);
  });

  // Show/hide sections
  document.querySelectorAll('.menu-section').forEach(sec => {
    sec.classList.toggle('active', sec.id === `section-${sectionId}`);
  });

  // Scroll to content area smoothly within overlay
  const section = document.getElementById(`section-${sectionId}`);
  if (section) {
    setTimeout(() => {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }
}

// Hook category tabs
if (menuCatBar) {
  menuCatBar.addEventListener('click', (e) => {
    const tab = e.target.closest('.menu-cat-tab');
    if (tab && tab.dataset.section) {
      switchMenuSection(tab.dataset.section);
    }
  });
}

// Keyboard accessibility: close overlay on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuOverlay.classList.contains('active')) {
    closeMenuOverlay();
  }
});

/* ── Simple focus trap ─── */
function trapFocus(element) {
  const focusables = element.querySelectorAll(
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusables.length) return;
  const first = focusables[0];
  const last  = focusables[focusables.length - 1];

  element.addEventListener('keydown', function handler(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    // Remove when overlay closes
    if (!element.classList.contains('active')) {
      element.removeEventListener('keydown', handler);
    }
  });
  first.focus();
}

/* ══════════════════════════════════════════════════════════════
   6. CONTACT FORM → WhatsApp redirect
   ═════════════════════════════════════════════════════════════= */
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name      = document.getElementById('form-name').value.trim();
    const phone     = document.getElementById('form-phone').value.trim();
    const orderType = document.getElementById('form-order-type').value;
    const message   = document.getElementById('form-message').value.trim();

    if (!name) {
      alert('Please enter your name so we know who to contact!');
      document.getElementById('form-name').focus();
      return;
    }

    let waMsg = `Hi Venba Bakes! 🎂\n\n`;
    waMsg += `*Name:* ${name}\n`;
    if (phone)     waMsg += `*Phone:* ${phone}\n`;
    if (orderType) waMsg += `*Order Type:* ${orderType}\n`;
    if (message)   waMsg += `\n*Message:* ${message}`;

    const encoded = encodeURIComponent(waMsg);
    window.open(`https://wa.me/918072389875?text=${encoded}`, '_blank', 'noopener,noreferrer');
  });
}

/* ══════════════════════════════════════════════════════════════
   7. SMOOTH SCROLL for # links
   ═════════════════════════════════════════════════════════════= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80; // header height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ══════════════════════════════════════════════════════════════
   8. GALLERY LIGHTBOX (simple)
   ═════════════════════════════════════════════════════════════= */
(function buildLightbox() {
  const overlay = document.createElement('div');
  overlay.id = 'lightbox-overlay';
  overlay.style.cssText = `
    display:none; position:fixed; inset:0; z-index:1100;
    background:rgba(0,0,0,0.9); align-items:center;
    justify-content:center; cursor:zoom-out;
    backdrop-filter: blur(6px);
  `;
  const img = document.createElement('img');
  img.style.cssText = `max-width:90vw; max-height:90vh; border-radius:12px; object-fit:contain;`;
  overlay.appendChild(img);
  document.body.appendChild(overlay);

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.querySelector('img').src;
      img.src = src;
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  });

  overlay.addEventListener('click', () => {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.style.display === 'flex') {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }
  });
})();

/* ══════════════════════════════════════════════════════════════
   9. HERO CTA pulse animation trigger
   ═════════════════════════════════════════════════════════════= */
(function heroPulse() {
  const btn = document.getElementById('hero-cta-btn');
  if (!btn) return;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes hero-pulse {
      0%   { box-shadow: 0 0 0 0 rgba(200,169,81,0.6); }
      70%  { box-shadow: 0 0 0 16px rgba(200,169,81,0); }
      100% { box-shadow: 0 0 0 0 rgba(200,169,81,0); }
    }
    #hero-cta-btn { animation: hero-pulse 2.5s 1.5s ease-out 3; }
  `;
  document.head.appendChild(style);
})();

/* ══════════════════════════════════════════════════════════════
   10. MENU CARD keyboard support (Enter/Space to activate)
   ═════════════════════════════════════════════════════════════= */
document.querySelectorAll('.menu-cat-card').forEach(card => {
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});

/* ══════════════════════════════════════════════════════════════
   INIT
   ═════════════════════════════════════════════════════════════= */
// Make hero visible immediately (it's above the fold)
document.querySelectorAll('#hero .reveal').forEach(el => {
  el.classList.add('visible');
});
