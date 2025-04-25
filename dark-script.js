// Script untuk Mobile App UI

document.addEventListener("DOMContentLoaded", function () {
  // Dark Mode Toggle
  const darkModeToggle = document.getElementById("darkModeToggle");
  const body = document.body;

  // Check for saved dark mode preference
  const darkMode = localStorage.getItem("darkMode");
  if (darkMode === "enabled") {
    body.classList.add("dark-mode");
    updateDarkModeIcon(true);
  }

  darkModeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    const isDarkMode = body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
    updateDarkModeIcon(isDarkMode);
  });

  function updateDarkModeIcon(isDarkMode) {
    const icon = darkModeToggle.querySelector("i");
    icon.className = isDarkMode ? "fas fa-sun" : "fas fa-moon";
  }

  // Placeholder untuk gambar yang belum tersedia
  const placeholderImages = document.querySelectorAll("img");

  placeholderImages.forEach((img) => {
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

  // Animasi sederhana untuk elemen-elemen UI
  const categoryItems = document.querySelectorAll(".category-item");
  categoryItems.forEach((item) => {
    item.addEventListener("click", function () {
      this.style.transform = "scale(0.95)";
      setTimeout(() => {
        this.style.transform = "scale(1)";
      }, 200);
    });
  });

  // Smooth scroll for links section
  const linksRow = document.querySelector(".links-section .row");
  if (linksRow) {
    linksRow.addEventListener("wheel", (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        linksRow.scrollLeft += e.deltaY;
      }
    });
  }

  // Bottom Navigation Tab Handling
  const navItems = document.querySelectorAll(".nav-item");

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
    mainContainer.classList.remove("hide-header");

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
});

const searchInput = document.querySelector(".search-bar input");
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

// Start the typing animation when page loads
document.addEventListener("DOMContentLoaded", () => {
  typeEffect();
});

// Add this to your existing JavaScript
document.addEventListener("DOMContentLoaded", function () {
  const allCategoryBtn = document.getElementById("allCategoryBtn");
  const extendedCategories = document.getElementById("extendedCategories");

  if (allCategoryBtn && extendedCategories) {
    allCategoryBtn.addEventListener("click", function (e) {
      e.preventDefault();
      extendedCategories.style.display = extendedCategories.style.display === "none" ? "block" : "none";
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const navItems = document.querySelectorAll(".nav-item");
  const bottomNav = document.querySelector(".bottom-nav");
  const tabPanes = document.querySelectorAll(".tab-pane");

  function updatePosition(item, prevLeft = null) {
    const itemRect = item.getBoundingClientRect();
    const navRect = bottomNav.getBoundingClientRect();
    const itemLeft = itemRect.left - navRect.left + itemRect.width / 2;

    navItems.forEach((navItem) => {
      const indicator = navItem.querySelector(".nav-indicator");
      const spotlight = navItem.querySelector(".spotlight-effect");

      if (navItem === item) {
        // Jika ada posisi sebelumnya, animasikan perpindahan
        if (prevLeft !== null) {
          // Atur posisi awal ke posisi tab sebelumnya
          indicator.style.left = prevLeft + "px";
          spotlight.style.left = prevLeft + "px";

          // Paksa reflow untuk memastikan transisi berjalan
          void indicator.offsetWidth;
          void spotlight.offsetWidth;
        }

        // Tampilkan indikator dan spotlight dengan delay kecil
        setTimeout(() => {
          indicator.style.opacity = "1";
          indicator.style.left = itemLeft + "px";
          spotlight.style.opacity = "0.7";
          spotlight.style.left = itemLeft + "px";
        }, 10);
      } else {
        indicator.style.opacity = "0";
        spotlight.style.opacity = "0";
      }
    });
  }

  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();

      // Jika tab yang diklik sudah aktif, tidak perlu melakukan apa-apa
      if (this.classList.contains("active")) return;

      // Simpan referensi ke tab yang sebelumnya aktif
      const previousActive = document.querySelector(".nav-item.active");

      // Hapus kelas active dari semua tab dan pane
      navItems.forEach((nav) => nav.classList.remove("active"));
      tabPanes.forEach((pane) => pane.classList.remove("active"));

      // Tambahkan kelas active ke tab yang diklik
      this.classList.add("active");

      // Animasi transisi dari tab sebelumnya ke tab yang baru
      if (previousActive) {
        // Dapatkan posisi tab sebelumnya dan tab baru
        const prevRect = previousActive.getBoundingClientRect();
        const navRect = bottomNav.getBoundingClientRect();

        // Hitung posisi untuk animasi
        const prevLeft = prevRect.left - navRect.left + prevRect.width / 2;

        // Animasikan perpindahan indikator dengan posisi awal dari tab sebelumnya
        updatePosition(this, prevLeft);
      } else {
        // Jika tidak ada tab aktif sebelumnya, langsung tampilkan indikator
        updatePosition(this);
      }

      // Menampilkan konten tab yang sesuai
      const tabId = this.getAttribute("data-tab");
      const tabContent = document.getElementById(tabId + "-content");
      if (tabContent) {
        tabContent.classList.add("active");
      }

      // Menyembunyikan header-section dan search-container pada tab Food, Order, dan Profile
      const mainContainer = document.querySelector(".main-container");
      if (tabId === "home") {
        mainContainer.classList.remove("hide-header");
      } else {
        mainContainer.classList.add("hide-header");
      }
    });
  });

  // Inisialisasi posisi indikator saat halaman dimuat
  setTimeout(() => {
    const activeItem = document.querySelector(".nav-item.active") || navItems[0];
    if (activeItem) {
      activeItem.classList.add("active");
      updatePosition(activeItem);

      // Menampilkan konten tab yang sesuai
      const tabId = activeItem.getAttribute("data-tab");
      const tabContent = document.getElementById(tabId + "-content");
      if (tabContent) {
        tabContent.classList.add("active");
      }
    }
  }, 100);
});

document.addEventListener("DOMContentLoaded", () => {
  // Cache DOM elements
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
      targetPane.style.display = "block";
      targetPane.classList.add("active");
    });
  });
});

// Add this to your existing JavaScript
document.getElementById("logoutBtn").addEventListener("click", function (e) {
  e.preventDefault();

  if (confirm("Apakah Anda yakin ingin keluar?")) {
    // Add your logout logic here
    alert("Anda telah berhasil logout");
    // Redirect to login page or perform other logout actions
    window.location.href = "login.html"; // Change this to your login page
  }
});

// 1. Add error handling
document.addEventListener("DOMContentLoaded", () => {
  try {
    initializeApp();
  } catch (error) {
    console.error("App initialization failed:", error);
  }
});

// 2. Improve tab switching performance
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
  // Misalnya: profile, order, food, dll
  if (tabId === "profile" || tabId === "order" || tabId === "food") {
    mainContainer.classList.add("hide-header");
  } else {
    mainContainer.classList.remove("hide-header");
  }
}

// 3. Add proper event cleanup
function addEventListeners() {
  const navItems = document.querySelectorAll(".nav-item");
  const cleanup = [];

  navItems.forEach((item) => {
    const handler = (e) => {
      e.preventDefault();
      const tabId = item.dataset.tab;
      switchTab(tabId);
    };

    item.addEventListener("click", handler);
    cleanup.push(() => item.removeEventListener("click", handler));
  });

  return () => cleanup.forEach((fn) => fn());
}
