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
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }

            if (mobileToggle.classList.contains('expanded')) {
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