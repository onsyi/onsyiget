window.addEventListener("DOMContentLoaded", function () {
  var sidebar = document.getElementById("sidebarMenu"),
    overlay = document.getElementById("sidebarOverlay"),
    menuBtn = document.getElementById("mulaiMenuBtn"),
    closeSidebar = document.getElementById("closeSidebar"),
    modalMulai = document.getElementById("modalMulai");
  if (sidebar) sidebar.classList.remove("active");
  if (overlay) overlay.classList.remove("active");
  if (menuBtn && sidebar && overlay)
    menuBtn.addEventListener("click", function (e) {
      sidebar.classList.add("active");
      overlay.classList.add("active");
    });
  if (closeSidebar && sidebar && overlay)
    closeSidebar.onclick = function () {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    };
  if (overlay && sidebar)
    overlay.onclick = function () {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    };
  if (sidebar)
    sidebar.onclick = function (e) {
      e.stopPropagation();
    };
  var logo = document.getElementById("jawariLogoAnim"),
    logoImg = document.querySelector(".mulai-logo-img-atas"),
    logoAnimated = false;
  function showLogoAnimated() {
    if (!logoAnimated && logo) {
      logo.classList.add("animated");
      logoAnimated = true;
    }
  }
  if (logo && logoImg) {
    logoImg.onload = showLogoAnimated;
    logoImg.onerror = function () {
      setTimeout(showLogoAnimated, 700);
    };
    if (logoImg.complete) {
      setTimeout(showLogoAnimated, 50);
    } else {
      setTimeout(showLogoAnimated, 2000);
    }
  }
  var tentangLink = document.querySelector(".sidebar-link"),
    bantuanLink = document.querySelectorAll(".sidebar-link")[1],
    modalTentang = document.getElementById("modalTentang"),
    modalBantuan = document.getElementById("modalBantuan"),
    closeModalTentang = document.getElementById("closeModalTentang"),
    closeModalBantuan = document.getElementById("closeModalBantuan");
  if (tentangLink && modalTentang)
    tentangLink.addEventListener("click", function (e) {
      e.preventDefault();
      if (modalBantuan) modalBantuan.classList.remove("active");
      if (sidebar) sidebar.classList.remove("active");
      if (overlay) overlay.classList.remove("active");
      modalTentang.classList.add("active");
    });
  if (closeModalTentang && modalTentang)
    closeModalTentang.onclick = function () {
      modalTentang.classList.remove("active");
    };
  if (modalTentang)
    modalTentang.addEventListener("click", function (e) {
      if (e.target === modalTentang) modalTentang.classList.remove("active");
    });
  if (bantuanLink && modalBantuan)
    bantuanLink.addEventListener("click", function (e) {
      e.preventDefault();
      if (modalTentang) modalTentang.classList.remove("active");
      if (sidebar) sidebar.classList.remove("active");
      if (overlay) overlay.classList.remove("active");
      modalBantuan.classList.add("active");
    });
  if (closeModalBantuan && modalBantuan)
    closeModalBantuan.onclick = function () {
      modalBantuan.classList.remove("active");
    };
  if (modalBantuan)
    modalBantuan.addEventListener("click", function (e) {
      if (e.target === modalBantuan) modalBantuan.classList.remove("active");
    });
  var btnMulai = document.getElementById("btnMulai"),
    closeModalMulai = document.getElementById("closeModalMulai");
  if (btnMulai && modalMulai)
    btnMulai.onclick = function (e) {
      e.preventDefault();
      modalMulai.classList.add("active");
    };
  if (closeModalMulai && modalMulai)
    closeModalMulai.onclick = function () {
      modalMulai.classList.remove("active");
    };
  if (modalMulai)
    modalMulai.addEventListener("click", function (e) {
      if (e.target === modalMulai) modalMulai.classList.remove("active");
    });
  var cardVideo = document.querySelector(".mulai-card-video"),
    modalVideo = document.getElementById("modalVideo"),
    closeModalVideo = document.getElementById("closeModalVideo"),
    videoFrame = document.querySelector(".modal-video-frame"),
    videoItems = document.querySelectorAll(".modal-video-item");
  videoItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var src = item.getAttribute("data-src");
      if (videoFrame && src) {
        videoFrame.src = src;
        videoFrame.focus();
      }
    });
  });
  if (cardVideo && modalVideo)
    cardVideo.onclick = function (e) {
      e.preventDefault();
      modalVideo.classList.add("active");
    };
  if (closeModalVideo && modalVideo)
    closeModalVideo.onclick = function () {
      modalVideo.classList.remove("active");
    };
  var cardMateri = document.querySelector(".mulai-card-materi"),
    modalMateri = document.getElementById("modalMateri"),
    closeModalMateri = document.getElementById("closeModalMateri");
  if (cardMateri && modalMateri)
    cardMateri.onclick = function (e) {
      e.preventDefault();
      modalMateri.classList.add("active");
    };
  if (closeModalMateri && modalMateri)
    closeModalMateri.onclick = function () {
      modalMateri.classList.remove("active");
    };
  if (modalMateri)
    modalMateri.addEventListener("click", function (e) {
      if (e.target === modalMateri) modalMateri.classList.remove("active");
    });
  var cardSinopsis = document.querySelector(".mulai-card-sinopsis"),
    modalSinopsis = document.getElementById("modalSinopsis"),
    closeModalSinopsis = document.getElementById("closeModalSinopsis");
  if (cardSinopsis && modalSinopsis)
    cardSinopsis.onclick = function (e) {
      e.preventDefault();
      modalSinopsis.classList.add("active");
    };
  if (closeModalSinopsis && modalSinopsis)
    closeModalSinopsis.onclick = function () {
      modalSinopsis.classList.remove("active");
    };
  if (modalSinopsis)
    modalSinopsis.addEventListener("click", function (e) {
      if (e.target === modalSinopsis) modalSinopsis.classList.remove("active");
    });
  // Bantuan item actions
  var bantuanKeluar = document.getElementById("bantuanKeluar"),
    bantuanMenu = document.getElementById("bantuanMenu"),
    bantuanKembali = document.getElementById("bantuanKembali"),
    bantuanInstagram = document.getElementById("bantuanInstagram"),
    bantuanYoutube = document.getElementById("bantuanYoutube"),
    bantuanWhatsapp = document.getElementById("bantuanWhatsapp");
  if (bantuanKeluar)
    bantuanKeluar.onclick = function () {
      if (sidebar) sidebar.classList.remove("active");
      if (overlay) overlay.classList.remove("active");
      if (modalBantuan) modalBantuan.classList.remove("active");
    };
  if (bantuanMenu)
    bantuanMenu.onclick = function () {
      if (modalMulai) modalMulai.classList.add("active");
    };
  if (bantuanKembali)
    bantuanKembali.onclick = function () {
      window.location.href = "/";
    };
  if (bantuanInstagram)
    bantuanInstagram.onclick = function () {
      window.open("https://instagram.com/", "_blank");
    };
  if (bantuanYoutube)
    bantuanYoutube.onclick = function () {
      window.open("https://youtube.com/", "_blank");
    };
  if (bantuanWhatsapp)
    bantuanWhatsapp.onclick = function () {
      window.open("https://wa.me/", "_blank");
    };
});
