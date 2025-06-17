// Global variables
let elements = {};
let config = {};

// Utility Functions
function sanitizeInput(input) {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

function showError(title, message) {
  try {
    console.error(`${title}: ${message}`);
    alert(`${title}\n\n${message}`);
  } catch (err) {
    console.error("Error showing error message:", err);
  }
}

function formatPrice(price) {
  try {
    if (typeof price !== "number" || isNaN(price)) {
      console.warn("Invalid price value:", price);
      return "0";
    }
    return Intl.NumberFormat().format(price);
  } catch (err) {
    console.error("Error formatting price:", err);
    return "0";
  }
}

// Scroll to Top Functionality
function initializeScrollToTop() {
  let ticking = false;

  function handleScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        const scrollTop = $(window).scrollTop();

        // Toggle scroll to top button
        if (scrollTop > 100) {
          $("#scroll").fadeIn(200);
          if (elements.header) {
            elements.header.style.background = "#fff";
          }
        } else {
          $("#scroll").fadeOut(200);
          if (elements.header) {
            elements.header.style.background = "transparent";
          }
        }

        ticking = false;
      });
      ticking = true;
    }
  }

  // Use passive event listener for better scrolling performance
  window.addEventListener("scroll", handleScroll, { passive: true });

  // Smooth scroll to top
  if (elements.scroll) {
    elements.scroll.addEventListener("click", function (e) {
      e.preventDefault();
      $("html, body").animate({ scrollTop: 0 }, 600, "swing");
      return false;
    });
  }
}

// Header Background Change
function initializeHeaderBackground() {
  if (elements.header) {
    window.onscroll = function () {
      const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
      elements.header.style.backgroundColor = scrollTop > 20 ? "rgba(33, 150, 243, 0.7)" : "rgba(33, 150, 243, 0)";
    };
  }
}

// Search Functionality
function initializeSearch() {
  if (elements.searchButton && elements.searchInput) {
    elements.searchButton.addEventListener("click", function () {
      const searchQuery = elements.searchInput.value.trim();
      if (searchQuery) {
        window.location.replace(`https://jgjk.mobi/act/search/${encodeURIComponent(searchQuery)}`);
      }
    });
  }
}

// Countdown Timer Functions
function animation(span) {
  if (!span) return;
  try {
    span.className = "puter";
    setTimeout(() => {
      if (span) span.className = "";
    }, 700);
  } catch (err) {
    console.error("Animation error:", err);
  }
}

function updateCountdown() {
  try {
    const now = new Date();
    const distance = config.countdownDeadline - now;

    if (distance < 0) {
      Object.values(elements).forEach((el) => {
        if (el && ["days", "hours", "minutes", "seconds"].includes(el.id)) {
          el.innerHTML = "0";
        }
      });
      return;
    }

    const timeValues = {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
    };

    Object.entries(timeValues).forEach(([key, value]) => {
      if (elements[key] && !isNaN(value)) {
        elements[key].innerHTML = value;
      }
    });

    if (elements.seconds) animation(elements.seconds);
    if (timeValues.seconds === 0 && elements.minutes) animation(elements.minutes);
    if (timeValues.minutes === 0 && elements.hours) animation(elements.hours);
    if (timeValues.hours === 0 && elements.days) animation(elements.days);
  } catch (err) {
    console.error("Countdown update error:", err);
  }
}

// Product Loading Functions
function loadProducts() {
  if (!elements.promo) {
    console.error("Promo element not found");
    return;
  }
  console.log("Loading products...");

  $.ajax({
    url: config.apiEndpoints.products,
    type: "POST",
    data: {
      aktifasi: "",
      halaman: 4,
    },
    dataType: "JSON",
    timeout: 10000,
    success: handleProductSuccess,
    error: handleProductError,
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.error("AJAX request failed:", textStatus, errorThrown);
    showError("Terjadi Kesalahan", "Gagal memuat produk. Silakan coba lagi nanti.");
  });
}

function handleProductSuccess(data) {
  try {
    if (!data) {
      throw new Error("No data received");
    }
    if (!Array.isArray(data)) {
      throw new Error("Invalid data format: expected array");
    }
    if (data.length === 0) {
      elements.promo.innerHTML = '<div class="col"><div class="no-products">Tidak ada produk tersedia</div></div>';
      return;
    }

    const xhtml = generateProductHTML(data);
    if (!elements.promo) {
      throw new Error("Promo element not found");
    }
    elements.promo.innerHTML = xhtml;
  } catch (err) {
    console.error("Product success handler error:", err);
    showError("Terjadi Kesalahan. 01", err.message);
  }
}

function handleProductError(err) {
  let errorMessage = "Terjadi Kesalahan. 02";
  if (err.status === 404) {
    errorMessage = "URL tidak ditemukan";
  } else if (err.status === 0) {
    errorMessage = "Tidak dapat terhubung ke server";
  } else if (err.status === 408) {
    errorMessage = "Request timeout";
  }
  console.error("Product error:", err);
  showError(errorMessage, err.responseText || err.message);
}

