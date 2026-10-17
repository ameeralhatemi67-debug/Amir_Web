const themeSelect = document.querySelector<HTMLSelectElement>('[data-theme-select]');
if (themeSelect) {
  themeSelect.value = document.documentElement.dataset.theme || 'system';
  themeSelect.addEventListener('change', () => {
    const theme = themeSelect.value;
    if (theme === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;
    try {
      if (theme === 'system') localStorage.removeItem('amir-theme');
      else localStorage.setItem('amir-theme', theme);
    } catch { /* The selected theme still works when browser storage is unavailable. */ }
  });
}

document.querySelectorAll<HTMLElement>('[data-collection]').forEach(collection => {
  collection.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      collection.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      let visible = 0;
      collection.querySelectorAll<HTMLElement>('[data-tags]').forEach(item => {
        item.hidden = filter !== 'all' && !item.dataset.tags?.split(' ').includes(filter || '');
        if (!item.hidden) visible++;
      });
      const result = collection.querySelector<HTMLElement>('[data-filter-result]');
      if (result) result.textContent = `${visible} ${result.dataset.resultLabel}`;
    });
  });
});

// All content is visible without JavaScript. Motion is handled by reduced-motion-aware CSS.
