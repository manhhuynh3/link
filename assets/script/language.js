// js/language.js
import { languages, portfolioProjects } from './data.js';

export let currentLanguage = localStorage.getItem('lang') || 'vi'; // Default to Vietnamese

// Function to update content based on selected language
export function updateContent(lang) {
    const elements = document.querySelectorAll('[data-lang-key]'); //
    elements.forEach(el => { //
        // Add a null check for 'el' to prevent errors if an element somehow becomes null
        if (!el) {
            console.warn('Attempted to update a null element with data-lang-key. Skipping.');
            return;
        }

        const key = el.getAttribute('data-lang-key'); //
        if (languages[lang][key]) { //
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') { //
                el.placeholder = languages[lang][key]; //
            } else if (el.tagName === 'TITLE') { //
                document.title = languages[lang][key]; //
            } else {
                el.innerHTML = languages[lang][key]; //
            }
        }
    });


    document.documentElement.lang = lang; // Update HTML lang attribute
    const langButton = document.getElementById('lang-toggle-button'); //
    if (langButton) { //
        langButton.textContent = lang.toUpperCase() === 'VI' ? 'EN' : 'VI'; // Update button text
    }
    localStorage.setItem('lang', lang); // Save preference
}

export function setupLanguageToggle() {
    const langToggleButton = document.getElementById('lang-toggle-button'); //
    if (langToggleButton) { //
        langToggleButton.addEventListener('click', () => { //
            currentLanguage = currentLanguage === 'vi' ? 'en' : 'vi'; //
            updateContent(currentLanguage); //
        });
    }
}