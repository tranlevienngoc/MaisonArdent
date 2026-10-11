(() => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ========================================================
     1. CINEMATIC LOADER
     ======================================================== */
  window.addEventListener('load', () => {
    setTimeout(() => {
      const loader = $('.loader');
      if (loader) loader.classList.add('is-gone');
    }, reducedMotion ? 50 : 800);
  });

  /* ========================================================
     2. SCROLL PROGRESS & HERO DYNAMICS
     ======================================================== */
  const progress = $('.scroll-progress span');
  const heroImage = $('.hero__image');
  const closingImage = $('.closing img');
  const heroSection = $('.hero');

  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress && max > 0) {
      progress.style.transform = `scaleX(${window.scrollY / max})`;
    }
    if (!reducedMotion && heroImage && window.scrollY < window.innerHeight * 1.2) {
      heroImage.style.transform = `scale(1.04) translateY(${window.scrollY * 0.12}px)`;
    }
    if (!reducedMotion && closingImage) {
      const rect = closingImage.parentElement.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        closingImage.style.transform = `translateY(${rect.top * -0.03}px)`;
      }
    }
  };
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  // Mouse glint over hero bottle
  if (heroSection && matchMedia('(pointer: fine)').matches) {
    heroSection.addEventListener('pointermove', e => {
      const rect = heroSection.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      heroSection.style.setProperty('--mouse-x', `${x}%`);
      heroSection.style.setProperty('--mouse-y', `${y}%`);
    });
  }

  /* ========================================================
     3. REVEAL ANIMATIONS (INTERSECTION OBSERVER)
     ======================================================== */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.04, rootMargin: '0px 0px 80px 0px' });
  $$('.reveal, .reveal-image').forEach(el => revealObserver.observe(el));

  /* ========================================================
     4. ATMOSPHERIC SOUNDSCAPE SYNTHESIZER (WEB AUDIO API)
     ======================================================== */
  let audioCtx = null;
  let masterGain = null;
  let isAudioPlaying = false;
  let oscillators = [];

  const startAtmosphereAudio = () => {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);

    // Warm, deep harmonic drone (55Hz sub, 110Hz octave, 165Hz fifth)
    const freqs = [55, 110, 164.81];
    oscillators = freqs.map((freq, index) => {
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = index === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(index === 0 ? 180 : 320, audioCtx.currentTime);

      // Subtle detune drift for warm organic vibration
      osc.detune.setValueAtTime((index - 1) * 3, audioCtx.currentTime);

      oscGain.gain.setValueAtTime(index === 0 ? 0.35 : 0.18, audioCtx.currentTime);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();
      return osc;
    });

    // Gentle fade in
    masterGain.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 2.5);
    isAudioPlaying = true;
    updateAudioUI(true);
  };

  const stopAtmosphereAudio = () => {
    if (!masterGain || !audioCtx) return;
    masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
    setTimeout(() => {
      oscillators.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch (e) {}
      });
      oscillators = [];
      isAudioPlaying = false;
      updateAudioUI(false);
    }, 1200);
  };

  const updateAudioUI = playing => {
    $$('.audio-toggle').forEach(btn => {
      btn.setAttribute('aria-pressed', String(playing));
      const label = $('.audio-label', btn);
      if (label) label.textContent = playing ? 'Atmosphere · On' : 'Atmosphere';
    });
    $$('.audio-toggle-mobile .audio-label').forEach(label => {
      label.textContent = playing ? 'Atmosphere: Playing' : 'Atmosphere: Off';
    });
  };

  const toggleAtmosphereAudio = () => {
    if (!isAudioPlaying) {
      startAtmosphereAudio();
    } else {
      stopAtmosphereAudio();
    }
  };

  $$('.audio-toggle, .audio-toggle-mobile').forEach(btn => {
    btn.addEventListener('click', toggleAtmosphereAudio);
  });

  /* ========================================================
     5. SCROLLYTELLING OLFACTORY PYRAMID
     ======================================================== */
  const notes = $('.notes');
  const layers = $$('.notes__visual-layer');
  const timelineSteps = $$('.notes__step');
  const timelineFill = $('.notes__timeline-fill');
  const movementNameEl = $('.movement-name');

  const movementLabels = [
    'The First Impression · 00—20 min',
    'The Identity · 20 min—4 hr',
    'The Memory · 4—12+ hr'
  ];

  const setMovement = index => {
    if (!notes) return;
    notes.dataset.active = String(index);

    // Crossfade visual layers
    layers.forEach((layer, i) => {
      layer.classList.toggle('is-active', i === Number(index));
    });

    // Update timeline steps
    timelineSteps.forEach((step, i) => {
      step.classList.toggle('is-active', i === Number(index));
    });

    // Update timeline progress bar fill
    if (timelineFill) {
      timelineFill.style.transform = `translateX(${Number(index) * 100}%)`;
    }

    // Update movement text tag
    if (movementNameEl && movementLabels[index]) {
      movementNameEl.textContent = movementLabels[index];
    }
  };

  const notePanels = $$('.note-panel');
  const noteObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const noteIdx = entry.target.dataset.note;
        setMovement(noteIdx);
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });

  notePanels.forEach(panel => noteObserver.observe(panel));
  setMovement(0);

  // Timeline step navigation clicks
  timelineSteps.forEach(step => {
    step.addEventListener('click', () => {
      const stepIdx = step.dataset.step;
      const targetPanel = $(`#note-movement-${stepIdx}`);
      if (targetPanel) {
        targetPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  /* ========================================================
     6. INTERACTIVE NOTE ACCORD DRAWERS
     ======================================================== */
  $$('.accord-header').forEach(button => {
    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isExpanded));
    });
  });

  /* ========================================================
     7. DISCOVERY SET VIAL SELECTOR
     ======================================================== */
  const vialTabs = $$('.vial-tab');
  const vialDesc = $('#vial-desc');

  const vialData = [
    {
      name: 'Lueur No. 01',
      desc: '<strong>Lueur No. 01:</strong> Saffron, Grasse Rose Centifolia, Florentine Orris & Smoked Wild Oud.'
    },
    {
      name: 'Ambre Fumé',
      desc: '<strong>Ambre Fumé:</strong> Somalian Frankincense, Aged Benzoin, Labdanum, and Dried Black Iris.'
    },
    {
      name: 'Bois Céleste',
      desc: '<strong>Bois Céleste:</strong> Atlas Cedar Heartwood, Bitter Bergamot, Smoked Vetiver, and Soft Suede.'
    }
  ];

  vialTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const idx = Number(tab.dataset.vial);
      vialTabs.forEach(t => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });
      if (vialDesc && vialData[idx]) {
        vialDesc.innerHTML = `<p>${vialData[idx].desc}</p>`;
      }
    });
  });

  /* ========================================================
     8. SERVICE NOTES & ENGRAVING ACCORDION
     ======================================================== */
  $$('.service-notes > button').forEach(button => {
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
    });
  });

  /* ========================================================
     9. COMMERCE STATE & BAG DRAWER (PROGRESSIVE COMMERCE)
     ======================================================== */
  let selection = {
    name: 'Lueur No. 01',
    variant: '50 ml',
    price: 250,
    image: 'assets/hero.jpg',
    engraving: ''
  };

  // Size volume change
  $$('input[name="size"]').forEach(input => {
    input.addEventListener('change', () => {
      selection.variant = input.value;
      selection.price = Number(input.dataset.price);
      const priceDisplay = $('.product-price');
      if (priceDisplay) priceDisplay.textContent = `€${selection.price}`;
    });
  });

  // Engraving input listener
  const engravingInput = $('#engraving-input');
  if (engravingInput) {
    engravingInput.addEventListener('input', e => {
      selection.engraving = e.target.value.trim().toUpperCase();
    });
  }

  const cart = $('.cart');
  const overlay = $('.cart-overlay');
  let lastFocus = null;

  const openCart = () => {
    lastFocus = document.activeElement;
    cart.classList.add('is-open');
    overlay.classList.add('is-open');
    cart.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    $('[data-cart-close]', cart)?.focus();
  };

  const closeCart = () => {
    cart.classList.remove('is-open');
    overlay.classList.remove('is-open');
    cart.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    lastFocus?.focus();
  };

  $$('.bag-trigger').forEach(btn => btn.addEventListener('click', openCart));
  $$('[data-cart-close]').forEach(btn => btn.addEventListener('click', closeCart));

  const renderCart = added => {
    const emptyState = $('.cart__empty');
    const itemRow = $('.cart__item');
    const samplePerk = $('.cart__sample-perk');
    const footer = $('.cart__footer');

    if (emptyState) emptyState.hidden = added;
    if (itemRow) itemRow.hidden = !added;
    if (footer) footer.hidden = !added;

    // Show complimentary 2ml sample only for full-size fragrance orders
    const isFullSize = selection.price > 30;
    if (samplePerk) samplePerk.hidden = !added || !isFullSize;

    $$('.bag-count').forEach(el => {
      el.textContent = added ? '(1)' : '(0)';
      el.setAttribute('aria-label', `${added ? 1 : 0} items`);
    });

    if (added) {
      $('#cart-item-name').textContent = selection.name;
      $('#cart-item-variant').textContent = selection.variant;
      $('#cart-item-price').textContent = `€${selection.price}`;
      $('.cart__subtotal').textContent = `€${selection.price}`;
      $('#cart-item-img').src = selection.image;

      const engravingTag = $('#cart-item-engraving');
      if (engravingTag) {
        if (selection.engraving && isFullSize) {
          engravingTag.textContent = `Travertine Engraving: "${selection.engraving}"`;
          engravingTag.hidden = false;
        } else {
          engravingTag.hidden = true;
        }
      }
    }
  };

  // Add Full Flacon to Bag
  const addToBagBtn = $('#add-to-bag-button');
  if (addToBagBtn) {
    addToBagBtn.addEventListener('click', () => {
      const selectedSize = $('input[name="size"]:checked');
      selection = {
        name: 'Lueur No. 01',
        variant: selectedSize ? selectedSize.value : '50 ml',
        price: selectedSize ? Number(selectedSize.dataset.price) : 250,
        image: 'assets/hero.jpg',
        engraving: engravingInput ? engravingInput.value.trim().toUpperCase() : ''
      };
      renderCart(true);
      openCart();
    });
  }

  // Remove Item
  $('.remove-item')?.addEventListener('click', () => renderCart(false));

  // Add Discovery Set to Bag
  $('#add-discovery-set-button')?.addEventListener('click', e => {
    e.preventDefault();
    selection = {
      name: 'Discovery Set (3 × 2 ml)',
      variant: 'Extrait Sampler Set',
      price: 30,
      image: 'assets/discovery_set.jpg',
      engraving: ''
    };
    renderCart(true);
    openCart();
  });

  /* ========================================================
     10. CHECKOUT MODAL RITUAL
     ======================================================== */
  const checkoutModal = $('#checkout-modal');
  const checkoutBtn = $('.checkout-button');

  if (checkoutBtn && checkoutModal) {
    checkoutBtn.addEventListener('click', () => {
      closeCart();
      $('#modal-summary-name').textContent = `${selection.name} (${selection.variant})${selection.engraving ? ' · Engraved [' + selection.engraving + ']' : ''}`;
      $('#modal-summary-price').textContent = `€${selection.price}`;
      checkoutModal.classList.add('is-open');
      checkoutModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
    });

    const closeCheckoutModal = () => {
      checkoutModal.classList.remove('is-open');
      checkoutModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
    };

    $('.checkout-modal__close')?.addEventListener('click', closeCheckoutModal);
    $('.checkout-modal__overlay')?.addEventListener('click', closeCheckoutModal);
    $('.checkout-modal__dismiss')?.addEventListener('click', closeCheckoutModal);
  }

  /* ========================================================
     11. KEYBOARD & MOBILE MENU HANDLING
     ======================================================== */
  const menuButton = $('.menu-trigger');
  const mobileMenu = $('.mobile-menu');

  const closeMenu = () => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenu.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
  };

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      mobileMenu.setAttribute('aria-hidden', String(open));
      mobileMenu.classList.toggle('is-open', !open);
      document.body.classList.toggle('no-scroll', !open);
    });
    $$('.mobile-menu a').forEach(link => link.addEventListener('click', closeMenu));
  }

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeCart();
      closeMenu();
      if (checkoutModal) {
        checkoutModal.classList.remove('is-open');
        checkoutModal.setAttribute('aria-hidden', 'true');
      }
    }
  });

  /* ========================================================
     12. NEWSLETTER FEEDBACK
     ======================================================== */
  $('#newsletter-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const formMsg = $('.form-message');
    if (formMsg) formMsg.textContent = 'Welcome to the Maison. You will receive private announcements in due course.';
    e.currentTarget.reset();
  });

  /* ========================================================
     13. CUSTOM CURSOR
     ======================================================== */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cursor = $('.cursor');
    if (cursor) {
      window.addEventListener('pointermove', e => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
      });
      $$('.product__image, .interlude__image, .closing, .sampling__visual, .notes__visual').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
      });
    }
  }
})();
