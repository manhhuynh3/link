// js/main.js

import { updateContent, setupLanguageToggle, currentLanguage } from './language.js';
import { applyTheme, setupThemeToggle, currentTheme } from './theme.js';
import { setupSmoothScrolling, setupScrollReveal, setupHeroParallax } from './scroll-effects.js';
import { createPortfolioCards } from './portfolio.js';
// Loại bỏ import setupServiceDetailsToggle vì nó không còn được sử dụng
// import { setupServiceDetailsToggle } from './services.js'; 
import { setupMobileNavigation } from './mobile-nav.js';

// Hàm để ẩn preloader và hiển thị nội dung chính
function hidePreloaderAndShowContent() {
    const preloaderWrapper = document.querySelector('.preloader-wrapper');
    const body = document.body;

    // Thêm lớp 'preloader-hidden' vào preloader để kích hoạt hiệu ứng ẩn dần
    // (được định nghĩa trong preloader.css)
    if (preloaderWrapper) {
        preloaderWrapper.classList.add('preloader-hidden');
    }

    // Loại bỏ lớp 'is-loading' khỏi thẻ body.
    // Điều này là CỰC KỲ QUAN TRỌNG:
    // - Nó sẽ làm cho các phần tử nội dung chính của bạn (header, footer, main, sections)
    //   thoát khỏi trạng thái `visibility: hidden; opacity: 0;` do CSS inline trong index.html quy định.
    // - Khi các phần tử này trở nên "có thể nhìn thấy" trong luồng tài liệu,
    //   IntersectionObserver trong setupScrollReveal() mới có thể phát hiện và
    //   thêm lớp 'visible' để kích hoạt hiệu ứng động.
    if (body.classList.contains('is-loading')) {
        body.classList.remove('is-loading');
    }

    // Tùy chọn: Sau khi hiệu ứng chuyển đổi của preloader hoàn tất,
    // xóa preloader khỏi DOM để giải phóng tài nguyên.
    // Thời gian timeout (900ms) nên khớp với thời gian transition trong preloader.css (0.9s).
    setTimeout(() => {
        if (preloaderWrapper && preloaderWrapper.parentNode) {
            preloaderWrapper.parentNode.removeChild(preloaderWrapper);
        }
    }, 900);
}


window.onload = function() {
    const header = document.querySelector('header');
    if (header) {
        const headerHeight = header.offsetHeight;
        // Gán margin-top cho main-content bằng chiều cao header, chỉ trên mobile
        const main = document.getElementById('main-content');
        if (main) {
            if (window.innerWidth < 768) { // mobile breakpoint
                main.style.marginTop = headerHeight + 'px';
            } else {
                main.style.marginTop = '';
            }
        }
    }

    // Thiết lập các chức năng chung
    setupHeroParallax();
    createPortfolioCards();
    setupLanguageToggle();
    setupThemeToggle();
    setupSmoothScrolling();
    setupScrollReveal(); 
    setupMobileNavigation();

    // Khởi tạo nội dung với ngôn ngữ và chủ đề hiện tại
    updateContent(currentLanguage);
    applyTheme(currentTheme);

    // Gọi hàm để ẩn preloader và hiển thị nội dung chính
    // Đảm bảo hàm này được gọi sau khi setupScrollReveal() để các phần tử có thể được quan sát
    hidePreloaderAndShowContent();
};