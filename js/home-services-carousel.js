// Services Carousel Logic
(function () {
    let carouselInitialized = false;
    let currentSlide = 0;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;
    let isHorizontalSwipe = false;
    let originalCards = [];
    let clonedCards = [];
    let isTransitioning = false;

    // iOS detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // Function to initialize a carousel
    function initCarousel() {
      const track = document.querySelector('.services-grid.services-carousel-track');
      const controlsContainer = document.querySelector('.services-carousel-controls');
      
      if (!track || !controlsContainer) return;
      
      const cols = Array.from(track.querySelectorAll(".services-carousel-card"));
      const dotsContainer = controlsContainer.querySelector(".services-dots");
  
      if (!cols.length || !dotsContainer) return;

      // Store original cards and clear track
      originalCards = [...cols];
      track.innerHTML = '';
      
      // Clone first and last cards for infinite loop
      const firstCardClone = originalCards[0].cloneNode(true);
      const lastCardClone = originalCards[originalCards.length - 1].cloneNode(true);
      firstCardClone.classList.add('services-carousel-card', 'clone');
      lastCardClone.classList.add('services-carousel-card', 'clone');
      
      // Add cloned cards to track: [lastClone, ...originalCards, firstClone]
      track.appendChild(lastCardClone);
      originalCards.forEach(card => {
        const cardClone = card.cloneNode(true);
        cardClone.classList.add('services-carousel-card');
        track.appendChild(cardClone);
      });
      track.appendChild(firstCardClone);
      
      // Store all cards including clones
      clonedCards = Array.from(track.querySelectorAll(".services-carousel-card"));
      
      // Set initial position to show first real card (index 1 after last clone)
      currentSlide = 1;
  
      function getColsPerSlide() {
        return window.innerWidth <= 1024 ? 1 : 2;
      }
  
      function getTotalSlides() {
        return Math.ceil(originalCards.length / getColsPerSlide());
      }
  
      function setWidths() {
        const colsPerSlide = getColsPerSlide();
        clonedCards.forEach((col) => {
          col.style.flex = `0 0 ${100 / colsPerSlide}%`;
          col.style.maxWidth = `${100 / colsPerSlide - 5}%`;
        });
        track.style.width = "100%";
      }
  
      function updateDots() {
        // Remove existing dots
        dotsContainer.innerHTML = "";
        const totalSlides = getTotalSlides();
        
        // Calculate which real slide we're on (accounting for cloned cards)
        const realSlideIndex = currentSlide - 1;
        const displaySlide = realSlideIndex < 0 ? totalSlides - 1 : realSlideIndex % totalSlides;
        
        for (let i = 0; i < totalSlides; i++) {
          const dot = document.createElement("button");
          dot.className = "services-dot";
          dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
          if (i === displaySlide) {
            dot.classList.add("active");
          }
          dot.addEventListener("click", () => {
            // Navigate to real slide (add 1 to account for first clone)
            updateSlide(i + 1);
          });
          dotsContainer.appendChild(dot);
        }
      }
  
      function updateSlide(newIndex) {
        if (isTransitioning) return; // Prevent multiple rapid transitions
        
        setWidths();
        const colsPerSlide = getColsPerSlide();
        const totalSlides = getTotalSlides();
        
        // Handle infinite loop logic
        let targetSlide = newIndex;
        
        // Allow transition to cloned cards for seamless effect
        if (newIndex === 0) {
          // Going to last clone (which looks like last card)
          targetSlide = 0;
        } else if (newIndex === totalSlides + 1) {
          // Going to first clone (which looks like first card)
          targetSlide = totalSlides + 1;
        }
        
        currentSlide = targetSlide;
        
        // Mobile fix: use pixel-based transform for 1 card per slide
        if (colsPerSlide === 1) {
          const container = track.closest('.services-container');
          const containerWidth = container ? container.offsetWidth : 0;
          const gap = containerWidth * 0.05; // 5% gap
          const offset = targetSlide * (containerWidth + gap);
          track.style.transform = `translateX(-${offset}px)`;
        } else {
          const percent = -(100 * currentSlide);
          track.style.transform = `translateX(${percent}%)`;
        }
        
        updateDots();
        
        // Handle seamless transition for infinite loop
        if (currentSlide === 0 || currentSlide === totalSlides + 1) {
          isTransitioning = true;
          setTimeout(() => {
            if (currentSlide === 0) {
              // We're at the last clone, jump to the real last slide
              currentSlide = totalSlides;
              track.style.transition = 'none';
              if (colsPerSlide === 1) {
                const container = track.closest('.services-container');
                const containerWidth = container ? container.offsetWidth : 0;
                const gap = containerWidth * 0.05; // 5% gap
                const offset = currentSlide * (containerWidth + gap);
                track.style.transform = `translateX(-${offset}px)`;
              } else {
                const percent = -(100 * currentSlide);
                track.style.transform = `translateX(${percent}%)`;
              }
              setTimeout(() => {
                track.style.transition = 'transform 0.3s ease-out';
                isTransitioning = false;
              }, 10);
            } else if (currentSlide === totalSlides + 1) {
              // We're at the first clone, jump to the real first slide
              currentSlide = 1;
              track.style.transition = 'none';
              if (colsPerSlide === 1) {
                const container = track.closest('.services-container');
                const containerWidth = container ? container.offsetWidth : 0;
                const gap = containerWidth * 0.05; // 5% gap
                const offset = currentSlide * (containerWidth + gap);
                track.style.transform = `translateX(-${offset}px)`;
              } else {
                const percent = -(100 * currentSlide);
                track.style.transform = `translateX(${percent}%)`;
              }
              setTimeout(() => {
                track.style.transition = 'transform 0.3s ease-out';
                isTransitioning = false;
              }, 10);
            }
          }, 350); // Slightly longer delay to ensure transition completes
        } else {
          isTransitioning = false;
        }
      }
  
      // Touch/Mouse event handlers for mobile swipe
      function handleStart(e) {
        // Only enable swipe on mobile devices (width < 1024px)
        if (window.innerWidth > 1024) return;
        
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
        if (!isDragging || window.innerWidth > 1024) return;
        
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
          
          const container = track.closest('.services-container');
          const containerWidth = container ? container.offsetWidth : 0;
          const gap = containerWidth * 0.05; // 5% gap
          const currentTranslate = -currentSlide * (containerWidth + gap);
          
          track.style.transform = `translateX(${currentTranslate + diffX}px)`;
        }
      }
  
      function handleEnd() {
        if (!isDragging || window.innerWidth > 1024) return;
        
        isDragging = false;
        track.style.transition = 'transform 0.3s ease-out';
        track.style.cursor = '';
        
        // Only handle carousel navigation for horizontal swipes
        if (isHorizontalSwipe) {
          const diffX = currentX - startX;
          const threshold = 50; // Minimum swipe distance to trigger slide change
          
          if (Math.abs(diffX) > threshold) {
            const totalSlides = getTotalSlides();
            
            if (diffX > 0) {
              // Swipe right - go to previous slide
              if (currentSlide === 1) {
                // If we're at the first real card, go to the last clone
                updateSlide(0);
              } else {
                updateSlide(currentSlide - 1);
              }
            } else {
              // Swipe left - go to next slide
              if (currentSlide === totalSlides) {
                // If we're at the last real card, go to the first clone
                updateSlide(totalSlides + 1);
              } else {
                updateSlide(currentSlide + 1);
              }
            }
          } else {
            // Return to current slide if swipe wasn't long enough
            updateSlide(currentSlide);
          }
        }
        
        isHorizontalSwipe = false;
      }
  
      // Add touch and mouse event listeners
      // Get the main carousel container (parent of track)
      const carouselContainer = track.closest('.services-container');
      
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
  
      // Initialize
      updateSlide(1);
      
      // Set initial height after a short delay to ensure all content is loaded
      setTimeout(() => {
        updateSlide(currentSlide);
      }, 100);
      
      carouselInitialized = true;
    }

    // Function to handle resize and toggle between grid/carousel
    function handleResize() {
      const track = document.querySelector('.services-grid.services-carousel-track');
      const controlsContainer = document.querySelector('.services-carousel-controls');
      
      if (!track || !controlsContainer) return;
      
      if (window.innerWidth <= 1024) {
        // Mobile: Initialize carousel if not already done
        if (!carouselInitialized) {
          initCarousel();
        } else {
          // Re-initialize for existing carousel
          updateSlide(currentSlide);
        }
      } else {
        // Desktop: Reset to grid layout
        track.style.transform = 'none';
        track.style.transition = 'none';
        currentSlide = 1;
      }
    }

    // Initialize services carousel when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      handleResize();
    });

    // Handle window resize
    window.addEventListener('resize', handleResize);
  })();