function initializeWhatsAppButton() {
  const whatsappBtn = document.querySelector('.whatsapp-button');
  const firstSection = document.querySelector('section');

  if (!whatsappBtn || !firstSection) return;

  const firstSectionBottom = firstSection.offsetTop + firstSection.offsetHeight;
  const scrollThreshold = firstSectionBottom - 100;

  const checkVisibility = () => {
    const scrollY = window.scrollY;

    if (scrollY > scrollThreshold) {
      whatsappBtn.classList.add('visible');
    } else {
      whatsappBtn.classList.remove('visible');
    }
  };

  checkVisibility();

  window.addEventListener('scroll', checkVisibility, { passive: true });
}


// Mobile menu functionality
function initializeMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  const body = document.body;

  if (!menuToggle || !mainNav) return;

  menuToggle.addEventListener('click', function() {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    menuToggle.classList.toggle('active');
    mainNav.classList.toggle('active');
    body.classList.toggle('menu-open');
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(event) {
    if (!mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.classList.remove('active');
      mainNav.classList.remove('active');
      body.classList.remove('menu-open');
    }
  });

  // Close menu when clicking a nav link
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.classList.remove('active');
      mainNav.classList.remove('active');
      body.classList.remove('menu-open');
    });
  });
}
window.initializeMobileMenu = initializeMobileMenu;

document.addEventListener("DOMContentLoaded", () => {
  // Only initialize mobile menu here
  initializeMobileMenu();

  const footerPlaceholder = document.getElementById("footer-placeholder");

  if (footerPlaceholder) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          setTimeout(() => {
            initializeWhatsAppButton();
          }, 100);

          observer.disconnect();
        }
      });
    });

    observer.observe(footerPlaceholder, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      initializeWhatsAppButton();
    }, 2000);
  } else {
    setTimeout(() => {
      initializeWhatsAppButton();
    }, 1000);
  }
});

// YouTube-like play/pause overlay for video
const playSVG = `<svg class="video-overlay-icon" viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="40" fill="rgba(0,0,0,0.5)"/><polygon points="30,25 30,55 56,40" fill="#fff"/></svg>`;
const pauseSVG = `<svg class="video-overlay-icon" viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="40" fill="rgba(0,0,0,0.5)"/><rect x="28" y="25" width="8" height="30" fill="#fff"/><rect x="46" y="25" width="8" height="30" fill="#fff"/></svg>`;

const video = document.getElementById('myVideo');
const overlay = document.getElementById('videoOverlay');
const persistentPlayBtn = document.getElementById('persistentPlayBtn');
let overlayTimeout;
let persistentBtnActive = true;

function showOverlay(iconHTML) {
  overlay.innerHTML = iconHTML;
  overlay.classList.add('show');
  clearTimeout(overlayTimeout);
  overlayTimeout = setTimeout(() => overlay.classList.remove('show'), 500);
}

if (video && overlay && persistentPlayBtn) {
  // Show persistent play button on load
  persistentPlayBtn.classList.remove('hide');
  persistentBtnActive = true;
  let userUnmuted = false;

  // Click or keyboard on persistent play button
  function activatePersistentPlay() {
    video.pause();
    video.currentTime = 0;
    video.muted = false;
    video.play();
    persistentPlayBtn.classList.add('hide');
    persistentBtnActive = false;
    userUnmuted = true;
  }
  persistentPlayBtn.addEventListener('click', activatePersistentPlay);
  persistentPlayBtn.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activatePersistentPlay();
    }
  });

  // Only allow YouTube-like overlay after persistent button is hidden
  video.addEventListener('click', function () {
    if (!persistentBtnActive) {
      if (video.paused) {
        video.play();
        showOverlay(playSVG);
      } else {
        video.pause();
        showOverlay(pauseSVG);
      }
    }
  });

  // Intersection Observer to mute/unmute video based on viewport
  let wasUnmutedByUser = false;
  const observer = new window.IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.target === video) {
        if (entry.isIntersecting) {
          // In viewport
          if (userUnmuted) {
            video.muted = false;
          }
        } else {
          // Out of viewport
          if (!video.muted) {
            video.muted = true;
          }
        }
      }
    });
  }, { threshold: 0.25 }); // 25% visible is considered in viewport
  observer.observe(video);
}