// js/language.js
import { languages, portfolioProjects } from './data.js';

export let currentLanguage = localStorage.getItem('lang') || 'vi'; // Default to Vietnamese

// Function to update content based on selected language
export function updateContent(lang) {
    const elements = document.querySelectorAll('[data-lang-key]');
    elements.forEach(el => {
        const key = el.getAttribute('data-lang-key');
        if (languages[lang][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = languages[lang][key];
            } else if (el.tagName === 'TITLE') {
                document.title = languages[lang][key];
            } else {
                el.innerHTML = languages[lang][key];
            }
        }
    });

    // Update dynamically loaded project content
    portfolioProjects.forEach(project => {
        const projectCard = document.getElementById(`project-card-${project.id}`);
        if (projectCard) {
            projectCard.querySelector('.project-title').textContent = languages[lang][project.title_key];
            projectCard.querySelector('.project-description').textContent = languages[lang][project.desc_key];

            const skillsContainer = projectCard.querySelector('.project-skills-container');
            skillsContainer.innerHTML = ''; // Clear existing skills

            // Filter out unwanted skills
            const skillsToExclude = ['Marketing', 'UI/UX', 'Digital Marketing'];
            const allSkills = languages[lang][project.skills_key].split(', ').map(skill => skill.trim());
            const filteredSkills = allSkills.filter(skill => !skillsToExclude.includes(skill));

            filteredSkills.forEach(skill => {
                const span = document.createElement('span');
                span.classList.add('skill-tag');
                span.textContent = skill;
                skillsContainer.appendChild(span);
            });
        }
    });

    document.documentElement.lang = lang; // Update HTML lang attribute
    const langButton = document.getElementById('lang-toggle-button');
    if (langButton) {
        langButton.textContent = lang.toUpperCase() === 'VI' ? 'EN' : 'VI'; // Update button text
    }
    localStorage.setItem('lang', lang); // Save preference
}

export function setupLanguageToggle() {
    const langToggleButton = document.getElementById('lang-toggle-button');
    if (langToggleButton) {
        langToggleButton.addEventListener('click', () => {
            currentLanguage = currentLanguage === 'vi' ? 'en' : 'vi';
            updateContent(currentLanguage);
        });
    }
}