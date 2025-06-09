document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    const loadingVideo = document.getElementById('loadingVideo');
    const contactButton = document.getElementById('contactButton');
    const progressText = document.getElementById('progressText');
    let assetsLoaded = 0;
    let totalAssets = 0;
    const minDisplayTime = 3000; // Thời gian hiển thị tối thiểu của màn hình chờ (3 giây)
    let startTime = performance.now(); // Ghi lại thời gian bắt đầu tải
    let actualLoadCompleteTime = null; // Thời gian thực tế khi tất cả tài nguyên đã tải xong

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
        if (contactButtonClicked) {
            preloader.classList.add('preloader-hidden');
            document.body.style.overflow = 'auto';
            return;
        }

        const elapsedTime = performance.now() - startTime;
        const remainingTime = minDisplayTime - elapsedTime;

        if (remainingTime > 0) {
            setTimeout(() => {
                preloader.classList.add('preloader-hidden');
                document.body.style.overflow = 'auto';
            }, remainingTime);
        } else {
            preloader.classList.add('preloader-hidden');
            document.body.style.overflow = 'auto';
        }
    }

    // Lắng nghe sự kiện click trên nút "Contact Now"
    contactButton.addEventListener('click', () => {
        contactButtonClicked = true;
        hidePreloader();
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Hàm cập nhật tiến độ VÀ vị trí của số %
    function updateProgressBar(loadedCount, totalCount) {
        if (totalCount === 0) {
            progressText.textContent = '100%';
            // Trên di động, không cần tính toán bottom động, chỉ đặt nội dung
            if (window.innerWidth >= 768) { // Chỉ áp dụng logic di chuyển trên màn hình lớn
                const progressTextHeight = progressText.offsetHeight;
                const viewportHeight = window.innerHeight;
                const maxBottom = (viewportHeight - progressTextHeight - (5 * viewportHeight / 100));
                progressText.style.bottom = `${maxBottom}px`;
            }
            return;
        }

        let currentPercentage;
        const currentTime = performance.now();
        const elapsedSinceStart = currentTime - startTime;

        if (actualLoadCompleteTime === null) {
            currentPercentage = Math.min(100, Math.round((loadedCount / totalCount) * 100));
        } else {
            const timeToReach100Percent = minDisplayTime;
            const progressRatio = Math.min(1, elapsedSinceStart / timeToReach100Percent);
            currentPercentage = Math.round(progressRatio * 100);
            currentPercentage = Math.min(100, currentPercentage);
        }

        progressText.textContent = `${currentPercentage}%`;

        // CHỈ cập nhật vị trí 'bottom' nếu ở trên màn hình lớn
        if (window.innerWidth >= 768) {
            const minBottomVh = 5;
            const maxTopPaddingVh = 5;

            const viewportHeightPx = window.innerHeight;
            const progressTextHeightPx = progressText.offsetHeight;

            const targetTopPx = maxTopPaddingVh * viewportHeightPx / 100;
            const maxBottomPx = viewportHeightPx - (progressTextHeightPx + targetTopPx);

            const minBottomPx = minBottomVh * viewportHeightPx / 100;

            const newBottomPx = minBottomPx + (currentPercentage / 100) * (maxBottomPx - minBottomPx);

            progressText.style.bottom = `${newBottomPx}px`;
        }
        // Nếu là màn hình nhỏ hơn 768px, CSS media query sẽ quản lý vị trí tĩnh của progress-indicator

        if (actualLoadCompleteTime !== null && (elapsedSinceStart >= minDisplayTime || contactButtonClicked)) {
            hidePreloader();
        } else if (actualLoadCompleteTime === null && loadedCount >= totalAssets) {
            actualLoadCompleteTime = performance.now();
            requestAnimationFrame(() => updateProgressBar(assetsLoaded, totalAssets));
        }
    }

    // --- LOGIC THEO DÕI TÀI NGUYÊN ---

    // 1 video + 19 ảnh (bao gồm gif) + 2 file js + 1 file 3d = 23 tài nguyên
    const trackedResources = [
        { type: 'video', element: document.querySelector('video:not(#loadingVideo)'), loaded: false },
        ...Array.from(document.querySelectorAll('img')).map(img => ({ type: 'image', element: img, loaded: false })),
        { type: 'script', name: 'assets/js/main.js', loaded: false },
        { type: 'script', name: 'assets/js/lottie.min.js', loaded: false },
        { type: '3d-model', name: 'your_3d_model.glb', loaded: false }, // Placeholder
    ].filter(resource => resource.element || resource.name);

    totalAssets = trackedResources.length;

    updateProgressBar(assetsLoaded, totalAssets);

    trackedResources.forEach(resource => {
        if (!resource.loaded) {
            if (resource.type === 'image') {
                if (resource.element.complete) {
                    assetsLoaded++;
                    resource.loaded = true;
                } else {
                    resource.element.addEventListener('load', () => {
                        if (!resource.loaded) {
                            assetsLoaded++;
                            resource.loaded = true;
                            updateProgressBar(assetsLoaded, totalAssets);
                        }
                    });
                    resource.element.addEventListener('error', () => {
                        if (!resource.loaded) {
                            assetsLoaded++;
                            resource.loaded = true;
                            updateProgressBar(assetsLoaded, totalAssets);
                        }
                    });
                }
            } else if (resource.type === 'video') {
                if (resource.element.readyState >= 3) {
                    assetsLoaded++;
                    resource.loaded = true;
                } else {
                    resource.element.addEventListener('loadeddata', () => {
                        if (!resource.loaded) {
                            assetsLoaded++;
                            resource.loaded = true;
                            updateProgressBar(assetsLoaded, totalAssets);
                        }
                    });
                    resource.element.addEventListener('error', () => {
                        if (!resource.loaded) {
                            assetsLoaded++;
                            resource.loaded = true;
                            updateProgressBar(assetsLoaded, totalAssets);
                        }
                    });
                }
            }
        }
    });

    window.addEventListener('load', () => {
        if (actualLoadCompleteTime === null) {
            actualLoadCompleteTime = performance.now();
        }
        updateProgressBar(totalAssets, totalAssets);
    });

    function animateProgress() {
        // Chỉ gọi updateProgressBar để cập nhật % (không phải vị trí) nếu đang ở màn hình nhỏ
        // hoặc nếu đang ở màn hình lớn và cần kéo dài thời gian
        if (actualLoadCompleteTime !== null && !contactButtonClicked) {
             updateProgressBar(assetsLoaded, totalAssets); // Cập nhật %
            if (performance.now() - startTime < minDisplayTime || window.innerWidth < 768) {
                requestAnimationFrame(animateProgress);
            }
        } else if (actualLoadCompleteTime === null) {
            requestAnimationFrame(animateProgress);
        }
    }
    animateProgress();

    document.body.style.overflow = 'hidden';
});