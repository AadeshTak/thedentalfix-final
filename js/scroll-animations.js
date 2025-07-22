/**
 * Scroll Animations using Intersection Observer API
 * Handles triggering animations when elements come into view
 */

class ScrollAnimations {
  constructor() {
    this.animatedElements = new Set();
    this.observer = null;
    this.init();
  }

  init() {
    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      // Intersection Observer not supported, animations will not work
      return;
    }

    this.setupObserver();
    this.observeElements();
  }

  setupObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
  }

  observeElements() {
    // Observe elements with animation classes
    const selectors = [
      '.animate-on-scroll',
      '[data-animate]',
      '.slide-in-up',
      '.slide-in-down', 
      '.slide-in-left',
      '.slide-in-right',
      '.fade-in',
      '.scale-in'
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (!this.animatedElements.has(element)) {
          this.observer.observe(element);
          this.animatedElements.add(element);
        }
      });
    });
  }

  animateElement(element) {
    // Stop observing this element
    this.observer.unobserve(element);

    // Get animation parameters
    const delay = element.dataset.delay || '0';
    const duration = element.dataset.duration || '600';

    // Apply delay and duration as CSS custom properties
    element.style.setProperty('--animation-delay', `${delay}ms`);
    element.style.setProperty('--animation-duration', `${duration}ms`);

    // For elements using the animate-on-scroll class
    if (element.classList.contains('animate-on-scroll')) {
      // Apply the animation using CSS classes
      element.classList.add('animate-in');
      element.style.animationDelay = `${delay}ms`;
      element.style.animationDuration = `${duration}ms`;
    } else {
      // For other animation classes, apply the animation directly
      const animationType = this.getAnimationType(element);
      element.style.animationName = animationType;
      element.style.animationDuration = `${duration}ms`;
      element.style.animationDelay = `${delay}ms`;
      element.style.animationTimingFunction = 'ease';
      element.style.animationFillMode = 'both';
    }

    // Add a class to mark as animated
    element.classList.add('animated');
  }

  getAnimationType(element) {
    if (element.classList.contains('slide-in-up')) return 'slideInUp';
    if (element.classList.contains('slide-in-down')) return 'slideInDown';
    if (element.classList.contains('slide-in-left')) return 'slideInLeft';
    if (element.classList.contains('slide-in-right')) return 'slideInRight';
    if (element.classList.contains('fade-in')) return 'fadeIn';
    if (element.classList.contains('scale-in')) return 'scaleIn';
    return 'slideInUp'; // Default animation
  }

  // Method to observe new elements (useful for dynamically added content)
  observeNewElements() {
    this.observeElements();
  }

  // Method to reset animations (useful for testing)
  resetAnimations() {
    this.animatedElements.clear();
    this.observeElements();
  }
}

// Initialize scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ScrollAnimations();
});

// Re-observe elements when new content is loaded (for SPA-like behavior)
document.addEventListener('DOMContentLoaded', () => {
  // Re-observe after a short delay to catch any dynamically loaded content
  setTimeout(() => {
    if (window.scrollAnimations) {
      window.scrollAnimations.observeNewElements();
    }
  }, 100);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScrollAnimations;
} 