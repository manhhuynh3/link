document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    // Đã đổi tên biến từ loadingVideo thành loadingAnimationImage để khớp với HTML
    const loadingAnimationImage = document.getElementById('loadingAnimationImage'); 
    const contactButton = document.getElementById('contactButton');
    const progressText = document.getElementById('progressText');

    const minDisplayTime = 3000; // Thời gian hiển thị tối thiểu của màn hình chờ (3 giây)
    let startTime = performance.now(); // Ghi lại thời gian DOMContentLoaded
    let actualLoadCompleteTime = null; // Thời gian thực tế khi window.onload bắn
    let preloaderImageReady = false; // Cờ cho biết ảnh preloader đã tải xong
    let allPageAssetsLoaded = false; // Cờ cho biết window.onload đã bắn
    let preloaderHidden = false; // Cờ để tránh ẩn preloader nhiều lần

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
        // Chỉ ẩn preloader nếu nó chưa bị ẩn
        if (preloader && !preloaderHidden) { 
            preloaderHidden = true; // Đặt cờ đã ẩn

            // Thêm class để kích hoạt transition ẩn
            preloader.classList.add('preloader-hidden');

            // === QUAN TRỌNG: XÓA CLASS 'is-loading' KHỎI BODY ===
            // Điều này sẽ hiển thị nội dung chính của trang
            document.body.classList.remove('is-loading'); 
            
            // Cho phép cuộn trang trở lại
            document.body.style.overflow = 'auto'; 

            // Đảm bảo preloader được loại bỏ khỏi DOM sau khi animation kết thúc
            // Điều này ngăn nó chiếm không gian hoặc gây ra các vấn đề về tương tác
            preloader.addEventListener('transitionend', () => {
                preloader.remove();
                // Nếu bạn có các animation khởi tạo cho trang chính (ví dụ với GSAP),
                // bạn có thể kích hoạt chúng tại đây
                // Ví dụ: gsap.to('.main-content', { opacity: 1, y: 0, duration: 1, ease: 'power2.out' });
            }, { once: true }); // Chỉ lắng nghe sự kiện transitionend một lần
        }
    }

    // Hàm để cập nhật phần trăm tiến độ hiển thị trên màn hình
    function updateProgressBar(percentage) {
        if (progressText) {
            progressText.textContent = `${Math.round(percentage)}%`;
        }
    }

    // Hàm kiểm tra các điều kiện để quyết định khi nào ẩn preloader
    function checkAndHidePreloaderConditions() {
        // Điều kiện để ẩn preloader:
        // 1. Tất cả tài nguyên của trang đã tải xong (allPageAssetsLoaded)
        // 2. Ảnh động của preloader đã sẵn sàng để hiển thị (preloaderImageReady)
        // 3. Đã đủ thời gian hiển thị tối thiểu (minDisplayTime) HOẶC nút Contact đã được click
        if (allPageAssetsLoaded && preloaderImageReady && 
           (performance.now() - startTime >= minDisplayTime || contactButtonClicked)) {
            hidePreloader();
        } else if (allPageAssetsLoaded && preloaderImageReady && !contactButtonClicked) {
            // Nếu trang và ảnh preloader đã tải xong, nhưng chưa đủ thời gian tối thiểu
            // Đặt một hẹn giờ để ẩn preloader sau thời gian còn lại
            const remainingTime = minDisplayTime - (performance.now() - startTime);
            if (remainingTime > 0) {
                setTimeout(hidePreloader, remainingTime);
            } else {
                // Trường hợp thời gian đã đủ hoặc đã vượt quá minDisplayTime nhưng chưa ẩn
                // (ví dụ: do một lần gọi checkAndHidePreloaderConditions trước đó đã không thành công)
                hidePreloader();
            }
        }
    }

    // Bắt sự kiện khi ảnh động preloader đã tải xong
    if (loadingAnimationImage) {
        // Sử dụng Promise để xử lý việc tải ảnh một cách linh hoạt
        const imageLoadPromise = new Promise(resolve => {
            // Nếu ảnh đã được tải (ví dụ: từ cache) và không bị lỗi
            if (loadingAnimationImage.complete && loadingAnimationImage.naturalHeight !== 0) { 
                resolve();
            } else {
                // Nếu ảnh chưa tải, lắng nghe sự kiện 'load' hoặc 'error'
                loadingAnimationImage.addEventListener('load', resolve);
                loadingAnimationImage.addEventListener('error', resolve); 
            }
        });

        imageLoadPromise.then(() => {
            preloaderImageReady = true; // Đặt cờ là ảnh đã sẵn sàng
            checkAndHidePreloaderConditions(); // Kiểm tra điều kiện ẩn preloader
        });
    } else {
        preloaderImageReady = true; // Nếu không có ảnh preloader, coi như nó đã sẵn sàng ngay lập tức
        checkAndHidePreloaderConditions(); // Vẫn kiểm tra điều kiện ẩn
    }

    // Bắt sự kiện khi toàn bộ trang (bao gồm tất cả hình ảnh, CSS, JavaScript bên ngoài) đã tải xong
    window.addEventListener('load', () => {
        actualLoadCompleteTime = performance.now(); // Ghi lại thời gian tải hoàn tất
        allPageAssetsLoaded = true; // Đặt cờ là tất cả tài nguyên đã tải
        updateProgressBar(100); // Cập nhật phần trăm tiến độ lên 100%
        checkAndHidePreloaderConditions(); // Kiểm tra điều kiện ẩn preloader
    });

    // Lắng nghe sự kiện click vào nút "Contact Now"
    if (contactButton) {
        contactButton.addEventListener('click', (event) => {
            event.preventDefault(); // Ngăn chặn hành vi mặc định của thẻ <a> hoặc <button>
            contactButtonClicked = true; // Đặt cờ là nút đã được click
            
            // Điều chỉnh vị trí của nút Contact để nó không bị ẩn đi cùng preloader
            // Đảm bảo nút vẫn hiển thị và có thể tương tác sau khi preloader ẩn
            contactButton.style.position = 'fixed';
            contactButton.style.zIndex = '10001'; 
            contactButton.style.right = '5vw';
            contactButton.style.bottom = '5vh';

            hidePreloader(); // Ẩn preloader ngay lập tức khi nút được click

            // Chuyển hướng đến phần liên hệ (ví dụ: dùng ScrollTo hoặc thay đổi URL)
            // Lấy ID của phần tử đích từ thuộc tính data-target (nếu có) hoặc mặc định là 'contact'
            const targetSectionId = contactButton.dataset.target || 'contact'; 
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                // Cuộn mượt mà đến phần tử đích
                targetSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                // Fallback: nếu không tìm thấy phần tử đích, chuyển hướng đến URL có hash
                window.location.href = `#${targetSectionId}`;
            }
        });
    }

    // Logic cập nhật tiến độ giả định (để hiển thị % tăng dần một cách mượt mà)
    let currentFictionalProgress = 0;
    const fictionalProgressInterval = setInterval(() => {
        // Chỉ cập nhật tiến độ giả nếu trang chưa tải xong (chưa đạt 100%)
        if (!allPageAssetsLoaded && currentFictionalProgress < 99) {
            currentFictionalProgress += Math.random() * 5; // Tăng tiến độ ngẫu nhiên
            if (currentFictionalProgress >= 99) {
                currentFictionalProgress = 99; // Giới hạn ở 99% để chờ tải thực tế
                clearInterval(fictionalProgressInterval); // Dừng cập nhật giả
            }
            updateProgressBar(currentFictionalProgress);
        } else if (allPageAssetsLoaded) {
            // Nếu tất cả tài nguyên đã tải xong, đảm bảo interval dừng lại
            clearInterval(fictionalProgressInterval);
            // updateProgressBar(100) đã được gọi trong window.onload
        }
    }, 100); // Cập nhật mỗi 100ms
});