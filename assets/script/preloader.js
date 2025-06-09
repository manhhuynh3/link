document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('progressBar');
    const loadingVideo = document.getElementById('loadingVideo');
    const contactButton = document.getElementById('contactButton');
    const progressText = document.getElementById('progressText'); // Lấy tham chiếu đến phần tử hiển thị %
    let assetsLoaded = 0;
    let totalAssets = 0;

    function hidePreloader() {
        preloader.classList.add('preloader-hidden');
        document.body.style.overflow = 'auto'; // Cho phép cuộn trang sau khi tải xong
    }

    // Lắng nghe sự kiện click trên nút "Liên hệ ngay"
    contactButton.addEventListener('click', () => {
        hidePreloader();
        // Cuộn đến phần liên hệ với ID là 'contact'
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Hàm cập nhật thanh tiến độ VÀ hiển thị phần trăm
    function updateProgressBar(loadedCount, totalCount) {
        if (totalCount === 0) { // Tránh chia cho 0 nếu không có tài nguyên nào được theo dõi
            progressBar.style.width = '100%';
            progressText.textContent = '100%';
            return;
        }
        const percentage = Math.min(100, Math.round((loadedCount / totalCount) * 100)); // Đảm bảo không vượt quá 100%
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${percentage}%`; // Cập nhật text hiển thị %
    }

    // Ước tính tổng số tài nguyên nặng.
    // Đây là phần quan trọng cần bạn điều chỉnh.
    // Bạn cần tính toán số lượng ảnh, video, file 3D, font, v.v., mà bạn biết sẽ tải.
    // VD: 5 ảnh, 2 video, 1 file 3D.
    // KHÔNG ĐẶT GIÁ TRỊ NÀY BẰNG 0 NẾU BẠN MUỐN THANH TIẾN ĐỘ HOẠT ĐỘNG.
    // CÁCH TỐT NHẤT LÀ ĐẾM TẤT CẢ CÁC TÀI NGUYÊN NẶNG TRÊN TRANG CỦA BẠN.
    const totalEstimatedAssets = 5 + 2 + 1; // Ví dụ, hãy điều chỉnh con số này!

    // Sử dụng một đối tượng để theo dõi trạng thái tải của các tài nguyên
    const resourceLoadingStatus = {
        images: [],
        videos: [],
        // Thêm các loại tài nguyên khác nếu cần (ví dụ: 'models': [])
    };

    // Lấy tất cả các thẻ hình ảnh trên trang và thêm vào danh sách theo dõi
    document.querySelectorAll('img').forEach(img => {
        resourceLoadingStatus.images.push({ element: img, loaded: false });
    });

    // Lấy tất cả các thẻ video trên trang và thêm vào danh sách theo dõi
    document.querySelectorAll('video').forEach(vid => {
        if (vid.id !== 'loadingVideo') { // Bỏ qua video loading animation
            resourceLoadingStatus.videos.push({ element: vid, loaded: false });
        }
    });

    // Đếm tổng số tài nguyên cần theo dõi
    totalAssets = resourceLoadingStatus.images.length + resourceLoadingStatus.videos.length;
    // Nếu bạn có các tài nguyên khác (ví dụ: file 3D được tải bằng loader JS), bạn cần tăng totalAssets
    // và thêm logic để theo dõi tải xong của chúng, sau đó gọi assetsLoaded++ và updateProgressBar.

    // Khởi tạo thanh tiến độ (hiển thị 0% ban đầu)
    updateProgressBar(assetsLoaded, totalAssets);

    // Lắng nghe sự kiện tải cho từng hình ảnh
    resourceLoadingStatus.images.forEach(imgData => {
        const img = imgData.element;
        if (img.complete) { // Nếu hình ảnh đã tải xong (trong cache)
            assetsLoaded++;
            imgData.loaded = true;
        } else {
            img.addEventListener('load', () => {
                if (!imgData.loaded) { // Đảm bảo chỉ tăng một lần
                    assetsLoaded++;
                    imgData.loaded = true;
                    updateProgressBar(assetsLoaded, totalAssets);
                    if (assetsLoaded >= totalAssets) {
                        hidePreloader();
                    }
                }
            });
            img.addEventListener('error', () => { // Xử lý lỗi tải cũng như tải xong
                if (!imgData.loaded) {
                    assetsLoaded++;
                    imgData.loaded = true;
                    updateProgressBar(assetsLoaded, totalAssets);
                    if (assetsLoaded >= totalAssets) {
                        hidePreloader();
                    }
                }
            });
        }
    });

    // Lắng nghe sự kiện tải cho từng video
    resourceLoadingStatus.videos.forEach(vidData => {
        const vid = vidData.element;
        // Kiểm tra readyState để xem video đã sẵn sàng phát chưa
        if (vid.readyState >= 3) { // readyState 3 (HAVE_ENOUGH_DATA) or 4 (HAVE_FUTURE_DATA)
            assetsLoaded++;
            vidData.loaded = true;
        } else {
            vid.addEventListener('loadeddata', () => { // Khi đủ dữ liệu để bắt đầu phát
                if (!vidData.loaded) {
                    assetsLoaded++;
                    vidData.loaded = true;
                    updateProgressBar(assetsLoaded, totalAssets);
                    if (assetsLoaded >= totalAssets) {
                        hidePreloader();
                    }
                }
            });
            vid.addEventListener('error', () => { // Xử lý lỗi tải cũng như tải xong
                if (!vidData.loaded) {
                    assetsLoaded++;
                    vidData.loaded = true;
                    updateProgressBar(assetsLoaded, totalAssets);
                    if (assetsLoaded >= totalAssets) {
                        hidePreloader();
                    }
                }
            });
        }
    });


    // Fallback: Nếu mọi thứ không hoạt động như mong đợi hoặc các tài nguyên khác không được theo dõi
    // Điều này sẽ ẩn preloader sau khi toàn bộ DOM và tất cả tài nguyên (bao gồm ảnh, video, script) đã tải xong.
    window.addEventListener('load', () => {
        // Đảm bảo rằng thanh tiến độ đạt 100% khi tất cả tài nguyên đã tải
        updateProgressBar(totalAssets, totalAssets);
        setTimeout(() => {
            hidePreloader();
        }, 500); // Thêm một độ trễ nhỏ để người dùng thấy thanh tiến độ đầy
    });

    // Ngăn chặn cuộn trang trong khi màn hình chờ đang hiển thị
    document.body.style.overflow = 'hidden';
});