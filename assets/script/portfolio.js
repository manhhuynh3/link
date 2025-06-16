// js/portfolio.js
import { portfolioProjects, languages } from './data.js';
import { currentLanguage } from './language.js';

export function createPortfolioCards() {
    const portfolioGrid = document.getElementById('portfolio-grid');
    if (!portfolioGrid) return;

    // Xóa nội dung cũ để tránh trùng lặp khi gọi lại hàm
    portfolioGrid.innerHTML = '';

    // Dựa vào kích thước màn hình để gọi hàm phù hợp
    if (window.innerWidth >= 768) { // Ví dụ: 768px là breakpoint cho desktop (md breakpoint của Tailwind CSS)
        createDesktopPortfolioCards(portfolioGrid);
    } else {
        createMobilePortfolioCards(portfolioGrid);
    }
}

// Helper function to determine file type based on extension
// Now expects mediaItem to be an object {url: '...', poster: '...'} or just a string URL
function getFileType(mediaItem) {
    const url = typeof mediaItem === 'object' && mediaItem !== null ? mediaItem.url : mediaItem;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const extension = url.substring(url.lastIndexOf('.')).toLowerCase();

    if (videoExtensions.includes(extension)) {
        return 'video';
    } else if (imageExtensions.includes(extension)) {
        return 'image';
    }
    return 'unknown'; // Fallback for unknown types
}

