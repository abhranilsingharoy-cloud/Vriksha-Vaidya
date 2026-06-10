// ── FILE: js/accordion.js ─────────────────────────────
export class Accordion {
  constructor(containerEl) {
    this.containerEl = containerEl;
  }

  init() {
    const triggers = this.containerEl.querySelectorAll('[data-accordion-trigger]');
    triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => this.toggle(e.currentTarget));
    });
  }

  toggle(triggerEl) {
    const contentEl = triggerEl.nextElementSibling;
    const isExpanded = triggerEl.getAttribute('aria-expanded') === 'true';

    // Close all others
    const allTriggers = this.containerEl.querySelectorAll('[data-accordion-trigger]');
    allTriggers.forEach(t => {
      if (t !== triggerEl && t.getAttribute('aria-expanded') === 'true') {
        t.setAttribute('aria-expanded', 'false');
        const c = t.nextElementSibling;
        c.style.maxHeight = c.scrollHeight + 'px'; // Fix height before transitioning to 0
        requestAnimationFrame(() => {
          c.style.maxHeight = '0px';
        });
      }
    });

    if (isExpanded) {
      // Close current
      triggerEl.setAttribute('aria-expanded', 'false');
      contentEl.style.maxHeight = contentEl.scrollHeight + 'px';
      requestAnimationFrame(() => {
        contentEl.style.maxHeight = '0px';
      });
    } else {
      // Open current
      triggerEl.setAttribute('aria-expanded', 'true');
      contentEl.style.maxHeight = contentEl.scrollHeight + 'px';
      
      const handleTransitionEnd = () => {
        if (triggerEl.getAttribute('aria-expanded') === 'true') {
          contentEl.style.maxHeight = 'none';
        }
        contentEl.removeEventListener('transitionend', handleTransitionEnd);
      };
      contentEl.addEventListener('transitionend', handleTransitionEnd);
    }
  }
}
