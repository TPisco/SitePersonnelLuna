// Small progressive enhancements. Every feature works (or degrades cleanly) without JS.

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Header: transparent at the top of the page, solid once scrolled ---------- */
function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;

  let ticking = false;
  const update = () => {
    header.classList.toggle('is-solid', window.scrollY >= 24);
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  // First check on the next frame: reading scrollY now would force a layout.
  requestAnimationFrame(update);
}

/* ---------- Mobile menu ---------- */
function initMenu() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  const label = document.querySelector<HTMLElement>('[data-menu-label]');
  if (!header || !toggle || !menu || !label) return;

  const setOpen = (open: boolean, returnFocus = true) => {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? header.dataset.labelClose! : header.dataset.labelOpen!;
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) menu.querySelector<HTMLElement>('a')?.focus();
    else if (returnFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => setOpen(!header.classList.contains('is-open')));
  menu.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a')) setOpen(false, false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('is-open')) setOpen(false);
  });
  // Keep Tab inside the open panel (toggle button + menu links).
  header.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab' || !header.classList.contains('is-open')) return;
    const focusables = [toggle, ...menu.querySelectorAll<HTMLElement>('a, button')];
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  window.matchMedia('(min-width: 900px)').addEventListener('change', (mq) => {
    if (mq.matches && header.classList.contains('is-open')) setOpen(false, false);
  });
}

/* ---------- Active section: nav highlight + language switch keeps the section ---------- */
function initSections() {
  const sections = [...document.querySelectorAll<HTMLElement>('[data-section]')];
  const navLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]')];
  const langLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-lang-link]')];
  let current = '';

  const update = (id: string) => {
    current = id;
    navLinks.forEach((link) => {
      if (link.dataset.navLink === id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    langLinks.forEach((link) => {
      link.hash = id ? `#${id}` : '';
    });
  };

  const visible = new Map<string, number>();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0));
      let best = '';
      let bestRatio = 0;
      for (const section of sections) {
        const ratio = visible.get(section.id) ?? 0;
        if (ratio > bestRatio) {
          best = section.id;
          bestRatio = ratio;
        }
      }
      if (best !== current) update(best);
    },
    { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
  );
  sections.forEach((section) => observer.observe(section));

  // Honor a hash coming from another language (e.g. /en/#music).
  if (location.hash) update(location.hash.slice(1));

  langLinks.forEach((link) =>
    link.addEventListener('click', () => {
      try {
        localStorage.setItem('lang', link.dataset.langLink!);
      } catch {
        /* storage unavailable: nothing to remember */
      }
    }),
  );
}

/* ---------- Marquee pause buttons (WCAG 2.2.2) ---------- */
function initMarquees() {
  document.querySelectorAll<HTMLButtonElement>('[data-marquee-toggle]').forEach((button) => {
    const marquee = button.closest<HTMLElement>('[data-marquee]');
    const label = button.querySelector<HTMLElement>('[data-marquee-label]');
    if (!marquee || !label) return;
    button.addEventListener('click', () => {
      const paused = !marquee.hasAttribute('data-paused');
      marquee.toggleAttribute('data-paused', paused);
      button.setAttribute('aria-pressed', String(paused));
      label.textContent = paused ? button.dataset.labelPlay! : button.dataset.labelPause!;
    });
  });
}

/* ---------- Reveal on scroll ---------- */
function initReveal() {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  targets.forEach((el) => observer.observe(el));
}

/* ---------- Click-to-load embeds (Spotify, YouTube) ---------- */
function initFacades() {
  document.querySelectorAll<HTMLElement>('[data-facade]').forEach((facade) => {
    const trigger = facade.querySelector<HTMLButtonElement>('[data-facade-load]');
    trigger?.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = facade.dataset.src!;
      iframe.title = facade.dataset.title!;
      iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.style.border = '0';
      iframe.style.width = '100%';
      iframe.style.height = facade.dataset.kind === 'spotify' ? '352px' : '100%';
      if (facade.dataset.kind === 'youtube') {
        iframe.style.position = 'absolute';
        iframe.style.inset = '0';
      }
      facade.replaceChildren(iframe);
      facade.classList.add('is-loaded');
      iframe.focus();
    });
  });
}

/* ---------- Copy email ---------- */
function initCopyEmail() {
  const status = document.querySelector<HTMLElement>('[data-copy-status]');
  document.querySelectorAll<HTMLButtonElement>('[data-copy-email]').forEach((button) => {
    button.addEventListener('click', async () => {
      const email = button.dataset.copyEmail!;
      let ok = false;
      try {
        await navigator.clipboard.writeText(email);
        ok = true;
      } catch {
        ok = false;
      }
      if (status) {
        status.textContent = ok ? button.dataset.labelCopied! : button.dataset.labelFailed!;
        window.setTimeout(() => (status.textContent = ''), 4000);
      }
    });
  });
}

/* ---------- Contact form → mailto: (no backend) ---------- */
function initContactForm() {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const from = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    const subject = form.dataset.subject!.replace('{name}', name || form.dataset.someone!);
    const body = `${message}\n\n— ${name}${from ? ` (${from})` : ''}`;
    window.location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

/* ---------- Gallery lightbox ---------- */
function initLightbox() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-lightbox-index]')];
  if (!dialog || !links.length || typeof dialog.showModal !== 'function') return;

  const img = dialog.querySelector<HTMLImageElement>('[data-lightbox-img]')!;
  const caption = dialog.querySelector<HTMLElement>('[data-lightbox-caption]')!;
  const counter = dialog.querySelector<HTMLElement>('[data-lightbox-counter]')!;
  let index = 0;
  let opener: HTMLElement | null = null;

  const show = (i: number) => {
    index = (i + links.length) % links.length;
    const link = links[index];
    img.src = link.href;
    img.alt = link.dataset.alt ?? '';
    caption.textContent = link.dataset.alt ?? '';
    counter.textContent = dialog.dataset.counter!.replace('{i}', String(index + 1)).replace('{n}', String(links.length));
  };

  links.forEach((link, i) =>
    link.addEventListener('click', (event) => {
      event.preventDefault();
      opener = link;
      show(i);
      dialog.showModal();
    }),
  );
  dialog.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => show(index - 1));
  dialog.querySelector('[data-lightbox-next]')?.addEventListener('click', () => show(index + 1));
  dialog.querySelector('[data-lightbox-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(index - 1);
    if (event.key === 'ArrowRight') show(index + 1);
  });
  // Click on the backdrop closes.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || (event.target as HTMLElement).classList.contains('lightbox__inner')) dialog.close();
  });
  dialog.addEventListener('close', () => opener?.focus());
}

window.addEventListener('load', () =>
  window.setTimeout(() => document.documentElement.classList.add('smooth-scroll'), 150),
);

initHeader();
initMenu();
initSections();
initMarquees();
initReveal();
initFacades();
initCopyEmail();
initContactForm();
initLightbox();
