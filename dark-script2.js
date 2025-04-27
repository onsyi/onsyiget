// Script untuk Dark Mode dan UI Enhancements

// Tidak mendefinisikan ulang initializeApp karena sudah ada di script.js
// Hanya menggunakan fungsi yang sudah didefinisikan di script.js

// Fungsi untuk menangani izin notifikasi
function handleNotificationPermission() {
  // Tidak meminta izin notifikasi secara otomatis untuk menghindari blocking
  // Sebagai gantinya, tambahkan tombol untuk meminta izin notifikasi
  const notificationBtn = document.getElementById("notificationBtn");
  
  if (notificationBtn) {
    notificationBtn.addEventListener("click", function() {
      // Cek apakah browser mendukung notifikasi
      if ("Notification" in window) {
        // Tunda permintaan izin untuk menghindari blocking
        Notification.requestPermission().then(function(permission) {
          if (permission === "granted") {
            console.log("Izin notifikasi diberikan");
          }
        });
      }
    });
  }
}

// Fungsi untuk menangani error API
function setupApiErrorHandling() {
  // Intercept fetch atau XMLHttpRequest untuk menangani error API
  const originalFetch = window.fetch;
  window.fetch = function (url, options) {
    return originalFetch(url, options)
      .then((response) => {
        if (!response.ok && response.status === 404) {
          console.warn(`API request to ${url} failed with 404. Using fallback data.`);
          // Gunakan data fallback jika API tidak tersedia
          return { json: () => Promise.resolve({ success: false, data: [] }) };
        }
        return response;
      })
      .catch((error) => {
        console.error(`API request failed: ${error.message}`);
        // Gunakan data fallback jika API tidak tersedia
        return { json: () => Promise.resolve({ success: false, data: [] }) };
      });
  };
}

// Fungsi-fungsi helper untuk initializeApp
function setupDarkMode() {
  const darkModeToggle = document.getElementById("darkModeToggle");
  const body = document.body;

  // Check for saved dark mode preference
  const darkMode = localStorage.getItem("darkMode");
  if (darkMode === "enabled") {
    body.classList.add("dark-mode");
    updateDarkModeIcon(true);
  }

  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      body.classList.toggle("dark-mode");
      const isDarkMode = body.classList.contains("dark-mode");
      localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
      updateDarkModeIcon(isDarkMode);
    });
  }
}

function updateDarkModeIcon(isDarkMode) {
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (darkModeToggle) {
    const icon = darkModeToggle.querySelector("i");
    if (icon) {
      icon.className = isDarkMode ? "fas fa-sun" : "fas fa-moon";
    }
  }
}

function setupPlaceholderImages() {
  const placeholderImages = document.querySelectorAll("img");

  placeholderImages.forEach((img) => {
    // Perbaiki path gambar yang tidak ditemukan
    if (img.src.includes("food-icon.svg")) {
      img.src = "images/food-icon.svg";
    } else if (img.src.includes("motor-icon.svg")) {
      img.src = "images/motor-icon.svg";
    } else if (img.src.includes("car-icon.svg")) {
      img.src = "images/car-icon.svg";
    } else if (img.src.includes("shop-icon.svg")) {
      img.src = "images/shop-icon.svg";
    } else if (img.src.includes("gomart-logo.svg")) {
      img.src = "images/gomart-logo.svg";
    } else if (img.src.includes("gopay-logo.svg")) {
      img.src = "images/gopay-logo.svg";
    } else if (img.src.includes("placeholder-restaurant.svg")) {
      img.src = "images/placeholder-restaurant.svg";
    }

    img.onerror = function () {
      // Jika gambar tidak ditemukan, ganti dengan warna latar belakang
      this.style.backgroundColor = "#e8f5e9";
      this.style.display = "flex";
      this.style.alignItems = "center";
      this.style.justifyContent = "center";
      this.style.color = "#00b14f";

      // Tambahkan ikon placeholder sesuai dengan kategori
      if (this.alt.includes("Makanan")) {
        this.parentElement.innerHTML = '<i class="fas fa-utensils" style="font-size: 24px; color: #00b14f;"></i>';
      } else if (this.alt.includes("Motor")) {
        this.parentElement.innerHTML = '<i class="fas fa-motorcycle" style="font-size: 24px; color: #00b14f;"></i>';
      } else if (this.alt.includes("Mobil")) {
        this.parentElement.innerHTML = '<i class="fas fa-car" style="font-size: 24px; color: #00b14f;"></i>';
      } else if (this.alt.includes("Belanja")) {
        this.parentElement.innerHTML = '<i class="fas fa-shopping-cart" style="font-size: 24px; color: #00b14f;"></i>';
      } else if (this.alt.includes("Semua")) {
        this.parentElement.innerHTML = '<i class="fas fa-th" style="font-size: 24px; color: #00b14f;"></i>';
      } else {
        this.parentElement.innerHTML = '<i class="fas fa-image" style="font-size: 24px; color: #00b14f;"></i>';
      }
    };
  });
}

