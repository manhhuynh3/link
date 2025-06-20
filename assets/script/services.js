// services.js
const projectMapping = {
  "service-fooh": [
    { src: "assets/images/Project/FOOH_1.gif", type: "image", caption: "Dự án CGI FOOH - Concept 1" },
    { src: "assets/images/Project/FOOH_2.gif", type: "image", caption: "Dự án CGI FOOH - Concept 2" },
    { src: "assets/images/Project/FOOH_3.gif", type: "image", caption: "Dự án CGI FOOH - Concept 3" },
  ],
  "service-3d-modeling-animation": [
    { src: "assets/images/Project/modeling_1.jpg", type: "image", caption: "Mô hình 3D sản phẩm cao cấp A" },
    { src: "assets/images/Project/modeling_2.jpg", type: "image", caption: "Hoạt hình 3D sản phẩm B" },
    { src: "assets/images/Project/modeling_3.jpg", type: "image", caption: "Render chân thực sản phẩm C" },
  ],
  "service-2d-design": [
    { src: "assets/images/Project/2D_1.jpg", type: "image", caption: "Thiết kế E-commerce cho cửa hàng X" },
    { src: "assets/images/Project/2D_2.jpg", type: "image", caption: "Thiết kế bao bì sản phẩm Y" },
    { src: "assets/images/Project/2D_3.jpg", type: "image", caption: "Thiết kế POSM cho chiến dịch Z" },
  ]
};

const carouselStates = new Map();

function initializeServiceCarousel(serviceCardId) {
  const cardElement = document.getElementById(serviceCardId);
  const inner = cardElement.querySelector(".carousel-inner");
  const indicators = cardElement.querySelector(".carousel-indicators");
  const data = projectMapping[serviceCardId] || [];

  carouselStates.set(serviceCardId, {
    currentProjectIndex: 0,
    autoSlideInterval: null
  });

  inner.innerHTML = "";
  indicators.innerHTML = "";

  if (!data.length) {
    inner.innerHTML = '<div class="text-center text-white">Chưa có dự án nào.</div>';
    return;
  }

  data.forEach((item, index) => {
    const element = document.createElement(item.type === "video" ? "video" : "img");
    element.src = item.src;
    element.alt = item.caption;
    if (item.type === "video") {
      element.autoplay = true;
      element.loop = true;
      element.muted = true;
    }
    element.classList.add("carousel-item", "w-full", "h-full", "object-cover", "rounded-xl", "flex-shrink-0");
    inner.appendChild(element);

    const dot = document.createElement("div");
    dot.classList.add("w-2", "h-2", "rounded-full", "bg-gray-400", "cursor-pointer");
    if (index === 0) dot.classList.add("bg-white", "active");
    dot.addEventListener("click", () => updateCarousel(serviceCardId, index));
    indicators.appendChild(dot);
  });

  const items = cardElement.querySelectorAll(".service-details-wrapper li");
  items.forEach((li, i) => {
    li.addEventListener("mouseenter", () => updateCarousel(serviceCardId, i));
  });

  cardElement.addEventListener("mouseleave", () => {
    updateCarousel(serviceCardId, 0);
    resetAutoSlide(serviceCardId);
  });

  inner.addEventListener("mousemove", (e) => handleCarouselMouseMove(e, cardElement));

  updateCarousel(serviceCardId, 0);
  startAutoSlide(serviceCardId);
}

function updateCarousel(serviceId, activeIndex) {
  const cardElement = document.getElementById(serviceId);
  const inner = cardElement.querySelector(".carousel-inner");
  const indicators = cardElement.querySelectorAll(".carousel-indicators div");
  const state = carouselStates.get(serviceId);

  if (!state) return;
  state.currentProjectIndex = activeIndex;
  const offset = -100 * activeIndex;
  inner.style.transform = `translateX(${offset}%)`;

  indicators.forEach((dot, i) => {
    dot.classList.toggle("bg-white", i === activeIndex);
    dot.classList.toggle("bg-gray-400", i !== activeIndex);
    dot.classList.toggle("active", i === activeIndex);
  });
}

function updateCarouselDisplay(cardElement) {
  const id = cardElement.id;
  const state = carouselStates.get(id);
  if (!state) return;
  updateCarousel(id, state.currentProjectIndex);
}

function handleCarouselMouseMove(event, cardElement) {
  if (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768) return;

  stopAutoSlide(cardElement.id);

  const rect = cardElement.querySelector(".carousel-container").getBoundingClientRect();
  const relX = event.clientX - rect.left;
  const width = rect.width;
  const total = projectMapping[cardElement.id]?.length || 0;
  const newIndex = Math.floor((relX / width) * total);

  const state = carouselStates.get(cardElement.id);
  if (state && state.currentProjectIndex !== newIndex) {
    updateCarousel(cardElement.id, newIndex);
  }
}

function startAutoSlide(serviceCardId) {
  const state = carouselStates.get(serviceCardId);
  if (!state) return;
  stopAutoSlide(serviceCardId);

  const total = projectMapping[serviceCardId]?.length || 0;
  state.autoSlideInterval = setInterval(() => {
    state.currentProjectIndex = (state.currentProjectIndex + 1) % total;
    updateCarousel(serviceCardId, state.currentProjectIndex);
  }, 3000);
}

function stopAutoSlide(serviceCardId) {
  const state = carouselStates.get(serviceCardId);
  if (state?.autoSlideInterval) {
    clearInterval(state.autoSlideInterval);
    state.autoSlideInterval = null;
  }
}

function resetAutoSlide(serviceCardId) {
  if (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768) {
    startAutoSlide(serviceCardId);
  } else {
    stopAutoSlide(serviceCardId);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initializeServiceCarousel("service-fooh");
  initializeServiceCarousel("service-3d-modeling-animation");
  initializeServiceCarousel("service-2d-design");
});
