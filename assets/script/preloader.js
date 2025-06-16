document.addEventListener('DOMContentLoaded', () => {
    // Hàm để kiểm tra xem thiết bị có phải là di động hay không
    function isMobileDevice() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        // Biểu thức chính quy để kiểm tra các chuỗi user agent phổ biến của thiết bị di động
        if (/android|ipad|iphone|ipod|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|rim)|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(userAgent) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|ob)|al(av|ca|co)|amoi|an(d|on)|aq(io|nk)|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|av(on|te|w )|ay(ec|nd)|blin|bo(l|c)k|bude|ca(li|co)|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|me|o )|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s)|\-v|_lib)|huaq|ic(e |ve)|ig01|ikom|inet|ipaq|it(ca|co|ip)|jdwa|jeru|jgwa|jk\-md|jo(di|me)|kc(28|mm)|ki(05|sc|zr)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|cd|ev)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|ad|lg|xe)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|mark|bl)|sc(01|st)|sh(mo|k0)|si(54|70)|sk\-0|sl(45|id)|sm(al|lk)|so(lb|gm)|upsi|vk(40|5[0-3]|\-v)|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nw)|wmlb|wonu|x700|xavw|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(userAgent.substr(0, 4))) {
            return true;
        }
        return false;
    }

    // === BẮT ĐẦU THÊM LOGIC ĐỂ VÔ HIỆU HÓA PRELOADER TRÊN THIẾT BỊ DI ĐỘNG ===
    if (isMobileDevice()) {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.display = 'none'; // Ẩn preloader ngay lập tức
            document.body.classList.remove('is-loading'); // Đảm bảo nội dung hiển thị
            document.body.style.overflow = 'auto'; // Cho phép cuộn trang
            preloader.remove(); // Xóa preloader khỏi DOM
        }
        return; // Dừng thực thi các logic preloader còn lại
    }
    // === KẾT THÚC LOGIC VÔ HIỆU HÓA PRELOADER TRÊN THIẾT BỊ DI ĐỘNG ===


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