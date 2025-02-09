// Fungsi untuk searching
document.getElementById("ybcari")?.addEventListener("click", function () {
    const inputElement = document.querySelector("input[name='ycari']");
    if (inputElement) {
        const searchTerm = inputElement.value.trim();
        if (searchTerm) {
            window.location.replace(`https://jgjk.mobi/act/search/${encodeURIComponent(searchTerm)}`);
        } else {
            alert("Masukkan kata kunci pencarian!");
        }
    }
});

// Fungsi untuk menampilkan popup
function showPopup(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) {
        popup.style.display = "flex";
    } else {
        console.error(`Popup dengan ID ${popupId} tidak ditemukan`);
    }
}

// Fungsi untuk menyembunyikan popup
function hidePopup(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) {
        popup.style.display = "none";
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

// Fungsi untuk mengganti "Rp" dengan "IDR"
function gantiSaldo() {
    const saldoElement = document.getElementById("saldo");
    if (saldoElement && saldoElement.textContent.includes("Rp")) {
        saldoElement.textContent = saldoElement.textContent.replace("Rp ", "IDR ");
    }
}

// Observer untuk mendeteksi perubahan pada elemen saldo
const saldoObserverTarget = document.getElementById("saldo");
if (saldoObserverTarget) {
    const observer = new MutationObserver(gantiSaldo);
    observer.observe(saldoObserverTarget, { childList: true, subtree: true, characterData: true });
}

// Fungsi slideshow
let slideIndex = 0;
function showSlides() {
    const slides = document.getElementsByClassName("mySlides");
    const dots = document.getElementsByClassName("dot");

    if (slides.length > 0) {
        Array.from(slides).forEach((slide) => (slide.style.display = "none"));
        slideIndex = (slideIndex + 1) % slides.length;
        slides[slideIndex].style.display = "block";

        Array.from(dots).forEach((dot) => dot.classList.remove("activ"));
        if (dots[slideIndex]) dots[slideIndex].classList.add("activ");
        setTimeout(showSlides, 5000);
    }
}

// Logika untuk status
document.addEventListener("DOMContentLoaded", function () {
    const updateStatus = (elementId, trueText, falseText) => {
        const element = document.getElementById(elementId);
        if (element) {
            const text = element.textContent.trim().toLowerCase();
            element.textContent = text === "diterima" ? trueText : falseText;
            element.style.color = text === "diterima" ? "white" : "yellow";
        }
    };

    updateStatus("driverStatus", "Menu Driver", "Daftar Driver");
    updateStatus("mitraStatus", "Menu Mitra", "Daftar Mitra");

    const updateVerification = (elementId, verifiedText, unverifiedText) => {
        const element = document.getElementById(elementId);
        if (element) {
            const text = element.textContent.trim();
            element.textContent = text === "1" ? verifiedText : unverifiedText;
            element.style.color = text === "1" ? "white" : "yellow";
        }
    };

    updateVerification("verifikasiEmail", "Email Terverifikasi", "Verifikasi Email Segera!");
    updateVerification("verifikasiHP", "Phone Terverifikasi", "Verifikasi Phone Segera!");
});

