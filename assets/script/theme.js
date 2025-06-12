// js/theme.js

export let currentTheme = localStorage.getItem('theme') || 'dark'; // Default to dark

export function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
    if (themeToggleCheckbox) {
        themeToggleCheckbox.checked = (theme === 'light'); // Set checkbox state
    }
    localStorage.setItem('theme', theme);
}

export function setupThemeToggle() {
    const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
    if (themeToggleCheckbox) {
        themeToggleCheckbox.addEventListener('change', () => {
            currentTheme = themeToggleCheckbox.checked ? 'light' : 'dark';
            applyTheme(currentTheme);
        });
    }
}