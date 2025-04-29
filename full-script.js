// Script untuk Mobile App UI

// Variabel global untuk elemen yang sering digunakan
let searchInput;
let bottomNav;

document.addEventListener("DOMContentLoaded", function () {
  // Inisialisasi aplikasi
  try {
    initializeApp();
  } catch (error) {
    console.error("App initialization failed:", error);
  }
});

// Fungsi utama untuk inisialisasi aplikasi
function initializeApp() {
  // Inisialisasi komponen aplikasi
  setupPlaceholderImages();
  setupCategoryAnimations();
  setupSmoothScroll();
  setupNavigationTabs();
  setupSearchPlaceholder();
  setupExtendedCategories();
  setupTabSwitching();
  setupLogoutButton();

  // Menangani notifikasi permission
  handleNotificationPermission();

  // Menangani API calls
  setupApiErrorHandling();
}

// Fungsi untuk mengatur animasi kategori
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

// Fungsi untuk mengatur smooth scroll
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

// Fungsi untuk mengatur navigasi tab
function setupNavigationTabs() {
  const navItems = document.querySelectorAll(".nav-item");
  bottomNav = document.querySelector(".bottom-nav");

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

// Variabel untuk efek typing pada search bar
const placeholders = ["Cari makanan favoritmu...", "Cari minuman segar...", "Cari cemilan...", "Cari restaurant..."];

let currentPlaceholder = 0;
let currentChar = 0;
let isDeleting = false;
let typingSpeed = 200;

// Fungsi untuk efek typing pada search bar
function typeEffect() {
  // Pastikan searchInput sudah diinisialisasi
  if (!searchInput) return;

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

// Fungsi untuk mengatur placeholder pada search bar
function setupSearchPlaceholder() {
  searchInput = document.querySelector(".search-bar input");
  if (searchInput) {
    typeEffect();
  }
}

// Fungsi untuk mengatur extended categories
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

// Fungsi untuk mengatur posisi indikator tab
function updatePosition(item, prevLeft = null) {
  if (!item || !bottomNav) return;

  const itemRect = item.getBoundingClientRect();
  const navRect = bottomNav.getBoundingClientRect();
  const itemLeft = itemRect.left - navRect.left + itemRect.width / 2;

  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((navItem) => {
    const indicator = navItem.querySelector(".nav-indicator");
    const spotlight = navItem.querySelector(".spotlight-effect");

    if (!indicator || !spotlight) return;

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

// Fungsi untuk mengatur tab switching dengan animasi
function setupTabSwitching() {
  const navItems = document.querySelectorAll(".nav-item");
  const tabPanes = document.querySelectorAll(".tab-pane");

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
      if (previousActive && bottomNav) {
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
      if (mainContainer) {
        if (tabId === "home") {
          mainContainer.classList.remove("hide-header");
        } else {
          mainContainer.classList.add("hide-header");
        }
      }
    });
  });

  // Inisialisasi posisi indikator saat halaman dimuat
  setTimeout(() => {
    const activeItem = document.querySelector(".nav-item.active") || (navItems.length > 0 ? navItems[0] : null);
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
}

// Fungsi untuk mengatur placeholder images
function setupPlaceholderImages() {
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
      if (this.alt && this.alt.includes("Makanan")) {
        this.parentElement.innerHTML = '<i class="fas fa-utensils" style="font-size: 24px; color: #00b14f;"></i>';
      } else if (this.alt && this.alt.includes("Motor")) {
        this.parentElement.innerHTML = '<i class="fas fa-motorcycle" style="font-size: 24px; color: #00b14f;"></i>';
      } else if (this.alt && this.alt.includes("Mobil")) {
        this.parentElement.innerHTML = '<i class="fas fa-car" style="font-size: 24px; color: #00b14f;"></i>';
      } else if (this.alt && this.alt.includes("Belanja")) {
        this.parentElement.innerHTML = '<i class="fas fa-shopping-cart" style="font-size: 24px; color: #00b14f;"></i>';
      } else {
        this.parentElement.innerHTML = '<i class="fas fa-image" style="font-size: 24px; color: #00b14f;"></i>';
      }
    };
  });
}

// Fungsi untuk menangani izin notifikasi
function handleNotificationPermission() {
  // Hanya meminta izin notifikasi jika user berinteraksi dengan halaman
  document.addEventListener(
    "click",
    function () {
      // Cek apakah browser mendukung notifikasi
      if ("Notification" in window && Notification.permission !== "denied" && Notification.permission !== "granted") {
        // Tunda permintaan izin untuk menghindari blocking
        setTimeout(() => {
          Notification.requestPermission();
        }, 5000);
      }
    },
    { once: true }
  );
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

// Fungsi untuk mengatur tombol logout
function setupLogoutButton() {
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

// Fungsi untuk mengganti tab
function switchTab(tabId) {
  if (!tabId) return;

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

// Fungsi untuk menambahkan event listener dengan cleanup
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
