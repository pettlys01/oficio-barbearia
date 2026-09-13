// OFÍCIO Barbearia · main.js
// Comportamento da landing, sem framework: rolagem suave, menu mobile,
// revelação no scroll e o formulário que monta a mensagem do WhatsApp.

(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');

  /* ---------- Rolagem suave (Lenis) — desligada pra quem pediu menos movimento ---------- */
  let lenis = null;
  if (!reduceMotion && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  /* ---------- Header sólido depois que sai do hero ---------- */
  const syncHeader = () => header && header.classList.toggle('is-stuck', window.scrollY > 60);
  window.addEventListener('scroll', syncHeader, { passive: true });
  if (lenis) lenis.on('scroll', syncHeader);
  syncHeader();

  /* ---------- Menu mobile ---------- */
  const menu = document.getElementById('menu');
  const burger = document.querySelector('.burger');
  const menuClose = menu ? menu.querySelector('.menu-close') : null;

  const openMenu = () => {
    if (!menu) return;
    menu.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
    menuClose.focus();
  };

  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
    if (restoreFocus) burger.focus();
  };

  if (burger) burger.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', () => closeMenu({ restoreFocus: true }));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu({ restoreFocus: true }); });

  /* ---------- Âncoras internas descontando o header fixo ---------- */
  const scrollToTarget = (target) => {
    const offset = header ? header.offsetHeight : 0;
    if (lenis) {
      lenis.scrollTo(target, { offset: -offset + 1, duration: 1.2 });
    } else {
      const top = target.getBoundingClientRect().top + window.scrollY - offset + 1;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const hash = link.getAttribute('href');
      if (hash.length < 2) return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      scrollToTarget(target);
      history.replaceState(null, '', hash);
    });
  });

  /* ---------- Revelação no scroll ---------- */
  const revealables = document.querySelectorAll('.rvl, .rvi, .rvh, .rvp, .rvs');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Agendamento: monta a mensagem e abre o WhatsApp ---------- */
  const form = document.getElementById('agendar-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const nome = String(data.get('nome') || '').trim();
      const barbeiro = String(data.get('barbeiro') || '');
      const servico = String(data.get('servico') || '');
      const quando = String(data.get('quando') || '');

      const partes = [
        'Olá!',
        nome ? `Aqui é o ${nome}.` : '',
        `Queria marcar ${servico.toLowerCase()} com ${barbeiro || 'quem estiver livre'}.`,
        `${quando}.`,
        'Tem horário?',
      ].filter(Boolean);

      const numero = form.dataset.whats;
      const url = `https://wa.me/${numero}?text=${encodeURIComponent(partes.join(' '))}`;
      window.open(url, '_blank', 'noopener');
    });
  }

  /* ---------- Ano no rodapé ---------- */
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