function generateProductHTML(data) {
  try {
    let xhtml = '<div class="col">';

    data.forEach((element) => {
      if (!element) {
        console.warn("Null element in data");
        return;
      }

      if (!element.Harga || !element.Nama || !element.Gambar) {
        console.warn("Invalid product data:", element);
        return;
      }

      try {
        const hargaNormal = element.Harga.substring(3).replace(/,/g, "");
        if (isNaN(hargaNormal)) {
          console.warn("Invalid price format:", element.Harga);
          return;
        }

        const hargadiskon = formatPrice(parseInt(hargaNormal * config.persenKu + parseInt(hargaNormal)));
        const productId = element.Gambar.substr(-17, 13);

        xhtml += `
          <div class="cardOnsyiSlide">
            <a href="https://jgjk.mobi/p/${productId}">
              <div class="product-image-container">
                <img class="OnsyiImageSlide" src="${element.Gambar}" alt="${element.Nama}" onerror="this.src='https://via.placeholder.com/140x140?text=No+Image'">
                <t class="stars">⭐4.8</t>
              </div>
              <t class="OnsyLogo">onsyi</t>
              <txt class="OnsyiLabelSlideFloatFD">Promo</txt>
              <div class="OnsyititleSlide">${element.Nama}</div>
              <div class="card-price-container">
                <div class="OnsyiPriceSlideDisk"><del>Rp${hargadiskon}</del></div>
                <div class="OnsyiPriceSlide bx-flashing">${element.Harga}</div>
              </div>
            </a>
          </div>
        `;
      } catch (err) {
        console.error("Error processing product:", element, err);
      }
    });

    xhtml += "</div>";
    return xhtml;
  } catch (err) {
    console.error("Error generating product HTML:", err);
    return '<div class="col"><div class="error-message">Error loading products</div></div>';
  }
}

// Food Products Loading
function loadFoodProducts() {
  if (!elements.hasil) {
    console.error("Hasil element not found");
    return;
  }
  console.log("Loading food products...");

  $.ajax({
    url: config.apiEndpoints.food,
    data: { halaman: config.halaman },
    method: "POST",
    dataType: "JSON",
    success: function (data) {
      try {
        if (!data) {
          throw new Error("No data received");
        }
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format: expected array");
        }
        if (data.length === 0) {
          elements.hasil.innerHTML = '<div class="no-products">Tidak ada produk tersedia</div>';
          return;
        }

        let xhtml = "";
        data.forEach(function (element) {
          if (!element || !element.Gambar || !element.Nama || !element.Harga) {
            console.warn("Invalid food product data:", element);
            return;
          }

          try {
            xhtml += '<div class="col-6">';
            xhtml += '<a href="https://jgjk.mobi/p/' + element.Gambar.substr(-17, 13) + '">' + '<div class="OnsyiCard">';
            xhtml += '<t class="OnsyiLabelHot bx-flashing">Fresh</t>';
            xhtml += '<t class="OnsyiLogo"></t>';
            xhtml += '<img class="OnsyiImage" src="' + element.Gambar + '" onerror="this.src=\'https://via.placeholder.com/140x140?text=No+Image\'">';
            xhtml += '<h6 class="OnsyiText-Judul">' + element.Nama + "</h6>";
            xhtml += '<b class="OnsyiText-Harga">🔥' + element.Harga + "</b>";
            xhtml += "</div>";
            xhtml += "</div>";
          } catch (err) {
            console.error("Error processing food product:", element, err);
          }
        });
        elements.hasil.innerHTML = xhtml;
      } catch (err) {
        console.error("Food products success handler error:", err);
        showError("Terjadi Kesalahan. 01", err.message);
      }
    },
    error: function (err) {
      console.error("Food products error:", err);
      showError("Terjadi Kesalahan. 02", err.responseText || err.message);
    },
  });
  config.halaman++;
}

// Menu Popup Functions
function initializeMenuPopup() {
  const menuButton = document.getElementById("menuLainnya");
  const menuPopup = document.getElementById("menuPopup");
  const menuOverlay = document.getElementById("menuOverlay");
  const menuClose = document.getElementById("menuClose");

  if (!menuButton || !menuPopup || !menuOverlay || !menuClose) {
    console.error("Required menu elements not found");
    return;
  }

  function openMenu() {
    menuPopup.classList.add("active");
    menuOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    menuPopup.classList.remove("active");
    menuOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  menuButton.addEventListener("click", function (e) {
    e.preventDefault();
    openMenu();
  });

  menuClose.addEventListener("click", closeMenu);
  menuOverlay.addEventListener("click", closeMenu);
}

// Initialize all functionality
function initializeApp() {
  try {
    // Define elements object
    elements = {
      days: document.getElementById("days"),
      hours: document.getElementById("hours"),
      minutes: document.getElementById("minutes"),
      seconds: document.getElementById("seconds"),
      scroll: document.getElementById("scroll"),
      header: document.getElementById("header2"),
      promo: document.getElementById("promo"),
      hasil: document.getElementById("hasil"),
      searchButton: document.getElementById("ybcari"),
      searchInput: document.querySelector("input[name='ycari']"),
    };

    // Configuration
    config = {
      countdownDeadline: new Date("dec 01, 2025 23:59:59"),
      persenKu: 1100,
      halaman: 1,
      apiEndpoints: {
        products: "https://onsyime.my.id/dianteer.php",
        food: "https://onsyime.my.id/food.php",
      },
    };

    // Initialize all features
    initializeScrollToTop();
    initializeHeaderBackground();
    initializeSearch();
    initializeMenuPopup();

    // Load products and start countdown
    if (elements.promo) loadProducts();
    if (elements.hasil) loadFoodProducts();
    if (elements.days) setInterval(updateCountdown, 1000);
  } catch (err) {
    console.error("Initialization error:", err);
    showError("Terjadi Kesalahan", "Gagal menginisialisasi aplikasi. Silakan refresh halaman.");
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeApp);