function setupCategoryAnimations() {
  const categoryItems = document.querySelectorAll(".category-item");
  categoryItems.forEach((item) => {
    item.addEventListener("click", function () {
      this.style.transform = "scale(0.95)";
      setTimeout(() => {
        this.style.transform = "scale(1)";
      }, 200);
    });
  });
}

function setupSmoothScroll() {
  const linksRow = document.querySelector(".links-section .row");
  if (linksRow) {
    linksRow.addEventListener("wheel", (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        linksRow.scrollLeft += e.deltaY;
      }
    });
  }
}

function setupNavigationTabs() {
  const navItems = document.querySelectorAll(".nav-item");
  const bottomNav = document.querySelector(".bottom-nav");

  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();

      // Remove active class from all nav items
      navItems.forEach((nav) => nav.classList.remove("active"));

      // Add active class to clicked nav item
      this.classList.add("active");

      // Show indicator and spotlight effect for active tab
      const indicator = this.querySelector(".nav-indicator");
      const spotlight = this.querySelector(".spotlight-effect");

      if (indicator) indicator.style.opacity = "1";
      if (spotlight) spotlight.style.opacity = "1";

      // Hide indicator and spotlight for inactive tabs
      navItems.forEach((nav) => {
        if (nav !== this) {
          const navIndicator = nav.querySelector(".nav-indicator");
          const navSpotlight = nav.querySelector(".spotlight-effect");

          if (navIndicator) navIndicator.style.opacity = "0";
          if (navSpotlight) navSpotlight.style.opacity = "0";
        }
      });

      // Panggil fungsi switchTab untuk mengganti konten tab dan mengelola header
      const tabId = this.getAttribute("data-tab");
      switchTab(tabId);
    });
  });

  // Set active state for default tab (home)
  const defaultTab = document.querySelector('.nav-item[data-tab="home"]');
  if (defaultTab) {
    defaultTab.classList.add("active");

    // Pastikan header ditampilkan untuk tab home saat halaman pertama kali dimuat
    const mainContainer = document.querySelector(".main-container");
    if (mainContainer) {
      mainContainer.classList.remove("hide-header");
    }

    // Tunggu sedikit untuk memastikan layout sudah dirender
    setTimeout(() => {
      // Panggil updatePosition untuk mengatur posisi awal indikator
      if (typeof updatePosition === "function" && bottomNav) {
        updatePosition(defaultTab);
      } else {
        // Fallback jika updatePosition belum tersedia
        const indicator = defaultTab.querySelector(".nav-indicator");
        const spotlight = defaultTab.querySelector(".spotlight-effect");

        if (indicator) indicator.style.opacity = "1";
        if (spotlight) spotlight.style.opacity = "1";
      }
    }, 100);
  }
}

function setupSearchPlaceholder() {
  const searchInput = document.querySelector(".search-bar input");
  if (searchInput) {
    const placeholders = ["Cari makanan favoritmu...", "Cari minuman segar...", "Cari cemilan...", "Cari restaurant..."];

    let currentPlaceholder = 0;
    let currentChar = 0;
    let isDeleting = false;
    let typingSpeed = 200;

    function typeEffect() {
      const current = placeholders[currentPlaceholder];

      if (isDeleting) {
        searchInput.placeholder = current.substring(0, currentChar - 1);
        currentChar--;
      } else {
        searchInput.placeholder = current.substring(0, currentChar + 1);
        currentChar++;
      }

      if (!isDeleting && currentChar === current.length) {
        isDeleting = true;
        typingSpeed = 100;
        setTimeout(typeEffect, 1000);
        return;
      }

      if (isDeleting && currentChar === 0) {
        isDeleting = false;
        currentPlaceholder = (currentPlaceholder + 1) % placeholders.length;
        typingSpeed = 200;
      }

      setTimeout(typeEffect, typingSpeed);
    }

    typeEffect();
  }
}

function setupExtendedCategories() {
  const allCategoryBtn = document.getElementById("allCategoryBtn");
  const extendedCategories = document.getElementById("extendedCategories");

  if (allCategoryBtn && extendedCategories) {
    allCategoryBtn.addEventListener("click", function (e) {
      e.preventDefault();
      extendedCategories.style.display = extendedCategories.style.display === "none" ? "block" : "none";
    });
  }
}

