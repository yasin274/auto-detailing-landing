/**
 * Autoclean — landing page interactions
 * Sections: reveal-on-scroll, trust counter, floating CTA,
 * phone mask, contact form validation, before/after compare sliders.
 */

function initRevealAnimations() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
        if (entry.target.classList.contains('trust-block')) {
          animateTrustCounter();
        }
      }
    });
  }, { threshold: 0.2 });

  reveals.forEach((el) => observer.observe(el));
}

function animateTrustCounter() {
  const counter = document.getElementById('counterTarget');
  if (!counter || counter.dataset.animated) return;
  counter.dataset.animated = 'true';

  const end = 430;
  const duration = 1400;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * end);
    counter.textContent = `${value}+`;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      counter.textContent = `${end}+`;
    }
  }

  requestAnimationFrame(step);
}

function initHeroSpotlight() {
  const hero = document.querySelector('.hero');
  const spotlight = hero ? hero.querySelector('.hero-spotlight') : null;
  if (!hero || !spotlight) return;

  const supportsFineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!supportsFineHover) return;

  let frameRequested = false;
  let pointerX = 0;
  let pointerY = 0;

  const applyPosition = () => {
    frameRequested = false;
    spotlight.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
  };

  hero.addEventListener('mouseenter', (event) => {
    const rect = hero.getBoundingClientRect();
    pointerX = event.clientX - rect.left;
    pointerY = event.clientY - rect.top;
    applyPosition();
    spotlight.classList.add('show');
  });

  hero.addEventListener('mousemove', (event) => {
    const rect = hero.getBoundingClientRect();
    pointerX = event.clientX - rect.left;
    pointerY = event.clientY - rect.top;
    if (!frameRequested) {
      frameRequested = true;
      requestAnimationFrame(applyPosition);
    }
  });

  hero.addEventListener('mouseleave', () => {
    spotlight.classList.remove('show');
  });
}

function initFloatingCta() {
  const floatingCta = document.querySelector('.floating-cta');
  const heroSection = document.querySelector('.hero');
  const contactsSection = document.getElementById('contacts');
  if (!floatingCta || !heroSection || !contactsSection) return;

  let pastHero = false;
  let inContacts = false;

  const updateVisibility = () => {
    if (pastHero && !inContacts) {
      floatingCta.classList.add('show');
    } else {
      floatingCta.classList.remove('show');
    }
  };

  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      pastHero = !entry.isIntersecting;
      updateVisibility();
    });
  }, { threshold: 0.2 });

  const contactsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      inContacts = entry.isIntersecting;
      updateVisibility();
    });
  }, { threshold: 0.2 });

  heroObserver.observe(heroSection);
  contactsObserver.observe(contactsSection);
}

function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (!toggle || !navLinks) return;

  const closeMenu = () => {
    navLinks.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Открыть меню');
    toggle.textContent = '☰';
  };

  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    toggle.textContent = isOpen ? '✕' : '☰';
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

