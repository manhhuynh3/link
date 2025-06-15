// js/main.js
import { updateContent, setupLanguageToggle, currentLanguage } from './language.js';
import { applyTheme, setupThemeToggle, currentTheme } from './theme.js';
import { setupSmoothScrolling, setupScrollReveal, setupHeroParallax } from './scroll-effects.js';
import { createPortfolioCards } from './portfolio.js';
import { setupServiceDetailsToggle } from './services.js';
import { setupMobileNavigation } from './mobile-nav.js';

window.onload = function() {
    const header = document.querySelector('header');
    if (header) {
        const headerHeight = header.offsetHeight;
        document.body.style.paddingTop = `-${headerHeight}px`;
    }

    // Setup general functionalities
    setupHeroParallax();
    createPortfolioCards();
    setupLanguageToggle();
    setupThemeToggle();
    setupSmoothScrolling();
    setupScrollReveal();
    setupServiceDetailsToggle();
    setupMobileNavigation();

    // Initialize content with current language and theme
    updateContent(currentLanguage);
    applyTheme(currentTheme);
};