// /assets/script/videoCarousel.js

export function initializeVideoCarousel() {
    const carouselContainer = document.getElementById('desktop-video-carousel-container');
    const innerCarousel = document.getElementById('desktop-video-carousel-inner');
    const paginationContainer = document.getElementById('desktop-video-pagination');
    const arrowLeft = document.getElementById('carousel-arrow-left');
    const arrowRight = document.getElementById('carousel-arrow-right');

    // Thoát nếu không tìm thấy các phần tử cần thiết (ví dụ: trên mobile hoặc HTML không đúng)
    if (!carouselContainer || !innerCarousel || !paginationContainer || !arrowLeft || !arrowRight) {
        // console.warn('Carousel elements not found or not on desktop. Skipping video carousel initialization.');
        return;
    }

    const videoSlides = Array.from(innerCarousel.querySelectorAll('.custom-carousel-slide'));
    const totalSlides = videoSlides.length;

    if (totalSlides === 0) {
        carouselContainer.style.display = 'none'; // Ẩn carousel nếu không có video
        return;
    }

    let currentSlideIndex = 0; // Index của video trung tâm (active)

    // Đặt biến CSS tùy chỉnh cho tổng số slide để tính toán chiều rộng của innerCarousel
    innerCarousel.style.setProperty('--total-slides', totalSlides);


    // Tạo các chấm chỉ báo (pagination dots)
    const paginationDots = [];
    paginationContainer.innerHTML = ''; // Xóa dots cũ nếu khởi tạo lại
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.classList.add('custom-carousel-dot');
        if (i === 0) {
            dot.classList.add('active');
        }
        dot.addEventListener('click', () => {
            stopAllVideos(); // Dừng tất cả các video trước khi chuyển
            currentSlideIndex = i;
            updateCarouselDisplay(true); // Kích hoạt autoplay khi click dot
        });
        paginationContainer.appendChild(dot);
        paginationDots.push(dot);
    }

    // Hàm để lấy URL gốc của video (không có tham số autoplay)
    function getOriginalVideoSrc(iframeElement) {
        const src = iframeElement.getAttribute('src');
        const url = new URL(src);
        url.searchParams.delete('autoplay');
        url.searchParams.delete('mute');
        url.searchParams.delete('start'); // Xóa tham số start nếu có
        return url.toString();
    }

    // Hàm để dừng tất cả các video
    function stopAllVideos() {
        videoSlides.forEach(slide => {
            const iframe = slide.querySelector('iframe');
            if (iframe) {
                const originalSrc = getOriginalVideoSrc(iframe);
                if (iframe.src !== originalSrc) {
                    iframe.src = originalSrc; // Reset src để dừng video
                }
            }
        });
    }

    // Hàm cập nhật hiển thị carousel và quản lý video
    const updateCarouselDisplay = (shouldAutoplay = false) => {
        // Tính toán translateX để căn giữa slide active
        const slideWidth = carouselContainer.offsetWidth / 3; // Lấy chiều rộng hiển thị của 1 slide
        const translateXValue = -(currentSlideIndex * slideWidth) + slideWidth; // Dịch chuyển để slide active nằm giữa

        innerCarousel.style.transform = `translateX(${translateXValue}px)`;

        paginationDots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentSlideIndex);
        });

        videoSlides.forEach((slide, idx) => {
            const iframe = slide.querySelector('iframe');
            if (iframe) {
                const originalSrc = getOriginalVideoSrc(iframe);

                // Áp dụng blur cho các slide không phải active
                if (idx !== currentSlideIndex) {
                    slide.classList.add('blurred');
                } else {
                    slide.classList.remove('blurred');
                }

                // Quản lý trạng thái phát/dừng video
                if (idx === currentSlideIndex && shouldAutoplay) {
                    // Nếu là video của slide hiện tại và được phép autoplay
                    if (!iframe.src.includes('autoplay=1')) {
                        // Thêm tham số autoplay=1 và mute=1
                        const newSrc = `${originalSrc}${originalSrc.includes('?') ? '&' : '?'}autoplay=1&mute=1`;
                        iframe.src = newSrc;
                    }
                } else {
                    // Dừng tất cả các video không phải active
                    if (iframe.src !== originalSrc) {
                        iframe.src = originalSrc;
                    }
                }
            }
        });
    };

    // Hàm chuyển slide tiếp theo
    const nextSlide = () => {
        stopAllVideos(); // Dừng tất cả trước khi chuyển
        currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
        updateCarouselDisplay(true);
    };

    // Hàm chuyển slide trước đó
    const prevSlide = () => {
        stopAllVideos(); // Dừng tất cả trước khi chuyển
        currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
        updateCarouselDisplay(true);
    };

    // =========================================
    // Lắng nghe sự kiện cho mũi tên điều hướng
    // =========================================
    arrowRight.addEventListener('click', () => {
        nextSlide();
    });

    arrowLeft.addEventListener('click', () => {
        prevSlide();
    });

    // Các đoạn mã xử lý hover đã bị loại bỏ như yêu cầu


    // Khởi tạo hiển thị lần đầu khi tải trang
    // Chỉ chạy khi màn hình là desktop
    if (window.innerWidth >= 768) {
        updateCarouselDisplay(true); // Video đầu tiên sẽ autoplay (tắt tiếng) khi tải trang trên desktop
    }
}

// Chạy hàm khởi tạo khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth >= 768) {
        initializeVideoCarousel();
    }
});

// Điều chỉnh lại khi thay đổi kích thước màn hình
window.addEventListener('resize', () => {
    // Chỉ khởi tạo lại nếu chuyển từ mobile sang desktop hoặc ngược lại, hoặc thay đổi kích thước desktop
    if (window.innerWidth >= 768) {
        initializeVideoCarousel(); // Khởi tạo lại để điều chỉnh bố cục
    } else {
        // Nếu chuyển sang mobile, dừng mọi video đang chạy trên desktop carousel
        const allIframes = document.querySelectorAll('#desktop-video-carousel-inner iframe');
        allIframes.forEach(iframe => {
            const src = iframe.getAttribute('src');
            const url = new URL(src);
            url.searchParams.delete('autoplay');
            url.searchParams.delete('mute');
            iframe.src = url.toString();
        });
    }
});