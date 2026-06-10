// ── FILE: js/navigation.js ─────────────────────────────
export class Navigation {
  constructor(navEl) {
    this.navEl = navEl;
    this.hamburgerBtn = navEl.querySelector('.hamburger');
    this.navLinks = navEl.querySelectorAll('.nav-links a');
  }

  init() {
    // Scroll event for sticky glass effect
    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) {
        this.navEl.classList.add('scrolled');
      } else {
        this.navEl.classList.remove('scrolled');
      }
    }, { passive: true });

    // Smooth scroll for anchors
    document.querySelectorAll('[data-scroll-to]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          const offsetTop = targetEl.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'auto'
          });
          
          // Close mobile menu if open
          document.body.classList.remove('nav-open');
          if (this.hamburgerBtn) this.hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // Mobile Hamburger
    if (this.hamburgerBtn) {
      this.hamburgerBtn.addEventListener('click', () => {
        const isOpen = document.body.classList.contains('nav-open');
        if (isOpen) {
          document.body.classList.remove('nav-open');
          this.hamburgerBtn.setAttribute('aria-expanded', 'false');
        } else {
          document.body.classList.add('nav-open');
          this.hamburgerBtn.setAttribute('aria-expanded', 'true');
        }
      });
    }

    // Scroll spy for active links
    const sections = Array.from(document.querySelectorAll('section[id]'));
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.highlightActiveLink(entry.target.id);
        }
      });
    }, { rootMargin: '-20% 0px -80% 0px' });
    
    sections.forEach(sec => observer.observe(sec));
  }

  highlightActiveLink(sectionId) {
    this.navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${sectionId}`) {
        link.classList.add('active');
      }
    });
  }
}
