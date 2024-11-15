    // Fungsi Popup
      function showPopup(popupId) {
        const popup = document.getElementById(popupId);
        if (popup) {
          popup.style.display = "flex"; // Atau gunakan style yang sesuai
        } else {
          console.error(`Popup dengan ID ${popupId} tidak ditemukan.`);
        }
      }
      
      function hidePopup(popupId) {
        const popup = document.getElementById(popupId);
        if (popup) {
          popup.style.display = "none";
        } else {
          console.error(`Popup dengan ID ${popupId} tidak ditemukan.`);
        }
      }
      
      // Contoh penggunaan popup
      document.addEventListener("DOMContentLoaded", function () {
        document.getElementById("showPopupButton").addEventListener("click", function () {
          showPopup("examplePopup");
        });
      
        document.getElementById("hidePopupButton").addEventListener("click", function () {
          hidePopup("examplePopup");
        });
      });
      
     
      // Produk Terlaris
var PersenKu = 1100;
var url_produk = "";
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
    try {
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
    } catch (err) {
      alert("Terjadi Kesalahan. 01\n\n" + (err.message || "Error tidak diketahui."));
    }
  },
  error: function (err) {
    alert("Terjadi Kesalahan. 02\n\n" + (err.statusText || "Error tidak diketahui."));
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
var config = { childList: true, subtree: true, characterData: true };
var observer = new MutationObserver(function (mutationsList) {
  mutationsList.forEach(gantiSaldo);
});
if (targetNode) observer.observe(targetNode, config);

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

// Fungsi untuk tab navigasi
function openPage(pageName, elmnt, color) {
  const tabcontent = document.getElementsByClassName("tabcontent");
  Array.from(tabcontent).forEach((content) => (content.style.display = "none"));
  const tablinks = document.getElementsByClassName("tablink");
  Array.from(tablinks).forEach((link) => (link.style.backgroundColor = ""));
  document.getElementById(pageName).style.display = "block";
  elmnt.style.backgroundColor = color;
}
document.getElementById("defaultOpen").click();

// Fungsi untuk mendapatkan data tambahan
function get_data() {
  $.ajax({
    url: "https://onsyime.my.id/antarek-food.php",
    data: { halaman: halaman },
    method: "POST",
    dataType: "JSON",
    success: function (data) {
      try {
        let xhtml = "";
        data.forEach(function (element) {
          xhtml += '<div class="col-6 col-md-4 col-lg-3 d-flex justify-content-center">';
          xhtml += '<a href="https://jgjk.mobi/p/' + element.Gambar.substr(-17, 13) + '">';
          xhtml += '<div class="OnsyiCard3">';
          xhtml += '<span class="OnsyiNew3">Best Seller</span>';
          xhtml += '<img class="OnsyiImage3" src="' + element.Gambar + '">';
          xhtml += '<div class="star3"><i class="fa-solid fa-star" style="color: #fff; font-size: 13px;"></i> 4.6 • 300+ rating</div>';
          xhtml += '<h6 class="OnsyiText-Judul3">' + element.Nama + '</h6>';
          xhtml += '<span class="thin3">Mitra Antarek</span>';
          xhtml += '<div class="OnsyiText-Harga3">' + element.Harga + '</div>';
          xhtml += '</div>';
          xhtml += '</a></div>';
        });

        document.getElementById("empat").innerHTML += xhtml;

        if (data.length === 0) {
          document.getElementById("selanjutnyaBtn").style.display = "none";
          document.getElementById("lastPageMessage").style.display = "block";
        }
      } catch (err) {
        console.error("Parsing Error:", err);
        alert("Terjadi Kesalahan. 01\n\n" + err.message);
      }
    },
    error: function (err) {
      console.error("Request Error:", err);
      alert("Terjadi Kesalahan. 02\n\n" + err.responseText);
    },
  });
  halaman++;
}

$(document).ready(function () {
  get_data();
});