function createDesktopPortfolioCards(portfolioGrid) {
    portfolioProjects.forEach((project, index) => {
        // THAY ĐỔI TẠI ĐÂY: Tìm poster mặc định cho dự án này
        let projectDefaultVideoPoster = 'https://placehold.co/600x400/1e293b/f8fafc?text=Project+Media'; // Poster dự phòng chung nếu không tìm thấy

        // Duyệt qua các media item của dự án để tìm poster của video đầu tiên
        for (const mediaItem of project.images) {
            const mediaType = getFileType(mediaItem);
            // Kiểm tra xem item có phải là video, là đối tượng và có thuộc tính poster hay không
            if (mediaType === 'video' && typeof mediaItem === 'object' && mediaItem !== null && mediaItem.poster) {
                projectDefaultVideoPoster = mediaItem.poster;
                break; // Đã tìm thấy poster của video đầu tiên, thoát vòng lặp
            }
        }

        const card = document.createElement('div');
        card.id = `project-card-${project.id}`;
        card.classList.add(
            'group', 'relative', 'overflow-hidden', 'rounded-xl', 'shadow-xl', 'bg-card',
            'transform', 'transition-all', 'duration-500', 'hover:scale-105', 'hover:shadow-2xl',
            'scroll-reveal', 'aspect-w-16', 'aspect-h-9', 'cursor-pointer'
        );
        if (project.card_layout_classes) {
            card.classList.add(...project.card_layout_classes.split(' '));
        }
        card.style.transitionDelay = `${index * 100}ms`;

        let currentProjectIndex = 0; // Khai báo cục bộ cho mỗi thẻ

        // --- Image/Video Stack (Common) ---
        const imageStack = document.createElement('div');
        imageStack.classList.add('relative', 'w-full', 'h-full', 'overflow-hidden');

        const innerStack = document.createElement('div');
        innerStack.classList.add(
            'flex', 'flex-row', 'h-full', 'flex-nowrap',
            'transition-transform', 'duration-700', 'ease-[cubic-bezier(0.25,1,0.5,1)]'
        );
        imageStack.appendChild(innerStack);

        const imgElements = [];
        project.images.forEach((mediaItem, mediaIndex) => { // mediaItem can be string or object
            const mediaType = getFileType(mediaItem);
            let mediaElement;
            const mediaUrl = typeof mediaItem === 'object' && mediaItem !== null ? mediaItem.url : mediaItem;
            // Lấy poster từ dữ liệu, nếu không có thì để trống
            const mediaPoster = typeof mediaItem === 'object' && mediaItem !== null && mediaType === 'video' ? mediaItem.poster : '';


            if (mediaType === 'video') {
                mediaElement = document.createElement('video');
                mediaElement.src = mediaUrl;
                mediaElement.loop = true;
                mediaElement.muted = true;
                mediaElement.playsInline = true;
                mediaElement.preload = 'auto';
                // THAY ĐỔI TẠI ĐÂY: Sử dụng mediaPoster hoặc projectDefaultVideoPoster
                if (mediaPoster) {
                    mediaElement.poster = mediaPoster; // Sử dụng poster riêng nếu có
                } else {
                    mediaElement.poster = projectDefaultVideoPoster; // Sử dụng poster mặc định của dự án
                }
            } else {
                mediaElement = document.createElement('img');
                mediaElement.src = mediaUrl;
            }

            mediaElement.onerror = function () {
                this.onerror = null;
                // Fallback to a placeholder image if media fails to load
                this.src = 'https://placehold.co/600x400/1e293b/f8fafc?text=Project+Media';
                // If it's a video that failed, you might want to remove video-specific attributes
                if (this.tagName === 'VIDEO') {
                    this.pause();
                    this.removeAttribute('autoplay');
                    this.removeAttribute('loop');
                    this.removeAttribute('muted');
                    this.removeAttribute('playsinline');
                }
            };
            mediaElement.alt = `Project Media ${mediaIndex + 1}`;
            mediaElement.classList.add(
                'h-full', 'w-full', 'object-cover', 'aspect-video', 'flex-shrink-0',
                'transition-transform', 'duration-500', 'ease-in-out'
            );
            innerStack.appendChild(mediaElement);
            imgElements.push(mediaElement); // vẫn dùng imgElements để quản lý các phần tử media
        });

        // --- Progress Bar (Common, but behavior differs) ---
        const progressWrapper = document.createElement('div');
        progressWrapper.classList.add(
            'absolute', 'top-0', 'left-0', 'w-full', 'z-20', 'flex', 'items-center', 'justify-center', 'gap-2', 'px-4', 'py-1'
        );

        const progressBarContainer = document.createElement('div');
        progressBarContainer.classList.add('flex', 'gap-1', 'w-full', 'max-w-xs', 'shadow-lg');

        const progressBars = [];
        project.images.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add(
                'h-1', 'flex-1', 'rounded-full',
                'transition-all', 'duration-300',
                i === 0 ? 'bg-blue-500' : 'bg-white',
                'shadow-md'
            );
            dot.addEventListener('click', () => {
                // Tạm dừng video hiện tại trước khi chuyển
                const prevMedia = imgElements[currentProjectIndex];
                if (prevMedia && prevMedia.tagName === 'VIDEO') {
                    prevMedia.pause();
                    prevMedia.currentTime = 0; // Đặt lại về đầu để hiển thị poster
                    prevMedia.load(); // THÊM DÒNG NÀY: Buộc tải lại để hiển thị poster
                }

                currentProjectIndex = i;
                updatePortfolioCarouselDisplay(true); // Truyền true để kích hoạt autoplay nếu là video
            });
            progressBarContainer.appendChild(dot);
            progressBars.push(dot);
        });

        progressWrapper.appendChild(progressBarContainer);
        imageStack.appendChild(progressWrapper);

        // --- Overlay (Common) ---
        const overlay = document.createElement('div');
        overlay.classList.add(
            'absolute', 'inset-0',
            'bg-gradient-to-t', 'from-black/70', 'via-black/30', 'to-transparent',
            'transition-opacity', 'duration-500',
            'flex', 'flex-col', 'items-start', 'justify-end',
            'p-2', 'sm:p-6',
            'pb-1', 'sm:pb-1',
            'text-left',
            'opacity-0', 'group-hover:opacity-100',
            'pointer-events-none'
        );

        const overlayContent = document.createElement('div');
        overlayContent.classList.add(
            'w-full', 'h-full', 'flex', 'flex-col', 'justify-end', 'relative',
            'transition-opacity', 'duration-300',
            'pointer-events-none',
            'opacity-0', 'group-hover:opacity-100'
        );

        overlay.appendChild(overlayContent);

        const titleLink = document.createElement('a');
        titleLink.href = project.behance_link;
        titleLink.target = '_blank';
        titleLink.rel = 'noopener noreferrer';
        titleLink.classList.add('block', 'text-decoration-none', 'mb-2', 'project-title-link', 'pointer-events-auto');

        const title = document.createElement('h3');
        title.classList.add('text-lg', 'sm:text-xl', 'font-bold', 'text-white', 'mb-2', 'project-title');
        title.setAttribute('data-lang-key', project.title_key);
        title.textContent = languages?.[currentLanguage]?.[project.title_key] || '';
        titleLink.appendChild(title);

        const description = document.createElement('p');
        description.classList.add(
            'text-white', 'text-sm', 'mb-4', 'project-description',
            'hidden', 'md:block'
        );
        description.setAttribute('data-lang-key', project.desc_key);
        description.textContent = languages?.[currentLanguage]?.[project.desc_key] || '';

        overlayContent.appendChild(titleLink);
        overlayContent.appendChild(description);

        const linkButton = document.createElement('a');
        linkButton.href = project.behance_link;
        linkButton.target = '_blank';
        linkButton.rel = 'noopener noreferrer';
        linkButton.classList.add(
            'view-details-button',
            'absolute', 'rounded-full', 'shadow-md',
            'flex', 'items-center', 'justify-center', 'z-30',
            'text-white',
            'border', 'border-solid', 'border-[rgba(255,255,255,0.2)]',
            'w-24', 'h-24', 'text-base', 'font-semibold',
            'opacity-0', 'group-hover:opacity-100', 'shadow-lg',
            'pointer-events-auto'
        );
        linkButton.style.backgroundColor = 'rgba(236, 236, 236, 0.1)';
        linkButton.style.backdropFilter = 'blur(10px)';
        linkButton.innerHTML = `View`;
        overlayContent.appendChild(linkButton);

        card.appendChild(imageStack);
        card.appendChild(overlay);
        portfolioGrid.appendChild(card);

        // --- Desktop Specific Interactions ---
        let isDragging = false;
        let isHovering = false; // Biến theo dõi trạng thái hover

        imageStack.addEventListener('mousedown', () => {
            isDragging = true;
            linkButton.style.pointerEvents = 'none';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            linkButton.style.pointerEvents = 'auto';
        });

        // Hàm cập nhật hiển thị carousel ảnh
        // Thêm tham số shouldAutoplay để kiểm soát việc phát video ngay lập tức
        const updatePortfolioCarouselDisplay = (shouldAutoplay = false) => {
            const totalProjects = project.images.length;
            if (totalProjects === 0) {
                innerStack.style.transform = `translateX(0%)`;
                progressBars.forEach(bar => {
                    bar.classList.remove('bg-blue-500');
                    bar.classList.add('bg-white');
                });
                return;
            }

            innerStack.style.transform = `translateX(-${currentProjectIndex * 100}%)`;

            progressBars.forEach((bar, idx) => {
                bar.classList.remove('bg-blue-500', 'bg-white');
                bar.classList.add(idx === currentProjectIndex ? 'bg-blue-500' : 'bg-white');
            });

            imgElements.forEach((mediaElement, idx) => {
                if (mediaElement.tagName === 'VIDEO') {
                    // Cập nhật logic: video chỉ play khi đang hover VÀ là media hiện tại
                    if (idx === currentProjectIndex && isHovering && shouldAutoplay) {
                        mediaElement.play().catch(e => {
                            console.warn("Video play failed:", e);
                        });
                    } else {
                        mediaElement.pause();
                        mediaElement.currentTime = 0; // Đặt lại về đầu để hiển thị poster
                        mediaElement.load(); // THÊM DÒNG NÀY: Buộc tải lại để hiển thị poster khi không phát
                    }
                } else if (mediaElement.tagName === 'IMG') {
                    mediaElement.style.transform = idx === currentProjectIndex ? 'scale(1.05)' : 'scale(1)';
                }
            });
        };

        // Hàm xử lý di chuyển chuột để slide ảnh
        const handlePortfolioImageMouseMove = (event) => {
            const rect = imageStack.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const elementWidth = rect.width;
            const totalProjects = project.images.length;

            if (totalProjects <= 1) {
                // Tạm dừng video hiện tại nếu có
                const prevMedia = imgElements[currentProjectIndex];
                if (prevMedia && prevMedia.tagName === 'VIDEO') {
                    prevMedia.pause();
                    prevMedia.currentTime = 0;
                    prevMedia.load(); // THÊM DÒNG NÀY: Buộc tải lại để hiển thị poster
                }
                currentProjectIndex = 0;
                updatePortfolioCarouselDisplay();
                return;
            }

            const segmentWidth = elementWidth / totalProjects;
            let newIndex = Math.floor(mouseX / segmentWidth);
            newIndex = Math.max(0, Math.min(totalProjects - 1, newIndex));

            if (newIndex !== currentProjectIndex) {
                // Tạm dừng video cũ trước khi chuyển sang cái mới
                const prevMedia = imgElements[currentProjectIndex];
                if (prevMedia && prevMedia.tagName === 'VIDEO') {
                    prevMedia.pause();
                    prevMedia.currentTime = 0; // Đặt lại về đầu để hiển thị poster
                    prevMedia.load(); // THÊM DÒNG NÀY: Buộc tải lại để hiển thị poster
                }

                currentProjectIndex = newIndex;
                updatePortfolioCarouselDisplay(true); // Kích hoạt autoplay cho video mới nếu có
            }
        };

        // Gộp các sự kiện mousemove vào thẻ cha 'card' để tránh xung đột pointer-events
        card.addEventListener('mousemove', (e) => {
            // Chỉ xử lý nếu đang hover
            if (!isHovering) return;

            // 1. Di chuyển nút "View" theo chuột
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            linkButton.style.left = `${x}px`;
            linkButton.style.top = `${y}px`;
            linkButton.style.transform = 'translate(-100%, -100%)';
            linkButton.style.opacity = '1';
            linkButton.style.pointerEvents = 'auto';

            // 2. Kích hoạt slide hình thumbnail dựa trên vị trí chuột trên thẻ
            handlePortfolioImageMouseMove(e);
        });

        card.addEventListener('mouseenter', () => {
            isHovering = true;
            updatePortfolioCarouselDisplay(true); // Kích hoạt autoplay khi bắt đầu hover
        });

        card.addEventListener('mouseleave', () => {
            isDragging = false;
            isHovering = false; // Đặt lại trạng thái hover
            linkButton.style.opacity = '0';
            linkButton.style.pointerEvents = 'none';
            // THAY ĐỔI TẠI ĐÂY: Dừng tất cả video và đặt lại currentTime về 0
            imgElements.forEach(mediaElement => {
                if (mediaElement.tagName === 'VIDEO') {
                    mediaElement.pause();
                    mediaElement.currentTime = 0; // Reset video to the beginning (poster frame)
                    mediaElement.load(); // THÊM DÒNG NÀY: Buộc tải lại để hiển thị poster
                }
            });
            // Không cần gọi updatePortfolioCarouselDisplay(false) ở đây vì vòng lặp trên đã xử lý việc dừng video.
            // updatePortfolioCarouselDisplay() sẽ được gọi tự động khi mouseenter lại.
        });

        updatePortfolioCarouselDisplay(); // Khởi tạo hiển thị ban đầu
    });
}