function setupTabSwitching() {
  const navItems = document.querySelectorAll(".nav-item");
  const tabPanes = document.querySelectorAll(".tab-pane");

  // Pre-load all tab contents
  tabPanes.forEach((pane) => {
    if (!pane.classList.contains("active")) {
      pane.style.display = "none";
    }
  });

  // Fast tab switching
  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();

      // Remove active class from all nav items
      navItems.forEach((nav) => nav.classList.remove("active"));

      // Add active class to clicked nav item
      item.classList.add("active");

      // Get target tab
      const targetTab = item.getAttribute("data-tab");

      // Hide all tab panes instantly
      tabPanes.forEach((pane) => {
        pane.style.display = "none";
        pane.classList.remove("active");
      });

      // Show target tab pane instantly
      const targetPane = document.getElementById(`${targetTab}-content`);
      if (targetPane) {
        targetPane.style.display = "block";
        targetPane.classList.add("active");
      }
    });
  });
}

function switchTab(tabId) {
  const tabs = document.querySelectorAll(".tab-pane");
  tabs.forEach((tab) => {
    tab.style.display = "none";
    tab.classList.remove("active");
  });

  const activeTab = document.getElementById(`${tabId}-content`);
  if (activeTab) {
    activeTab.style.display = "block";
    activeTab.classList.add("active");
  }

  // Mengelola tampilan header berdasarkan tab yang aktif
  const mainContainer = document.querySelector(".main-container");
  if (mainContainer) {
    // Tambahkan class hide-header untuk tab yang tidak memerlukan header
    // Misalnya: profile, order, food, dll
    if (tabId === "profile" || tabId === "order" || tabId === "food") {
      mainContainer.classList.add("hide-header");
    } else {
      mainContainer.classList.remove("hide-header");
    }
  }
}

// Menangani preload resource yang tidak digunakan
function handleUnusedPreloads() {
  // Hapus preload links yang tidak digunakan
  const preloadLinks = document.querySelectorAll('link[rel="preload"]');
  
  // Ubah preload menjadi prefetch untuk menghindari peringatan
  preloadLinks.forEach((link) => {
    // Ubah rel dari preload menjadi prefetch
    link.setAttribute("rel", "prefetch");
    
    // Pastikan atribut 'as' ada
    if (!link.hasAttribute("as")) {
      link.setAttribute("as", "image");
    }
  });
}

// Menangani logout
function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();

      if (confirm("Apakah Anda yakin ingin keluar?")) {
        // Add your logout logic here
        alert("Anda telah berhasil logout");
        // Redirect to login page or perform other logout actions
        window.location.href = "login.html"; // Change this to your login page
      }
    });
  }
}

// Inisialisasi aplikasi saat DOM sudah siap
document.addEventListener("DOMContentLoaded", () => {
  try {
    // Periksa apakah initializeApp sudah didefinisikan di script.js
    if (typeof window.initializeApp === 'function') {
      window.initializeApp();
    } else {
      // Jika tidak ada, panggil fungsi-fungsi yang diperlukan secara langsung
      setupDarkMode();
      setupPlaceholderImages();
      setupCategoryAnimations();
      setupSmoothScroll();
      setupNavigationTabs();
      if (typeof setupSearchPlaceholder === 'function') setupSearchPlaceholder();
      if (typeof setupExtendedCategories === 'function') setupExtendedCategories();
      if (typeof setupTabSwitching === 'function') setupTabSwitching();
    }
    
    // Panggil fungsi tambahan
    handleUnusedPreloads();
    setupLogout();
    handleNotificationPermission();
  } catch (error) {
    console.error("App initialization failed:", error);
  }
});

// Definisikan fungsi switchTab jika belum ada
if (typeof switchTab !== 'function') {
  function switchTab(tabId) {
    const tabs = document.querySelectorAll(".tab-pane");
    tabs.forEach((tab) => {
      tab.style.display = "none";
      tab.classList.remove("active");
    });

    const activeTab = document.getElementById(`${tabId}-content`);
    if (activeTab) {
      activeTab.style.display = "block";
      activeTab.classList.add("active");
    }

    // Mengelola tampilan header berdasarkan tab yang aktif
    const mainContainer = document.querySelector(".main-container");

    // Tambahkan class hide-header untuk tab yang tidak memerlukan header
    if (tabId === "profile" || tabId === "order" || tabId === "food") {
      mainContainer.classList.add("hide-header");
    } else {
      mainContainer.classList.remove("hide-header");
    }
  }
}
