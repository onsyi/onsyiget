// Shopee Mobile UI JavaScript

// Navigation functionality
function setActiveNav(clickedElement) {
  // Remove active class from all nav items
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.classList.remove('active');
  });
  
  // Add active class to clicked item
  clickedElement.classList.add('active');
}

// Search functionality
function initializeSearch() {
  const searchInput = document.querySelector('.search-input');
  const searchForm = document.querySelector('.search-form');
  
  if (searchInput) {
    searchInput.addEventListener('focus', function() {
      this.style.backgroundColor = '#f8f9fa';
    });
    
    searchInput.addEventListener('blur', function() {
      this.style.backgroundColor = 'transparent';
    });
    
    searchInput.addEventListener('input', function() {
      // Here you can add search functionality
      console.log('Searching for:', this.value);
    });
  }
  
  // Handle form submission
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      const searchQuery = searchInput.value.trim();
      if (!searchQuery) {
        e.preventDefault();
        alert('Silakan masukkan kata kunci pencarian');
        return false;
      }
      // Form will automatically submit to the action URL with the query parameter
    });
  }
}

// Dark mode toggle functionality
function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle('dark');
  
  // Save preference to localStorage
  const isDark = body.classList.contains('dark');
  localStorage.setItem('darkMode', isDark);
}

// Initialize dark mode from localStorage
function initializeDarkMode() {
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode === 'true') {
    document.body.classList.add('dark');
  }
}

// Cart functionality
function updateCartCount(count) {
  const cartBadge = document.querySelector('.cart-badge');
  if (cartBadge) {
    cartBadge.textContent = count;
    
    // Add animation effect
    cartBadge.style.transform = 'scale(1.2)';
    setTimeout(() => {
      cartBadge.style.transform = 'scale(1)';
    }, 200);
  }
}

// Service item click handlers
function initializeServiceItems() {
  const serviceItems = document.querySelectorAll('.service-item');
  
  serviceItems.forEach((item, index) => {
    item.addEventListener('click', function() {
      // Add click effect
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 150);
      
      // Handle different service actions
      const serviceLabel = this.querySelector('.service-label').textContent;
      console.log('Service clicked:', serviceLabel);
      
      // You can add specific functionality for each service here
      switch(index) {
        case 0: // Food
          console.log('Opening Food category');
          break;
        case 1: // UMKM
          console.log('Opening UMKM category');
          break;
        case 2: // B2B
          console.log('Opening B2B category');
          break;
        case 3: // Wisata
          console.log('Opening Wisata category');
          break;
      }
    });
  });
}

// Balance items click handlers
function initializeBalanceItems() {
  const balanceItems = document.querySelectorAll('.balance-info');
  
  balanceItems.forEach((item, index) => {
    item.addEventListener('click', function() {
      // Add click effect
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 150);
      
      // Handle balance actions
      switch(index) {
        case 0: // Isi Saldo
          console.log('Opening Isi Saldo');
          break;
        case 1: // Tukar Koin
          console.log('Opening Tukar Koin');
          break;
        case 2: // Gratis Ongkir
          console.log('Opening Gratis Ongkir vouchers');
          break;
      }
    });
  });
}

// Header icons functionality
function initializeHeaderIcons() {
  const cameraIcon = document.querySelector('.header-content .material-icons[onclick]') || 
                    document.querySelector('.header-content .material-icons:nth-child(2)');
  const cartIcon = document.querySelector('.cart-container');
  const chatIcon = document.querySelector('.header-content .material-icons:last-child');
  
  // Camera icon
  if (cameraIcon && cameraIcon.textContent === 'photo_camera') {
    cameraIcon.addEventListener('click', function() {
      console.log('Camera clicked - opening camera');
      // Add camera functionality here
    });
  }
  
  // Cart icon
  if (cartIcon) {
    cartIcon.addEventListener('click', function() {
      console.log('Cart clicked - opening shopping cart');
      // Add cart functionality here
    });
  }
  
  // Chat icon
  if (chatIcon && chatIcon.textContent === 'chat_bubble_outline') {
    chatIcon.addEventListener('click', function() {
      console.log('Chat clicked - opening chat');
      // Add chat functionality here
    });
  }
}

// Add smooth transitions
function addTransitions() {
  const style = document.createElement('style');
  style.textContent = `
    .service-item, .balance-info, .nav-item {
      transition: transform 0.15s ease;
      cursor: pointer;
    }
    
    .service-item:hover, .balance-info:hover {
      transform: scale(1.05);
    }
    
    .nav-item:hover {
      opacity: 0.8;
    }
    
    .cart-badge {
      transition: transform 0.2s ease;
    }
    
    .search-input {
      transition: background-color 0.2s ease;
    }
  `;
  document.head.appendChild(style);
}

// Partner Registration Function
function openPartnerRegistration() {
  // Open Google form or registration page
  const registrationUrl = 'https://forms.google.com/'; // Replace with actual Google form URL
  window.open(registrationUrl, '_blank');
  
  // Optional: Add analytics or tracking
  console.log('Partner registration clicked');
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeDarkMode();
  initializeSearch();
  initializeServiceItems();
  initializeBalanceItems();
  initializeHeaderIcons();
  initializeProfileNavigation();
  addTransitions();
  
  console.log('Shopee Mobile UI initialized successfully!');
});

// Export functions for external use
window.ShopeeUI = {
  setActiveNav,
  toggleDarkMode,
  updateCartCount
};


// Profile Page Navigation Functions
function showProfilePage() {
  const profilePage = document.querySelector('.profile-page');
  const mainContentWrapper = document.querySelector('.main-content-wrapper');
  
  if (profilePage && mainContentWrapper) {
    // Hide main content and show profile page
    mainContentWrapper.style.display = 'none';
    profilePage.style.display = 'block';
    
    // Add profile-active class to body
    document.body.classList.add('profile-active');
  }
}

function hideProfile() {
  const profilePage = document.querySelector('.profile-page');
  const mainContentWrapper = document.querySelector('.main-content-wrapper');
  
  if (profilePage && mainContentWrapper) {
    // Show main content and hide profile page
    mainContentWrapper.style.display = 'block';
    profilePage.style.display = 'none';
    
    // Remove profile-active class from body
    document.body.classList.remove('profile-active');
    
    // Reset navigation to home
    const homeNavItem = document.querySelector('.nav-item[onclick*="showHomePage"]');
    if (homeNavItem) {
      setActiveNav(homeNavItem);
    }
  }
}

function showHomePage() {
  // Use the same logic as hideProfile for consistency
  hideProfile();
}

function initializeProfileNavigation() {
  // Ensure profile page is hidden on load
  const profilePage = document.querySelector('.profile-page');
  if (profilePage) {
    profilePage.style.display = 'none';
  }
  
  // Remove any existing profile-active class
  document.body.classList.remove('profile-active');
}

// Initialize profile navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeProfileNavigation();
});
