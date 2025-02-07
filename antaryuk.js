document.addEventListener("DOMContentLoaded", function () {
    // Fungsi untuk mengganti "Rp" dengan "IDR" tanpa spasi ekstra
    function gantiSaldo() {
        var saldoElement = document.getElementById("saldo");
        if (saldoElement && saldoElement.innerHTML.includes("Rp")) {
            saldoElement.innerHTML = saldoElement.innerHTML.replace("Rp ", "IDR");
        }
    }
    
    // Observer untuk mendeteksi perubahan pada elemen saldo
    var targetNode = document.getElementById("saldo");
    if (targetNode) {
        var config = { childList: true, subtree: true, characterData: true };
        var observer = new MutationObserver(gantiSaldo);
        observer.observe(targetNode, config);
    }
    
    // Menjalankan fungsi saat halaman pertama kali dimuat
    gantiSaldo();

    // Slideshow otomatis
    let slideIndex = 0;
    function showSlides() {
        const slides = document.getElementsByClassName("mySlides");
        const dots = document.getElementsByClassName("dot");
        for (let slide of slides) {
            slide.style.display = "none";
        }
        slideIndex++;
        if (slideIndex > slides.length) slideIndex = 1;
        for (let dot of dots) {
            dot.classList.remove("activ");
        }
        slides[slideIndex - 1].style.display = "block";
        dots[slideIndex - 1].classList.add("activ");
        setTimeout(showSlides, 5000);
    }
    showSlides();
    
    // Fungsi untuk memperbarui status
    function updateStatus(id, acceptedText, pendingText) {
        var element = document.getElementById(id);
        if (element) {
            var text = element.textContent.trim().toLowerCase();
            console.log(`Status ${id}:`, text);
            if (text === "diterima") {
                element.textContent = acceptedText;
                element.style.color = "white";
            } else {
                element.textContent = pendingText;
                element.style.color = "yellow";
            }
        }
    }
    updateStatus("driverStatus", "Menu Driver", "Daftar Driver");
    updateStatus("mitraStatus", "Menu Mitra", "Daftar Mitra");

    function updateVerification(id, textZero, textOne) {
        var element = document.getElementById(id);
        if (element) {
            var text = element.textContent.trim();
            console.log(`Status ${id}:`, text);
            element.textContent = text === "1" ? textOne : textZero;
            element.style.color = text === "1" ? "white" : "yellow";
        }
    }
    updateVerification("verifikasiEmail", "Verifikasi Email Segera!", "Email Terverifikasi");
    updateVerification("verifikasiHP", "Verifikasi Phone Segera!", "Phone Terverifikasi");
    
    // Fungsi untuk menambahkan class "active" saat elemen diklik
    const list = document.querySelectorAll(".list");
    function activelink() {
        list.forEach((item) => item.classList.remove("active"));
        this.classList.add("active");
    }
    list.forEach((item) => item.addEventListener("click", activelink));
    
    // Fungsi untuk tab switching
    function openPage(pageName, elmnt, color) {
        var tabcontent = document.getElementsByClassName("tabcontent");
        for (let content of tabcontent) {
            content.style.display = "none";
        }
        var tablinks = document.getElementsByClassName("tablink");
        for (let link of tablinks) {
            link.style.backgroundColor = "";
        }
        var page = document.getElementById(pageName);
        if (page) {
            page.style.display = "block";
            elmnt.style.backgroundColor = color;
        }
    }
    
    // Menjalankan klik default pada tab awal
    var defaultOpen = document.getElementById("defaultOpen");
    if (defaultOpen) {
        defaultOpen.click();
    }
});

// Memuat modul ionicons
import("https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js").catch(console.error);
