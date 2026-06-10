// ── FILE: js/animations.js ─────────────────────────────
export class AnimationManager {
  initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    
    // Special observer for benchmark chart bars
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      const barObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this.animateBenchmarkBars();
          barObserver.disconnect();
        }
      }, { threshold: 0.5 });
      barObserver.observe(aboutSection);
    }
  }

  animateCounters() {
    const statValues = document.querySelectorAll('.stat-value');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const text = el.innerText;
          const isPercentage = text.includes('%');
          const targetValue = parseFloat(text);
          
          let startTimestamp = null;
          const duration = 1500;
          
          const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // easeOutExpo
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            
            const currentValue = easeProgress * targetValue;
            
            if (isPercentage) {
              el.innerText = currentValue.toFixed(1) + '%';
            } else {
              el.innerText = Math.round(currentValue);
            }
            
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              el.innerText = text; // ensure exact final value
            }
          };
          
          requestAnimationFrame(step);
          observer.unobserve(el);
        }
      });
    });

    statValues.forEach(el => observer.observe(el));
  }

  triggerConfetti(originEl) {
    if (!originEl) return;
    
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1000';
    
    originEl.style.position = 'relative';
    originEl.appendChild(canvas);
    
    canvas.width = originEl.clientWidth;
    canvas.height = originEl.clientHeight;
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    const colors = ['#39ff6e', '#f5a623', '#ffffff', '#2d7a3a'];
    
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 1) * 10 - 5,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }
    
    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let active = false;
      
      particles.forEach(p => {
        p.vy += 0.2; // gravity
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        
        if (p.y < canvas.height + 10) active = true;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
        ctx.restore();
      });
      
      if (active && frame < 150) { // 2.5s at 60fps
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    };
    
    animate();
  }

  triggerHealthyRipple(originEl) {
    if (!originEl) return;
    
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.top = '50%';
        ripple.style.left = '50%';
        ripple.style.width = '100px';
        ripple.style.height = '100px';
        ripple.style.marginLeft = '-50px';
        ripple.style.marginTop = '-50px';
        ripple.style.borderRadius = '50%';
        ripple.style.border = '2px solid var(--biolum)';
        ripple.style.pointerEvents = 'none';
        ripple.style.animation = 'healthy-ripple 1.2s ease-out forwards';
        
        originEl.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 1200);
      }, i * 400);
    }
  }

  animateBenchmarkBars() {
    const fills = document.querySelectorAll('.benchmark-chart .bar-fill');
    fills.forEach((fill, i) => {
      setTimeout(() => {
        fill.style.width = fill.getAttribute('data-value') + '%';
      }, i * 80);
    });
  }
}
