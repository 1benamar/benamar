// BENAMAR · interacción: cabecera, menú, relojes de los tres mundos, ajuste de los nombres de país,
// país del proyecto en el formulario y envío (contact.php, con alternativa por WhatsApp o email).
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const lang = () => root.lang || 'es';
  const T = (m) => (m && (m[lang()] ?? m.es)) || '';
  const safe = (fn, name) => { try { fn(); } catch (e) { console.error('[benamar] ' + name, e); } };

  /* Cabecera: línea inferior al bajar */
  function initHeader() {
    const hdr = $('[data-hdr]');
    if (!hdr) return;
    const on = () => hdr.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', on, { passive: true });
    on();
  }

  /* Menú a pantalla completa (tableta y móvil) */
  function initMenu() {
    const btn = $('[data-menu-btn]');
    const menu = $('#menu');
    if (!btn || !menu) return;
    const set = (open) => {
      btn.setAttribute('aria-expanded', String(open));
      menu.hidden = !open;
      root.classList.toggle('menu-open', open);
      if (open) menu.querySelector('a, button')?.focus({ preventScroll: true });
    };
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) { set(false); btn.focus(); }
    });
    window.matchMedia('(min-width: 1180px)').addEventListener('change', (e) => { if (e.matches) set(false); });
  }

  /* Desplegable de idiomas con banderas */
  function initLangs() {
    const dd = $('[data-lang-dd]');
    if (!dd) return;
    const btn = $('[data-lang-dd-btn]', dd);
    const list = $('[data-lang-dd-list]', dd);
    const set = (open) => {
      dd.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    };
    const sync = () => {
      const l = lang().slice(0, 2);
      $('[data-lang-dd-flag]', dd).setAttribute('href', '#flag-' + l);
      $('[data-lang-dd-code]', dd).textContent = l.toUpperCase();
    };
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      set(open);
      if (open) ($('[aria-pressed="true"]', list) || $('button', list)).focus({ preventScroll: true });
    });
    list.addEventListener('click', (e) => { if (e.target.closest('[data-lang]')) { set(false); btn.focus({ preventScroll: true }); } });
    list.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const items = $('button', list);
      const i = items.indexOf(document.activeElement);
      items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
    });
    document.addEventListener('click', (e) => { if (!dd.contains(e.target)) set(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && dd.classList.contains('is-open')) { set(false); btn.focus(); } });
    document.addEventListener('langchange', sync);
    sync();
  }

  /* Entradas al bajar: cada bloque marcado con data-reveal aparece una vez */
  function initReveal() {
    const els = $$('[data-reveal]');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    els.forEach((el) => io.observe(el));
  }

  /* Cifras que cuentan hasta su valor cuando aparecen */
  function initCount() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    $$('[data-count]').forEach((el) => {
      const end = Number(el.dataset.count);
      const host = el.closest('[data-reveal]');
      if (!host || !Number.isFinite(end)) return;
      el.textContent = '0';
      const run = () => {
        const dur = 1300;
        const t0 = performance.now();
        const step = (t) => {
          const k = Math.min(1, (t - t0) / dur);
          el.textContent = String(Math.round(end * (1 - Math.pow(1 - k, 3))));
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        setTimeout(() => { el.textContent = String(end); }, dur + 400); // por si la pestaña no pinta
      };
      if (host.classList.contains('is-in')) { setTimeout(run, 250); return; }
      const mo = new MutationObserver(() => { if (host.classList.contains('is-in')) { mo.disconnect(); setTimeout(run, 250); } });
      mo.observe(host, { attributes: true, attributeFilter: ['class'] });
    });
  }

  /* Barra: marca la sección en la que se está y, sin línea de tiempo de scroll, mueve el avance */
  function initSpy() {
    const nav = $('.hdr__nav');
    const ind = nav && $('.hdr__ind', nav);
    if (!ind) return;
    const place = (a) => {
      if (!a || !a.offsetWidth) { nav.style.setProperty('--o', '0'); return; }
      nav.style.setProperty('--x', a.offsetLeft + 'px');
      nav.style.setProperty('--w', a.offsetWidth + 'px');
      nav.style.setProperty('--o', '1');
    };
    const pairs = $$('a[href^="#"]', nav).map((a) => [a, $(a.getAttribute('href'))]).filter(([, s]) => s);
    let current = $('a[aria-current]', nav);
    const update = () => {
      if (pairs.length) {
        const y = window.innerHeight * 0.38;
        let hit = null;
        pairs.forEach(([a, s]) => { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) hit = a; });
        if (hit !== current) {
          pairs.forEach(([a]) => a.removeAttribute('aria-current'));
          if (hit) hit.setAttribute('aria-current', 'location');
          current = hit;
        }
      }
      place(current);
    };
    const bar = $('.hdr__progress');
    const timeline = window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()');
    const progress = () => {
      if (!bar || timeline) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty('--p', String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
    };
    let raf = 0;
    const onScroll = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; update(); progress(); }); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    document.addEventListener('langchange', () => setTimeout(() => place(current), 60));
    if (document.fonts) document.fonts.ready.then(() => place(current));
    update(); progress();
  }

  /* Con «reducir movimiento», las banderas se quedan quietas */
  function initMotion() {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    $$('#sprite animate, #sprite animateTransform').forEach((a) => a.remove());
  }

  /* Relojes: hora, fecha en el idioma de cada país y desfase UTC */
  const fmts = new Map();
  const fmt = (loc, opt) => {
    const k = loc + JSON.stringify(opt);
    if (!fmts.has(k)) fmts.set(k, new Intl.DateTimeFormat(loc, opt));
    return fmts.get(k);
  };
  const cap = (s) => s.charAt(0).toLocaleUpperCase() + s.slice(1);
  function tick() {
    const now = new Date();
    $$('[data-clock]').forEach((el) => {
      const tz = el.dataset.tz;
      el.textContent = fmt('es-ES', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
      const p = Object.fromEntries(fmt('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now).map((x) => [x.type, x.value]));
      el.setAttribute('datetime', `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`);
    });
    $$('[data-date]').forEach((el) => {
      el.textContent = cap(fmt(el.dataset.loc, { timeZone: el.dataset.tz, weekday: 'long', day: 'numeric', month: 'long' }).format(now));
    });
    $$('[data-offset]').forEach((el) => {
      const part = fmt('en-US', { timeZone: el.dataset.tz, timeZoneName: 'shortOffset' }).formatToParts(now).find((x) => x.type === 'timeZoneName');
      if (part) el.textContent = part.value.replace('GMT', 'UTC').replace(/^UTC$/, 'UTC+0');
    });
  }
  function initClocks() {
    tick();
    const next = () => setTimeout(() => { tick(); next(); }, 60000 - (Date.now() % 60000) + 40);
    next();
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
  }

  /* Nombres de país: el mismo cuerpo en los tres paneles, el mayor que quepa (manda el más largo) */
  let measure;
  function widthAt100(text, font, tracking) {
    measure = measure || document.createElement('canvas').getContext('2d');
    measure.font = font.replace('{s}', '100px');
    return measure.measureText(text).width + tracking * 100 * text.length;
  }
  function fitWorlds() {
    const names = $$('.world__name');
    if (!names.length) return;
    const panel = names[0].closest('.world');
    const cs = getComputedStyle(panel);
    const inner = panel.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const widest = Math.max(...names.map((n) => widthAt100(n.textContent.trim(), '600 {s} Inter', -0.035)));
    const cap = window.matchMedia('(max-width: 899px)').matches ? 76 : 84;
    const size = Math.max(30, Math.min(cap, Math.floor((inner / widest) * 100 * 0.96)));
    root.style.setProperty('--world-fs', size + 'px');
  }
  function fitMark() {
    const mark = $('.ftr__mark');
    if (!mark) return;
    const w = mark.clientWidth;
    const word = mark.textContent.trim();
    const size = Math.floor((w / widthAt100(word, '600 {s} Panchang', 0.02)) * 100 * 0.985);
    root.style.setProperty('--mark-fs', Math.max(40, size) + 'px');
  }
  function sameLocal() {
    $$('.world').forEach((w) => {
      const local = $('.world__local', w);
      const name = $('.world__name', w);
      if (!local || !name) return;
      // Si el nombre local coincide con el del idioma de la web, se oculta; el árabe se queda
      const lat = $('.lat', local);
      const same = !!lat && lat.textContent.trim().toLocaleLowerCase() === name.textContent.trim().toLocaleLowerCase();
      local.classList.toggle('is-same', same);
    });
  }
  function initFit() {
    const run = () => { safe(fitWorlds, 'fitWorlds'); safe(fitMark, 'fitMark'); };
    run();
    if (document.fonts) document.fonts.ready.then(run);
    let t;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(run, 120); });
    document.addEventListener('langchange', () => { run(); sameLocal(); });
    sameLocal();
  }

  /* País del proyecto: los botones de cada mundo lo eligen en el formulario y tiñen el envío */
  function setWorld(w) {
    const ok = ['es', 'ma', 'ro'].includes(w);
    if (ok) root.dataset.world = w; else delete root.dataset.world;
    const sel = $('#f-country');
    if (sel && w && [...sel.options].some((o) => o.value === w)) sel.value = w;
  }
  function initWorlds() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-world]');
      if (a) setWorld(a.dataset.world);
    });
    $('#f-country')?.addEventListener('change', (e) => setWorld(e.target.value));
    const q = new URLSearchParams(location.search).get('pais');
    if (q) setWorld(q);
  }

  /* Formulario */
  const MSG = {
    name: { es: 'Escriba su nombre.', en: 'Please enter your name.', fr: 'Indiquez votre nom.', ro: 'Scrieți-vă numele.' },
    email: { es: 'Escriba un email válido, por ejemplo nombre@empresa.com.', en: 'Enter a valid email, for example name@company.com.', fr: 'Saisissez un e-mail valide, par exemple nom@entreprise.com.', ro: 'Introduceți un e-mail valid, de exemplu nume@firma.ro.' },
    country: { es: 'Elija el país del proyecto.', en: 'Choose the project country.', fr: 'Choisissez le pays du projet.', ro: 'Alegeți țara proiectului.' },
    service: { es: 'Elija un servicio.', en: 'Choose a service.', fr: 'Choisissez un service.', ro: 'Alegeți un serviciu.' },
    message: { es: 'Cuéntenos en unas líneas qué necesita.', en: 'Tell us in a few lines what you need.', fr: 'Décrivez votre besoin en quelques lignes.', ro: 'Spuneți-ne în câteva rânduri de ce aveți nevoie.' },
    consent: { es: 'Acepte la política de privacidad para enviar la solicitud.', en: 'Accept the privacy policy to send the request.', fr: 'Acceptez la politique de confidentialité pour envoyer la demande.', ro: 'Acceptați politica de confidențialitate pentru a trimite cererea.' },
    sending: { es: 'Enviando…', en: 'Sending…', fr: 'Envoi…', ro: 'Se trimite…' },
    done: {
      es: (n) => `Solicitud enviada${n ? ', ' + n : ''}. Le respondemos en menos de 24 horas.`,
      en: (n) => `Request sent${n ? ', ' + n : ''}. We’ll reply in under 24 hours.`,
      fr: (n) => `Demande envoyée${n ? ', ' + n : ''}. Nous vous répondons en moins de 24 heures.`,
      ro: (n) => `Cererea a fost trimisă${n ? ', ' + n : ''}. Vă răspundem în mai puțin de 24 de ore.`
    },
    // Texto del mensaje que se compone para WhatsApp o email si el envío falla
    hi: { es: 'Hola, soy', en: 'Hello, I am', fr: 'Bonjour, je suis', ro: 'Bună ziua, sunt' },
    lCountry: { es: 'País', en: 'Country', fr: 'Pays', ro: 'Țara' },
    lService: { es: 'Servicio', en: 'Service', fr: 'Service', ro: 'Serviciu' },
    subject: { es: 'Solicitud de propuesta', en: 'Proposal request', fr: 'Demande de proposition', ro: 'Cerere de ofertă' }
  };
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function initForm() {
    const form = $('[data-form]');
    if (!form) return;
    const status = $('[data-status]', form);
    const fallback = $('[data-fallback]', form);
    const submit = $('button[type="submit"]', form);
    const fields = ['name', 'email', 'country', 'service', 'message', 'consent'];

    const check = (name) => {
      const el = form.elements[name];
      let ok = true;
      if (el.type === 'checkbox') ok = el.checked;
      else if (name === 'email') ok = EMAIL_RE.test(el.value.trim());
      else ok = el.value.trim() !== '';
      const err = $('#e-' + name, form);
      el.setAttribute('aria-invalid', String(!ok));
      if (err) { err.textContent = ok ? '' : T(MSG[name]); err.hidden = ok; }
      return ok;
    };
    // Cada error se corrige en cuanto el campo vuelve a ser válido
    fields.forEach((name) => {
      const el = form.elements[name];
      const ev = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(ev, () => { if (el.getAttribute('aria-invalid') === 'true') check(name); });
    });
    document.addEventListener('langchange', () => {
      fields.forEach((name) => { if (form.elements[name].getAttribute('aria-invalid') === 'true') check(name); });
    });

    const optText = (sel) => (sel.selectedIndex > 0 ? sel.options[sel.selectedIndex].text : '');
    const compose = () => {
      const f = form.elements;
      const who = f.name.value.trim() + (f.company.value.trim() ? ' (' + f.company.value.trim() + ')' : '');
      return [
        `${T(MSG.hi)} ${who}.`,
        `${T(MSG.lCountry)}: ${optText(f.country)}`,
        `${T(MSG.lService)}: ${optText(f.service)}`,
        `Email: ${f.email.value.trim()}`,
        '',
        f.message.value.trim()
      ].join('\n');
    };
    const showFallback = () => {
      const text = compose();
      $('[data-fb-wa]', fallback).href = 'https://wa.me/34613441239?text=' + encodeURIComponent(text);
      $('[data-fb-mail]', fallback).href = 'mailto:contact@benamar.es?subject=' + encodeURIComponent(T(MSG.subject)) + '&body=' + encodeURIComponent(text);
      fallback.hidden = false;
      status.textContent = '';
      fallback.setAttribute('role', 'alert');
      fallback.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (form.classList.contains('is-sending')) return;
      const bad = fields.filter((n) => !check(n));
      if (bad.length) { form.elements[bad[0]].focus(); return; }

      fallback.hidden = true;
      form.classList.add('is-sending');
      submit.disabled = true;
      status.textContent = T(MSG.sending);

      // El contact.php actual recibe name, email, company, service, message y consent:
      // el país va también al principio del mensaje para que no se pierda.
      const data = new FormData(form);
      data.set('message', `[${T(MSG.lCountry)}: ${optText(form.elements.country)}]\n` + form.elements.message.value.trim());

      try {
        const res = await fetch(form.getAttribute('action') || 'contact.php', { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        const json = await res.json();
        if (!res.ok || !json || !json.success) throw new Error('send');
        const first = form.elements.name.value.trim().split(/\s+/)[0] || '';
        const done = document.createElement('p');
        done.className = 'form__done';
        done.setAttribute('role', 'status');
        done.textContent = MSG.done[lang()] ? MSG.done[lang()](first) : MSG.done.es(first);
        $$('.field, .form__end', form).forEach((n) => { n.hidden = true; });
        form.append(done);
        status.textContent = '';
      } catch (_) {
        showFallback();
      } finally {
        form.classList.remove('is-sending');
        submit.disabled = false;
      }
    });
  }

  /* Entrada de la portada, una sola vez */
  function initHero() {
    const hero = $('.hero');
    if (!hero) return;
    // Un fotograma con el estado inicial para que la transición se vea; si la pestaña está en segundo plano
    // (sin fotogramas), el temporizador la muestra igualmente.
    const go = () => {
      let done = false;
      const show = () => { if (!done) { done = true; hero.classList.add('is-in'); } };
      requestAnimationFrame(() => requestAnimationFrame(show));
      setTimeout(show, 150);
    };
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fonts, new Promise((r) => setTimeout(r, 900))]).then(go);
  }

  /* 1. Mapa: el país y su panel se iluminan a la vez */
  function initMapa() {
    const mapa = $('.mapa');
    if (!mapa) return;
    const pair = (k) => [$('.mapa__pais--' + k, mapa), $('.world--' + k)];
    ['es', 'ma', 'ro'].forEach((k) => {
      const [pais, panel] = pair(k);
      if (!pais || !panel) return;
      const on = () => { pais.classList.add('is-hot'); panel.classList.add('is-hot'); };
      const off = () => { pais.classList.remove('is-hot'); panel.classList.remove('is-hot'); };
      [pais, panel].forEach((el) => { el.addEventListener('pointerenter', on); el.addEventListener('pointerleave', off); });
    });
  }

  /* 4. Animaciones en bucle solo mientras se ven: el viento de la bandera grande (SMIL)
     y los pulsos del mapa. Fuera de pantalla no gastan nada. */
  function initPausa() {
    const io = 'IntersectionObserver' in window;
    const sprite = $('#sprite');
    const flag = $('.country__flag');
    if (sprite && sprite.pauseAnimations) {
      if (!flag) sprite.pauseAnimations();
      else if (io) new IntersectionObserver((en) => (en[0].isIntersecting ? sprite.unpauseAnimations() : sprite.pauseAnimations())).observe(flag);
    }
    $$('.mapa').forEach((el) => {
      if (!io) { el.classList.add('is-vis'); return; }
      new IntersectionObserver((en) => el.classList.toggle('is-vis', en[0].isIntersecting)).observe(el);
    });
  }

  /* 5. Formulario por pasos: primero sus datos, después su proyecto */
  function initWizard() {
    const form = $('[data-form]');
    const groups = form ? $$('.form__group', form) : [];
    if (groups.length !== 2) return;
    const legend = (g) => ($('legend', g) || {}).textContent || '';
    const bar = document.createElement('div');
    bar.className = 'form__steps';
    bar.innerHTML = '<ol><li class="is-on"><span>1</span><b data-step-name="0"></b></li><li><span>2</span><b data-step-name="1"></b></li></ol><div class="form__bar"><i></i></div>';
    form.prepend(bar);
    const names = () => $$('[data-step-name]', bar).forEach((b) => { b.textContent = legend(groups[+b.dataset.stepName]); });
    names();
    document.addEventListener('langchange', () => setTimeout(names, 0));
    const next = document.createElement('div');
    next.className = 'form__next';
    next.innerHTML = '<button type="button" class="btn" data-i18n="f_next">Siguiente</button>';
    groups[0].after(next);
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'btn btn--ghost form__back';
    back.setAttribute('data-i18n', 'f_back');
    back.textContent = 'Atrás';
    const end = $('.form__end', form);
    end.prepend(back);
    if (window.I18N && I18N.get() !== (I18N.base || 'es')) I18N.set(I18N.get());
    const go = (step) => {
      form.dataset.step = String(step);
      $$('li', bar).forEach((li, i) => li.classList.toggle('is-on', i < step));
      bar.style.setProperty('--s', step === 1 ? '.5' : '1');
      const g = groups[step - 1];
      g.classList.remove('is-entering'); void g.offsetWidth; g.classList.add('is-entering');
    };
    form.classList.add('is-wizard');
    go(1);
    const fieldOk = (name) => {
      const el = form.elements[name];
      const ok = name === 'email' ? EMAIL_RE.test(el.value.trim()) : el.value.trim() !== '';
      const err = $('#e-' + name, form);
      el.setAttribute('aria-invalid', String(!ok));
      if (err) { err.textContent = ok ? '' : T(MSG[name]); err.hidden = ok; }
      return ok;
    };
    $('button', next).addEventListener('click', () => {
      const bad = ['name', 'email'].filter((n) => !fieldOk(n));
      if (bad.length) { form.elements[bad[0]].focus(); return; }
      go(2);
      setTimeout(() => (form.elements.country.value ? form.elements.service : form.elements.country).focus({ preventScroll: true }), 50);
      form.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    back.addEventListener('click', () => { go(1); form.elements.name.focus({ preventScroll: true }); });
    // Si al enviar falta algo del primer paso, se vuelve a él
    form.addEventListener('submit', () => {
      if (form.dataset.step === '2' && (!form.elements.name.value.trim() || !EMAIL_RE.test(form.elements.email.value.trim()))) go(1);
    }, true);
    new MutationObserver(() => { if ($('.form__done', form)) form.classList.add('is-done'); }).observe(form, { childList: true });
  }

  /* 6. WhatsApp a mano: aparece tras la portada y se esconde al llegar al contacto */
  function initWa() {
    const wa = $('[data-wa-float]');
    if (!wa) return;
    const contacto = $('#contacto');
    let visibleContact = false;
    if (contacto && 'IntersectionObserver' in window) {
      new IntersectionObserver((en) => { visibleContact = en[0].isIntersecting; tick(); }, { threshold: 0.05 }).observe(contacto);
    }
    const hero = $('.hero');
    let limit = 320, raf = 0;
    const measure = () => { limit = hero ? hero.offsetHeight * 0.75 : 320; };
    const update = () => { raf = 0; wa.classList.toggle('is-on', window.scrollY > limit && !visibleContact); };
    const tick = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', () => { measure(); tick(); });
    measure();
    update();
  }

  /* 7. Galería a pantalla completa: flechas, teclado y deslizar */
  function initLightbox() {
    const items = $$('.gal__item');
    if (!items.length) return;
    const L = { close: { es: 'Cerrar', en: 'Close', fr: 'Fermer', ro: 'Închide' }, prev: { es: 'Anterior', en: 'Previous', fr: 'Précédente', ro: 'Anterioara' }, next: { es: 'Siguiente', en: 'Next', fr: 'Suivante', ro: 'Următoarea' } };
    const chev = (d) => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const dlg = document.createElement('dialog');
    dlg.className = 'lb';
    dlg.innerHTML = '<figure class="lb__fig"><img alt=""><figcaption class="lb__cap"></figcaption></figure>'
      + '<button type="button" class="lb__btn lb__close">' + chev('M6 6l12 12M18 6 6 18') + '</button>'
      + '<button type="button" class="lb__btn lb__prev">' + chev('M15 5l-7 7 7 7') + '</button>'
      + '<button type="button" class="lb__btn lb__next">' + chev('M9 5l7 7-7 7') + '</button>'
      + '<p class="lb__n" aria-hidden="true"></p>';
    document.body.append(dlg);
    const img = $('img', dlg), cap = $('.lb__cap', dlg), num = $('.lb__n', dlg);
    let cur = 0;
    const labels = () => { $('.lb__close', dlg).setAttribute('aria-label', T(L.close)); $('.lb__prev', dlg).setAttribute('aria-label', T(L.prev)); $('.lb__next', dlg).setAttribute('aria-label', T(L.next)); };
    const big = (k) => { const t = $('img', items[(k + items.length) % items.length]); return (t.currentSrc || t.src).replace(/-(500|800)\.webp$/, '-1400.webp'); };
    const pedidas = new Set();
    const pide = (url) => { if (pedidas.has(url)) return; pedidas.add(url); const im = new Image(); im.decoding = 'async'; im.src = url; };
    const show = (i) => {
      cur = (i + items.length) % items.length;
      const src = $('img', items[cur]);
      const yo = cur, grande = big(cur);
      img.classList.remove('is-in'); void img.offsetWidth;
      img.src = src.currentSrc || src.src;
      if (grande !== img.src) {
        const pre = new Image();
        pre.src = grande;
        (pre.decode ? pre.decode() : Promise.resolve()).then(() => { if (cur === yo && dlg.open) img.src = grande; }).catch(() => {});
      }
      setTimeout(() => { pide(big(cur + 1)); pide(big(cur - 1)); }, 250);
      img.alt = src.alt;
      cap.textContent = ($('.gal__cap', items[cur]) || {}).textContent || '';
      num.textContent = (cur + 1) + ' / ' + items.length;
      img.classList.add('is-in');
    };
    const open = (i) => { labels(); show(i); dlg.showModal(); root.classList.add('lb-open'); };
    const close = () => { dlg.close(); };
    dlg.addEventListener('close', () => { root.classList.remove('lb-open'); items[cur].focus({ preventScroll: true }); });
    items.forEach((it, i) => {
      it.tabIndex = 0;
      it.setAttribute('role', 'button');
      const label = () => it.setAttribute('aria-label', ($('.gal__cap', it) || {}).textContent || '');
      label();
      document.addEventListener('langchange', () => setTimeout(label, 0));
      it.addEventListener('click', () => open(i));
      it.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
    });
    $('.lb__close', dlg).addEventListener('click', close);
    $('.lb__prev', dlg).addEventListener('click', () => show(cur - 1));
    $('.lb__next', dlg).addEventListener('click', () => show(cur + 1));
    dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
    dlg.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
    let x0 = null;
    dlg.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    dlg.addEventListener('pointerup', (e) => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); });
  }

  /* 8. Titular: cada palabra sale de un ligero desenfoque */
  function splitHero() {
    let k = 0;
    $$('.hero__line').forEach((line) => {
      const words = line.textContent.trim().split(/\s+/);
      line.innerHTML = words.map((w) => '<span class="hw" style="--k:' + (k++) + '">' + w + '</span>').join(' ');
    });
  }
  function initHeroWords() {
    if (!$('.hero__line')) return;
    splitHero();
    document.addEventListener('langchange', () => setTimeout(splitHero, 0));
  }

  function boot() {
    safe(initHeader, 'header');
    safe(initMenu, 'menu');
    safe(initLangs, 'langs');
    safe(initMotion, 'motion');
    safe(initReveal, 'reveal');
    safe(initCount, 'count');
    safe(initSpy, 'spy');
    safe(initClocks, 'clocks');
    safe(initFit, 'fit');
    safe(initWorlds, 'worlds');
    safe(initForm, 'form');
    safe(initHeroWords, 'heroWords');
    safe(initHero, 'hero');
    safe(initMapa, 'mapa');
    safe(initPausa, 'pausa');
    safe(initWizard, 'wizard');
    safe(initWa, 'wa');
    safe(initLightbox, 'lightbox');
    const y = $('[data-year]');
    if (y) y.textContent = String(new Date().getFullYear());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
