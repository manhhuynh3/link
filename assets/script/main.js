// assets/script/main.js
import { updateContent, setupLanguageToggle, currentLanguage } from './language.js';
import { applyTheme, setupThemeToggle, currentTheme } from './theme.js';
import { setupSmoothScrolling, setupScrollReveal, setupHeroParallax } from './scroll-effects.js';
import { createPortfolioCards } from './portfolio.js';
import { setupServiceDetailsToggle } from './services.js';
import { setupMobileNavigation } from './mobile-nav.js';
import { loadAllTemplates } from './loadTemplates.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadAllTemplates(); // Tải header & footer
    } catch (error) {
        console.error('An error occurred during template loading, some features might not work:', error);
        return;
    }

    // Tính và set lại padding-top theo chiều cao header
    const header = document.querySelector('header');
    if (header) {
        const headerHeight = header.offsetHeight;
        document.body.style.paddingTop = `-${headerHeight}px`;
    } else {
        console.warn('Header element not found after template loading.');
    }

    // ⚠️ Quan trọng: delay để chắc chắn phần tử đã render trước khi gắn event
    setTimeout(() => {
        setupLanguageToggle();       // Gắn sự kiện cho nút EN/VI
        setupThemeToggle();          // Gắn toggle dark/light mode
        setupMobileNavigation();     // Toggle menu mobile

        updateContent(currentLanguage);  // Gán nội dung ngôn ngữ lần đầu
        applyTheme(currentTheme);        // Gán theme lần đầu
    }, 0);

    // Các hiệu ứng và tương tác khác
    setupHeroParallax();
    createPortfolioCards();
    setupSmoothScrolling();
    setupScrollReveal();
    setupServiceDetailsToggle();

    // Smooth scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  const targetId = anchor.getAttribute('href').substring(1);
  const targetElement = document.getElementById(targetId);

  // Chỉ gắn listener nếu phần tử target tồn tại
  if (targetElement) {
    anchor.addEventListener('click', function (event) {
      event.preventDefault();
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  }
});
