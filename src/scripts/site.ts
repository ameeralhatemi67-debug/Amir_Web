// Every control here enhances markup that already works without JavaScript.
const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* Images light up once decoded, so a slow capture shows the unlit dot grid instead of an empty box. */
const light = (img: HTMLImageElement) => img.setAttribute('data-lit', '');
document.querySelectorAll<HTMLImageElement>('.plate img').forEach(img => {
  if (img.complete && img.naturalWidth) light(img);
  else {
    img.addEventListener('load', () => light(img), { once: true });
    img.addEventListener('error', () => light(img), { once: true });
  }
});

/* Theme: Auto follows the device; Print and Lit are stored locally only. */
const themeButtons = document.querySelectorAll<HTMLButtonElement>('[data-theme-set]');
const themeMetas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
const showTheme = (theme: string) => {
  themeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeSet === theme)));
  // The browser chrome follows a manual Print or Lit choice too, not only the device setting.
  themeMetas.forEach(meta => { meta.content = theme === 'light' ? '#f5f6f2' : theme === 'dark' ? '#0a0e0c' : meta.media.includes('dark') ? '#0a0e0c' : '#f5f6f2'; });
};
showTheme(root.dataset.theme || 'system');
themeButtons.forEach(button => button.addEventListener('click', () => {
  const theme = button.dataset.themeSet || 'system';
  if (theme === 'system') delete root.dataset.theme;
  else root.dataset.theme = theme;
  try {
    if (theme === 'system') localStorage.removeItem('amir-theme');
    else localStorage.setItem('amir-theme', theme);
  } catch { /* The chosen theme still applies when storage is unavailable. */ }
  showTheme(theme);
}));

/* Board: hovering, focusing or touching a row lights it and switches the screen to that project's real captures. */
document.querySelectorAll<HTMLElement>('[data-board]').forEach(board => {
  const rows = [...board.querySelectorAll<HTMLAnchorElement>('[data-row]')];
  const screens = new Map([...board.querySelectorAll<HTMLElement>('[data-screen]')].map(screen => [screen.dataset.screen, screen]));
  let current = rows[0]?.dataset.row;
  let warmed = false;
  const warm = () => {
    if (warmed) return;
    warmed = true;
    board.querySelectorAll<HTMLImageElement>('[data-screen] img[loading="lazy"]').forEach(img => { img.loading = 'eager'; });
  };
  const select = (row: HTMLAnchorElement, animate: boolean) => {
    const slug = row.dataset.row;
    if (!slug || slug === current) return;
    rows.forEach(item => item.classList.toggle('is-lit', item === row));
    const next = screens.get(slug);
    screens.forEach(screen => { screen.hidden = screen !== next; screen.classList.remove('is-entering'); });
    if (next && animate && !reduceMotion.matches) {
      void next.offsetWidth;
      next.classList.add('is-entering');
      next.addEventListener('animationend', () => next.classList.remove('is-entering'), { once: true });
    }
    current = slug;
  };
  board.addEventListener('pointerenter', warm, { once: true });
  board.addEventListener('focusin', warm, { once: true });
  rows.forEach(row => {
    row.addEventListener('pointerenter', event => { if ((event as PointerEvent).pointerType === 'mouse') select(row, true); });
    row.addEventListener('focus', () => select(row, true));
  });

  /* Filters on the projects page keep their pressed state and a spoken result count. */
  const filters = board.querySelectorAll<HTMLButtonElement>('[data-filter]');
  filters.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter || 'all';
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let visible = 0;
    let first: HTMLAnchorElement | undefined;
    board.querySelectorAll<HTMLElement>('[data-tags]').forEach(item => {
      item.hidden = filter !== 'all' && !item.dataset.tags?.split(' ').includes(filter);
      if (!item.hidden) { visible++; first ??= item.querySelector<HTMLAnchorElement>('[data-row]') ?? undefined; }
    });
    if (first) select(first, false);
    const result = board.querySelector<HTMLElement>('[data-filter-result]');
    if (result) result.textContent = `${visible} ${result.dataset.resultLabel}`;
  }));

  /* The ticker can be paused and resumed; the choice holds for the visit. */
  const toggle = board.querySelector<HTMLButtonElement>('[data-ticker-toggle]');
  const ticker = board.querySelector<HTMLElement>('[data-ticker]');
  toggle?.addEventListener('click', () => {
    const paused = toggle.getAttribute('aria-pressed') !== 'true';
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', (paused ? toggle.dataset.labelPlay : toggle.dataset.labelPause) || '');
    ticker?.toggleAttribute('data-paused', paused);
  });
});

/* Lettered views: a tab set per figure, with arrow-key movement. */
document.querySelectorAll<HTMLElement>('[data-views]').forEach(views => {
  const tabs = [...views.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const activate = (tab: HTMLButtonElement, focus = false) => {
    tabs.forEach(item => {
      const on = item === tab;
      item.setAttribute('aria-selected', String(on));
      item.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(item.getAttribute('aria-controls') || '');
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      const rtl = root.dir === 'rtl';
      const step = event.key === 'ArrowRight' ? (rtl ? -1 : 1) : event.key === 'ArrowLeft' ? (rtl ? 1 : -1) : 0;
      if (event.key === 'Home') { event.preventDefault(); activate(tabs[0], true); }
      else if (event.key === 'End') { event.preventDefault(); activate(tabs[tabs.length - 1], true); }
      else if (step) { event.preventDefault(); activate(tabs[(i + step + tabs.length) % tabs.length], true); }
    });
  });
});

/* Short ambient clips play only while visible, and never when reduced motion is requested. */
const ambient = document.querySelectorAll<HTMLVideoElement>('video[data-ambient]');
if (ambient.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    const video = entry.target as HTMLVideoElement;
    if (entry.isIntersecting && !reduceMotion.matches) video.play().catch(() => {});
    else video.pause();
  }), { threshold: .4 });
  ambient.forEach(video => observer.observe(video));
}
