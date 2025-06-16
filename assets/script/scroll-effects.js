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
    // Kiểm tra nếu đang ở màn hình nhỏ (mobile) trước khi thiết lập observer
    // Sử dụng 768px làm breakpoint, khớp với 'md' của Tailwind CSS
    if (window.innerWidth < 768) {
        // Nếu ở mobile, đảm bảo tất cả các phần tử scroll-reveal hiển thị ngay lập tức
        document.querySelectorAll('.scroll-reveal, .scroll-reveal-x').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
            el.style.transition = 'none';
            el.style.visibility = 'visible';
            el.classList.add('visible'); // Thêm lớp 'visible' để đồng bộ hóa styling nếu có quy tắc phụ thuộc
        });
        return; // Thoát khỏi hàm, không thiết lập IntersectionObserver
    }

    const scrollRevealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-x');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 /* Phần tử hiển thị 10% */
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

    const parallaxSpeed = 0.2; // Điều chỉnh giá trị này để có nhiều/ít hiệu ứng parallax hơn

    function handleHeroParallax() {
        const scrollY = window.scrollY;
        heroTextContent.style.transform = `translateY(${scrollY * parallaxSpeed}px)`;
    }

    window.addEventListener('scroll', handleHeroParallax);
}