// js/services.js
import { projectMapping, languages } from './data.js';
import { currentLanguage, updateContent } from './language.js'; // Import updateContent to translate 'no_projects'

let activeServiceId = null;
let autoSlideInterval;
let currentProjectIndex = 0;

export function setupServiceDetailsToggle() {
    document.querySelectorAll('.toggle-details').forEach(button => {
        button.addEventListener('click', function() {
            const serviceId = this.dataset.serviceId;
            toggleServiceDetails(serviceId);
        });
    });

    window.addEventListener('resize', () => {
        if (activeServiceId) { // Only re-evaluate if a service is expanded
            const activeCardElement = document.getElementById(activeServiceId);
            const projectCarouselWrapper = activeCardElement.querySelector('.project-carousel-wrapper');

            if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768) {
                startAutoSlide(activeCardElement);
                projectCarouselWrapper.removeEventListener('mousemove', handleCarouselMouseMove);
                projectCarouselWrapper.removeEventListener('mouseleave', handleCarouselMouseLeave);
            } else {
                stopAutoSlide();
                projectCarouselWrapper.addEventListener('mousemove', (e) => handleCarouselMouseMove(e, activeCardElement));
                projectCarouselWrapper.removeEventListener('mouseleave', (e) => handleCarouselMouseLeave(e, activeCardElement));
            }
            updateCarouselDisplay(activeCardElement); // Update carousel position after resize
        }
    });
}

function loadCarousel(serviceId, cardElement) {
    const carouselInner = cardElement.querySelector('.carousel-inner');
    let carouselIndicatorsContainer = cardElement.querySelector('.carousel-indicators');

    carouselInner.innerHTML = '';
    carouselIndicatorsContainer.innerHTML = '';

    const projects = projectMapping[serviceId];
    if (projects && projects.length > 0) {
        projects.forEach((project, index) => {
            const item = document.createElement('div');
            item.classList.add('carousel-item');
            const img = document.createElement('img');
            img.src = project.src;
            img.alt = project.caption;
            item.appendChild(img);
            carouselInner.appendChild(item);

            const indicator = document.createElement('span');
            indicator.classList.add('w-3', 'h-3', 'bg-gray-400', 'rounded-full', 'cursor-pointer', 'transition-colors', 'duration-300');
            indicator.dataset.index = index;
            indicator.addEventListener('click', () => {
                currentProjectIndex = index;
                updateCarouselDisplay(cardElement);
                resetAutoSlide(cardElement);
            });
            carouselIndicatorsContainer.appendChild(indicator);
        });
        currentProjectIndex = 0;
        updateCarouselDisplay(cardElement);

        const projectCarouselWrapper = cardElement.querySelector('.project-carousel-wrapper');
        projectCarouselWrapper.removeEventListener('mousemove', handleCarouselMouseMove);
        projectCarouselWrapper.removeEventListener('mouseleave', handleCarouselMouseLeave);

        if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768) {
            startAutoSlide(cardElement);
        } else {
            stopAutoSlide();
            projectCarouselWrapper.addEventListener('mousemove', (e) => handleCarouselMouseMove(e, cardElement));
            projectCarouselWrapper.addEventListener('mouseleave', (e) => handleCarouselMouseLeave(e, cardElement));
        }

    } else {
        carouselInner.innerHTML = `<p class="text-gray-medium text-center" data-lang-key="no_projects">${languages[currentLanguage]['no_projects']}</p>`;
        // updateContent(currentLanguage); // This might cause a loop if called inside loadCarousel, better to handle directly.
        stopAutoSlide();
    }
}

