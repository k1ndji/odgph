/* =========================================================
   ODGPH — Interactions
   ========================================================= */
(function () {
  'use strict';

  const root = document.documentElement;
  const store = {
    get(key, fallback) {
      try { return localStorage.getItem('odgph.' + key) ?? fallback; }
      catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('odgph.' + key, value); } catch { /* stockage indisponible */ }
    },
  };

  /* ---------- Année ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- En-tête au défilement ---------- */
  const header = document.querySelector('.header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Menu mobile ---------- */
  const drawer = document.querySelector('.drawer');
  const navToggle = document.querySelector('.nav-toggle');
  const drawerClose = document.querySelector('.drawer__close');
  let lastFocus = null;

  function openDrawer() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.hidden = false;
    drawer.setAttribute('open', '');
    navToggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    drawerClose?.focus();
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.removeAttribute('open');
    drawer.hidden = true;
    navToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (lastFocus instanceof HTMLElement) lastFocus.focus();
  }

  navToggle?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  drawer?.querySelector('.drawer__scrim')?.addEventListener('click', closeDrawer);
  drawer?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeDrawer));

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (drawer?.hasAttribute('open')) { closeDrawer(); return; }
    if (a11yPanel?.classList.contains('is-open')) closeA11yPanel();
  });

  /* ---------- Panneau d'accessibilité ---------- */
  const a11yPanel = document.getElementById('a11y-panel');
  let lastA11yTrigger = null;

  const a11yMarkup = `
    <div class="a11y-panel__head">
      <h2 id="a11y-title">Confort de lecture</h2>
      <button type="button" class="a11y-panel__close" data-a11y-close aria-label="Fermer le panneau d'accessibilité">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>
    <div class="a11y-group">
      <span class="a11y-group__label" id="a11y-size-label">Taille du texte</span>
      <div class="a11y-row" role="group" aria-labelledby="a11y-size-label">
        <button type="button" class="a11y-chip" data-textsize="base" aria-pressed="false">A</button>
        <button type="button" class="a11y-chip" data-textsize="lg" aria-pressed="false">A+</button>
        <button type="button" class="a11y-chip" data-textsize="xl" aria-pressed="false">A++</button>
      </div>
    </div>
    <div class="a11y-group">
      <span class="a11y-group__label">Affichage</span>
      <div class="a11y-row">
        <button type="button" class="a11y-chip" data-toggle="contrast" aria-pressed="false">Contraste</button>
        <button type="button" class="a11y-chip" data-toggle="spacing" aria-pressed="false">Espacement</button>
      </div>
      <div class="a11y-row">
        <button type="button" class="a11y-chip" data-toggle="underline" aria-pressed="false">Souligner les liens</button>
        <button type="button" class="a11y-chip" data-toggle="motion" aria-pressed="false">Réduire les animations</button>
      </div>
    </div>
    <button type="button" class="btn btn--outline btn--sm a11y-reset" data-a11y-reset>Réinitialiser</button>
  `;

  if (a11yPanel) a11yPanel.innerHTML = a11yMarkup;

  function applyTextSize(size) {
    root.dataset.textsize = size;
    store.set('textsize', size);
    a11yPanel?.querySelectorAll('[data-textsize]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.textsize === size));
    });
  }

  const toggles = {
    contrast: 'high-contrast',
    spacing: 'spacing-loose',
    underline: 'underline-links',
    motion: 'reduce-motion',
  };

  function applyToggle(name, on) {
    root.classList.toggle(toggles[name], on);
    store.set(name, on ? '1' : '0');
    a11yPanel?.querySelector(`[data-toggle="${name}"]`)?.setAttribute('aria-pressed', String(on));
  }

  function openA11yPanel(trigger) {
    if (!a11yPanel) return;
    lastA11yTrigger = trigger instanceof HTMLElement ? trigger : document.activeElement;
    a11yPanel.classList.add('is-open');
    document.querySelectorAll('[data-open-a11y]').forEach((el) => el.setAttribute('aria-expanded', 'true'));
    a11yPanel.querySelector('button')?.focus();
  }

  function closeA11yPanel() {
    if (!a11yPanel) return;
    a11yPanel.classList.remove('is-open');
    document.querySelectorAll('[data-open-a11y]').forEach((el) => el.setAttribute('aria-expanded', 'false'));
    if (lastA11yTrigger instanceof HTMLElement) lastA11yTrigger.focus();
  }

  if (a11yPanel) {
    document.querySelectorAll('[data-open-a11y]').forEach((trigger) => {
      trigger.setAttribute('aria-controls', 'a11y-panel');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.addEventListener('click', () => {
        a11yPanel.classList.contains('is-open') ? closeA11yPanel() : openA11yPanel(trigger);
      });
    });
    a11yPanel.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('[data-a11y-close]')) { closeA11yPanel(); return; }
      if (target.closest('[data-a11y-reset]')) {
        applyTextSize('base');
        Object.keys(toggles).forEach((name) => applyToggle(name, false));
        return;
      }
      const sizeBtn = target.closest('[data-textsize]');
      if (sizeBtn) { applyTextSize(sizeBtn.dataset.textsize); return; }
      const toggleBtn = target.closest('[data-toggle]');
      if (toggleBtn) {
        const name = toggleBtn.dataset.toggle;
        applyToggle(name, !root.classList.contains(toggles[name]));
      }
    });

    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!a11yPanel.classList.contains('is-open')) return;
      if (a11yPanel.contains(target) || target.closest('[data-open-a11y]')) return;
      closeA11yPanel();
    });
  }

  /* Restauration des préférences */
  const savedSize = store.get('textsize', 'base');
  if (a11yPanel) applyTextSize(savedSize);
  Object.keys(toggles).forEach((name) => {
    if (store.get(name, '0') === '1') applyToggle(name, true);
  });

  /* ---------- Révélation au défilement ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Compteurs ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const animate = (el) => {
      const target = Number(el.dataset.count || 0);
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || root.classList.contains('reduce-motion');
      if (reduce) { el.textContent = target.toLocaleString('fr-FR') + suffix; return; }
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased).toLocaleString('fr-FR') + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => counterObserver.observe(el));
  }

  /* ---------- Carrousel de témoignages (défilement natif) ---------- */
  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('[data-carousel-track]');
    const prev = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    if (!track) return;
    const step = () => {
      const card = track.querySelector(':scope > *');
      return card ? card.getBoundingClientRect().width + 20 : 320;
    };
    prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  });

  /* ---------- Formulaires ----------
     Pour activer les envois : créez un formulaire sur https://formspree.io
     puis collez son URL ci-dessous. Guide complet : FORMULAIRES.md.
     Tant que cette constante est vide, le site reste en mode démonstration
     et affiche un message explicite au visiteur : aucune donnée n'est envoyée. */
  const FORM_ENDPOINT = ''; // ex. 'https://formspree.io/f/abcdwxyz'

  const FORM_LABELS = {
    contact: 'Contact',
    don: 'Promesse de don',
    newsletter: 'Newsletter',
  };

  const DEMO_MESSAGES = {
    contact: `Formulaire de démonstration : l'envoi n'est pas encore activé. Écrivez-nous à odgph.org@gmail.com.`,
    don: `Formulaire de démonstration : votre promesse de don n'a pas été envoyée. Écrivez-nous à odgph.org@gmail.com.`,
    newsletter: `Formulaire de démonstration : l'inscription à la lettre n'est pas encore activée. Écrivez-nous à odgph.org@gmail.com.`,
  };

  document.querySelectorAll('[data-form]').forEach((form) => {
    const success = form.parentElement?.querySelector('.form__success') || form.querySelector('.form__success');
    const successText = success?.querySelector('[data-success-text]') || success;
    const successMessage = successText?.textContent.trim() || 'Merci ! Votre message a bien été envoyé.';
    const submit = form.querySelector('[type="submit"]');
    const submitLabel = submit ? submit.innerHTML : '';
    const kind = form.dataset.form || 'contact';

    const showNotice = (message, state) => {
      if (!success) return;
      if (successText) successText.textContent = message;
      success.classList.remove('is-demo', 'is-error');
      if (state === 'demo') success.classList.add('is-demo');
      if (state === 'error') success.classList.add('is-error');
      success.classList.add('is-visible');
      success.setAttribute('tabindex', '-1');
      success.focus();
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      let valid = true;
      form.querySelectorAll('[required]').forEach((field) => {
        const error = form.querySelector(`[data-error-for="${field.id}"]`);
        const message = field.type === 'checkbox' && !field.checked
          ? 'Merci de cocher cette case pour continuer.'
          : !field.value.trim()
            ? 'Merci de remplir ce champ.'
            : field.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(field.value)
              ? 'Merci de saisir une adresse électronique valide.'
              : '';
        if (message) {
          valid = false;
          field.setAttribute('aria-invalid', 'true');
          if (error) { error.textContent = message; error.hidden = false; }
        } else {
          field.removeAttribute('aria-invalid');
          if (error) { error.textContent = ''; error.hidden = true; }
        }
      });
      if (!valid) {
        form.querySelector('[aria-invalid="true"]')?.focus();
        return;
      }

      if (!FORM_ENDPOINT) {
        showNotice(DEMO_MESSAGES[kind] || DEMO_MESSAGES.contact, 'demo');
        return;
      }

      const data = new FormData(form);
      data.set('_subject', `Site ODGPH — ${FORM_LABELS[kind] || kind}`);
      data.set('formulaire', FORM_LABELS[kind] || kind);

      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Envoi en cours…';
      }

      try {
        const response = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        form.reset();
        showNotice(successMessage, 'success');
      } catch {
        showNotice(`L'envoi a échoué. Vérifiez votre connexion ou écrivez-nous à odgph.org@gmail.com.`, 'error');
      } finally {
        if (submit) { submit.disabled = false; submit.innerHTML = submitLabel; }
      }
    });
  });

  /* ---------- Montant de don personnalisé ---------- */
  const customAmount = document.querySelector('#don-libre');
  if (customAmount) {
    customAmount.addEventListener('input', () => {
      document.querySelectorAll('input[name="montant"]').forEach((radio) => { radio.checked = false; });
    });
  }
})();
