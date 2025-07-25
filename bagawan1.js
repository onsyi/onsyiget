    // Global variables
let elements = {};
let config = {};

// ===================== UTILITY FUNCTIONS =====================
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

// ===================== SCROLL TO TOP =====================
function initializeScrollToTop() {
  let ticking = false;

  function handleScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        const scrollTop = $(window).scrollTop();
        // Toggle scroll to top button
        if (scrollTop > 100) {
          $("#scroll").fadeIn(200);
          if (elements.header) elements.header.style.background = "#fff";
        } else {
          $("#scroll").fadeOut(200);
          if (elements.header) elements.header.style.background = "transparent";
        }
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener("scroll", handleScroll, { passive: true });
  if (elements.scroll) {
    elements.scroll.addEventListener("click", function (e) {
      e.preventDefault();
      if (typeof $ === "function" && $("html, body").animate) {
        $("html, body").animate({ scrollTop: 0 }, 600, "swing");
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return false;
    });
  } else {
    console.warn("#scroll element not found or not initialized");
  }
}

// ===================== HEADER BACKGROUND =====================
function initializeHeaderBackground() {
  if (elements.header) {
    window.onscroll = function () {
      const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
      elements.header.style.backgroundColor = scrollTop > 20 ? "rgba(33, 150, 243, 0.7)" : "rgba(33, 150, 243, 0)";
    };
  }
}

// ===================== SEARCH FUNCTION =====================
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

// ===================== COUNTDOWN TIMER =====================
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
      ["days", "hours", "minutes", "seconds"].forEach((id) => {
        if (elements[id]) elements[id].innerHTML = "0";
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
      if (elements[key] && !isNaN(value)) elements[key].innerHTML = value;
    });
    if (elements.seconds) animation(elements.seconds);
    if (timeValues.seconds === 0 && elements.minutes) animation(elements.minutes);
    if (timeValues.minutes === 0 && elements.hours) animation(elements.hours);
    if (timeValues.hours === 0 && elements.days) animation(elements.days);
  } catch (err) {
    console.error("Countdown update error:", err);
  }
}

