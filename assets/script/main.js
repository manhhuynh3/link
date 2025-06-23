// assets/script/main.js

import { updateContent, setupLanguageToggle, currentLanguage } from './language.js'; //
import { setupSmoothScrolling, setupScrollReveal, setupHeroParallax } from './scroll-effects.js'; //
import { createPortfolioCards } from './portfolio.js'; //
import { setupMobileNavigation } from './mobile-nav.js'; //

// Hàm để ẩn preloader và hiển thị nội dung chính
function hidePreloaderAndShowContent() {
    // Tắt hoàn toàn trên mobile (chỉ chạy trên desktop)
    if (window.innerWidth < 768) return;
    const preloaderWrapper = document.querySelector('.preloader-wrapper'); //
    const body = document.body; //

    // Thêm lớp 'preloader-hidden' vào preloader để kích hoạt hiệu ứng ẩn dần
    if (preloaderWrapper) { //
        preloaderWrapper.classList.add('preloader-hidden'); //
    }

    // Loại bỏ lớp 'is-loading' khỏi thẻ body.
    if (body.classList.contains('is-loading')) { //
        body.classList.remove('is-loading'); //
    }

    // Tùy chọn: Sau khi hiệu ứng chuyển đổi của preloader hoàn tất,
    // xóa preloader khỏi DOM để giải phóng tài nguyên.
    setTimeout(() => { //
        if (preloaderWrapper && preloaderWrapper.parentNode) { //
            preloaderWrapper.parentNode.removeChild(preloaderWrapper); //
        }
    }, 900); //
}

// Cập nhật --app-height cho mobile preloader
function setAppHeight() {
    const doc = document.documentElement; //
    doc.style.setProperty('--app-height', `${window.innerHeight}px`); //
}

// -----------------------------------------------------------------------------
// Logic khởi tạo các thành phần chính
// Đảm bảo các hàm khởi tạo được gọi sau khi DOM đã sẵn sàng
// -----------------------------------------------------------------------------

// Lắng nghe sự kiện 'headerLoaded' từ loadTemplates.js
// Sự kiện này được kích hoạt khi header.html được chèn vào DOM.
document.addEventListener('headerLoaded', () => {
    // Khởi tạo Mobile Navigation sau khi header đã được tải
    setupMobileNavigation(); //
});

// Lắng nghe sự kiện DOMContentLoaded
// Đây là điểm khởi đầu cho các script khi DOM đã được tải hoàn chỉnh.
// Nó cũng đóng vai trò fallback cho trường hợp header đã có sẵn trong index.html
// và không được load qua loadTemplates.js.
document.addEventListener('DOMContentLoaded', () => {
    // Đảm bảo setupMobileNavigation chỉ được gọi một lần
    const mobileToggle = document.getElementById('mobile-toggle'); //
    if (mobileToggle && !mobileToggle.hasAttribute('data-mobile-nav-initialized')) {
        setupMobileNavigation(); //
        mobileToggle.setAttribute('data-mobile-nav-initialized', 'true'); //
    }

    // Thiết lập chiều cao header cho main-content trên mobile
    const header = document.querySelector('header'); //
    if (header) { //
        const headerHeight = header.offsetHeight; //
        const main = document.getElementById('main-content'); //
        if (main) { //
            // Áp dụng margin-top chỉ khi không ở chế độ desktop (ví dụ: < 768px)
            if (window.innerWidth < 768) { // mobile breakpoint
                main.style.marginTop = headerHeight + 'px'; //
            } else {
                main.style.marginTop = ''; // Xóa margin-top trên desktop
            }
        }
    }

    // Các chức năng chung khác có thể được gọi ở đây,
    // đảm bảo chúng không phụ thuộc vào header được tải bất đồng bộ
    // hoặc có logic riêng để xử lý việc DOM thay đổi.
    setupHeroParallax(); //
    createPortfolioCards(); //
    setupLanguageToggle(); //
    setupSmoothScrolling(); //
    setupScrollReveal(); //
    updateContent(currentLanguage); //

    // Gọi hàm để ẩn preloader và hiển thị nội dung chính
    hidePreloaderAndShowContent(); //
});

// Khởi tạo chiều cao ứng dụng khi tải trang và khi thay đổi kích thước cửa sổ
window.addEventListener('resize', setAppHeight); //
setAppHeight(); //

// `window.onload` chỉ nên chứa những gì cần thiết sau khi TẤT CẢ tài nguyên (bao gồm hình ảnh, video) đã tải.
// Hầu hết các khởi tạo DOM có thể được chuyển sang DOMContentLoaded.
window.onload = function() {
    // Không cần gọi lại các setup chức năng ở đây nếu chúng đã được xử lý trong DOMContentLoaded
    // hoặc headerLoaded, để tránh trùng lặp.
    // Các chức năng ẩn preloader và hiển thị nội dung chính đã được gọi trong DOMContentLoaded.
};