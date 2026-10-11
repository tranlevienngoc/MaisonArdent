(() => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.addEventListener('load', () => {
    setTimeout(() => $('.loader')?.classList.add('is-gone'), reducedMotion ? 0 : 700);
  });

  const progress = $('.scroll-progress span');
  const heroImage = $('.hero__image');
  const closingImage = $('.closing img');
  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    if (!reducedMotion && heroImage && scrollY < innerHeight * 1.2) {
      heroImage.style.transform = `scale(1.04) translateY(${scrollY * .12}px)`;
    }
    if (!reducedMotion && closingImage) {
      const rect = closingImage.parentElement.getBoundingClientRect();
      if (rect.top < innerHeight && rect.bottom > 0) closingImage.style.transform = `translateY(${rect.top * -.025}px)`;
    }
  };
  addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .14 });
  $$('.reveal, .reveal-image').forEach(el => revealObserver.observe(el));

  const notes = $('.notes');
  const noteObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) notes.dataset.active = entry.target.dataset.note;
    });
  }, { rootMargin: '-42% 0px -42% 0px' });
  $$('.note-panel').forEach(panel => noteObserver.observe(panel));
  notes.dataset.active = '0';

  const menuButton = $('.menu-trigger');
  const mobileMenu = $('.mobile-menu');
  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenu.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
  };
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mobileMenu.setAttribute('aria-hidden', String(open));
    mobileMenu.classList.toggle('is-open', !open);
    document.body.classList.toggle('no-scroll', !open);
  });
  $$('.mobile-menu a').forEach(link => link.addEventListener('click', closeMenu));

  $$('.service-notes > button').forEach(button => {
    button.addEventListener('click', () => {
      button.setAttribute('aria-expanded', String(button.getAttribute('aria-expanded') !== 'true'));
    });
  });

  let selection = { name: 'Lueur No. 01', variant: '50 ml', price: 250 };
  $$('input[name="size"]').forEach(input => {
    input.addEventListener('change', () => {
      selection.variant = input.value;
      selection.price = Number(input.dataset.price);
      $('.product-price').textContent = `€${selection.price}`;
    });
  });

  const cart = $('.cart');
  const overlay = $('.cart-overlay');
  let lastFocus = null;
  const openCart = () => {
    lastFocus = document.activeElement;
    cart.classList.add('is-open');
    overlay.classList.add('is-open');
    cart.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    $('[data-cart-close]', cart).focus();
  };
  const closeCart = () => {
    cart.classList.remove('is-open');
    overlay.classList.remove('is-open');
    cart.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    lastFocus?.focus();
  };
  $$('.bag-trigger').forEach(button => button.addEventListener('click', openCart));
  $$('[data-cart-close]').forEach(button => button.addEventListener('click', closeCart));
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeCart(); closeMenu(); }
    if (e.key === 'Tab' && cart.classList.contains('is-open')) {
      const focusable = $$('button, a, input:not([disabled])', cart).filter(el => !el.closest('[hidden]'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  const renderCart = added => {
    $('.cart__empty').hidden = added;
    $('.cart__item').hidden = !added;
    $('.cart__footer').hidden = !added;
    $$('.bag-count').forEach(el => { el.textContent = added ? '(1)' : '(0)'; el.setAttribute('aria-label', `${added ? 1 : 0} items`); });
    if (added) {
      $('.cart__item h3').textContent = selection.name;
      $('.cart__variant').textContent = selection.variant;
      $('.cart__price').textContent = `€${selection.price}`;
      $('.cart__subtotal').textContent = `€${selection.price}`;
    }
  };
  $('.add-button').addEventListener('click', () => {
    const selectedSize = $('input[name="size"]:checked');
    selection = { name: 'Lueur No. 01', variant: selectedSize.value, price: Number(selectedSize.dataset.price) };
    renderCart(true);
    openCart();
  });
  $('.remove-item').addEventListener('click', () => renderCart(false));
  $('[data-sample]').addEventListener('click', e => {
    e.preventDefault();
    selection = { name: 'Discovery Set', variant: '3 × 2 ml', price: 30 };
    renderCart(true);
    openCart();
  });

  $('.checkout-button').addEventListener('click', e => {
    const label = e.currentTarget.firstChild;
    label.textContent = 'Checkout available at launch ';
    e.currentTarget.disabled = true;
  });

  $('#newsletter-form').addEventListener('submit', e => {
    e.preventDefault();
    $('.form-message').textContent = 'Welcome to the Maison.';
    e.currentTarget.reset();
  });

  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cursor = $('.cursor');
    addEventListener('pointermove', e => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });
    $$('.product__image, .interlude__image, .closing').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
    });
  }
})();
