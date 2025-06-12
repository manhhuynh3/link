// js/portfolio.js
import { portfolioProjects, languages } from './data.js';
import { currentLanguage } from './language.js'; // Import currentLanguage to ensure skills are translated initially

// Function to create and append portfolio cards
export function createPortfolioCards() {
    const portfolioGrid = document.getElementById('portfolio-grid');
    if (!portfolioGrid) return;

    portfolioGrid.innerHTML = ''; // Clear existing content

    portfolioProjects.forEach((project, index) => {
        const card = document.createElement('div');
        card.id = `project-card-${project.id}`;
        card.classList.add('group', 'relative', 'overflow-hidden', 'rounded-xl', 'shadow-xl', 'bg-card', 'transform', 'transition', 'duration-500', 'hover:scale-105', 'hover:shadow-2xl', 'scroll-reveal');
        card.style.transitionDelay = `${index * 100}ms`; // Stagger animation

        // Image thumbnail container
        const thumbnailContainer = document.createElement('div');
        thumbnailContainer.classList.add('project-thumbnail-container');

        // Images for thumbnail carousel
        project.images.forEach((imgSrc, imgIndex) => {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.onerror = function() { this.onerror=null; this.src='https://placehold.co/600x400/1e293b/f8fafc?text=Project+Image'; };
            img.alt = `Project Image ${imgIndex + 1}`;
            img.classList.add('project-thumbnail-image');
            if (imgIndex === 0) {
                img.classList.add('active'); // First image active by default
            }
            thumbnailContainer.appendChild(img);
        });

        // Thumbnail indicators
        const indicatorsContainer = document.createElement('div');
        indicatorsContainer.classList.add('thumbnail-indicators');
        project.images.forEach((_, imgIndex) => {
            const indicator = document.createElement('span');
            if (imgIndex === 0) {
                indicator.classList.add('active');
            }
            indicatorsContainer.appendChild(indicator);
        });
        if (project.images.length > 1) { // Only show indicators if there's more than one image
            thumbnailContainer.appendChild(indicatorsContainer);
        }

        // Auto-slide and hover logic for thumbnails
        let currentImageIndex = 0;
        let autoSlideInterval;
        let hoverInterval; // For faster cycling on hover

        function updateThumbnailDisplay() {
            const images = thumbnailContainer.querySelectorAll('.project-thumbnail-image');
            const indicators = thumbnailContainer.querySelectorAll('.thumbnail-indicators span');
            images.forEach((img, idx) => {
                img.classList.toggle('active', idx === currentImageIndex);
            });
            indicators.forEach((ind, idx) => {
                ind.classList.toggle('active', idx === currentImageIndex);
            });
        }

        function startAutoSlide() {
            stopAutoSlide(); // Clear any existing auto-slide
            if (project.images.length > 1) { // Only auto-slide if more than one image
                autoSlideInterval = setInterval(() => {
                    currentImageIndex = (currentImageIndex + 1) % project.images.length;
                    updateThumbnailDisplay();
                }, 3000); // Auto-slide every 3 seconds
            }
        }

        function stopAutoSlide() {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
                autoSlideInterval = null;
            }
        }

        // Initial start of auto-slide
        startAutoSlide();

        thumbnailContainer.addEventListener('mouseenter', () => {
            stopAutoSlide(); // Stop auto-slide on hover
            if (project.images.length > 1) {
                hoverInterval = setInterval(() => {
                    currentImageIndex = (currentImageIndex + 1) % project.images.length;
                    updateThumbnailDisplay();
                }, 800); // Faster change every 0.8s on hover
            }
        });

        thumbnailContainer.addEventListener('mouseleave', () => {
            if (hoverInterval) {
                clearInterval(hoverInterval); // Clear hover interval
            }
            currentImageIndex = 0; // Reset to first image on mouse leave
            updateThumbnailDisplay(); // Show first image immediately
            startAutoSlide(); // Restart auto-slide
        });

        // Content Div
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('px-6', 'pt-6', 'pb-16', 'text-left');

        const title = document.createElement('h3');
        title.classList.add('text-2xl', 'font-bold', 'text-main', 'mb-2', 'project-title');
        title.setAttribute('data-lang-key', project.title_key);
        title.textContent = languages[currentLanguage][project.title_key]; // Set initial translated title

        const description = document.createElement('p');
        description.classList.add('text-gray-normal', 'text-sm', 'mb-4', 'project-description');
        description.setAttribute('data-lang-key', project.desc_key);
        description.textContent = languages[currentLanguage][project.desc_key]; // Set initial translated description

        const skillsContainer = document.createElement('div');
        skillsContainer.classList.add('flex', 'flex-wrap', 'items-center', 'gap-2', 'mb-4', 'project-skills-container');
        skillsContainer.setAttribute('data-lang-key', project.skills_key);

        // Populate initial skills
        const skillsToExclude = ['Marketing', 'UI/UX', 'Digital Marketing'];
        const allSkills = languages[currentLanguage][project.skills_key].split(', ').map(skill => skill.trim());
        const filteredSkills = allSkills.filter(skill => !skillsToExclude.includes(skill));
        filteredSkills.forEach(skill => {
            const span = document.createElement('span');
            span.classList.add('skill-tag');
            span.textContent = skill;
            skillsContainer.appendChild(span);
        });


        // "Xem chi tiết dự án" button, now positioned absolutely within the card
        const linkButton = document.createElement('a');
        linkButton.href = project.behance_link;
        linkButton.target = '_blank';
        linkButton.rel = 'noopener noreferrer';
        linkButton.classList.add('bg-primary-button', 'hover:bg-primary-button', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded-full', 'shadow-md', 'transition', 'duration-300', 'transform', 'hover:scale-105', 'text-sm', 'project-details-link-button'); // Added new class for positioning
        linkButton.setAttribute('data-lang-key', 'project_details_link');
        linkButton.textContent = languages[currentLanguage]['project_details_link']; // Set initial translated text

        contentDiv.appendChild(title);
        contentDiv.appendChild(description);
        contentDiv.appendChild(skillsContainer);
        card.appendChild(thumbnailContainer); // Add thumbnail container first
        card.appendChild(contentDiv);
        card.appendChild(linkButton); // Add button directly to card for absolute positioning

        portfolioGrid.appendChild(card);
    });
}