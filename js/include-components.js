// components/includeComponents.js
document.addEventListener("DOMContentLoaded", function () {
  // Function to determine the correct path to components
  function getComponentPath(componentName) {
    // Always use root-relative path for components
    return `/components/${componentName}.html`;
  }

    // Active page highlighting function
   function initializeActivePageHighlighting() {
    const currentPath = window.location.pathname.replace(/\/$/, ''); // remove trailing slash
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
      let href = link.getAttribute('href').replace(/^\.\//, '').replace(/\/$/, '');
      // For home link
      if ((currentPath === '' || currentPath === '/' || currentPath === '/index' || currentPath === '/index.html') &&
          (href === '' || href === 'index' || href === 'index.html' || href === '/')) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        // For pretty URLs and .html
        let page = currentPath.split('/').pop();
        if (page === '') page = 'index';
        if (page.endsWith('.html')) page = page.replace('.html', '');
        if (href.endsWith('.html')) href = href.replace('.html', '');
        if (page === href) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      }
    });
  }
  
  
  // Function to load HTML components
  async function includeHTML(elementId, componentPath) {
    try {
      const response = await fetch(componentPath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const html = await response.text();
      document.getElementById(elementId).innerHTML = html;
      
      // Initialize menu toggle if this is the navbar
      if (elementId === "navbar-placeholder") {
        initializeMobileMenu();
        if (typeof window.initializeActivePageHighlighting === 'function') {
          window.initializeActivePageHighlighting();
        }
      }
    } catch (error) {
      // Graceful degradation - component won't load but site remains functional
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = `<div class="component-error">Component temporarily unavailable</div>`;
      }
    }
  }

  // Function to initialize mobile menu
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

  // Load components with correct paths
  includeHTML("navbar-placeholder", getComponentPath("navbar"));
  includeHTML("footer-placeholder", getComponentPath("footer"));
});