function initPhoneMask() {
  const phoneInput = document.getElementById('phone');
  if (!phoneInput) return;

  const applyPhoneMask = () => {
    let digits = phoneInput.value.replace(/\D/g, '');
    if (digits.startsWith('8')) {
      digits = '7' + digits.slice(1);
    }
    digits = digits.slice(0, 11);

    let formatted = '';
    if (digits.length > 0) {
      formatted = '+7';
      if (digits.length > 1) formatted += ` (${digits.slice(1, 4)}`;
      if (digits.length > 4) formatted += `) ${digits.slice(4, 7)}`;
      if (digits.length > 7) formatted += `-${digits.slice(7, 9)}`;
      if (digits.length > 9) formatted += `-${digits.slice(9, 11)}`;
    }
    phoneInput.value = formatted.replace(/\s+/g, ' ').trim();
  };

  ['input', 'change'].forEach((eventName) => {
    phoneInput.addEventListener(eventName, applyPhoneMask);
  });
  applyPhoneMask();
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  const successMessage = document.getElementById('formSuccess');
  if (!form || !successMessage) return;

  // TODO: placeholder endpoint — replace with the real webhook/CRM/Telegram-bot proxy URL before launch
  const LEAD_WEBHOOK_URL = 'https://webhook.site/your-id';

  const fieldsToValidate = [
    { name: 'name', message: 'Пожалуйста, укажите ваше имя.' },
    { name: 'phone', message: 'Пожалуйста, укажите корректный номер телефона.' }
  ];

  const validateField = (name, message) => {
    const input = form.elements[name];
    const error = form.querySelector(`[data-error-for="${name}"]`);

    if (!input.value.trim()) {
      error.textContent = message;
      return false;
    }

    if (name === 'phone') {
      const rawPhone = input.value.replace(/\D/g, '');
      const normalizedPhone = rawPhone.startsWith('8') ? `7${rawPhone.slice(1)}` : rawPhone;
      if (!/^7\d{10}$/.test(normalizedPhone)) {
        error.textContent = message;
        return false;
      }
    }

    error.textContent = '';
    return true;
  };

  const validateConsent = () => {
    const consent = form.elements['consent'];
    const error = form.querySelector('[data-error-for="consent"]');
    if (!consent.checked) {
      error.textContent = 'Необходимо согласие на обработку персональных данных.';
      return false;
    }
    error.textContent = '';
    return true;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fieldsValid = fieldsToValidate
      .map(({ name, message }) => validateField(name, message))
      .every(Boolean);
    const consentValid = validateConsent();

    if (!fieldsValid || !consentValid) {
      successMessage.textContent = '';
      successMessage.style.color = '';
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Отправка...';
    successMessage.style.color = '';
    successMessage.textContent = '';

    try {
      const response = await fetch(LEAD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.elements['name'].value.trim(),
          phone: form.elements['phone'].value.trim(),
          time: form.elements['time'].value.trim(),
          car: form.elements['car'].value.trim(),
          consent: form.elements['consent'].checked
        })
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      successMessage.style.color = '#8ce6a6';
      successMessage.textContent = 'Спасибо! Мы свяжемся с вами в ближайшее время.';
      form.reset();
    } catch (error) {
      successMessage.style.color = 'var(--error)';
      successMessage.textContent = 'Не удалось отправить заявку. Позвоните нам напрямую: +7 (999) 123-45-67';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
}

/**
 * Draggable before/after compare sliders in the portfolio section.
 * Supports mouse, touch (via Pointer Events), click-to-set and arrow-key control.
 */
function initCompareSliders() {
  const cards = document.querySelectorAll('.portfolio-card[data-compare]');

  cards.forEach((card) => {
    const afterLayer = card.querySelector('.compare-after');
    const handle = card.querySelector('.compare-handle');
    if (!afterLayer || !handle) return;

    let dragging = false;
    let currentPercent = 50;

    const percentFromClientX = (clientX) => {
      const rect = card.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    };

    const setPosition = (percent) => {
      currentPercent = Math.min(100, Math.max(0, percent));
      afterLayer.style.clipPath = `inset(0 0 0 ${currentPercent}%)`;
      handle.style.left = `${currentPercent}%`;
      handle.setAttribute('aria-valuenow', String(Math.round(currentPercent)));
    };

    const endDrag = (event) => {
      dragging = false;
      if (handle.hasPointerCapture(event.pointerId)) {
        handle.releasePointerCapture(event.pointerId);
      }
    };

    handle.addEventListener('pointerdown', (event) => {
      dragging = true;
      handle.setPointerCapture(event.pointerId);
      setPosition(percentFromClientX(event.clientX));
    });

    handle.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      setPosition(percentFromClientX(event.clientX));
    });

    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);

    handle.addEventListener('lostpointercapture', () => {
      dragging = false;
    });

    card.addEventListener('click', (event) => {
      if (event.target === handle || handle.contains(event.target)) return;
      setPosition(percentFromClientX(event.clientX));
    });

    handle.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        setPosition(currentPercent - 5);
        event.preventDefault();
      } else if (event.key === 'ArrowRight') {
        setPosition(currentPercent + 5);
        event.preventDefault();
      }
    });

    handle.setAttribute('tabindex', '0');
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-orientation', 'horizontal');
    handle.setAttribute('aria-valuemin', '0');
    handle.setAttribute('aria-valuemax', '100');
    handle.setAttribute('aria-valuenow', '50');
    handle.setAttribute('aria-label', 'Перетащите, чтобы сравнить "до" и "после"');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initRevealAnimations();
  initHeroSpotlight();
  initFloatingCta();
  initMobileNav();
  initPhoneMask();
  initContactForm();
  initCompareSliders();
});
