document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    const loadingAnimationImage = document.getElementById('loadingAnimationImage');
    const contactButton = document.getElementById('contactButton');
    const progressText = document.getElementById('progressText');

    const minDisplayTime = 3000; // Thời gian hiển thị tối thiểu của màn hình chờ (3 giây)
    let startTime = performance.now(); // Ghi lại thời gian DOMContentLoaded
    let actualLoadCompleteTime = null; // Thời gian thực tế khi window.onload bắn
    let preloaderImageReady = false; // Cờ cho biết ảnh preloader đã tải xong
    let allPageAssetsLoaded = false; // Cờ cho biết window.onload đã bắn
    let preloaderHidden = false; // Cờ để tránh ẩn nhiều lần

    // Biến cờ để kiểm tra xem đã click nút "Contact Now" chưa
    let contactButtonClicked = false;

    // Hàm để tính toán và đặt chiều cao viewport thực tế
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--app-height', `${vh * 100}px`);
    }

    // Gọi hàm một lần khi khởi tạo
    setViewportHeight();
    // Lắng nghe sự kiện thay đổi kích thước và xoay màn hình để cập nhật lại chiều cao
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);

    // Hàm để ẩn màn hình chờ
    function hidePreloader() {
        if (preloader && !preloaderHidden) { // Kiểm tra để tránh ẩn nhiều lần
            preloaderHidden = true; // Đặt cờ đã ẩn
            preloader.classList.add('preloader-hidden');
            // Xóa preloader khỏi DOM sau khi transition kết thúc
            preloader.addEventListener('transitionend', () => {
                preloader.remove();
                document.body.style.overflow = 'auto'; // Cho phép cuộn trang lại
                // Kích hoạt animation của trang chính sau khi preloader biến mất
                // Ví dụ: gsap.to('.main-content', { opacity: 1, y: 0, duration: 1 });
            }, { once: true }); // Chỉ lắng nghe một lần
        }
    }

    // Hàm để cập nhật phần trăm tiến độ
    function updateProgressBar(percentage) {
        if (progressText) {
            progressText.textContent = `${Math.round(percentage)}%`;
        }
    }

    // Hàm kiểm tra tất cả điều kiện để ẩn preloader
    function checkAndHidePreloaderConditions() {
        // Điều kiện 1: Tất cả tài nguyên của trang đã tải (window.onload)
        // Điều kiện 2: Ảnh động của preloader đã sẵn sàng
        // Điều kiện 3: Thời gian hiển thị tối thiểu đã trôi qua HOẶC nút Contact đã được click
        if (allPageAssetsLoaded && preloaderImageReady && 
           (performance.now() - startTime >= minDisplayTime || contactButtonClicked)) {
            hidePreloader();
        } else if (allPageAssetsLoaded && preloaderImageReady && !contactButtonClicked) {
            // Nếu đã tải xong nhưng chưa đủ thời gian tối thiểu,
            // đặt một timeout để ẩn sau khi đủ thời gian
            const remainingTime = minDisplayTime - (performance.now() - startTime);
            if (remainingTime > 0) {
                setTimeout(hidePreloader, remainingTime);
            }
        }
    }

    // Bắt sự kiện khi ảnh động preloader đã tải xong
    if (loadingAnimationImage) {
        const imageLoadPromise = new Promise(resolve => {
            if (loadingAnimationImage.complete && loadingAnimationImage.naturalHeight !== 0) { 
                // Kiểm tra naturalHeight để đảm bảo ảnh không lỗi
                resolve();
            } else {
                loadingAnimationImage.addEventListener('load', resolve);
                loadingAnimationImage.addEventListener('error', resolve); 
            }
        });

        imageLoadPromise.then(() => {
            preloaderImageReady = true;
            checkAndHidePreloaderConditions();
        });
    } else {
        preloaderImageReady = true; // Nếu không có ảnh preloader, coi như đã sẵn sàng
        checkAndHidePreloaderConditions(); // Vẫn kiểm tra nếu không có ảnh
    }

    // Bắt sự kiện khi toàn bộ trang (bao gồm tài nguyên ngoài) đã tải xong
    window.addEventListener('load', () => {
        actualLoadCompleteTime = performance.now();
        allPageAssetsLoaded = true;
        updateProgressBar(100); // Cập nhật 100% khi tất cả tài nguyên đã tải
        checkAndHidePreloaderConditions(); // Gọi lại để kiểm tra ẩn preloader
    });

    // Lắng nghe sự kiện click nút Contact Now
    if (contactButton) {
        contactButton.addEventListener('click', (event) => {
            event.preventDefault(); 
            contactButtonClicked = true;
            
            // Đảm bảo nút không biến mất cùng preloader
            contactButton.style.position = 'fixed';
            contactButton.style.zIndex = '10001'; 
            contactButton.style.right = '5vw';
            contactButton.style.bottom = '5vh';

            hidePreloader(); // Ẩn preloader ngay lập tức khi nút được click

            // Chuyển hướng đến phần contact (ví dụ: dùng ScrollTo hoặc thay đổi URL)
            const targetSectionId = contactButton.dataset.target || 'contact'; 
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.location.href = `#${targetSectionId}`;
            }
        });
    }

    // Logic cập nhật tiến độ giả định
    let currentFictionalProgress = 0;
    const fictionalProgressInterval = setInterval(() => {
        // Chỉ cập nhật tiến độ giả nếu trang chưa tải xong (chưa đạt 100%)
        if (!allPageAssetsLoaded && currentFictionalProgress < 99) {
            currentFictionalProgress += Math.random() * 5; 
            if (currentFictionalProgress >= 99) {
                currentFictionalProgress = 99; 
                clearInterval(fictionalProgressInterval);
            }
            updateProgressBar(currentFictionalProgress);
        } else if (allPageAssetsLoaded) {
            // Nếu đã tải xong, dừng interval ngay lập tức nếu chưa dừng
            clearInterval(fictionalProgressInterval);
            // updateProgressBar(100) đã được gọi trong window.onload
        }
    }, 100); 

    // Đảm bảo body có overflow: hidden khi preloader hiển thị
    document.body.style.overflow = 'hidden';
});