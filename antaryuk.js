// Fungsi untuk searching
const searchButton = document.getElementById("ybcari");
if (searchButton) {
    searchButton.addEventListener("click", function () {
        const searchInput = document.querySelector("input[name='ycari']");
        if (searchInput) {
            const lokasi = `https://jgjk.mobi/act/search/${encodeURIComponent(searchInput.value)}`;
            window.location.replace(lokasi);
        } else {
            console.error("Elemen input[name='ycari'] tidak ditemukan");
        }
    });
}

// Fungsi untuk menampilkan atau menyembunyikan popup
function togglePopup(popupId, show = true) {
    const popup = document.getElementById(popupId);
    if (popup) {
        popup.style.display = show ? "flex" : "none";
    } else {
        console.error(`Popup dengan ID ${popupId} tidak ditemukan`);
    }
}

// Fungsi untuk melanjutkan ke URL yang diberikan
function continueAction(url) {
    if (url) {
        window.location.href = url;
    } else {
        console.error("URL tidak valid atau tidak disediakan");
    }
}

// Produk Terlaris
const PersenKu = 1100;
let halaman = 1;
const aktifasi = "terlaris";

fetch("https://onsyime.my.id/antarek-terlaris.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ aktifasi, halaman })
})
    .then(response => response.json())
    .then(data => {
        if (!data || !Array.isArray(data)) return;
        let xhtml = "";
        data.forEach(element => {
            const hargaNormal = parseInt(element.Harga.replace(/[^0-9]/g, "")) || 0;
            const hargadiskon = Intl.NumberFormat().format(hargaNormal * PersenKu + hargaNormal);
            xhtml += `
                <a style="text-decoration:none" href="https://jgjk.mobi/p/${element.Gambar.substr(-17, 13)}">
                    <div class="OnsyiCardo">
                        <div class="OnsyiPromo1 terlaris-label">
                            <i class="fa-solid fa-fire" style="font-size: 13px; color: orange;"></i>
                            <span class="rating-number">Best Seller</span>
                        </div>
                        <div class="thinn1">45% off</div>
                        <img class="OnsyiImag3" src="${element.Gambar}" />
                    </div>
                    <div class="product-details">
                        <div class="OnsyiText-Judu">${element.Nama}</div>
                        <div class="thinn">Terlaris - Harga terbaik</div>
                        <div class="thinn2">Diantar secepatnya!</div>
                        <div class="OnsyiText-Diskon"><del>Rp${hargadiskon}</del></div>
                        <div class="OnsyiText-Harg">${element.Harga}</div>
                        <txt class="cartu">
                            <i class="fa-solid fa-bag-shopping" style="font-size: 17px;"></i>
                        </txt>
                    </div>
                </a>`;
        });
        const promoElement = document.getElementById("prmo");
        if (promoElement) promoElement.innerHTML = xhtml;
    })
    .catch(error => console.error("Gagal mengambil data produk terlaris:", error));

// Fungsi untuk mengganti "Rp" dengan "IDR"
function gantiSaldo() {
    const saldoElement = document.getElementById("saldo");
    if (saldoElement) {
        saldoElement.innerHTML = saldoElement.innerHTML.replace("Rp ", "IDR");
    }
}

// Observer untuk mendeteksi perubahan pada elemen saldo
const targetNode = document.getElementById("saldo");
if (targetNode) {
    new MutationObserver(gantiSaldo).observe(targetNode, { childList: true, subtree: true, characterData: true });
}

document.addEventListener("DOMContentLoaded", () => {
    gantiSaldo();
    showSlides();
});

// Fungsi slideshow
let slideIndex = 0;
function showSlides() {
    const slides = document.getElementsByClassName("mySlides");
    const dots = document.getElementsByClassName("dot");
    [...slides].forEach(slide => (slide.style.display = "none"));
    slideIndex = (slideIndex + 1 > slides.length) ? 1 : slideIndex + 1;
    slides[slideIndex - 1].style.display = "block";
    [...dots].forEach(dot => dot.classList.remove("activ"));
    dots[slideIndex - 1]?.classList.add("activ");
    setTimeout(showSlides, 5000);
}

// Logika untuk status dan verifikasi
const updateTextContent = (elementId, condition, trueText, falseText, trueColor = "white", falseColor = "yellow") => {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = condition ? trueText : falseText;
        element.style.color = condition ? trueColor : falseColor;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    updateTextContent("driverStatus", document.getElementById("driverStatus")?.textContent.trim().toLowerCase() === "diterima", "Menu Driver", "Daftar Driver");
    updateTextContent("mitraStatus", document.getElementById("mitraStatus")?.textContent.trim().toLowerCase() === "diterima", "Menu Mitra", "Daftar Mitra");
    updateTextContent("verifikasiEmail", document.getElementById("verifikasiEmail")?.textContent.trim() === "1", "Email Terverifikasi", "Verifikasi Email Segera!");
    updateTextContent("verifikasiHP", document.getElementById("verifikasiHP")?.textContent.trim() === "1", "Phone Terverifikasi", "Verifikasi Phone Segera!");
});

// Fungsi untuk membuka halaman tab
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".navigation ul li").forEach(item => {
        item.addEventListener("click", () => {
            document.querySelectorAll(".navigation ul li").forEach(i => i.classList.remove("active"));
            item.classList.add("active");
        });
    });

    document.getElementById("defaultOpen")?.click();
});
