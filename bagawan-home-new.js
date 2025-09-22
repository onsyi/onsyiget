// Global variables for pagination
let elements = {};
let config = {};
let currentPage = 1;
let allProducts = [];
let displayedProducts = [];

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
        products: "https://onsyime.my.id/onsyi.php", // official store
        food: "https://onsyime.my.id/onsyi.php", // flashsale
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

// ===================== ADDITIONAL FUNCTIONS =====================

// Fungsi untuk searching
document.getElementById("ybcari").addEventListener("click", function () {
  var lokasi = "https://jgjk.mobi/act/search/" + $("input[name='ycari']").val();
  window.location.replace(lokasi);
});

// Fungsi untuk menampilkan popup
function showPopup(popupId) {
  const popup = document.getElementById(popupId);
  if (popup) {
    popup.style.display = "flex"; // Menampilkan popup
  } else {
    console.error("Popup dengan ID " + popupId + " tidak ditemukan");
  }
}

// Fungsi untuk menyembunyikan popup
function hidePopup(popupId) {
  const popup = document.getElementById(popupId);
  if (popup) {
    popup.style.display = "none"; // Menyembunyikan popup
  } else {
    console.error("Popup dengan ID " + popupId + " tidak ditemukan");
  }
}

// Fungsi untuk melanjutkan ke URL yang diberikan
function continueAction(url) {
  if (url) {
    window.location.href = url; // Arahkan ke tautan
  } else {
    console.error("URL tidak valid atau tidak disediakan");
  }
}

// Produk Terlaris
var PersenKu = 1100;
var halaman = 1;
var aktifasi = "terlaris"; // Tambahkan filter "terlaris"

$.ajax({
  url: "https://onsyime.my.id/antarek-terlaris.php",
  method: "POST",
  data: {
    aktifasi: aktifasi, // Mengambil produk terlaris
    halaman: halaman,
  },
  dataType: "JSON",
  success: function (data) {
    var xhtml = "";
    data.forEach(function (element) {
      var hargaNormal = element.Harga.substring(3).replace(/,/g, "");
      var hargadiskon = Intl.NumberFormat().format(parseInt(hargaNormal * PersenKu + parseInt(hargaNormal)));

      xhtml += '<a style="text-decoration:none" href="https://jgjk.mobi/p/' + element.Gambar.substr(-17, 13) + '">';
      xhtml += '<div class="OnsyiCardo">';
      xhtml += '<div class="OnsyiPromo1 terlaris-label"><i class="fa-solid fa-fire" style="font-size: 13px; color: orange;"></i> <span class="rating-number">Best Seller</span></div>';
      xhtml += '<div class="thinn1">45% off</div>';
      xhtml += '<img class="OnsyiImag3" src="' + element.Gambar + '"></div>';
      xhtml += '<div class="product-details">';
      xhtml += '<div class="OnsyiText-Judu">' + element.Nama + "</div>";
      xhtml += '<div class="thinn">Terlaris - Harga terbaik</div>';
      xhtml += '<div class="thinn2">Diantar secepatnya!</div>';
      xhtml += '<div class="OnsyiText-Diskon"><del>Rp' + hargadiskon + "</del></div>";
      xhtml += '<div class="OnsyiText-Harg">' + element.Harga + "</div>";
      xhtml += '<txt class="cartu"><i class="fa-solid fa-bag-shopping" style="font-size: 17px;"></i></txt>';
      xhtml += "</a></div>";
    });
    document.getElementById("prmo").innerHTML = xhtml;
  },
});

// Fungsi untuk mengganti "Rp" dengan "IDR"
function gantiSaldo() {
  var saldoElement = document.getElementById("saldo");
  if (saldoElement && saldoElement.innerHTML.includes("Rp")) {
    saldoElement.innerHTML = saldoElement.innerHTML.replace("Rp ", "IDR");
  }
}

// Observer untuk mendeteksi perubahan pada elemen saldo
var targetNode = document.getElementById("saldo");
var observerConfig = {
  childList: true,
  subtree: true,
  characterData: true,
};
var observer = new MutationObserver(function () {
  gantiSaldo();
});
if (targetNode) observer.observe(targetNode, observerConfig);

window.onload = function () {
  gantiSaldo();
  showSlides();
};

// Fungsi slideshow
let slideIndex = 0;

function showSlides() {
  const slides = document.getElementsByClassName("mySlides");
  const dots = document.getElementsByClassName("dot");
  for (let i = 0; i < slides.length; i++) slides[i].style.display = "none";
  slideIndex++;
  if (slideIndex > slides.length) slideIndex = 1;
  for (let i = 0; i < dots.length; i++) dots[i].className = dots[i].className.replace(" activ", "");
  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " activ";
  setTimeout(showSlides, 5000);
}

// Logika untuk status
document.addEventListener("DOMContentLoaded", function () {
  const updateStatus = (elementId, trueText, falseText) => {
    const element = document.getElementById(elementId);
    const text = element?.textContent.trim().toLowerCase();
    if (text === "diterima") {
      element.textContent = trueText;
      element.style.color = "white";
    } else {
      element.textContent = falseText;
      element.style.color = "yellow";
    }
  };

  updateStatus("driverStatus", "Menu Driver", "Daftar Driver");
  updateStatus("mitraStatus", "Menu Mitra", "Daftar Mitra");

  const updateVerification = (elementId, verifiedText, unverifiedText) => {
    const element = document.getElementById(elementId);
    const text = element?.textContent.trim();
    if (text === "0") {
      element.textContent = unverifiedText;
      element.style.color = "yellow";
    } else if (text === "1") {
      element.textContent = verifiedText;
      element.style.color = "white";
    }
  };

  updateVerification("verifikasiEmail", "Email Terverifikasi", "Verifikasi Email Segera!");
  updateVerification("verifikasiHP", "Phone Terverifikasi", "Verifikasi Phone Segera!");
});

