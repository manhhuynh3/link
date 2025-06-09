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
            // Khi tổng tài nguyên là 0, đặt nó ở vị trí cao nhất (gần đỉnh)
            // Tính toán dynamic maxBottom dựa trên kích thước font thực tế của progressText
            const progressTextHeight = progressText.offsetHeight; // Lấy chiều cao pixel của phần tử
            const viewportHeight = window.innerHeight;
            const maxBottom = (viewportHeight - progressTextHeight - (5 * viewportHeight / 100)); // 5vh padding từ trên cùng
            progressText.style.bottom = `${maxBottom}px`; // Đặt vị trí bằng pixel
            return;
        }

        let currentPercentage;
        const currentTime = performance.now();
        const elapsedSinceStart = currentTime - startTime;

        if (actualLoadCompleteTime === null) {
            // Tải chưa hoàn thành, tính toán % dựa trên tài nguyên thực tế
            currentPercentage = Math.min(100, Math.round((loadedCount / totalCount) * 100));
        } else {
            // Tải đã hoàn thành, nhưng cần kéo dài tiến độ đến minDisplayTime
            const timeToReach100Percent = minDisplayTime;
            const progressRatio = Math.min(1, elapsedSinceStart / timeToReach100Percent);
            currentPercentage = Math.round(progressRatio * 100);
            currentPercentage = Math.min(100, currentPercentage);
        }

        progressText.textContent = `${currentPercentage}%`;

        // Tính toán vị trí 'bottom' cho số % dựa trên currentPercentage
        const minBottomVh = 5; // vh (0% ở 5vh từ đáy)
        const maxTopPaddingVh = 5; // vh (5vh padding từ đỉnh)

        // Lấy chiều cao của viewport tính bằng pixel
        const viewportHeightPx = window.innerHeight;

        // Lấy chiều cao của phần tử progressText tính bằng pixel
        // Cần đảm bảo rằng font-size đã được áp dụng khi đo
        const progressTextHeightPx = progressText.offsetHeight;

        // Tính toán vị trí bottom tối đa cho 100% để chữ không bị cắt ở đỉnh
        // maxBottomPx = (viewportHeightPx - progressTextHeightPx - (maxTopPaddingVh * viewportHeightPx / 100))
        // Đơn giản hóa: khoảng cách từ đỉnh màn hình đến đỉnh của chữ khi 100% là 5vh
        // Vậy, vị trí bottom (tính từ đáy màn hình) của chữ khi 100% là:
        // total height - (height of text + 5vh from top)
        const targetTopPx = maxTopPaddingVh * viewportHeightPx / 100;
        const maxBottomPx = viewportHeightPx - (progressTextHeightPx + targetTopPx);


        // Vị trí bottom cho 0% (tính bằng pixel)
        const minBottomPx = minBottomVh * viewportHeightPx / 100;

        // Tính toán vị trí 'bottom' hiện tại bằng cách nội suy
        const newBottomPx = minBottomPx + (currentPercentage / 100) * (maxBottomPx - minBottomPx);

        progressText.style.bottom = `${newBottomPx}px`;

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
        if (actualLoadCompleteTime !== null && !contactButtonClicked) {
            updateProgressBar(assetsLoaded, totalAssets);
            if (performance.now() - startTime < minDisplayTime) {
                requestAnimationFrame(animateProgress);
            }
        } else if (actualLoadCompleteTime === null) {
            requestAnimationFrame(animateProgress);
        }
    }
    animateProgress();

    document.body.style.overflow = 'hidden';
});