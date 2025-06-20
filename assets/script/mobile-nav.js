// js/mobile-nav.js

export function setupMobileNavigation() {
    const mobileToggle = document.getElementById('mobile-toggle');
    if (!mobileToggle) return;

    const toggleIcon = mobileToggle.querySelector('i.fa-solid');
    const navMenuLinks = mobileToggle.querySelectorAll('.menu-item a');

    function setToggleState(isExpanded) {
        if (isExpanded) {
            mobileToggle.classList.remove('collapsed');
            mobileToggle.classList.add('expanded');
        } else {
            mobileToggle.classList.remove('expanded');
            mobileToggle.classList.add('collapsed');
        }
    }

    // Initialize mobile toggle to collapsed state on page load for mobile screens
    if (window.innerWidth <= 767) {
        setToggleState(false); // Start collapsed
    } else {
        mobileToggle.classList.remove('collapsed', 'expanded'); // Ensure no mobile classes on desktop
    }

    toggleIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        setToggleState(!mobileToggle.classList.contains('expanded'));
    });

    mobileToggle.addEventListener('click', (e) => {
        if (e.target === mobileToggle) {
            setToggleState(!mobileToggle.classList.contains('expanded'));
        }
    });

    navMenuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            // Xác định nếu là anchor trong trang hiện tại (bắt đầu bằng # hoặc /# và trang là index)
            const isInPageAnchor = href && (href.startsWith('#') || href.startsWith('/#'));
            // Xác định nếu là trang template (không có section target)
            let canScroll = false;
            let targetId = null;
            if (isInPageAnchor) {
                // Lấy id section, loại bỏ dấu / nếu có
                targetId = href.replace(/^\/?/, '');
                if (targetId && targetId.startsWith('#')) {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        canScroll = true;
                        e.preventDefault();
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
            // Nếu không scroll được (không có section), cho phép chuyển hướng mặc định
            if (!canScroll && mobileToggle.classList.contains('expanded')) {
                setToggleState(false);
            } else if (canScroll && mobileToggle.classList.contains('expanded')) {
                setToggleState(false);
            }
        });
    });

    // Adjust header padding for logo visibility on mobile when toggle is collapsed
    const headerNav = document.querySelector('header nav');
    function adjustHeaderPadding() {
        if (window.innerWidth <= 767) {
            headerNav.style.paddingLeft = '0';
        } else {
            headerNav.style.paddingLeft = '0';
        }
    }
    adjustHeaderPadding();
    window.addEventListener('resize', adjustHeaderPadding);
}