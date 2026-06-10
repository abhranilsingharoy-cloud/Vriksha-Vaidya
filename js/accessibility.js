// ── FILE: js/accessibility.js ─────────────────────────────
export function trapFocus(containerEl) {
  const focusableSelectors = 'a[href], button:not([disabled]), textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])';
  const focusableEls = containerEl.querySelectorAll(focusableSelectors);
  
  if (focusableEls.length === 0) return () => {};
  
  const firstFocusableEl = focusableEls[0];
  const lastFocusableEl = focusableEls[focusableEls.length - 1];

  firstFocusableEl.focus();

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusableEl) {
          e.preventDefault();
          lastFocusableEl.focus();
        }
      } else {
        if (document.activeElement === lastFocusableEl) {
          e.preventDefault();
          firstFocusableEl.focus();
        }
      }
    }
  };

  containerEl.addEventListener('keydown', handleKeyDown);

  return function release() {
    containerEl.removeEventListener('keydown', handleKeyDown);
  };
}

export function releaseFocus(triggerEl) {
  if (triggerEl) triggerEl.focus();
}

export function announceToScreenReader(message, urgency = 'polite') {
  let announcer = document.getElementById('sr-announcer');
  
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'sr-announcer';
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
  }
  
  announcer.setAttribute('aria-live', urgency);
  announcer.textContent = message;
  
  setTimeout(() => {
    if (announcer.textContent === message) {
      announcer.textContent = '';
    }
  }, 3000);
}

export function initSkipLink() {
  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const main = document.getElementById('main-content');
      if (main) {
        main.tabIndex = -1;
        main.focus();
        main.scrollIntoView();
      }
    });
  }
}