function updateCarouselDisplay(cardElement) {
    const carouselInner = cardElement.querySelector('.carousel-inner');
    const carouselIndicators = cardElement.querySelectorAll('.carousel-indicators span');

    const projects = projectMapping[cardElement.id];
    if (!projects || projects.length === 0) return;

    carouselInner.style.transform = `translateX(-${currentProjectIndex * 100}%)`;

    carouselIndicators.forEach((indicator, index) => {
        if (index === currentProjectIndex) {
            indicator.classList.remove('bg-gray-400');
            indicator.classList.add('bg-blue-500', 'active');
        } else {
            indicator.classList.remove('bg-blue-500', 'active');
            indicator.classList.add('bg-gray-400');
        }
    });
}

function handleCarouselMouseMove(event, cardElement) {
    const projectCarouselWrapper = cardElement.querySelector('.project-carousel-wrapper');
    const rect = projectCarouselWrapper.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const elementWidth = rect.width;
    const projects = projectMapping[cardElement.id];
    const totalProjects = projects ? projects.length : 0;

    if (totalProjects <= 1) {
        currentProjectIndex = 0;
        updateCarouselDisplay(cardElement);
        return;
    }

    const segmentWidth = elementWidth / totalProjects;
    let newIndex = Math.floor(mouseX / segmentWidth);
    newIndex = Math.max(0, Math.min(totalProjects - 1, newIndex));

    if (newIndex !== currentProjectIndex) {
        currentProjectIndex = newIndex;
        updateCarouselDisplay(cardElement);
    }
}

function handleCarouselMouseLeave(event, cardElement) {
    // As per previous request, no reset on mouse leave for desktop
}

function startAutoSlide(cardElement) {
    stopAutoSlide();
    autoSlideInterval = setInterval(() => {
        const projects = projectMapping[cardElement.id];
        if (projects && projects.length > 0) {
            currentProjectIndex = (currentProjectIndex + 1) % projects.length;
            updateCarouselDisplay(cardElement);
        }
    }, 3000);
}

function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }
}

function resetAutoSlide(cardElement) {
    if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768) {
        stopAutoSlide();
        startAutoSlide(cardElement);
    }
}

function toggleServiceDetails(serviceId) {
    const allServiceCards = document.querySelectorAll('.service-card');
    const clickedCard = document.getElementById(serviceId);
    const clickedIcon = clickedCard.querySelector('.toggle-details i');
    const projectCarouselWrapper = clickedCard.querySelector('.project-carousel-wrapper');
    const servicesCardsContainer = document.getElementById('services-cards-container');

    const isCurrentlyExpanded = clickedCard.classList.contains('expanded');

    // Reset all cards and container to their default collapsed state (3-column grid)
    allServiceCards.forEach(card => {
        card.classList.remove('expanded', 'hidden-by-expansion'); // Remove all state classes
        card.querySelector('.toggle-details i').classList.replace('fa-times', 'fa-plus'); // Reset icon
        // Ensure carousel wrapper is hidden for all cards
        const pcw = card.querySelector('.project-carousel-wrapper');
        if (pcw) {
            pcw.classList.remove('carousel-visible'); // Remove carousel visible class
        }
    });
    servicesCardsContainer.classList.remove('services-expanded'); // Reset container layout

    stopAutoSlide(); // Stop auto-slide for any previous active card

    if (isCurrentlyExpanded) {
        // If clicked card was expanded, we just collapsed it.
        // The reset above already handled the collapse. So we just exit.
        activeServiceId = null;
        return;
    }

    // If the clicked card was not expanded, we will expand it.
    clickedCard.classList.add('expanded'); // Mark clicked card as expanded
    clickedIcon.classList.replace('fa-plus', 'fa-times'); // Change icon

    // Hide other cards by adding `hidden-by-expansion` class
    allServiceCards.forEach(card => {
        if (card.id !== serviceId) {
            card.classList.add('hidden-by-expansion');
        }
    });

    // Set container to expanded state layout (flex row for desktop)
    servicesCardsContainer.classList.add('services-expanded');

    // Ensure the active card's project carousel is visible
    projectCarouselWrapper.classList.add('carousel-visible'); // Add the new class

    // Load and display projects for the active service
    loadCarousel(serviceId, clickedCard);
    activeServiceId = serviceId;
}