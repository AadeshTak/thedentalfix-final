// Modal functionality
document.addEventListener('DOMContentLoaded', () => {
  // Get all elements with doctor-cta class
  const modalTriggers = document.querySelectorAll('.doctor-cta, .story-cta');
  const modalOverlays = document.querySelectorAll('.modal-overlay');
  const modalCloseButtons = document.querySelectorAll('.modal-close');

  // Function to reset achievements section
  const resetAchievements = (modal) => {
    const moreContent = modal.querySelector('.achievements-more');
    const toggleButton = modal.querySelector('.achievements-toggle');
    if (moreContent && toggleButton) {
      moreContent.classList.remove('active');
      toggleButton.classList.remove('active');
      toggleButton.textContent = 'View More';
    }
  };

  // Open modal
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = `modal-${trigger.dataset.modal}`;
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
      }
    });
  });

  // Close modal when clicking the close button
  modalCloseButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal-overlay');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        resetAchievements(modal); // Reset achievements when modal is closed
      }
    });
  });

  // Close modal when clicking outside
  modalOverlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        resetAchievements(overlay); // Reset achievements when modal is closed
      }
    });
  });

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-overlay.active');
      if (activeModal) {
        activeModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        resetAchievements(activeModal); // Reset achievements when modal is closed
      }
    }
  });

  // Add this inside your DOMContentLoaded event listener
  const achievementToggles = document.querySelectorAll('.achievements-toggle');

  achievementToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const moreContent = toggle.previousElementSibling;
      const isExpanded = moreContent.classList.contains('active');
      
      moreContent.classList.toggle('active');
      toggle.classList.toggle('active');
      toggle.textContent = isExpanded ? 'View More' : 'View Less';
    });
  });
}); 