function createMobilePortfolioCards(portfolioGrid) {
    portfolioProjects.forEach((project, index) => {
        // Tìm poster mặc định cho dự án này (cho mobile)
        let projectDefaultVideoPoster = 'https://placehold.co/600x400/1e293b/f8fafc?text=Project+Media'; // Poster dự phòng chung nếu không tìm thấy

        // Lấy media item đầu tiên để hiển thị
        const firstMediaItem = project.images.length > 0 ? project.images[0] : null;
        let imageUrlToDisplay = projectDefaultVideoPoster;

        if (firstMediaItem) {
            const mediaType = getFileType(firstMediaItem);
            const mediaUrl = typeof firstMediaItem === 'object' && firstMediaItem !== null ? firstMediaItem.url : firstMediaItem;
            const mediaPoster = typeof firstMediaItem === 'object' && firstMediaItem !== null && mediaType === 'video' ? firstMediaItem.poster : '';

            // Nếu là video, sử dụng poster; ngược lại, sử dụng URL hình ảnh
            if (mediaType === 'video') {
                imageUrlToDisplay = mediaPoster || projectDefaultVideoPoster;
            } else {
                imageUrlToDisplay = mediaUrl;
            }
        }

        const card = document.createElement('div');
        card.id = `project-card-${project.id}`;
        card.classList.add(
            'group', 'relative', 'overflow-hidden', 'rounded-xl', 'shadow-xl', 'bg-card',
            'transform', 'transition-all', 'duration-500', // Giữ một số hiệu ứng chuyển động chung của thẻ
            'scroll-reveal', 'aspect-w-16', 'aspect-h-9', 'cursor-pointer'
        );
        if (project.card_layout_classes) {
            card.classList.add(...project.card_layout_classes.split(' '));
        }
        card.style.transitionDelay = `${index * 100}ms`;

        // --- Tạo thẻ <a> bao phủ toàn bộ khung hình để dễ dàng click trên mobile ---
        const fullCardLink = document.createElement('a');
        fullCardLink.href = project.behance_link;
        fullCardLink.target = '_blank';
        fullCardLink.rel = 'noopener noreferrer';
        fullCardLink.classList.add('absolute', 'inset-0', 'z-30', 'pointer-events-auto');

        // --- Đặt chữ "View →" ở góc phải, bên dưới của khung ---
        const viewText = document.createElement('span');
        viewText.classList.add(
            'absolute', 'bottom-2', 'right-2',
            'text-white/80', 'font-light', 'text-sm',
            'z-40'
        );
        viewText.textContent = 'View →';
        fullCardLink.appendChild(viewText);

        card.appendChild(fullCardLink);

        // --- Image Stack (Đơn giản hóa cho một hình ảnh duy nhất) ---
        const imageStack = document.createElement('div');
        imageStack.classList.add('relative', 'w-full', 'h-full', 'overflow-hidden');

        // Luôn tạo thẻ <img> để hiển thị hình ảnh hoặc poster
        const mediaElement = document.createElement('img');
        mediaElement.src = imageUrlToDisplay;
        mediaElement.onerror = function () {
            this.onerror = null;
            this.src = 'https://placehold.co/600x400/1e293b/f8fafc?text=Project+Media';
        };
        mediaElement.alt = `Project Media 1`;
        mediaElement.classList.add(
            'h-full', 'w-full', 'object-cover', 'aspect-video', 'flex-shrink-0'
        );
        imageStack.appendChild(mediaElement);

        card.appendChild(imageStack);

        // --- Lớp phủ (Overlay) cho tiêu đề ---
        const overlay = document.createElement('div');
        overlay.classList.add(
            'absolute', 'inset-0',
            'bg-gradient-to-t', 'from-black/70', 'via-black/30', 'to-transparent',
            'flex', 'flex-col', 'items-start', 'justify-end',
            'p-2', 'sm:p-6',
            'pb-1', 'sm:pb-1',
            'text-left', 'opacity-100', // Luôn hiển thị trên mobile
            'pointer-events-none'
        );

        const overlayContent = document.createElement('div');
        overlayContent.classList.add(
            'w-full', 'h-full', 'flex', 'flex-col', 'justify-end', 'relative',
            'opacity-100', // Luôn hiển thị trên mobile
            'pointer-events-none'
        );

        overlay.appendChild(overlayContent);

        const title = document.createElement('h3');
        title.classList.add('text-sm', 'sm:text-lg', 'font-bold', 'text-white', 'mb-2', 'project-title');
        title.setAttribute('data-lang-key', project.title_key);
        title.textContent = languages?.[currentLanguage]?.[project.title_key] || '';
        overlayContent.appendChild(title);

        // Mô tả dự án và nút "View Details" đã bị loại bỏ như yêu cầu cho phiên bản mobile đơn giản

        card.appendChild(overlay);
        portfolioGrid.appendChild(card);

        // Tất cả các chức năng kéo thả, autoplay, và chỉ báo (indicator) đã được loại bỏ cho phiên bản mobile này
    });
}