(() => {
  /* ============================================================
     1. BACKGROUND IMAGE SEQUENCE SCROLL ENGINE
  ============================================================ */
  const FRAME_COUNT = 300;
  // Versioning (?v=2) guarantees crystal-clear 1080p frames from local cache
  const getFrameUrl = (frameNumber) =>
    `video_image/ezgif-frame-${String(frameNumber).padStart(3, '0')}.jpg?v=2`;

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d', {
    alpha: false
  });

  const images = new Array(FRAME_COUNT);
  const loaded = new Array(FRAME_COUNT).fill(false);

  let targetProgress = 0;
  let currentProgress = 0;
  let displayedFrame = -1;
  let canvasWidth = 0;
  let canvasHeight = 0;

  function handleResize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = Math.round(window.innerWidth * dpr);
    canvasHeight = Math.round(window.innerHeight * dpr);

    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      if (displayedFrame !== -1 && images[displayedFrame] && loaded[displayedFrame]) {
        drawFrame(displayedFrame);
      }
    }
  }

  function drawFrame(index) {
    let img = images[index];

    // Fallback to nearest loaded frame
    if (!img || !loaded[index]) {
      let nearestIndex = -1;
      let minDistance = Infinity;

      for (let i = 0; i < FRAME_COUNT; i++) {
        if (loaded[i] && images[i]) {
          const dist = Math.abs(i - index);
          if (dist < minDistance) {
            minDistance = dist;
            nearestIndex = i;
          }
        }
      }

      if (nearestIndex !== -1) {
        img = images[nearestIndex];
      } else {
        return;
      }
    }

    const imgWidth = img.naturalWidth || 1920;
    const imgHeight = img.naturalHeight || 1080;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Object-fit: cover scaling
    const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
    const drawWidth = Math.round(imgWidth * scale);
    const drawHeight = Math.round(imgHeight * scale);
    const drawX = Math.round((canvasWidth - drawWidth) / 2);
    const drawY = Math.round((canvasHeight - drawHeight) / 2);

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    displayedFrame = index;
  }

  function getScrollPosition() {
    return window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
  }

  function getMaxScroll() {
    const docHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );
    return Math.max(docHeight - window.innerHeight, 1);
  }

  function updateScrollTarget() {
    const scrollY = getScrollPosition();
    const maxScroll = getMaxScroll();
    targetProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
  }

  function preloadImages() {
    // Immediate frame 1 load
    const firstImg = new Image();
    firstImg.src = getFrameUrl(1);
    images[0] = firstImg;

    const onFirstLoad = () => {
      loaded[0] = true;
      if (displayedFrame === -1) {
        drawFrame(0);
      }
    };

    firstImg.onload = onFirstLoad;
    if (firstImg.decode) {
      firstImg.decode().then(onFirstLoad).catch(onFirstLoad);
    }

    // Preload remaining frames concurrently
    for (let i = 1; i < FRAME_COUNT; i++) {
      const img = new Image();
      const frameNum = i + 1;
      img.src = getFrameUrl(frameNum);
      images[i] = img;

      const onLoad = () => {
        loaded[i] = true;
      };

      img.onload = onLoad;
      if (img.decode) {
        img.decode().then(onLoad).catch(onLoad);
      }
    }
  }

  function renderAnimation() {
    const lerpFactor = 0.12;
    const delta = targetProgress - currentProgress;

    if (Math.abs(delta) > 0.00005) {
      currentProgress += delta * lerpFactor;
    } else {
      currentProgress = targetProgress;
    }

    const targetFrameIndex = Math.min(
      FRAME_COUNT - 1,
      Math.max(0, Math.round(currentProgress * (FRAME_COUNT - 1)))
    );

    if (targetFrameIndex !== displayedFrame) {
      drawFrame(targetFrameIndex);
    }

    requestAnimationFrame(renderAnimation);
  }

  /* ============================================================
     2. DYNAMIC HERO TYPEWRITER
  ============================================================ */
  const roles = [
    'Full Stack Web Apps',
    'Python & Django Solutions',
    'Generative AI Innovations',
    'Java Backend Systems'
  ];
  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  const typeElement = document.getElementById('roleTypewriter');

  function typeRole() {
    if (!typeElement) return;
    const currentWord = roles[roleIdx];

    if (isDeleting) {
      typeElement.textContent = currentWord.substring(0, charIdx - 1);
      charIdx--;
    } else {
      typeElement.textContent = currentWord.substring(0, charIdx + 1);
      charIdx++;
    }

    let typeSpeed = isDeleting ? 45 : 90;

    if (!isDeleting && charIdx === currentWord.length) {
      typeSpeed = 2000; // Pause at end of word
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      typeSpeed = 400; // Pause before typing next word
    }

    setTimeout(typeRole, typeSpeed);
  }

  /* ============================================================
     3. ANIMATED NUMBER COUNTERS (Intersection Observer)
  ============================================================ */
  const counters = document.querySelectorAll('.counter');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const duration = 1500; // ms
      const startTime = performance.now();

      function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentVal = Math.floor(progress * target);
        counter.textContent = currentVal;

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          counter.textContent = target;
        }
      }

      requestAnimationFrame(updateNumber);
    });
  }

  const statCards = document.querySelector('.stat-card');
  if (statCards && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });
    observer.observe(statCards);
  } else {
    animateCounters();
  }

  /* ============================================================
     4. INTERACTIVE CONTACT FORM
  ============================================================ */
  const contactForm = document.getElementById('contactForm');
  const formAlert = document.getElementById('formAlert');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('userName').value.trim();
      const email = document.getElementById('userEmail').value.trim();
      const message = document.getElementById('message').value.trim();

      if (!name || !email || !message) {
        contactForm.classList.add('was-validated');
        return;
      }

      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Sending...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check me-2"></i> Sent!';

        if (formAlert) {
          formAlert.classList.remove('d-none');
        }

        contactForm.reset();
        contactForm.classList.remove('was-validated');

        setTimeout(() => {
          submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i> Send Message';
          if (formAlert) formAlert.classList.add('d-none');
        }, 5000);
      }, 1000);
    });
  }

  /* ============================================================
     5. INITIALIZE & EVENT LISTENERS
  ============================================================ */
  window.addEventListener('resize', handleResize, { passive: true });
  window.addEventListener('scroll', updateScrollTarget, { passive: true });
  document.addEventListener('scroll', updateScrollTarget, { passive: true });
  window.addEventListener('wheel', () => requestAnimationFrame(updateScrollTarget), { passive: true });

  // Close mobile navbar on click
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  const navbarCollapse = document.getElementById('navbarContent');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navbarCollapse && navbarCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) bsCollapse.hide();
      }
    });
  });

  // Dynamic Scroll Active Nav Highlighting
  const sections = document.querySelectorAll('section[id]');
  function updateActiveNav() {
    const scrollPos = getScrollPosition() + 150;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });

  handleResize();
  preloadImages();
  updateScrollTarget();
  requestAnimationFrame(renderAnimation);
  typeRole();
})();