// Fungsi untuk mendapatkan data tambahan
function get_data() {
  $.ajax({
    url: "https://onsyime.my.id/bagawanx-food.php",
    data: {
      halaman: currentPage,
    },
    method: "POST",
    dataType: "JSON",
    success: function (data) {
      // Add new products to allProducts array
      if (data && data.length > 0) {
        allProducts = allProducts.concat(data);
      }
      
      // Display only 10 products per page
      const startIndex = (currentPage - 1) * 10;
      const endIndex = startIndex + 10;
      displayedProducts = allProducts.slice(startIndex, endIndex);
      
      let xhtml = "";
      displayedProducts.forEach(function (element) {
        xhtml += '<div class="col-6 mb-3 d-flex justify-content-center">';
        xhtml += '<a href="https://jgjk.mobi/p/' + element.Gambar.substr(-17, 13) + '" style="text-decoration: none; width: 100%;">';
        xhtml += '<div class="OnsyiCard3" style="width: 100%; height: 100%;">';
        xhtml += '<span class="OnsyiNew3"></span>';
        xhtml += '<img class="OnsyiImage3" src="' + element.Gambar + '" style="width: 100%; height: auto;">';
        xhtml += '<div class="star3"><i class="fa-solid fa-star" style="color: #fff; font-size: 13px;"></i> 4.6 • 300+ rating</div>';
        xhtml += '<h6 class="OnsyiText-Judul3">' + element.Nama + "</h6>";
        // Use product description or location as fallback with word limit
        const deskripsi = element.Deskripsi || element.Lokasi || "Deskripsi produk tidak tersedia";
        const fittedDesc = getFittedDescription(deskripsi);
        const stok = element.Stok || "Habis";
        xhtml += '<span class="thin3">' + fittedDesc + '</span>';
        xhtml += '<div class="OnsyiText-Harga3">Stok: ' + stok + '</div>';
        xhtml += '<div class="OnsyiText-Harga3">' + element.Harga + "</div>";
        xhtml += "</div>";
        xhtml += "</a></div>";
      });

      // If this is the first page, replace content; otherwise, append
      if (currentPage === 1) {
        document.getElementById("empat").innerHTML = xhtml;
      } else {
        document.getElementById("empat").innerHTML += xhtml;
      }

      // Hide button if no more products to load
      if (data.length === 0 || displayedProducts.length < 10) {
        document.getElementById("selanjutnyaBtn").style.display = "none";
        document.getElementById("lastPageMessage").style.display = "block";
      }
      
      // Increment page for next load
      currentPage++;
    },
    error: function() {
      // Handle error case
      if (currentPage === 1) {
        document.getElementById("empat").innerHTML = '<div class="col-12"><p class="text-center">Gagal memuat produk. Silakan coba lagi.</p></div>';
      }
    }
  });
}

// Modify the button click handler to use the updated function
$(document).ready(function () {
  // Reset pagination when page loads
  currentPage = 1;
  allProducts = [];
  displayedProducts = [];
  
  // Load initial data
  get_data();
  
  // Add click handler for the "Selanjutnya" button
  document.getElementById("selanjutnyaBtn").addEventListener("click", function(e) {
    e.preventDefault();
    get_data();
  });
});

// Fungsi untuk membuka halaman tab
function openPage(pageName) {
  const tabcontent = document.getElementsByClassName("tabcontent");
  for (let content of tabcontent) {
    content.style.display = "none"; // Sembunyikan semua konten tab
  }

  const tablinks = document.getElementsByClassName("list");
  for (let link of tablinks) {
    link.classList.remove("active"); // Hapus kelas active dari semua tab
  }

  // Tampilkan tab yang dipilih
  const activeTab = document.getElementById(pageName);
  if (activeTab) activeTab.style.display = "block";

  // Tambahkan kelas active ke tab yang diklik
  const activeLink = Array.from(tablinks).find((link) => link.querySelector(`[onclick="openPage('${pageName}')"]`));
  if (activeLink) activeLink.classList.add("active");
}

// Set tab default yang aktif saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  const defaultTab = document.getElementById("defaultOpen");
  if (defaultTab) defaultTab.click();

  // Tambahkan event listener untuk membuat tab aktif saat diklik
  const tablinks = document.querySelectorAll(".navigation ul li");
  tablinks.forEach((item) => {
    item.addEventListener("click", () => {
      // Hapus kelas 'active' dari semua tab
      tablinks.forEach((i) => i.classList.remove("active"));
      // Tambahkan kelas 'active' ke tab yang diklik
      item.classList.add("active");
    });
  });
});

// Fungsi untuk membatasi deskripsi produk
function limitDescription(description, maxWords) {
  if (!description) return "";
  
  const words = description.split(" ");
  if (words.length <= maxWords) {
    return words.join(" ");
  }
  
  return words.slice(0, maxWords).join(" ") + "...";
}

// Fungsi untuk mendapatkan deskripsi yang sesuai dengan ukuran card
function getFittedDescription(description) {
  // Coba dengan 3 kata dulu
  let fittedDesc = limitDescription(description, 3);
  
  // Jika deskripsi terlalu panjang (lebih dari 30 karakter), gunakan 2 kata saja
  if (fittedDesc.length > 30) {
    fittedDesc = limitDescription(description, 2);
  }
  
  return fittedDesc;
}