// ===================== PRODUCT LOADING =====================
function loadProducts() {
  if (!elements.promo) {
    console.error("Promo element not found");
    return;
  }
  console.log("Loading products...");
  $.ajax({
    url: config.apiEndpoints.products,
    type: "POST",
    data: { aktifasi: "", halaman: 4 },
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
    if (!data) throw new Error("No data received");
    if (!Array.isArray(data)) throw new Error("Invalid data format: expected array");
    if (data.length === 0) {
      elements.promo.innerHTML = '<div class="produk-grid"><div class="no-products">Tidak ada produk tersedia</div></div>';
      return;
    }
    const xhtml = generateProductHTML(data);
    if (!elements.promo) throw new Error("Promo element not found");
    elements.promo.innerHTML = xhtml;
  } catch (err) {
    console.error("Product success handler error:", err);
    showError("Terjadi Kesalahan. 01", err.message);
  }
}

function handleProductError(err) {
  let errorMessage = "Terjadi Kesalahan. 02";
  if (err.status === 404) errorMessage = "URL tidak ditemukan";
  else if (err.status === 0) errorMessage = "Tidak dapat terhubung ke server";
  else if (err.status === 408) errorMessage = "Request timeout";
  console.error("Product error:", err);
  showError(errorMessage, err.responseText || err.message);
}

function generateProductHTML(data) {
  try {
    let xhtml = '<div class="promo-cards-row">';
    data.forEach((element) => {
      if (!element || !element.Harga || !element.Nama || !element.Gambar) {
        console.warn("Invalid product data:", element);
        return;
      }
      try {
        const hargaDiskon = element.HargaDiskon && element.HargaDiskon.trim() !== "" ? `<p class='item-price-before-discount'>${element.HargaDiskon}</p>` : "";
        const stok = element.Stok || "Habis";
        const rating = element.Rating ? element.Rating : "4.9";
        const produkLink = element.Link && element.Link.startsWith("http") ? element.Link : `https://jgjk.mobi/p/${element.Gambar.substr(-17, 13)}`;
        xhtml += `
          <a href="${produkLink}" class="promo-card-item promo-card-item-link" target="_blank">
            <div class="image-container">
              <div class="ribbon">Hot</div>
              <span class="promo-label"><i class='fa fa-star'></i> ${rating}</span>
              <span class="promo-badge">Stok: ${stok}</span>
              <img src="${element.Gambar}" alt="${element.Nama}" />
            </div>
            <div class="promo-card-content">
              <div class="product-name">${element.Nama}</div>
              ${hargaDiskon}
              <div class="product-price">${element.Harga}</div>
              <div class="card-action-row-promo">
                <button class="promo-beli-btn" onclick="event.stopPropagation(); window.open('${produkLink}', '_blank');">
                  <i class="fa fa-plus"></i>
                </button>
              </div>
            </div>
          </a>
        `;
      } catch (err) {
        console.error("Error processing product:", element, err);
      }
    });
    xhtml += "</div>";
    return xhtml;
  } catch (err) {
    console.error("Error generating product HTML:", err);
    return '<div class="promo-cards-row"><div class="error-message">Error loading products</div></div>';
  }
}

// ===================== FOOD PRODUCTS LOADING =====================
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
        if (!data) throw new Error("No data received");
        if (!Array.isArray(data)) throw new Error("Invalid data format: expected array");
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
            const hargaDiskon = element.HargaDiskon && element.HargaDiskon.trim() !== "" ? `<p class='item-price-before-discount'>${element.HargaDiskon}</p>` : "";
            const stok = element.Stok || "Habis";
            const rating = element.Rating ? element.Rating : "4.9";
            const produkLink = element.Link && element.Link.startsWith("http") ? element.Link : `https://jgjk.mobi/p/${element.Gambar.substr(-17, 13)}`;
            xhtml += `
              <a href="${produkLink}" class="promo-card-item promo-card-item-link" target="_blank">
                <div class="image-container">
                  <span class="promo-label"><i class='fa fa-star'></i> ${rating}</span>
                  <span class="promo-badge">Stok: ${stok}</span>
                  <img src="${element.Gambar}" alt="${element.Nama}" />
                </div>
                <div class="promo-card-content">
                  <div class="product-name">${element.Nama}</div>
                  ${hargaDiskon}
                  <div class="product-price">${element.Harga}</div>
                  <div class="card-action-row-promo">
                    <button class="promo-beli-btn" onclick="event.stopPropagation(); window.open('${produkLink}', '_blank');">
                      <i class="fa fa-plus"></i>
                    </button>
                  </div>
                </div>
              </a>
            `;
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

// ===================== MENU POPUP =====================
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

// ===================== APP INITIALIZATION =====================
function initializeApp() {
  try {
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
    config = {
      countdownDeadline: new Date("dec 01, 2025 23:59:59"),
      persenKu: 1100,
      halaman: 1,
      apiEndpoints: {
        products: "https://onsyime.my.id/bagawan-officialstore.php", // official store
        food: "https://onsyime.my.id/bagawanx-food.php", // flashsale
      },
    };
    initializeScrollToTop();
    initializeHeaderBackground();
    initializeSearch();
    if (elements.promo) loadProducts();
    if (elements.hasil) loadFoodProducts();
    if (elements.days) setInterval(updateCountdown, 1000);
  } catch (err) {
    console.error("App initialization error:", err);
  }
}
document.addEventListener("DOMContentLoaded", initializeApp);

// Efek header transparan saat refresh, putih saat scroll
window.addEventListener("DOMContentLoaded", function () {
  var header = document.getElementById("header2");
  function updateHeaderTransparency() {
    if (window.scrollY > 10) {
      header.classList.remove("header-transparent");
    } else {
      header.classList.add("header-transparent");
    }
  }
  if (header) {
    updateHeaderTransparency();
    window.addEventListener("scroll", updateHeaderTransparency);
  }
});
