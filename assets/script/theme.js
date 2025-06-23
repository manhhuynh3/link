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
    if (themeToggleCheckbox && !themeToggleCheckbox.hasAttribute('data-theme-initialized')) {
        themeToggleCheckbox.addEventListener('change', () => {
            currentTheme = themeToggleCheckbox.checked ? 'light' : 'dark';
            applyTheme(currentTheme);
        });
        themeToggleCheckbox.setAttribute('data-theme-initialized', 'true');
    }
}

// Lắng nghe sự kiện 'headerLoaded' sau khi header đã được chèn vào DOM
document.addEventListener('headerLoaded', () => {
    setupThemeToggle();
    applyTheme(currentTheme);
});

// Fallback: Nếu header đã có sẵn trong HTML ban đầu (không qua loadTemplates)
// thì DOMContentLoaded sẽ đảm bảo theme được áp dụng và toggle được setup.
// Tránh chạy trùng lặp nếu headerLoaded đã xử lý.
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Chỉ chạy nếu headerLoaded chưa xử lý hoặc không có phần tử theme-toggle-checkbox
        // (Trường hợp này ít xảy ra nếu loadTemplates.js luôn tải header)
        const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
        if (themeToggleCheckbox && !themeToggleCheckbox.hasAttribute('data-theme-initialized')) {
            setupThemeToggle();
            applyTheme(currentTheme);
        } else if (!themeToggleCheckbox) { // Áp dụng theme ban đầu nếu không có nút toggle
            applyTheme(currentTheme);
        }
    });
    // Áp dụng theme ngay nếu trang đã tải xong và nút theme đã tồn tại
    if (document.readyState !== 'loading' && document.getElementById('theme-toggle-checkbox')) {
        setupThemeToggle();
        applyTheme(currentTheme);
    }
}