export function initializePortfolioInteractions() {
  const cards = document.querySelectorAll('#portfolio-grid .group');

  cards.forEach(card => {
    const mediaContainer = card.querySelector('.flex.flex-row');
    let mediaItems = Array.from(card.querySelectorAll('.media-item'));
    let dots = Array.from(card.querySelectorAll('.progress-dot'));
    const viewButton = card.querySelector('.view-details-button');
    const overlay = card.querySelector('.bg-gradient-to-t');
    const infoContainer = card.querySelector('.project-info');
    const desc = card.querySelector('.project-description');

    let current = 0;
    let isHovering = false;
    let autoplayInterval = null;

    function updateDisplay(playCurrentVideo = false) {
      mediaItems = Array.from(card.querySelectorAll('.media-item'));
      dots = Array.from(card.querySelectorAll('.progress-dot'));

      if (!mediaContainer) return;
      mediaContainer.style.transform = `translateX(-${current * 100}%)`;

      dots.forEach((dot, idx) => {
        dot.classList.toggle('bg-blue-500', idx === current);
        dot.classList.toggle('bg-white', idx !== current);
      });

      mediaItems.forEach((el, i) => {
        if (el.tagName.toLowerCase() === 'video') {
          if (i === current && playCurrentVideo) {
            // Chỉ load + play khi tới slide cần chạy
            el.pause();
            el.currentTime = 0;
            el.load(); // trigger load để reset poster
            el.addEventListener('canplay', () => {
              el.play().catch(err => console.error('Play failed:', err));
            }, { once: true });
          } else {
            // Dừng video khác
            el.pause();
            el.currentTime = 0;
          }
        }
      });
    }

    // khởi tạo
    if (mediaContainer) mediaContainer.style.transform = 'translateX(0%)';
    if (overlay) overlay.style.opacity = 0;
    if (infoContainer) infoContainer.style.opacity = 0;
    if (desc) desc.classList.add('hidden');
    if (viewButton) {
      viewButton.style.transform = 'translate(-9999px, -9999px)';
      viewButton.style.opacity = '0';
      viewButton.style.pointerEvents = 'none';
    }
    current = 0;
    updateDisplay(false);

    card.addEventListener('mouseenter', () => {
      isHovering = true;
      if (overlay) overlay.style.opacity = 1;
      if (infoContainer) infoContainer.style.opacity = 1;
      if (desc) desc.classList.remove('hidden');

      current = 0;
      updateDisplay(true);

      if (mediaItems.length > 1) {
        autoplayInterval = setInterval(() => {
          current = (current + 1) % mediaItems.length;
          updateDisplay(true);
        }, 4000);
      }
    });

    card.addEventListener('mousemove', e => {
      if (!isHovering) return;

      const rect = card.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (mediaItems.length > 1) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;

        const segment = rect.width / mediaItems.length;
        const newIndex = Math.min(mediaItems.length - 1,
                          Math.max(0, Math.floor(mouseX / segment)));

        if (newIndex !== current) {
          current = newIndex;
          updateDisplay(true);
        }
      }

      if (viewButton) {
        viewButton.style.left = `${mouseX}px`;
        viewButton.style.top = `${mouseY}px`;
        viewButton.style.transform = 'translate(-50%, -50%)';
        viewButton.style.opacity = '1';
        viewButton.style.pointerEvents = 'auto';
        viewButton.style.backdropFilter = 'blur(10px)';
        viewButton.style.color = '#fff';
        viewButton.style.border = '1px solid rgba(255,255,255,0.2)';
      }
    });

    card.addEventListener('mouseleave', () => {
      isHovering = false;
      clearInterval(autoplayInterval);
      autoplayInterval = null;

      current = 0;
      if (overlay) overlay.style.opacity = 0;
      if (infoContainer) infoContainer.style.opacity = 0;
      if (desc) desc.classList.add('hidden');
      if (viewButton) {
        viewButton.style.opacity = '0';
        viewButton.style.pointerEvents = 'none';
        viewButton.style.backdropFilter = 'none';
        viewButton.style.color = '';
        viewButton.style.border = '';
      }
      updateDisplay(false);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePortfolioInteractions);
} else {
  initializePortfolioInteractions();
}
