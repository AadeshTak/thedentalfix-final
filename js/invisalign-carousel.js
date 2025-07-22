// Invisalign Treatment Slider Logic
(function () {
  // Function to initialize a carousel
  function initCarousel(track, controlsContainer) {
    if (!track || !controlsContainer) return;

    const cols = Array.from(track.querySelectorAll(".invisalign-treatment-slider-col"));
    const leftArrow = controlsContainer.querySelector(".invisalign-treatment-slider-arrow-left");
    const rightArrow = controlsContainer.querySelector(".invisalign-treatment-slider-arrow-right");
    const dotsContainer = controlsContainer.querySelector(".invisalign-treatment-slider-dots");

    if (!cols.length || !leftArrow || !rightArrow || !dotsContainer) return;

    let currentSlide = 0;
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    function getColsPerSlide() {
      return window.innerWidth <= 1024 ? 1 : 2;
    }

    function getTotalSlides() {
      return Math.ceil(cols.length / getColsPerSlide());
    }

    function setWidths() {
      const colsPerSlide = getColsPerSlide();
      cols.forEach((col) => {
        col.style.flex = `0 0 ${100 / colsPerSlide}%`;
        col.style.maxWidth = `${100 / colsPerSlide - 10}%`;
      });
      track.style.width = "100%";
    }

    function updateDots() {
      // Remove existing dots
      dotsContainer.innerHTML = "";
      const totalSlides = getTotalSlides();
      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement("button");
        dot.className = "invisalign-treatment-slider-dot";
        dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
        if (i === currentSlide) dot.classList.add("active");
        dot.addEventListener("click", () => {
          updateSlide(i);
        });
        dotsContainer.appendChild(dot);
      }
    }

    function updateSlide(newIndex) {
      setWidths();
      const colsPerSlide = getColsPerSlide();
      const totalSlides = getTotalSlides();
      currentSlide = Math.max(0, Math.min(newIndex, totalSlides - 1));

      // Mobile fix: use pixel-based transform for 1 card per slide
      if (colsPerSlide === 1) {
        const container = track.closest('.invisalign-treatment-slider-slider');
        const containerWidth = container ? container.offsetWidth : 0;
        track.style.transform = `translateX(-${currentSlide * containerWidth}px)`;
      } else {
        const percent = -(100 * currentSlide);
        track.style.transform = `translateX(${percent}%)`;
      }
      updateDots();
    }

    // Touch/Mouse event handlers for mobile swipe
    function handleStart(e) {
      // Only enable swipe on mobile devices (width < 1024px)
      if (window.innerWidth >= 1024) return;
      
      isDragging = true;
      startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
      currentX = startX;
      
      track.style.transition = 'none';
      track.style.cursor = 'grabbing';
    }

    function handleMove(e) {
      if (!isDragging || window.innerWidth >= 1024) return;
      
      e.preventDefault();
      currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
      const diffX = currentX - startX;
      
      const container = track.closest('.invisalign-treatment-slider-slider');
      const containerWidth = container ? container.offsetWidth : 0;
      const currentTranslate = -currentSlide * containerWidth;
      
      track.style.transform = `translateX(${currentTranslate + diffX}px)`;
    }

    function handleEnd() {
      if (!isDragging || window.innerWidth >= 1024) return;
      
      isDragging = false;
      track.style.transition = 'transform 0.3s ease-out';
      track.style.cursor = '';
      
      const diffX = currentX - startX;
      const threshold = 50; // Minimum swipe distance to trigger slide change
      
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0 && currentSlide > 0) {
          // Swipe right - go to previous slide
          updateSlide(currentSlide - 1);
        } else if (diffX < 0 && currentSlide < getTotalSlides() - 1) {
          // Swipe left - go to next slide
          updateSlide(currentSlide + 1);
        } else {
          // Return to current slide if at boundaries
          updateSlide(currentSlide);
        }
      } else {
        // Return to current slide if swipe wasn't long enough
        updateSlide(currentSlide);
      }
    }

    // Add touch and mouse event listeners
    // track.addEventListener('touchstart', handleStart, { passive: false });
    // track.addEventListener('touchmove', handleMove, { passive: false });
    // track.addEventListener('touchend', handleEnd);
    
    // track.addEventListener('mousedown', handleStart);
    // track.addEventListener('mousemove', handleMove);
    // track.addEventListener('mouseup', handleEnd);
    // track.addEventListener('mouseleave', handleEnd);

    // Prevent context menu on long press
    track.addEventListener('contextmenu', (e) => {
      if (window.innerWidth < 1024) {
        e.preventDefault();
      }
    });

    leftArrow.addEventListener("click", () => {
      updateSlide(currentSlide - 1);
    });
    rightArrow.addEventListener("click", () => {
      updateSlide(currentSlide + 1);
    });

    window.addEventListener("resize", () => {
      updateSlide(currentSlide);
    });

    // Initialize
    updateSlide(0);
  }

  // Initialize all carousels on the page
  document.querySelectorAll('.invisalign-treatment-slider-slider').forEach(slider => {
    const track = slider.querySelector('.invisalign-treatment-slider-track');
    const controls = slider.querySelector('.invisalign-treatment-slider-controls');
    if (track && controls) {
      initCarousel(track, controls);
    }
  });
})();

// Image Slider Functionality for Treatment Progress
document.addEventListener('DOMContentLoaded', function () {
  // For each treatment slider column
  document.querySelectorAll('.invisalign-treatment-slider-col').forEach(function (col) {
    const images = col.querySelectorAll('.invisalign-treatment-slider-images img');
    const slider = col.querySelector('.slider-range');
    const weekLabel = col.querySelector('.invisalign-treatment-slider-week');
    if (!images.length || !slider || !weekLabel) return; // skip if elements missing

    function updateImage() {
      const index = parseInt(slider.value, 10);
      images.forEach((img, i) => {
        img.style.display = (i === index) ? '' : 'none';
      });
      weekLabel.textContent = `Week ${index + 1}`;
    }

    updateImage();
    slider.addEventListener('input', updateImage);
  });
});