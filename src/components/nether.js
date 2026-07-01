// ── About Page JS ──────────────────────────────────
// Stripped-down script for the about page only.
// No intro/loading screen – page is visible immediately.

function startAboutPage() {
  const mainPage = document.getElementById('main-page');
  const topBar = document.getElementById('top-bar');
  const scrollIndicator = document.getElementById('scroll-indicator');

  // ── Instant Visibility (no loading delay) ─────────
  if (mainPage) mainPage.classList.add('visible');
  if (topBar) topBar.classList.add('visible');
  document.documentElement.classList.remove('scroll-locked');
  document.body.classList.remove('scroll-locked');

  // ── Reverse Nether Portal Transition ──────────────
  const transitionEl = document.getElementById('portal-transition');
  if (transitionEl && (localStorage.getItem('nether_transition_back') === 'true' || localStorage.getItem('nether_transition') === 'true')) {
    localStorage.removeItem('nether_transition_back');
    localStorage.removeItem('nether_transition');
    transitionEl.classList.add('active');
    transitionEl.style.transition = 'none';
    transitionEl.style.transform = 'scale(1)';
    transitionEl.style.opacity = '1';
    transitionEl.style.borderRadius = '0%';

    requestAnimationFrame(() => {
      setTimeout(() => {
        transitionEl.style.transition = 'transform 1.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.5s ease, border-radius 1.5s ease';
        transitionEl.style.transform = 'scale(0)';
        transitionEl.style.opacity = '0';
        transitionEl.style.borderRadius = '50%';
      }, 50);
    });
  }

  // ── Tap Sound ─────────────────────────────────────
  const tapAudioSrc = '../assets/audio/tap.mp3';
  const tapPool = [];
  const TAP_POOL_SIZE = 6;
  for (let i = 0; i < TAP_POOL_SIZE; i++) {
    const a = new Audio(tapAudioSrc);
    a.volume = 0.35;
    tapPool.push(a);
  }
  let tapIndex = 0;
  let hasSword = false;

  function playTap(volume) {
    const a = tapPool[tapIndex];
    tapIndex = (tapIndex + 1) % TAP_POOL_SIZE;
    a.volume = volume !== undefined ? volume : 0.35;
    a.currentTime = 0;
    a.play().catch(() => { });
  }

  // ── Image Cursor ──────────────────────────────────
  const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let cursorEl = null;
  let cursorX = window.innerWidth / 2, cursorY = window.innerHeight / 2;
  let targetX = window.innerWidth / 2, targetY = window.innerHeight / 2;
  let cursorVisible = false;
  let cursorRAF = null;

  if (isDesktop) {
    // Create cursor element
    cursorEl = document.createElement('div');
    cursorEl.className = 'image-cursor';
    cursorEl.innerHTML = '<img src="../assets/images/about/cursor.png" alt="" draggable="false">';
    document.body.appendChild(cursorEl);

    // Hide default cursor
    document.documentElement.style.cursor = 'none';
    const cursorStyle = document.createElement('style');
    cursorStyle.textContent = `
      *, *::before, *::after { cursor: none !important; }
      .image-cursor {
        position: fixed;
        left: 0; top: 0;
        width: 40px; height: 40px;
        pointer-events: none;
        z-index: 99999;
        transform: translate(var(--cursor-offset-x, -20px), var(--cursor-offset-y, -20px));
        will-change: transform, left, top;
        opacity: 0;
        transition: opacity 0.25s ease, width 0.3s cubic-bezier(0.22,1,0.36,1), height 0.3s cubic-bezier(0.22,1,0.36,1);
      }
      .image-cursor::before {
        content: '';
        position: absolute;
        inset: -30px;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: -1;
        transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease;
      }
      .image-cursor.visible { opacity: 1; }
      .image-cursor.hovering {
        width: 52px; height: 52px;
      }
      .image-cursor.hovering::before {
        transform: scale(1.3);
        background: radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 70%);
      }
      .image-cursor.clicking {
        width: 32px; height: 32px;
      }
      .image-cursor.clicking::before {
        transform: scale(0.85);
      }
      .image-cursor img {
        width: 100%; height: 100%;
        object-fit: contain;
        display: block;
        filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4));
        transition: transform 0.2s ease;
      }
      .image-cursor.hovering img {
        transform: rotate(-12deg) scale(1.1);
      }
      .image-cursor.clicking img {
        transform: scale(0.85);
      }
      .image-cursor.swinging img {
        transform: rotate(-35deg) scale(1.15) !important;
        transition: transform 0.05s ease-out !important;
      }
    `;
    document.head.appendChild(cursorStyle);

    // Visual cursor show/hide listeners
    window.addEventListener('mouseenter', () => {
      if (cursorEl) cursorEl.classList.add('visible');
    });

    window.addEventListener('mouseleave', () => {
      if (cursorEl) cursorEl.classList.remove('visible');
    });

    window.updateGlobalCursor = function (tier) {
      if (!cursorEl) return;
      const img = cursorEl.querySelector('img');
      if (img) {
        const paths = [
          '../assets/images/about/cursor.png',
          '../assets/images/minecraft/Wooden_Pickaxe_JE3_BE3.webp',
          '../assets/images/minecraft/Iron_Pickaxe_JE3_BE2.webp',
          '../assets/images/minecraft/Golden_Pickaxe_JE4_BE3.webp',
          '../assets/images/minecraft/Diamond_Pickaxe_JE3_BE3.webp',
          '../assets/images/minecraft/Enchanted_Netherite_Pickaxe.webp'
        ];
        let newSrc = paths[tier] || paths[0];
        if (hasSword) {
          newSrc = '../assets/images/minecraft/netherite_sword.png';
        }
        if (img.getAttribute('src') !== newSrc) {
          img.src = newSrc;
          img.onerror = () => {
            img.src = '../assets/images/about/cursor.png';
          };
        }

        if (tier === 0 && !hasSword) {
          cursorEl.style.setProperty('--cursor-offset-x', '-20px');
          cursorEl.style.setProperty('--cursor-offset-y', '-20px');
        } else {
          cursorEl.style.setProperty('--cursor-offset-x', '0px');
          cursorEl.style.setProperty('--cursor-offset-y', '-32px');
        }
      }
    };

    // Load tier from localStorage for cursor initialization
    let initialTier = 0;
    const savedStateForCursor = localStorage.getItem('mc_pocket_miner_state');
    if (savedStateForCursor) {
      try {
        const parsed = JSON.parse(savedStateForCursor);
        if (typeof parsed.tier === 'number') {
          initialTier = parsed.tier;
        }
        if (parsed.hasSword) {
          hasSword = true;
        }
      } catch (e) { }
    }
    window.currentMinecraftTier = initialTier;
    window.updateGlobalCursor(initialTier);

    // Hover on interactive elements
    window.addEventListener('mouseover', (e) => {
      const isBlock = e.target.closest('#mc-active-block');
      if (isBlock) {
        cursorEl.classList.add('mc-custom-cursor');
        cursorEl.classList.remove('hovering');
      } else {
        cursorEl.classList.remove('mc-custom-cursor');
        const hit = e.target.closest('a, button, input, textarea, .logo, [role="button"], .content-card, .doing-item, .tag, .sidequest-item, .plate-item, .post-link, .decor-image');
        cursorEl.classList.toggle('hovering', !!hit);
      }
    });

    // Click states
    window.addEventListener('mousedown', () => {
      cursorEl.classList.add('clicking');
      if (cursorEl.classList.contains('mc-custom-cursor')) {
        cursorEl.classList.add('swinging');
      }
    });
    window.addEventListener('mouseup', () => {
      cursorEl.classList.remove('clicking');
      cursorEl.classList.remove('swinging');
    });

    // Smooth follow loop
    function animateCursor() {
      cursorX += (targetX - cursorX) * 0.18;
      cursorY += (targetY - cursorY) * 0.18;
      cursorEl.style.transform = `translate(${cursorX - 20}px, ${cursorY - 20}px)`;
      cursorRAF = requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }

  // Track mouse and touch coordinates unconditionally (for Endermen AI)
  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!cursorVisible) {
      cursorVisible = true;
      if (cursorEl) {
        cursorEl.classList.add('visible');
        // Snap custom cursor to first position
        cursorX = targetX;
        cursorY = targetY;
        cursorEl.style.transform = `translate(${cursorX - 20}px, ${cursorY - 20}px)`;
      }
    }
  }, { passive: true });

  window.addEventListener('mouseenter', () => {
    cursorVisible = true;
    if (cursorEl) cursorEl.classList.add('visible');
  });

  window.addEventListener('mouseleave', () => {
    cursorVisible = false;
    if (cursorEl) cursorEl.classList.remove('visible');
  });

  window.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 0) {
      targetX = e.touches[0].clientX;
      targetY = e.touches[0].clientY;
      if (!cursorVisible) {
        cursorVisible = true;
        cursorX = targetX;
        cursorY = targetY;
      }
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches.length > 0) {
      targetX = e.touches[0].clientX;
      targetY = e.touches[0].clientY;
      cursorVisible = true;
    }
  }, { passive: true });

  // ── Ember Particles Canvas ──────────────────────────
  initEmbers();

  // ── Scroll Indicator Fade ─────────────────────────
  if (scrollIndicator) {
    window.addEventListener('scroll', () => {
      scrollIndicator.classList.toggle('fade-out', window.scrollY > 80);
    }, { passive: true });
  }

  // ── Logo Click to Top ─────────────────────────────
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', () => {
      playTap(0.4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Tap Sound on Interactive Elements ──────────────
  // Back button
  const backBtn = document.getElementById('contact-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => playTap(0.45));
  }

  // Tags
  document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', () => playTap(0.3));
  });

  // Content cards and sidequests
  document.querySelectorAll('.content-card, .sidequest-item').forEach(card => {
    card.addEventListener('click', () => playTap(0.25));
  });

  // Doing / plate items
  document.querySelectorAll('.doing-item, .plate-item').forEach(item => {
    item.addEventListener('click', () => playTap(0.25));
  });

  // Music collage items
  document.querySelectorAll('.collage-item').forEach(item => {
    item.addEventListener('click', () => playTap(0.25));
  });

  // Form submit button
  const reachSend = document.querySelector('.reach-send');
  if (reachSend) {
    reachSend.addEventListener('click', () => playTap(0.45));
  }

  // ── Animated Me (Hover Emoji Explosion) ───────────
  initAnimatedMe();

  // ── Reach Form ────────────────────────────────────
  initReachForm();

  // ── Passport System ────────────────────────────────
  initPassport();

  // ── Draggable Scrapbook Stickers ───────────────────
  initDraggableDecor();

  // ── Decor Fly Out from Brain ───────────────────────
  initDecorFlyOut();

  // ── Minecraft Pocket Miner ─────────────────────────
  initMinecraftGame();

  // ── Section Reveal on Scroll ──────────────────────
  const sections = document.querySelectorAll('.about-content-section');
  const reachSection = document.getElementById('reach-section');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.02, rootMargin: '0px 0px -20px 0px' });

    sections.forEach(section => {
      revealObserver.observe(section);
    });

    if (reachSection) revealObserver.observe(reachSection);
  } else {
    // Fallback if IntersectionObserver is not supported
    sections.forEach(section => section.classList.add('visible'));
    if (reachSection) reachSection.classList.add('visible');
  }

  // Double check elements that are already visible in viewport on load/scroll
  function checkRevealFallback() {
    sections.forEach(section => {
      if (!section.classList.contains('visible')) {
        const rect = section.getBoundingClientRect();
        // If element top is above the viewport bottom (with a 20px buffer), reveal it
        if (rect.top < window.innerHeight - 20) {
          section.classList.add('visible');
        }
      }
    });
  }

  // Trigger fallback check on load, scroll and resize
  window.addEventListener('scroll', checkRevealFallback, { passive: true });
  window.addEventListener('resize', checkRevealFallback, { passive: true });
  setTimeout(checkRevealFallback, 600); // Wait for page layouts/stickers to settle

  // ──────────────────────────────────────────────────
  // Function Definitions
  // ──────────────────────────────────────────────────

  function initEmbers() {
    const canvas = document.getElementById('constellation-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const points = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = null;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      points.length = 0;
      const isMobile = window.innerWidth <= 768;
      const count = Math.min(80, Math.max(isMobile ? 15 : 30, Math.floor(width * height / 15000)));
      for (let i = 0; i < count; i++) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -(Math.random() * 0.6 + 0.3), // Float upwards
          r: Math.random() * 2 + 0.8,
          alpha: Math.random() * 0.5 + 0.3,
          color: Math.random() > 0.45 ? 'rgba(249, 115, 22, ' : (Math.random() > 0.5 ? 'rgba(239, 68, 68, ' : 'rgba(251, 191, 36, ')
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      points.forEach((point) => {
        point.y += point.vy;
        point.x += point.vx + Math.sin(point.y / 30) * 0.15; // Sway side to side
        if (point.y < -10) {
          point.y = height + 10;
          point.x = Math.random() * width;
        }
        if (point.x < -10 || point.x > width + 10) {
          point.x = Math.random() * width;
        }

        ctx.fillStyle = point.color + point.alpha + ')';
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
        ctx.fill();
      });
      rafId = requestAnimationFrame(draw);
    }

    const onResize = debounce(resize, 150);
    window.addEventListener('resize', onResize);
    resize();
    draw();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
      } else if (!document.hidden) {
        draw();
      }
    });
  }

  function initAnimatedMe() {
    const animatedMe = document.getElementById('animated-me');
    if (!animatedMe) return;

    const frames = [
      '../assets/images/about/1.PNG',
      '../assets/images/about/2.PNG',
      '../assets/images/about/3.PNG',
      '../assets/images/about/4.PNG',
      '../assets/images/about/5.PNG'
    ];

    // Preload frames to prevent flicker
    frames.forEach(src => {
      const img = new Image();
      img.src = src;
    });

    let intervalId = null;
    let currentFrame = 0; // 0 to 4
    let direction = 1; // 1 = forward, -1 = backward
    let isHovered = false;
    let clickLoopActive = false; // true if running a click-induced loop (1 -> 5 -> 1)

    function startAnimation() {
      if (intervalId) return; // already running

      animatedMe.classList.add('animating');

      intervalId = setInterval(() => {
        currentFrame += direction;

        if (direction === 1) {
          if (currentFrame >= frames.length - 1) {
            currentFrame = frames.length - 1;

            if (clickLoopActive) {
              // Click loop: reached the top, now go back
              direction = -1;
            } else if (isHovered) {
              // Hover: hold at frame 5, stop interval
              clearInterval(intervalId);
              intervalId = null;
            } else {
              // Left hover while animating up: go back
              direction = -1;
            }
          }
        } else {
          // direction === -1
          if (currentFrame <= 0) {
            currentFrame = 0;
            clearInterval(intervalId);
            intervalId = null;
            clickLoopActive = false;
            animatedMe.classList.remove('animating');
          }
        }

        animatedMe.src = frames[currentFrame];
      }, 100);
    }

    animatedMe.addEventListener('mouseenter', () => {
      isHovered = true;
      clickLoopActive = false; // Hover overrides click loop
      direction = 1;
      startAnimation();
    });

    animatedMe.addEventListener('mouseleave', () => {
      isHovered = false;
      if (!clickLoopActive) {
        direction = -1;
        startAnimation();
      }
    });

    animatedMe.addEventListener('click', () => {
      // Typewriter Particle Burst
      const rect = animatedMe.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const chars = ['*', '+', 'x', 'o', '?', '!', '~', 'a', 'n', 'm', 'x', 'l', 'r'];
      const chosenChars = [];
      for (let i = 0; i < 8; i++) {
        chosenChars.push(chars[Math.floor(Math.random() * chars.length)]);
      }

      chosenChars.forEach((char, index) => {
        setTimeout(() => {
          createTypewriterParticle(char, centerX, centerY);
        }, index * 50);
      });

      // Play click sound
      playTap(0.35);

      // If clicked and not hovered (like mobile tap), run a full cycle 1 -> 5 -> 1
      if (!isHovered) {
        clickLoopActive = true;
        direction = 1;
        startAnimation();
      }
    });
  }

  function createTypewriterParticle(char, startX, startY) {
    const particle = document.createElement('div');
    particle.className = 'typewriter-particle';
    particle.textContent = char;

    const angle = Math.random() * Math.PI * 2;
    const distance = 120 + Math.random() * 80;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    const rotation = Math.random() * 720 - 360;

    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    particle.style.setProperty('--rot', `${rotation}deg`);

    document.body.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 1500);
  }

  function initReachForm() {
    const form = document.getElementById('reach-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const location = (data.get('location') || '').toString().trim();
      const building = (data.get('building') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();

      const subject = `Portfolio reach out from ${name || 'someone building something'}`;
      const body = [
        'Hey Anmol,',
        '',
        `Name: ${name}`,
        `Location: ${location || 'Not shared'}`,
        `Email: ${email}`,
        `What I am building: ${building}`,
        '',
        'Message:',
        message,
        '',
        'Sent from anmxlr.github.io'
      ].join('\n');

      window.location.href = `mailto:anmxlr@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }



  function initPassport() {
    const stamps = {
      melophile: document.getElementById('stamp-melophile'),
      hacker: document.getElementById('stamp-hacker'),
      investigator: document.getElementById('stamp-investigator'),
      miner: document.getElementById('stamp-miner')
    };

    function updateStampVisuals(key) {
      const el = stamps[key];
      if (!el) return;
      const isUnlocked = localStorage.getItem(`passport_stamp_${key}`) === 'unlocked';
      if (isUnlocked && !el.classList.contains('unlocked')) {
        el.classList.add('unlocked');
        const statusSpan = el.querySelector('.stamp-status');
        if (statusSpan) statusSpan.textContent = 'PASSED';
      }
    }

    // Initial load
    Object.keys(stamps).forEach(updateStampVisuals);

    // Expose unlock function globally for page actions
    window.unlockPassportStamp = function (key) {
      if (localStorage.getItem(`passport_stamp_${key}`) === 'unlocked') return;
      localStorage.setItem(`passport_stamp_${key}`, 'unlocked');

      // Play double thud stamp sound
      if (typeof playTap === 'function') {
        playTap(0.7);
        setTimeout(() => playTap(0.55), 80);
      }

      // Show toast
      showPassportToast(key);

      // Update element
      updateStampVisuals(key);
    };
  }

  function showPassportToast(key) {
    const toast = document.createElement('div');
    toast.className = 'passport-toast';
    toast.innerHTML = `
      <span class="toast-kicker">Passport Stamp Earned</span>
      <span class="toast-title">${key.toUpperCase()}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // ── Drag & Drop Decor Images ──────────────────────
  function initDraggableDecor() {
    const decorImages = document.querySelectorAll('.decor-image');

    decorImages.forEach(el => {
      // Prevent default browser image dragging
      el.addEventListener('dragstart', (e) => e.preventDefault());

      el.addEventListener('mousedown', startDrag);
      el.addEventListener('touchstart', startDrag, { passive: false });
    });

    function startDrag(e) {
      // Only drag with left mouse button click
      if (e.type === 'mousedown' && e.button !== 0) return;

      const el = this;

      // Play a soft tap sound when grabbing the sticker
      if (typeof playTap === 'function') {
        playTap(0.3);
      }

      // Get positions
      const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
      const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

      const rect = el.getBoundingClientRect();
      const parentRect = el.offsetParent ? el.offsetParent.getBoundingClientRect() : { left: 0, top: 0 };

      // Absolute positioning relative to offsets
      let currentLeft = rect.left - parentRect.left;
      let currentTop = rect.top - parentRect.top;

      // Remove right and bottom offsets
      el.style.right = 'auto';
      el.style.bottom = 'auto';
      el.style.left = currentLeft + 'px';
      el.style.top = currentTop + 'px';

      const shiftX = clientX - rect.left;
      const shiftY = clientY - rect.top;

      // Temporarily raise Z-index and cursor class
      el.style.zIndex = '1000';
      el.classList.add('dragging');

      function moveAt(clientX, clientY) {
        let x = clientX - parentRect.left - shiftX;
        let y = clientY - parentRect.top - shiftY;

        el.style.left = x + 'px';
        el.style.top = y + 'px';
      }

      function onMouseMove(e) {
        if (e.type === 'touchmove') {
          e.preventDefault();
        }
        const moveX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const moveY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        moveAt(moveX, moveY);
      }

      if (e.type === 'touchstart') {
        document.addEventListener('touchmove', onMouseMove, { passive: false });
        document.addEventListener('touchend', onMouseUp);
      } else {
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      }

      function onMouseUp() {
        el.classList.remove('dragging');
        el.style.zIndex = '16'; // Keep it slightly higher than normal so it sits above non-dragged items

        // Play soft tap sound on drop
        if (typeof playTap === 'function') {
          playTap(0.25);
        }

        if (e.type === 'touchstart') {
          document.removeEventListener('touchmove', onMouseMove);
          document.removeEventListener('touchend', onMouseUp);
        } else {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        }
      }
    }
  }

  // ── Decor Fly Out from Brain ───────────────────────
  function initDecorFlyOut() {
    const animatedMe = document.getElementById('animated-me');
    const aboutHero = document.getElementById('about-hero');
    const decorImages = document.querySelectorAll('.decor-image');
    if (!animatedMe || !aboutHero || decorImages.length === 0) return;

    let hasSpread = false;
    let fadeOutTimer = null;
    const isMobile = window.innerWidth <= 768;

    // Move all decor images to the hero section so they are visible immediately,
    // share the same stacking context, and do not inherit fade/scroll effects from lower sections.
    decorImages.forEach(el => {
      if (el.parentNode !== aboutHero) {
        aboutHero.appendChild(el);
      }
    });

    // Calculate and set initial state (condensed inside the head/brain of animated-me)
    function setupInitialState() {
      if (hasSpread) return;

      const meRect = animatedMe.getBoundingClientRect();
      const heroRect = aboutHero.getBoundingClientRect();
      const brainX = (meRect.left - heroRect.left) + meRect.width / 2;
      const brainY = (meRect.top - heroRect.top) + meRect.height * 0.35;

      decorImages.forEach(el => {
        const elWidth = el.offsetWidth || 80;
        const elHeight = el.offsetHeight || 80;

        // Position directly at the center of the brain
        el.style.transition = 'none';
        el.style.left = `${brainX - elWidth / 2}px`;
        el.style.top = `${brainY - elHeight / 2}px`;
        el.style.right = 'auto';
        el.style.bottom = 'auto';
        el.style.transform = 'scale(0)';
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
      });
    }

    // Wait for layout to stabilize
    window.addEventListener('load', setupInitialState);
    setTimeout(setupInitialState, 200);

    function scatterDecor() {
      hasSpread = true;
      clearTimeout(fadeOutTimer);

      const meRect = animatedMe.getBoundingClientRect();
      const heroRect = aboutHero.getBoundingClientRect();
      const brainX = (meRect.left - heroRect.left) + meRect.width / 2;
      const brainY = (meRect.top - heroRect.top) + meRect.height * 0.35;

      const xRangeMin = isMobile ? 55 : 140;
      const xRangeMax = isMobile ? 120 : 380;
      const yRangeMax = isMobile ? 100 : 250;

      // Staggered scatter fly out
      decorImages.forEach((el, index) => {
        const elWidth = el.offsetWidth || 80;
        const elHeight = el.offsetHeight || 80;

        // Reset directly to the brain center instantly
        el.style.transition = 'none';
        el.style.left = `${brainX - elWidth / 2}px`;
        el.style.top = `${brainY - elHeight / 2}px`;
        el.style.transform = 'scale(0)';
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';

        // Alternate left and right sides of the profile
        const side = index % 2 === 0 ? -1 : 1;
        const targetX = brainX + side * (xRangeMin + Math.random() * (xRangeMax - xRangeMin)) - elWidth / 2;
        const targetY = brainY + (Math.random() - 0.5) * 2 * yRangeMax - elHeight / 2;
        const randomRot = Math.random() * 40 - 20; // -20deg to 20deg

        setTimeout(() => {
          el.style.transition = 'left 1.4s cubic-bezier(0.16, 1, 0.3, 1), top 1.4s cubic-bezier(0.16, 1, 0.3, 1), transform 1.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.4s ease';
          el.style.left = `${targetX}px`;
          el.style.top = `${targetY}px`;
          el.style.transform = `scale(1) rotate(${randomRot}deg)`;
          el.style.opacity = '1';

          // Disable transitions after animation to prevent lag during dragging
          setTimeout(() => {
            el.style.transition = 'filter 0.4s ease, opacity 2.5s ease, transform 2.5s ease';
            el.style.pointerEvents = 'auto';
          }, 1400);
        }, 50 + index * 60);
      });

      // Slowly disappear/fade out after a display duration
      fadeOutTimer = setTimeout(() => {
        decorImages.forEach(el => {
          el.style.transition = 'opacity 3.0s ease, transform 3.0s ease, filter 0.4s ease';
          el.style.opacity = '0';
          // Retain rotation while shrinking
          const currentRotation = el.style.transform.match(/rotate\([^)]+\)/);
          const rotStr = currentRotation ? currentRotation[0] : 'rotate(0deg)';
          el.style.transform = `${rotStr} scale(0.6)`;
          el.style.pointerEvents = 'none';
        });
        hasSpread = false;
      }, 1400 + decorImages.length * 60 + 3500);
    }

    // Hover listener to trigger the scatter spread
    animatedMe.addEventListener('mouseenter', () => {
      if (!hasSpread) {
        scatterDecor();
      }
    });

    // Click listener to force a re-scatter (condenses back and spreads out again)
    animatedMe.addEventListener('click', () => {
      scatterDecor();
    });
  }

  function initMinecraftGame() {
    const blockEl = document.getElementById('mc-active-block');
    const cracksEl = document.getElementById('mc-block-cracks');
    const symbolEl = document.getElementById('mc-block-symbol');
    const nameEl = document.getElementById('mc-block-name');
    const hpFillEl = document.getElementById('mc-block-hp-fill');
    const hpTextEl = document.getElementById('mc-block-hp-text');
    const escapeBtn = document.getElementById('mc-escape-btn');
    const escapeStatusEl = document.getElementById('mc-escape-status');
    const toolInfoEl = document.getElementById('mc-tool-info');

    if (!blockEl) return;

    const state = {
      inventory: { cobble: 0, coal: 0, iron: 0, gold: 0, diamond: 0, tear: 0 },
      tier: 5 // Default to Netherite if no save state exists
    };

    hasSword = false;
    let isFireResistant = false;
    let isPortalIgnited = false;

    const blocksPool = [
      { name: 'Netherrack', hp: 30, image: '../assets/images/minecraft/nether.jpg', color: '#991b1b', drop: 'cobble', weight: 0.3 },
      { name: 'Soul Soil', hp: 55, image: '../assets/images/minecraft/coal.jpg', color: '#451a03', drop: 'coal', weight: 0.2 },
      { name: 'Blackstone', hp: 80, image: '../assets/images/minecraft/stone.jpg', color: '#1f2937', drop: 'iron', weight: 0.2 },
      { name: 'Nether Gold Ore', hp: 115, image: '../assets/images/minecraft/gold.jpg', color: '#fbbf24', drop: 'gold', weight: 0.15 },
      { name: 'Ancient Debris', hp: 160, image: '../assets/images/minecraft/diamond.jpg', color: '#78350f', drop: 'diamond', weight: 0.05 },
      { name: 'Obsidian Block', hp: 200, image: '../assets/images/minecraft/obsidian.png', color: '#3b0764', drop: 'obsidian', weight: 0.1 }
    ];

    function pickRandomBlock() {
      const r = Math.random();
      let sum = 0;
      for (const b of blocksPool) {
        sum += b.weight;
        if (r <= sum) return { ...b };
      }
      return { ...blocksPool[0] };
    }

    let activeBlock = pickRandomBlock();
    let currentHP = activeBlock.hp;
    let obsidianMined = 0;

    // Page level health parameters
    let health = 10;
    let isGameOver = false;
    let isInvincible = false;

    const pickaxes = [
      { name: "Wooden Pickaxe", power: 10 },
      { name: "Stone Pickaxe", power: 18 },
      { name: "Iron Pickaxe", power: 28 },
      { name: "Golden Pickaxe", power: 45 },
      { name: "Diamond Pickaxe", power: 70 },
      { name: "Netherite Pickaxe", power: 110 },
      { name: "Enchanted Netherite Pickaxe", power: 160 }
    ];

    // Load state
    const saved = localStorage.getItem('mc_pocket_miner_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.inventory) {
          state.inventory = parsed.inventory;
          if (state.inventory.tear === undefined) {
            state.inventory.tear = 0;
          }
          state.tier = typeof parsed.tier === 'number' ? parsed.tier : 5;
          obsidianMined = parsed.obsidianMined || 0;
          isPortalIgnited = parsed.isPortalIgnited || false;
          hasSword = parsed.hasSword || false;
        }
      } catch (e) {
        console.warn('Failed to parse pocket miner state:', e);
      }
    }

    // Web Audio Synthesizer
    let audioCtx = null;
    function getAudioContext() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => { });
      }
      return audioCtx;
    }

    let droneOsc = null;
    let droneFilter = null;
    let droneGain = null;

    function startAmbientDrone() {
      try {
        const ctx = getAudioContext();
        if (!ctx || droneOsc) return;
        const now = ctx.currentTime;

        droneOsc = ctx.createOscillator();
        droneFilter = ctx.createBiquadFilter();
        droneGain = ctx.createGain();

        droneOsc.type = 'triangle';
        droneOsc.frequency.setValueAtTime(45, now);

        droneFilter.type = 'lowpass';
        droneFilter.frequency.setValueAtTime(90, now);

        droneGain.gain.setValueAtTime(0.08, now);

        droneOsc.connect(droneFilter);
        droneFilter.connect(droneGain);
        droneGain.connect(ctx.destination);

        droneOsc.start();
      } catch (e) {
        console.warn('Drone start failed', e);
      }
    }

    function playNoiseBurst(duration, volume) {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 1.0;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + duration);
      } catch (e) {
        console.warn(e);
      }
    }

    function playHitSound() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
        playNoiseBurst(0.04, 0.15);
      } catch (e) {
        console.warn(e);
      }
    }

    function playBreakSound() {
      try {
        playHitSound();
        setTimeout(() => playHitSound(), 50);
        setTimeout(() => {
          const ctx = getAudioContext();
          if (!ctx) return;
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(80, now);
          osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 300;
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.15);
        }, 100);
      } catch (e) {
        console.warn(e);
      }
    }

    function playHurtSound() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.linearRampToValueAtTime(70, now + 0.15);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      } catch (e) {
        console.warn(e);
      }
    }

    function playTeleportSound() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } catch (e) {
        console.warn(e);
      }
    }

    function playCraftSound() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(330, now);
        osc2.frequency.setValueAtTime(440, now);
        osc2.frequency.setValueAtTime(660, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.25);
        osc2.start(now);
        osc2.stop(now + 0.25);
      } catch (e) { }
    }

    function playEatSound() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            const now = ctx.currentTime;
            const bufferSize = ctx.sampleRate * 0.05;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let j = 0; j < bufferSize; j++) {
              data[j] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 180;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            noise.start(now);
          }, i * 120);
        }
      } catch (e) { }
    }

    function playGhastSound() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.45);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
      } catch (e) { }
    }

    function playBlazeSound() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.linearRampToValueAtTime(120, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
        playNoiseBurst(0.08, 0.12);
      } catch (e) { }
    }

    function playPiglinSound() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(75, now);
        osc.frequency.linearRampToValueAtTime(45, now + 0.22);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(150, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } catch (e) { }
    }

    function drawHearts(currentHealth) {
      const healthBar = document.getElementById('mc-health-bar');
      if (!healthBar) return;
      healthBar.innerHTML = '';
      for (let i = 0; i < 5; i++) {
        const heartImg = document.createElement('img');
        heartImg.style.width = '24px';
        heartImg.style.height = '24px';
        heartImg.style.imageRendering = 'pixelated';
        const heartVal = currentHealth - (i * 2);
        if (heartVal >= 2) {
          heartImg.src = '../assets/images/minecraft/full.png';
        } else if (heartVal === 1) {
          heartImg.src = '../assets/images/minecraft/half.png';
        } else {
          heartImg.src = '../assets/images/minecraft/empty.png';
        }
        healthBar.appendChild(heartImg);
      }
    }

    function updateHPBar() {
      const pct = Math.max(0, (currentHP / activeBlock.hp) * 100);
      hpFillEl.style.width = `${pct}%`;
      hpTextEl.textContent = `HP: ${Math.max(0, currentHP)} / ${activeBlock.hp}`;

      const ratio = currentHP / activeBlock.hp;
      cracksEl.className = 'mc-block-cracks';
      if (ratio <= 0.15) {
        cracksEl.classList.add('crack-heavy');
      } else if (ratio <= 0.45) {
        cracksEl.classList.add('crack-medium');
      } else if (ratio <= 0.75) {
        cracksEl.classList.add('crack-light');
      }
    }

    function saveState() {
      state.obsidianMined = obsidianMined;
      state.isPortalIgnited = isPortalIgnited;
      localStorage.setItem('mc_pocket_miner_state', JSON.stringify(state));
    }

    const craftSwordBtn = document.getElementById('mc-craft-sword');
    const craftAppleBtn = document.getElementById('mc-craft-apple');
    const craftPotionBtn = document.getElementById('mc-craft-potion');

    function checkCraftability() {
      if (!craftSwordBtn || isGameOver) return;

      // Sword: 3 Iron, 2 Diamond
      if (state.inventory.iron >= 3 && state.inventory.diamond >= 2 && !hasSword) {
        craftSwordBtn.disabled = false;
        craftSwordBtn.classList.add('afford');
      } else {
        craftSwordBtn.disabled = true;
        craftSwordBtn.classList.remove('afford');
      }

      if (hasSword) {
        craftSwordBtn.querySelector('.mc-btn-label').textContent = "SWORD ACTIVE";
        craftSwordBtn.querySelector('.mc-btn-cost').textContent = "Click Mobs to Attack";
        craftSwordBtn.disabled = true;
        craftSwordBtn.classList.remove('afford');
      }

      // Apple: 5 Gold, 2 Coal
      if (state.inventory.gold >= 5 && state.inventory.coal >= 2 && health < 10) {
        craftAppleBtn.disabled = false;
        craftAppleBtn.classList.add('afford');
      } else {
        craftAppleBtn.disabled = true;
        craftAppleBtn.classList.remove('afford');
      }

      // Potion: 3 Coal, 2 Gold
      if (state.inventory.coal >= 3 && state.inventory.gold >= 2 && !isFireResistant) {
        craftPotionBtn.disabled = false;
        craftPotionBtn.classList.add('afford');
      } else {
        craftPotionBtn.disabled = true;
        craftPotionBtn.classList.remove('afford');
      }
    }

    function updateEscapeButton() {
      if (obsidianMined < 10 || !escapeBtn) return;

      escapeBtn.style.display = 'block';

      if (!isPortalIgnited) {
        escapeBtn.querySelector('.mc-btn-label').textContent = "IGNITE PORTAL";
        escapeStatusEl.textContent = "Requires 1 Ghast Tear";
        if (state.inventory.tear >= 1) {
          escapeBtn.disabled = false;
          escapeBtn.classList.add('afford');
        } else {
          escapeBtn.disabled = true;
          escapeBtn.classList.remove('afford');
        }
      } else {
        escapeBtn.disabled = false;
        escapeBtn.classList.remove('afford');
        escapeBtn.querySelector('.mc-btn-label').textContent = "ESCAPE THE NETHER";
        escapeStatusEl.textContent = "Portal Active";
      }
    }

    function updateUI() {
      document.getElementById('mc-count-cobble').textContent = state.inventory.cobble;
      document.getElementById('mc-count-coal').textContent = state.inventory.coal;
      document.getElementById('mc-count-iron').textContent = state.inventory.iron;
      document.getElementById('mc-count-gold').textContent = state.inventory.gold;
      document.getElementById('mc-count-diamond').textContent = state.inventory.diamond;

      const countTearEl = document.getElementById('mc-count-tear');
      if (countTearEl) {
        countTearEl.textContent = state.inventory.tear || 0;
      }

      if (toolInfoEl) {
        const pickPower = pickaxes[state.tier]?.power || 10;
        if (hasSword) {
          toolInfoEl.textContent = `Tool: Netherite Sword (Power: 150)`;
        } else {
          toolInfoEl.textContent = `Tool: ${pickaxes[state.tier]?.name || 'Wooden Pickaxe'} (Power: ${pickPower})`;
        }
      }

      const counterEl = document.getElementById('mc-obsidian-count');
      if (counterEl) {
        counterEl.textContent = `Obsidian Mined: ${obsidianMined} / 10`;
      }

      if (obsidianMined >= 10) {
        if (isPortalIgnited) {
          symbolEl.innerHTML = `<img src="../assets/images/minecraft/nether-portal-minecraft.gif" alt="Nether Portal" style="width: 100%; height: 100%; object-fit: cover; image-rendering: pixelated;" />`;
          nameEl.textContent = "Nether Portal Active";
          cracksEl.className = 'mc-block-cracks';
          hpFillEl.style.width = '100%';
          hpTextEl.textContent = "ACTIVE";
        } else {
          symbolEl.innerHTML = `<img src="../assets/images/minecraft/obsidian.png" alt="Obsidian Portal Frame" style="width: 100%; height: 100%; object-fit: cover; image-rendering: pixelated;" />`;
          nameEl.textContent = "Portal Frame Complete";
          cracksEl.className = 'mc-block-cracks';
          hpFillEl.style.width = '100%';
          hpTextEl.textContent = "INACTIVE";
        }
      }

      if (window.updateGlobalCursor) {
        window.updateGlobalCursor(state.tier);
      }

      checkCraftability();
      updateEscapeButton();
    }

    function spawnParticles(color) {
      const screenEl = document.querySelector('.mc-screen');
      if (!screenEl) return;
      const count = 5 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'mc-particle';
        const dx = (Math.random() - 0.5) * 80 + 'px';
        const dy = (Math.random() - 0.5) * 60 - 20 + 'px';
        const rot = (Math.random() * 360) + 'deg';
        p.style.setProperty('--dx', dx);
        p.style.setProperty('--dy', dy);
        p.style.setProperty('--rot', rot);
        p.style.setProperty('--color', color);
        p.style.left = '52px';
        p.style.top = '52px';
        screenEl.appendChild(p);
        setTimeout(() => p.remove(), 600);
      }
    }

    function spawnFloatingText(text) {
      const screenEl = document.querySelector('.mc-screen');
      if (!screenEl) return;
      const ft = document.createElement('div');
      ft.className = 'mc-floating-text';
      ft.textContent = text;
      ft.style.left = '40px';
      ft.style.top = '30px';
      screenEl.appendChild(ft);
      setTimeout(() => ft.remove(), 800);
    }

    function spawnPurpleParticles(cx, cy) {
      const count = 6 + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'mc-particle';
        const dx = (Math.random() - 0.5) * 60 + 'px';
        const dy = (Math.random() - 0.5) * 60 + 'px';
        const rot = (Math.random() * 360) + 'deg';
        p.style.setProperty('--dx', dx);
        p.style.setProperty('--dy', dy);
        p.style.setProperty('--rot', rot);
        p.style.setProperty('--color', '#c084fc');
        p.style.left = `${cx}px`;
        p.style.top = `${cy}px`;
        p.style.position = 'fixed';
        p.style.zIndex = '10003';
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 600);
      }
    }

    blockEl.addEventListener('click', () => {
      if (obsidianMined >= 10) {
        if (isPortalIgnited) {
          escapeNetherPortal();
        } else {
          spawnFloatingText("Light portal first!");
        }
        return;
      }

      if (!droneOsc) {
        startAmbientDrone();
      }

      blockEl.classList.remove('shake');
      void blockEl.offsetWidth;
      blockEl.classList.add('shake');
      setTimeout(() => blockEl.classList.remove('shake'), 150);

      playHitSound();
      spawnParticles(activeBlock.color || '#ef4444');

      let clickPower = pickaxes[state.tier]?.power || 10;
      if (hasSword) {
        clickPower = 150;
      }
      currentHP -= clickPower;

      if (currentHP <= 0) {
        playBreakSound();

        if (activeBlock.drop === 'obsidian') {
          obsidianMined++;
          spawnFloatingText("+1 Obsidian");
        } else {
          state.inventory[activeBlock.drop]++;
          spawnFloatingText(`+1 ${activeBlock.name}`);
        }

        updateUI();
        saveState();

        if (obsidianMined < 10) {
          activeBlock = pickRandomBlock();
          currentHP = activeBlock.hp;
          cracksEl.className = 'mc-block-cracks';
          nameEl.textContent = activeBlock.name;
          symbolEl.innerHTML = `<img src="${activeBlock.image}" alt="${activeBlock.name}" style="width: 100%; height: 100%; object-fit: cover; image-rendering: pixelated;" />`;
          hpFillEl.style.backgroundColor = activeBlock.color;
          hpFillEl.style.boxShadow = `0 0 6px ${activeBlock.color}`;
          updateHPBar();
        } else {
          spawnFloatingText("Frame Built!");
          updateUI();
          saveState();
        }
      } else {
        updateHPBar();
      }
    });

    if (escapeBtn) {
      escapeBtn.addEventListener('click', () => {
        if (!isPortalIgnited) {
          if (state.inventory.tear >= 1) {
            state.inventory.tear -= 1;
            isPortalIgnited = true;
            playTeleportSound();
            spawnFloatingText("Portal Ignited!");

            const rect = escapeBtn.getBoundingClientRect();
            spawnPurpleParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);

            updateUI();
            saveState();
          }
        } else {
          escapeNetherPortal();
        }
      });
    }

    function escapeNetherPortal() {
      playTeleportSound();
      localStorage.setItem('nether_transition_back', 'true');
      const transitionEl = document.getElementById('portal-transition');
      if (transitionEl) {
        transitionEl.classList.add('active');
        setTimeout(() => {
          window.location.href = 'about.html';
        }, 1500);
      } else {
        window.location.href = 'about.html';
      }
    }

    if (craftSwordBtn) {
      craftSwordBtn.addEventListener('click', () => {
        if (state.inventory.iron >= 3 && state.inventory.diamond >= 2 && !hasSword) {
          state.inventory.iron -= 3;
          state.inventory.diamond -= 2;
          hasSword = true;
          playCraftSound();
          spawnFloatingText("Sword Crafted!");

          if (window.updateGlobalCursor) {
            window.updateGlobalCursor(5);
          }

          updateUI();
          saveState();
          checkCraftability();
        }
      });
    }

    if (craftAppleBtn) {
      craftAppleBtn.addEventListener('click', () => {
        if (state.inventory.gold >= 5 && state.inventory.coal >= 2 && health < 10) {
          state.inventory.gold -= 5;
          state.inventory.coal -= 2;
          health = 10;
          playEatSound();
          spawnFloatingText("Eaten Apple! Full HP");
          drawHearts(health);
          updateUI();
          saveState();
          checkCraftability();
        }
      });
    }

    if (craftPotionBtn) {
      craftPotionBtn.addEventListener('click', () => {
        if (state.inventory.coal >= 3 && state.inventory.gold >= 2 && !isFireResistant) {
          state.inventory.coal -= 3;
          state.inventory.gold -= 2;
          isFireResistant = true;
          playCraftSound();
          spawnFloatingText("Fire Resist Active (12s)");

          document.body.style.boxShadow = "inset 0 0 40px rgba(34, 211, 238, 0.6)";

          let secondsLeft = 12;
          craftPotionBtn.querySelector('.mc-btn-label').textContent = `POTION: ${secondsLeft}s`;

          const potionTimer = setInterval(() => {
            secondsLeft--;
            if (secondsLeft <= 0 || isGameOver) {
              clearInterval(potionTimer);
              isFireResistant = false;
              document.body.style.boxShadow = "none";
              if (craftPotionBtn) {
                craftPotionBtn.querySelector('.mc-btn-label').textContent = "FIRE RESIST POTION";
              }
              checkCraftability();
            } else {
              if (craftPotionBtn) {
                craftPotionBtn.querySelector('.mc-btn-label').textContent = `POTION: ${secondsLeft}s`;
              }
            }
          }, 1000);

          updateUI();
          saveState();
          checkCraftability();
        }
      });
    }

    let healthBar = document.getElementById('mc-health-bar');
    if (!healthBar) {
      healthBar = document.createElement('div');
      healthBar.id = 'mc-health-bar';
      document.body.appendChild(healthBar);
    }

    let hitFlash = document.getElementById('mc-hit-flash');
    if (!hitFlash) {
      hitFlash = document.createElement('div');
      hitFlash.id = 'mc-hit-flash';
      document.body.appendChild(hitFlash);
    }

    let gameOverOverlay = document.getElementById('mc-gameover-overlay');
    if (!gameOverOverlay) {
      gameOverOverlay = document.createElement('div');
      gameOverOverlay.id = 'mc-gameover-overlay';
      gameOverOverlay.innerHTML = `
        <div class="mc-go-title" style="color: #ef4444;">YOU DIED!</div>
        <div class="mc-go-sub">Inventory Lost in Nether</div>
        <button class="mc-go-btn" id="mc-respawn-btn" style="background: #7f1d1d; border-color: #ef4444; box-shadow: inset -3px -3px 0px #450a0a, inset 3px 3px 0px #b91c1c;">RESPAWN</button>
      `;
      document.body.appendChild(gameOverOverlay);
    }

    const mobs = [];
    const mobElements = [];
    const mobDefs = [
      { type: 'ghast', name: 'Ghast', src: '../assets/images/minecraft/thenether/Ghast_JE3_BE3.webp', width: 90, height: 90, cssClass: 'mc-ghast', hp: 100 },
      { type: 'blaze', name: 'Blaze 1', src: '../assets/images/minecraft/thenether/Blaze.webp', width: 60, height: 70, cssClass: 'mc-blaze', hp: 100 },
      { type: 'blaze', name: 'Blaze 2', src: '../assets/images/minecraft/thenether/Blaze.webp', width: 60, height: 70, cssClass: 'mc-blaze', hp: 100 },
      { type: 'piglin', name: 'Piglin Brute 1', src: '../assets/images/minecraft/thenether/Piglin_Brute_being_zombified.gif', width: 55, height: 80, cssClass: 'mc-piglin', hp: 100 },
      { type: 'piglin', name: 'Piglin Brute 2', src: '../assets/images/minecraft/thenether/Piglin_Brute_being_zombified.gif', width: 55, height: 80, cssClass: 'mc-piglin', hp: 100 }
    ];

    mobDefs.forEach((def, idx) => {
      let el = document.getElementById(`mc-mob-${idx}`);
      if (el) el.remove();

      el = document.createElement('img');
      el.id = `mc-mob-${idx}`;
      el.className = `mc-mob ${def.cssClass}`;
      el.src = def.src;
      el.style.width = `${def.width}px`;
      el.style.height = `${def.height}px`;
      el.style.position = 'fixed';
      el.style.zIndex = '10002';
      el.style.display = 'block';
      document.body.appendChild(el);
      mobElements.push(el);

      mobs.push({
        idx: idx,
        type: def.type,
        name: def.name,
        width: def.width,
        height: def.height,
        hp: def.hp,
        maxHp: def.hp,
        x: 50 + idx * (window.innerWidth / (mobDefs.length + 1)),
        y: def.type === 'ghast' ? 80 : (def.type === 'blaze' ? window.innerHeight / 2 : window.innerHeight - 150),
        vx: 0,
        vy: 0,
        isDefeated: false,
        defeatTime: 0,
        lastTeleport: Date.now() - Math.random() * 6000,
        lastAction: Date.now() - Math.random() * 3000,
        wanderTargetX: 50 + idx * (window.innerWidth / (mobDefs.length + 1)),
        wanderTargetY: def.type === 'ghast' ? 100 : (def.type === 'blaze' ? window.innerHeight / 2 : window.innerHeight - 150),
        wanderWaitUntil: 0
      });

      el.addEventListener('click', (e) => {
        if (!hasSword || mobs[idx].isDefeated || isGameOver) return;
        e.stopPropagation();

        mobs[idx].hp -= 50;
        playHitSound();
        spawnParticles('#ef4444');
        spawnFloatingText("-50 HP");

        if (mobs[idx].hp <= 0) {
          defeatMob(mobs[idx]);
        }
      });
    });

    function defeatMob(mob) {
      mob.isDefeated = true;
      mob.defeatTime = Date.now();

      const el = mobElements[mob.idx];
      el.style.display = 'none';

      playBreakSound();
      spawnFloatingText("DEFEATED!");

      let lootText = "";
      if (mob.type === 'ghast') {
        state.inventory.tear = (state.inventory.tear || 0) + 1;
        state.inventory.diamond += 2;
        state.inventory.gold += 3;
        lootText = "+1 Ghast Tear, +2 Diamond, +3 Gold";
      } else if (mob.type === 'blaze') {
        state.inventory.gold += 2;
        state.inventory.coal += 3;
        lootText = "+2 Gold, +3 Coal";
      } else {
        state.inventory.iron += 2;
        state.inventory.cobble += 4;
        lootText = "+2 Iron, +4 Cobble";
      }

      spawnFloatingText(lootText);
      updateUI();
      saveState();

      setTimeout(() => {
        if (isGameOver) return;
        mob.isDefeated = false;
        mob.hp = mob.maxHp;
        const el = mobElements[mob.idx];
        el.style.display = 'block';
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.5s';

        const consoleRect = getConsoleRect();
        pickWanderTarget(mob, consoleRect);
        mob.x = mob.wanderTargetX;
        mob.y = mob.wanderTargetY;
        el.style.left = `${mob.x}px`;
        el.style.top = `${mob.y}px`;

        requestAnimationFrame(() => {
          el.style.opacity = '1';
        });
      }, 6000);
    }

    let projectiles = [];

    function spawnFireball(startX, startY, targetX, targetY, isGhastFireball) {
      const el = document.createElement('div');
      el.className = 'mc-fireball';
      el.style.left = `${startX}px`;
      el.style.top = `${startY}px`;
      document.body.appendChild(el);

      const dx = targetX - startX;
      const dy = targetY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const speed = isGhastFireball ? 4.5 : 3.5;
      const vx = (dx / dist) * speed;
      const vy = (dy / dist) * speed;

      const p = {
        el,
        x: startX,
        y: startY,
        vx,
        vy,
        radius: 12,
        isGhast: isGhastFireball,
        deflected: false
      };

      projectiles.push(p);

      el.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        if (isGameOver || p.deflected) return;

        p.deflected = true;
        playCraftSound();

        let nearestMob = null;
        let minDist = Infinity;
        mobs.forEach(mob => {
          if (mob.isDefeated) return;
          const mx = mob.x + mob.width / 2;
          const my = mob.y + mob.height / 2;
          const d = Math.sqrt((mx - p.x) ** 2 + (my - p.y) ** 2);
          if (d < minDist) {
            minDist = d;
            nearestMob = mob;
          }
        });

        if (nearestMob) {
          const mCenterX = nearestMob.x + nearestMob.width / 2;
          const mCenterY = nearestMob.y + nearestMob.height / 2;
          const mDx = mCenterX - p.x;
          const mDy = mCenterY - p.y;
          const mD = Math.sqrt(mDx * mDx + mDy * mDy) || 1;
          p.vx = (mDx / mD) * 8.5;
          p.vy = (mDy / mD) * 8.5;
          spawnFloatingText("DEFLECTED!");
        } else {
          p.vx = -p.vx * 1.5;
          p.vy = -p.vy * 1.5;
        }
      });
    }

    let lavaSpoutWarningEl = null;
    let lavaSpoutEl = null;
    let spoutActive = false;
    let spoutX = 0;

    function triggerLavaSpout() {
      if (isGameOver) return;

      spoutX = 50 + Math.random() * (window.innerWidth - 150);

      lavaSpoutWarningEl = document.createElement('div');
      lavaSpoutWarningEl.className = 'mc-lava-spout-warning';
      lavaSpoutWarningEl.style.left = `${spoutX}px`;
      document.body.appendChild(lavaSpoutWarningEl);

      playNoiseBurst(0.4, 0.08);

      setTimeout(() => {
        if (lavaSpoutWarningEl) lavaSpoutWarningEl.remove();
        if (isGameOver) return;

        lavaSpoutEl = document.createElement('div');
        lavaSpoutEl.className = 'mc-lava-spout';
        lavaSpoutEl.style.left = `${spoutX}px`;
        document.body.appendChild(lavaSpoutEl);

        spoutActive = true;
        playTeleportSound();

        let elapsed = 0;
        const checkInterval = setInterval(() => {
          if (!spoutActive || isGameOver) {
            clearInterval(checkInterval);
            return;
          }

          if (cursorVisible && !isInvincible && !isFireResistant) {
            if (targetX >= spoutX - 10 && targetX <= spoutX + 45 + 10 && targetY >= 72) {
              damagePlayer(2);
              setOnFire();
            }
          }

          elapsed += 100;
          if (elapsed >= 1500) {
            clearInterval(checkInterval);
            spoutActive = false;
            if (lavaSpoutEl) {
              lavaSpoutEl.remove();
              lavaSpoutEl = null;
            }
          }
        }, 100);

      }, 1500);
    }

    let fireOverlayEl = document.getElementById('mc-fire-overlay');
    if (!fireOverlayEl) {
      fireOverlayEl = document.createElement('div');
      fireOverlayEl.id = 'mc-fire-overlay';
      document.body.appendChild(fireOverlayEl);
    }

    let fireTimer = null;
    function setOnFire() {
      if (isFireResistant || isGameOver) return;
      fireOverlayEl.style.opacity = '1';

      if (fireTimer) clearTimeout(fireTimer);

      let ticks = 0;
      const burnInterval = setInterval(() => {
        if (isGameOver || isFireResistant || ticks >= 4) {
          clearInterval(burnInterval);
          fireOverlayEl.style.opacity = '0';
          return;
        }
        if (!isInvincible) {
          damagePlayer(1);
        }
        ticks++;
      }, 500);

      fireTimer = setTimeout(() => {
        clearInterval(burnInterval);
        fireOverlayEl.style.opacity = '0';
      }, 2000);
    }

    function damagePlayer(amount) {
      if (isInvincible || isGameOver) return;
      health -= amount;
      playHurtSound();
      triggerHitFlash();
      if (health <= 0) {
        health = 0;
        isGameOver = true;
        document.getElementById('mc-gameover-overlay').classList.add('visible');

        projectiles.forEach(p => p.el.remove());
        projectiles = [];
        if (lavaSpoutEl) lavaSpoutEl.remove();
        if (lavaSpoutWarningEl) lavaSpoutWarningEl.remove();
      } else {
        isInvincible = true;
        healthBar.classList.add('mc-heart-invincible');
        setTimeout(() => {
          isInvincible = false;
          healthBar.classList.remove('mc-heart-invincible');
        }, 1000);
      }
      drawHearts(health);
    }

    const spoutInterval = setInterval(() => {
      if (isGameOver) {
        clearInterval(spoutInterval);
        return;
      }
      triggerLavaSpout();
    }, 13000);

    function pickWanderTarget(mob, consoleRect) {
      const minY = 72;
      for (let i = 0; i < 25; i++) {
        const tx = Math.random() * (window.innerWidth - mob.width);
        let ty = minY + Math.random() * (window.innerHeight - minY - mob.height);
        if (mob.type === 'ghast') {
          ty = minY + Math.random() * 150;
        } else if (mob.type === 'blaze') {
          ty = minY + 150 + Math.random() * 200;
        } else {
          ty = window.innerHeight - 150;
        }
        if (!consoleRect || !isInside(tx, ty, consoleRect)) {
          mob.wanderTargetX = tx;
          mob.wanderTargetY = ty;
          mob.wanderWaitUntil = 0;
          return;
        }
      }
      mob.wanderTargetX = mob.x;
      mob.wanderTargetY = mob.y;
    }

    function resetMobs() {
      const consoleRect = getConsoleRect();
      mobs.forEach((mob) => {
        const consoleRect = getConsoleRect();
        pickWanderTarget(mob, consoleRect);
        mob.x = mob.wanderTargetX;
        mob.y = mob.wanderTargetY;
        mob.wanderWaitUntil = 0;
      });
    }

    resetMobs();
    drawHearts(health);

    document.getElementById('mc-respawn-btn').addEventListener('click', () => {
      state.inventory = { cobble: 0, coal: 0, iron: 0, gold: 0, diamond: 0, tear: 0 };
      state.tier = 0;
      obsidianMined = 0;
      isPortalIgnited = false;
      saveState();
      localStorage.setItem('nether_transition_back', 'true');
      window.location.href = 'about.html';
    });

    function getConsoleRect() {
      const consoleEl = document.querySelector('.mc-console');
      if (!consoleEl) return null;
      const r = consoleEl.getBoundingClientRect();
      const padding = 20;
      return {
        left: r.left - padding,
        right: r.right + padding,
        top: r.top - padding,
        bottom: r.bottom + padding
      };
    }

    function isInside(x, y, rect) {
      if (!rect) return false;
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    }

    function clipToRectBoundary(x, y, rect) {
      if (!rect) return { x, y };
      if (!isInside(x, y, rect)) return { x, y };
      const dl = Math.abs(x - rect.left);
      const dr = Math.abs(x - rect.right);
      const dt = Math.abs(y - rect.top);
      const db = Math.abs(y - rect.bottom);
      const min = Math.min(dl, dr, dt, db);
      if (min === dl) return { x: rect.left, y };
      if (min === dr) return { x: rect.right, y };
      if (min === dt) return { x, y: rect.top };
      return { x, y: rect.bottom };
    }

    function triggerHitFlash() {
      const flash = document.getElementById('mc-hit-flash');
      if (flash) {
        flash.style.opacity = '1';
        setTimeout(() => {
          flash.style.opacity = '0';
        }, 100);
      }
    }

    function moveMob(mob, vx, vy, consoleRect) {
      let nextX = mob.x + vx;
      let nextY = mob.y + vy;
      if (consoleRect && isInside(nextX, nextY, consoleRect)) {
        const wasOutsideX = mob.x < consoleRect.left || mob.x > consoleRect.right;
        const wasOutsideY = mob.y < consoleRect.top || mob.y > consoleRect.bottom;
        if (wasOutsideX && !wasOutsideY) {
          nextX = mob.x;
        } else if (wasOutsideY && !wasOutsideX) {
          nextY = mob.y;
        } else {
          const clipped = clipToRectBoundary(nextX, nextY, consoleRect);
          nextX = clipped.x;
          nextY = clipped.y;
        }
      }
      const minY = 72;
      mob.x = Math.max(0, Math.min(window.innerWidth - mob.width, nextX));
      mob.y = Math.max(minY, Math.min(window.innerHeight - mob.height, nextY));
    }

    function updateMobs() {
      if (isGameOver) {
        mobs.forEach((mob, idx) => {
          mobElements[idx].style.left = `${mob.x}px`;
          mobElements[idx].style.top = `${mob.y}px`;
        });
        requestAnimationFrame(updateMobs);
        return;
      }

      const consoleRect = getConsoleRect();
      const minY = 72;
      const isCursorInPlayZone = cursorVisible;

      mobs.forEach((mob, idx) => {
        if (mob.isDefeated) return;

        const mobEl = mobElements[idx];

        if (mob.type === 'ghast') {
          const distToWander = Math.sqrt((mob.wanderTargetX - mob.x) ** 2 + (mob.wanderTargetY - mob.y) ** 2);
          if (distToWander < 15) {
            mob.wanderTargetX = 50 + Math.random() * (window.innerWidth - 150);
            mob.wanderTargetY = minY + Math.random() * 150;
          } else {
            const dx = mob.wanderTargetX - mob.x;
            const dy = mob.wanderTargetY - mob.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            mob.x += (dx / d) * 0.8;
            mob.y += (dy / d) * 0.8;
          }

          if (Date.now() - mob.lastAction > 3800) {
            mob.lastAction = Date.now();
            if (isCursorInPlayZone) {
              playGhastSound();
              spawnFireball(mob.x + 45, mob.y + 45, targetX, targetY, true);
              mobEl.style.transform = 'scale(1.15)';
              setTimeout(() => mobEl.style.transform = 'none', 300);
            }
          }
        }
        else if (mob.type === 'blaze') {
          if (isCursorInPlayZone) {
            const dx = targetX - (mob.x + 30);
            const dy = targetY - (mob.y + 35);
            const d = Math.sqrt(dx * dx + dy * dy) || 1;

            if (d < 300) {
              if (Date.now() - mob.lastAction > 3200) {
                mob.lastAction = Date.now();
                playBlazeSound();
                spawnFireball(mob.x + 30, mob.y + 35, targetX, targetY, false);
              }
            }

            mob.x += (dx / d) * 0.9;
            mob.y += (dy / d) * 0.9;
            mob.y = Math.max(minY + 120, Math.min(window.innerHeight - 220, mob.y));
          } else {
            const distToWander = Math.sqrt((mob.wanderTargetX - mob.x) ** 2 + (mob.wanderTargetY - mob.y) ** 2);
            if (distToWander < 15) {
              mob.wanderTargetX = 50 + Math.random() * (window.innerWidth - 100);
              mob.wanderTargetY = minY + 150 + Math.random() * 200;
            } else {
              const dx = mob.wanderTargetX - mob.x;
              const dy = mob.wanderTargetY - mob.y;
              const d = Math.sqrt(dx * dx + dy * dy) || 1;
              mob.x += (dx / d) * 0.6;
              mob.y += (dy / d) * 0.6;
            }
          }
        }
        else if (mob.type === 'piglin') {
          const groundY = window.innerHeight - 150;
          mob.y = groundY;

          if (isCursorInPlayZone) {
            const dx = targetX - (mob.x + 27);
            const distToCursor = Math.abs(dx);

            if (distToCursor < 450) {
              const speed = 2.0;
              mob.x += (dx > 0 ? 1 : -1) * speed;

              if (Date.now() - mob.lastAction > 5000 && Math.random() > 0.6) {
                mob.lastAction = Date.now();
                playPiglinSound();
              }
            } else {
              wanderGround(mob);
            }
          } else {
            wanderGround(mob);
          }
        }

        if (consoleRect && isInside(mob.x, mob.y, consoleRect)) {
          const clipped = clipToRectBoundary(mob.x, mob.y, consoleRect);
          mob.x = clipped.x;
          mob.y = clipped.y;
        }

        mob.x = Math.max(0, Math.min(window.innerWidth - mob.width, mob.x));
        mobEl.style.left = `${mob.x}px`;
        mobEl.style.top = `${mob.y}px`;
      });

      function wanderGround(mob) {
        const distToWander = Math.abs(mob.wanderTargetX - mob.x);
        if (distToWander < 15) {
          if (mob.wanderWaitUntil === 0) {
            mob.wanderWaitUntil = Date.now() + Math.random() * 1500 + 800;
          } else if (Date.now() >= mob.wanderWaitUntil) {
            mob.wanderTargetX = 50 + Math.random() * (window.innerWidth - 100);
            mob.wanderWaitUntil = 0;
          }
        } else {
          const dx = mob.wanderTargetX - mob.x;
          mob.x += (dx > 0 ? 1 : -1) * 0.6;
        }
      }

      let activeProjectiles = [];
      projectiles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        p.el.style.left = `${p.x}px`;
        p.el.style.top = `${p.y}px`;

        if (p.x < -40 || p.x > window.innerWidth + 40 || p.y < -40 || p.y > window.innerHeight + 40) {
          p.el.remove();
          return;
        }

        if (isCursorInPlayZone && !isInvincible && !p.deflected) {
          const dist = Math.sqrt((p.x - targetX) ** 2 + (p.y - targetY) ** 2);
          if (dist < p.radius + 8) {
            damagePlayer(p.isGhast ? 2 : 1);
            if (!isFireResistant) {
              setOnFire();
            }
            p.el.remove();
            return;
          }
        }

        if (p.deflected) {
          let hitMob = false;
          mobs.forEach(mob => {
            if (mob.isDefeated || hitMob) return;
            const mx = mob.x + mob.width / 2;
            const my = mob.y + mob.height / 2;
            const dist = Math.sqrt((p.x - mx) ** 2 + (p.y - my) ** 2);
            if (dist < 45) {
              hitMob = true;
              p.el.remove();
              defeatMob(mob);
            }
          });
          if (hitMob) return;
        }

        activeProjectiles.push(p);
      });
      projectiles = activeProjectiles;

      if (isCursorInPlayZone && !isInvincible) {
        let touchedMob = false;
        mobs.forEach(mob => {
          if (mob.isDefeated || touchedMob) return;

          if (targetX >= mob.x && targetX <= mob.x + mob.width &&
            targetY >= mob.y && targetY <= mob.y + mob.height) {
            touchedMob = true;
          }
        });

        if (touchedMob) {
          damagePlayer(1);
          if (!isFireResistant) {
            setOnFire();
          }
        }
      }

      requestAnimationFrame(updateMobs);
    }
    requestAnimationFrame(updateMobs);

    updateUI();
    updateHPBar();

    symbolEl.innerHTML = `<img src="${activeBlock.image}" alt="${activeBlock.name}" style="width: 100%; height: 100%; object-fit: cover; image-rendering: pixelated;" />`;
    nameEl.textContent = activeBlock.name;
    hpFillEl.style.backgroundColor = activeBlock.color;
    hpFillEl.style.boxShadow = `0 0 6px ${activeBlock.color}`;
    cracksEl.className = 'mc-block-cracks';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startAboutPage);
} else {
  startAboutPage();
}
