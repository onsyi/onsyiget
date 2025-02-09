perbaiki fungsi js ini :
     // Fungsi untuk searching
document.getElementById("ybcari").addEventListener("click", function() {
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
	success: function(data) {
		var xhtml = "";
		data.forEach(function(element) {
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
var config = {
	childList: true,
	subtree: true,
	characterData: true
};
var observer = new MutationObserver(function() {
	gantiSaldo();
});
if (targetNode) observer.observe(targetNode, config);

window.onload = function() {
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
document.addEventListener("DOMContentLoaded", function() {
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
		url: "https://onsyime.my.id/antarek-food.php",
		data: {
			halaman: halaman
		},
		method: "POST",
		dataType: "JSON",
		success: function(data) {
			let xhtml = "";
			data.forEach(function(element) {
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
		},
	});
	halaman++;
}

$(document).ready(function() {
	get_data();
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
	const activeLink = Array.from(tablinks).find((link) =>
		link.querySelector(`[onclick="openPage('${pageName}')"]`)
	);
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
