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

  /* ---------- Barbeiros: pilha de cartões navegável ---------- */
  const stack = document.querySelector('.barber-stack');
  if (stack) {
    const cards = Array.from(stack.querySelectorAll('.barber'));
    const total = cards.length;
    const counter = document.querySelector('.barber-count [data-current]');
    let active = 0;

    const render = () => {
      cards.forEach((card, i) => {
        const offset = (i - active + total) % total;
        card.classList.remove('is-active', 'is-prev', 'is-next', 'is-hidden');
        card.removeAttribute('tabindex');
        card.removeAttribute('role');
        card.removeAttribute('aria-label');
        if (offset === 0) {
          card.classList.add('is-active');
        } else if (offset === 1) {
          card.classList.add('is-next');
        } else if (offset === total - 1) {
          card.classList.add('is-prev');
        } else {
          card.classList.add('is-hidden');
        }
        if (offset === 1 || offset === total - 1) {
          card.tabIndex = 0;
          card.setAttribute('role', 'button');
          const nome = card.querySelector('h3');
          card.setAttribute('aria-label', `Mostrar ${nome ? nome.textContent : 'este barbeiro'}`);
        }
      });
      if (counter) counter.textContent = String(active + 1).padStart(2, '0');
    };

    const go = (dir) => { active = (active + dir + total) % total; render(); };

    stack.parentElement.querySelectorAll('.barber-arrow').forEach((btn) => {
      btn.addEventListener('click', () => go(btn.dataset.dir === 'next' ? 1 : -1));
    });

    cards.forEach((card, i) => {
      card.addEventListener('click', () => {
        if (card.classList.contains('is-prev') || card.classList.contains('is-next')) { active = i; render(); }
      });
      card.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && (card.classList.contains('is-prev') || card.classList.contains('is-next'))) {
          e.preventDefault();
          active = i;
          render();
        }
      });
    });

    let touchX = null;
    stack.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    stack.addEventListener('touchend', (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      touchX = null;
    }, { passive: true });

    render();
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

  /* ---------- Vídeo do hero ---------- */
  // Loop de ida e volta (a câmera avança e recua, ver tools/video-web.py), mudo.
  // Celular em pé recebe o recorte 9:16; o resto, o 16:9. A escolha é refeita quando a tela muda
  // de formato (girar o aparelho, DevTools), senão o recorte vertical ficava esticado no desktop.
  const heroVideo = document.querySelector('.hero-video');
  const heroPause = document.querySelector('.hero-pause');
  if (heroVideo) {
    const saveData = navigator.connection && navigator.connection.saveData;
    if (reduceMotion || saveData) {
      heroVideo.remove();
      if (heroPause) heroPause.remove();
    } else {
      const retrato = window.matchMedia('(orientation: portrait) and (max-width: 700px)');
      let pausadoPeloUsuario = false;
      let heroVisivel = true;

      const sync = () => {
        if (pausadoPeloUsuario || !heroVisivel || document.hidden) heroVideo.pause();
        else heroVideo.play().catch(() => {});
      };
      const carregar = () => {
        const arquivo = `assets/video/${retrato.matches ? 'hero-retrato' : 'hero-1344'}.mp4`;
        if (heroVideo.getAttribute('src') === arquivo) return;
        // as duas versões têm a mesma linha do tempo: continua do mesmo ponto na troca
        const t = heroVideo.currentTime;
        heroVideo.src = arquivo;
        if (t) heroVideo.addEventListener('loadedmetadata', () => { heroVideo.currentTime = t; }, { once: true });
        sync();
      };

      heroVideo.addEventListener('playing', () => heroVideo.classList.add('is-on'));
      // loop feito aqui e não com o atributo loop: no WebKit o loop nativo volta pro zero e fica
      // pausado. Como o clipe é ida e volta, o quadro final e o inicial quase coincidem (sem emenda).
      heroVideo.addEventListener('ended', () => { heroVideo.currentTime = 0; sync(); });
      retrato.addEventListener('change', carregar);
      document.addEventListener('visibilitychange', sync);

      // hero fora da tela: pausa (bateria/CPU), volta ao reaparecer
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([e]) => { heroVisivel = e.isIntersecting; sync(); })
          .observe(heroVideo.closest('.hero'));
      }

      if (heroPause) {
        heroPause.hidden = false;
        heroPause.addEventListener('click', () => {
          pausadoPeloUsuario = !pausadoPeloUsuario;
          heroPause.classList.toggle('is-paused', pausadoPeloUsuario);
          heroPause.setAttribute('aria-label', pausadoPeloUsuario ? 'Tocar vídeo de fundo' : 'Pausar vídeo de fundo');
          sync();
        });
      }

      // só depois do load: o vídeo não disputa banda com a foto, que é o LCP
      if (document.readyState === 'complete') carregar();
      else window.addEventListener('load', carregar, { once: true });
    }
  }

  /* ---------- Ano no rodapé ---------- */
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
