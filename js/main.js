/* THE VELVET HAUS CAFÉ — site interactions */
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- header on scroll + back to top ---------- */
  const header = $('.site-header');
  const backTop = $('.back-top');
  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 40);
    if (backTop) backTop.classList.toggle('show', y > 700);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (backTop) backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- mobile nav ---------- */
  const toggle = $('.menu-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open);
    });
    $$('.mobile-nav a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('nav-open')));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') document.body.classList.remove('nav-open'); });
  }

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal, .reveal-img').forEach(el => io.observe(el));

  /* ---------- parallax backgrounds ---------- */
  const para = $$('[data-parallax]');
  if (para.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const run = () => {
      para.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        el.style.transform = `translate3d(0, ${p * -60}px, 0)`;
      });
    };
    window.addEventListener('scroll', () => requestAnimationFrame(run), { passive: true });
    run();
  }

  /* ---------- home menu tabs ---------- */
  $$('[data-tabs]').forEach(wrap => {
    const btns = $$('.tab-btn', wrap);
    const panels = $$('.tab-panel', wrap);
    const imgs = $$('.preview-media img', wrap);
    const cap = $('.preview-media .caption span', wrap);
    btns.forEach((b, i) => b.addEventListener('click', () => {
      btns.forEach(x => { x.classList.toggle('active', x === b); x.setAttribute('aria-selected', x === b); });
      panels.forEach((p, j) => p.classList.toggle('active', j === i));
      imgs.forEach((im, j) => im.classList.toggle('active', j === i));
      if (cap) cap.textContent = b.textContent;
    }));
  });

  /* ---------- opening hours: today + open status ---------- */
  // index = JS getDay() (0 Sunday). Times in minutes from midnight.
  const HOURS = { 0: [480, 960], 1: [420, 1020], 2: [420, 1020], 3: [420, 1020], 4: [420, 1020], 5: [420, 1020], 6: [480, 960] };
  const now = new Date();
  const day = now.getDay();
  $$('.hours tr[data-day]').forEach(tr => { if (+tr.dataset.day === day) tr.classList.add('today'); });
  $$('.status').forEach(el => {
    const h = HOURS[day];
    const mins = now.getHours() * 60 + now.getMinutes();
    const open = h && mins >= h[0] && mins < h[1];
    el.classList.toggle('open', !!open);
    const label = $('span', el);
    if (label) label.textContent = open ? 'Open now' : 'Closed now';
  });

  /* ---------- menu page scrollspy ---------- */
  const menuLinks = $$('.menu-nav a');
  if (menuLinks.length) {
    const blocks = menuLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        menuLinks.forEach(a => {
          const on = a.getAttribute('href') === '#' + en.target.id;
          a.classList.toggle('active', on);
          if (on) a.scrollIntoView({ block: 'nearest', inline: 'center' });
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    blocks.forEach(b => spy.observe(b));
  }

  /* ---------- gallery filter + lightbox ---------- */
  const items = $$('.g-item');
  if (items.length) {
    const filters = $$('.filter-btn');
    filters.forEach(f => f.addEventListener('click', () => {
      filters.forEach(x => x.classList.toggle('active', x === f));
      const cat = f.dataset.filter;
      items.forEach(it => it.classList.toggle('hide', cat !== 'all' && it.dataset.cat !== cat));
    }));

    const lb = $('.lightbox');
    const lbImg = $('img', lb);
    const lbCap = $('figcaption', lb);
    let current = 0;
    const visible = () => items.filter(it => !it.classList.contains('hide'));
    const show = i => {
      const list = visible();
      current = (i + list.length) % list.length;
      const img = $('img', list[current]);
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = `${img.alt} — ${current + 1} / ${list.length}`;
    };
    items.forEach(it => it.addEventListener('click', () => {
      show(visible().indexOf(it));
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }));
    const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-prev', lb).addEventListener('click', e => { e.stopPropagation(); show(current - 1); });
    $('.lb-next', lb).addEventListener('click', e => { e.stopPropagation(); show(current + 1); });
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  /* ---------- contact form (front-end only) ---------- */
  const form = $('#contact-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const note = $('.form-note', form);
      if (!form.checkValidity()) { form.reportValidity(); return; }
      note.textContent = 'Thank you — your message is brewing. We will reply within one business day.';
      form.reset();
    });
  }

  /* ---------- footer year ---------- */
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
