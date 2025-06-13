// Initialize modal and carousel
document.addEventListener("DOMContentLoaded", function () {
  // Initialize modal
  const seeAllBtn = document.querySelector(".see-all-btn");
  const categoriesModal = document.getElementById("categoriesModal");

  if (seeAllBtn && categoriesModal) {
    // Handle modal backdrop and accessibility
    categoriesModal.addEventListener("show.bs.modal", function () {
      // Remove inert attribute when modal is shown
      categoriesModal.removeAttribute("inert");
    });

    categoriesModal.addEventListener("hidden.bs.modal", function () {
      // Add inert attribute when modal is hidden
      categoriesModal.setAttribute("inert", "");

      // Remove modal backdrop
      const backdrop = document.querySelector(".modal-backdrop");
      if (backdrop) {
        backdrop.remove();
      }

      // Remove modal-open class from body
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      // Return focus to the button that opened the modal
      seeAllBtn.focus();
    });

    seeAllBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const modal = new bootstrap.Modal(categoriesModal);
      modal.show();
    });
  }

  // Initialize carousel
  const carousel = document.getElementById("carouselExample");
  if (carousel) {
    new bootstrap.Carousel(carousel, {
      interval: 5000,
      wrap: true,
    });
  }
});

// Handle loading state
window.addEventListener("load", function () {
  // Handle loading indicator
  const loading = document.getElementById("loading");
  if (loading) {
    loading.style.opacity = "0";
    setTimeout(() => {
      loading.style.display = "none";
    }, 300);
  }

  // Lazy load images
  if ("loading" in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach((img) => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
  }
});

// Fallback: Hide loading indicator after 5 seconds
setTimeout(function () {
  const loading = document.getElementById("loading");
  if (loading && loading.style.display !== "none") {
    loading.style.display = "none";
  }
}, 5000);
