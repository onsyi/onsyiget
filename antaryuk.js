      // Fungsi untuk searching
      document.addEventListener("DOMContentLoaded", function () {
        const searchButton = document.getElementById("ybcari");
        if (searchButton) {
          searchButton.addEventListener("click", function () {
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
        }
      });

      // Fungsi untuk menampilkan popup
      function showPopup(popupId) {
        const popup = document.getElementById(popupId);
        if (popup) popup.style.display = "flex";
      }

      // Fungsi untuk menyembunyikan popup
      function hidePopup(popupId) {
        const popup = document.getElementById(popupId);
        if (popup) popup.style.display = "none";
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
        gantiSaldo();
      }

      // Fungsi slideshow
      let slideIndex = 0;
      function showSlides() {
        const slides = document.getElementsByClassName("mySlides");
        const dots = document.getElementsByClassName("dot");

        if (slides.length > 0) {
          for (let slide of slides) slide.style.display = "none";
          slideIndex = (slideIndex + 1) % slides.length;
          slides[slideIndex].style.display = "block";

          if (dots.length > 0) {
            for (let dot of dots) dot.classList.remove("activ");
            if (dots[slideIndex]) dots[slideIndex].classList.add("activ");
          }

          setTimeout(showSlides, 5000);
        }
      }

      // Fungsi untuk memperbarui status driver dan mitra
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

        if (document.getElementsByClassName("mySlides").length > 0) {
          showSlides();
        }

        if (document.getElementById("saldo")) {
          gantiSaldo();
        }
      });

      // Fungsi untuk membuka halaman tab
      document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll(".navigation ul li a").forEach((tab) => {
          tab.addEventListener("click", function (event) {
            event.preventDefault(); // Mencegah reload halaman

            let pageName = this.getAttribute("data-page"); // Ambil nama tab dari atribut data-page

            // Sembunyikan semua tab content
            document.querySelectorAll(".tabcontent").forEach((content) => {
              content.style.display = "none";
            });

            // Tampilkan tab content yang sesuai
            let activeTab = document.getElementById(pageName);
            if (activeTab) {
              activeTab.style.display = "block";
            }

            // Hapus class "active" dari semua tab dan tambahkan ke tab yang diklik
            document.querySelectorAll(".navigation ul li").forEach((item) => {
              item.classList.remove("active");
            });
            this.parentElement.classList.add("active");
          });
        });

        // Tampilkan tab default saat halaman dimuat
        let defaultTab = document.querySelector(".navigation ul li a[data-page='home']");
        if (defaultTab) {
          defaultTab.click();
        }
      });
