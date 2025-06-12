// js/scroll-effects.js

export function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

export function setupScrollReveal() {
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-x');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 /* Element is 10% visible */
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    scrollRevealElements.forEach(el => observer.observe(el));
}

export function setupHeroParallax() {
    const heroTextContent = document.getElementById('hero-text-content');
    if (!heroTextContent) return;

    const parallaxSpeed = 0.2; // Adjust this value for more/less parallax

    function handleHeroParallax() {
        const scrollY = window.scrollY;
        heroTextContent.style.transform = `translateY(${scrollY * parallaxSpeed}px)`;
    }

    window.addEventListener('scroll', handleHeroParallax);
    handleHeroParallax(); // Call initially to set correct position
}