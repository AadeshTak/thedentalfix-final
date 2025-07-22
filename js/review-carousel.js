// Review Plain Carousel Logic
(function () {
  // Function to initialize a carousel
  function initCarousel(track, controlsContainer) {
    if (!track || !controlsContainer) return;

    const cols = Array.from(track.querySelectorAll(".review-plain-col"));
    const leftArrow = controlsContainer.querySelector(".review-arrow-left");
    const rightArrow = controlsContainer.querySelector(".review-arrow-right");
    const dotsContainer = controlsContainer.querySelector(".review-dots");

    if (!cols.length || !leftArrow || !rightArrow || !dotsContainer) return;

    let currentSlide = 0;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;
    let isHorizontalSwipe = false;

    // iOS detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

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
        col.style.maxWidth = `${100 / colsPerSlide - 5}%`;
      });
      track.style.width = "100%";
    }

    function updateDots() {
      // Remove existing dots
      dotsContainer.innerHTML = "";
      const totalSlides = getTotalSlides();
      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement("button");
        dot.className = "review-dot";
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
        const container = track.closest('.review-plain-slider');
        const containerWidth = container ? container.offsetWidth : 0;
        track.style.transform = `translateX(-${currentSlide * containerWidth}px)`;
        
        // Adjust track height to match current card height (mobile only)
        if (window.innerWidth < 1024) {
          const currentCard = cols[currentSlide];
          if (currentCard) {
            const cardHeight = currentCard.offsetHeight;
            track.style.height = `${cardHeight}px`;
          }
        }
      } else {
        const percent = -(100 * currentSlide);
        track.style.transform = `translateX(${percent}%)`;
      }
      updateDots();
    }

    // Check if this carousel is within a before-after-slider
    function isBeforeAfterSlider() {
      return track.closest('.before-after-slider') !== null;
    }

    // Touch/Mouse event handlers for mobile swipe
    function handleStart(e) {
      // Only enable swipe on mobile devices (width < 1024px) and not for before-after-slider
      if (window.innerWidth >= 1024 || isBeforeAfterSlider()) return;
      
      isDragging = true;
      isHorizontalSwipe = false;
      startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
      startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
      currentX = startX;
      currentY = startY;
      
      track.style.transition = 'none';
      track.style.cursor = 'grabbing';
    }

    function handleMove(e) {
      if (!isDragging || window.innerWidth >= 1024 || isBeforeAfterSlider()) return;
      
      currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
      currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
      
      const diffX = Math.abs(currentX - startX);
      const diffY = Math.abs(currentY - startY);
      
      // Determine if this is a horizontal swipe (only after a minimum distance)
      if (!isHorizontalSwipe && (diffX > 10 || diffY > 10)) {
        isHorizontalSwipe = diffX > diffY;
      }
      
      // Only prevent default and handle carousel movement for horizontal swipes
      if (isHorizontalSwipe) {
        e.preventDefault();
        const diffX = currentX - startX;
        
        const container = track.closest('.review-plain-slider');
        const containerWidth = container ? container.offsetWidth : 0;
        const currentTranslate = -currentSlide * containerWidth;
        
        track.style.transform = `translateX(${currentTranslate + diffX}px)`;
      }
    }

    function handleEnd() {
      if (!isDragging || window.innerWidth >= 1024 || isBeforeAfterSlider()) return;
      
      isDragging = false;
      track.style.transition = 'transform 0.3s ease-out';
      track.style.cursor = '';
      
      // Only handle carousel navigation for horizontal swipes
      if (isHorizontalSwipe) {
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
      
      isHorizontalSwipe = false;
    }

    // Add touch and mouse event listeners only if not a before-after-slider
    if (!isBeforeAfterSlider()) {
      // Get the main carousel container (parent of track)
      const carouselContainer = track.closest('.review-plain-slider');
      
      if (carouselContainer) {
        // Set CSS properties for better iOS compatibility
        carouselContainer.style.touchAction = 'pan-y';
        carouselContainer.style.webkitOverflowScrolling = 'touch';
        
        // iOS-specific touch event handling with better compatibility
        if (isIOS) {
          // For iOS, attach listeners to the main container and use passive: false for touchmove
          carouselContainer.addEventListener('touchstart', handleStart, { passive: true });
          carouselContainer.addEventListener('touchmove', handleMove, { passive: false });
          carouselContainer.addEventListener('touchend', handleEnd, { passive: true });
          
          // Add additional iOS-specific event listeners
          carouselContainer.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
          carouselContainer.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false });
          carouselContainer.addEventListener('gestureend', (e) => e.preventDefault(), { passive: false });
        } else {
          carouselContainer.addEventListener('touchstart', handleStart, { passive: false });
          carouselContainer.addEventListener('touchmove', handleMove, { passive: false });
          carouselContainer.addEventListener('touchend', handleEnd);
        }
        
        carouselContainer.addEventListener('mousedown', handleStart);
        carouselContainer.addEventListener('mousemove', handleMove);
        carouselContainer.addEventListener('mouseup', handleEnd);
        carouselContainer.addEventListener('mouseleave', handleEnd);

        // Prevent context menu on long press
        carouselContainer.addEventListener('contextmenu', (e) => {
          if (window.innerWidth < 1024) {
            e.preventDefault();
          }
        });
      }
    }

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
    
    // Set initial height after a short delay to ensure all content is loaded
    setTimeout(() => {
      updateSlide(currentSlide);
    }, 100);
  }

  // Initialize all review carousels when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Find all review carousel tracks and their corresponding controls
    const reviewTracks = document.querySelectorAll('.review-plain-track');
    
    reviewTracks.forEach(track => {
      // Find the controls container that belongs to this track
      const slider = track.closest('.review-plain-slider');
      const controls = slider ? slider.querySelector('.review-plain-controls') : null;
      
      if (track && controls) {
        initCarousel(track, controls);
      }
    });
  });
})();