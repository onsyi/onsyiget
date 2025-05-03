/**
 * Script untuk Muslim App E-Wallet
 * Aplikasi untuk menampilkan jadwal sholat dan fitur e-wallet
 */

// Variabel konfigurasi aplikasi
const CONFIG = {
  defaultPage: "home-page",
  navItems: {
    home: "nav-home",
    profile: "nav-profile",
  },
};

/**
 * Fungsi untuk menampilkan halaman yang dipilih
 * @param {string} pageId - ID halaman yang akan ditampilkan
 */
function showPage(pageId) {
  // Sembunyikan semua halaman
  document.querySelectorAll(".page-content").forEach((page) => {
    page.style.display = "none";
  });

  // Tampilkan halaman yang dipilih
  const selectedPage = document.getElementById(pageId);
  if (selectedPage) {
    selectedPage.style.display = "block";
  } else {
    console.warn(`Halaman dengan ID '${pageId}' tidak ditemukan`);
    return;
  }

  // Update navigasi aktif
  updateActiveNavigation(pageId);
}

/**
 * Fungsi untuk memperbarui navigasi aktif
 * @param {string} pageId - ID halaman yang aktif
 */
function updateActiveNavigation(pageId) {
  const navItems = document.querySelectorAll(".nav-item[data-page]");
  navItems.forEach((item) => {
    item.classList.remove("active");
  });

  // Aktifkan navigasi yang sesuai
  if (pageId === "home-page") {
    document.getElementById(CONFIG.navItems.home)?.classList.add("active");
  } else if (pageId === "profile-page") {
    document.getElementById(CONFIG.navItems.profile)?.classList.add("active");
  }
}

// Inisialisasi aplikasi saat DOM telah dimuat
document.addEventListener("DOMContentLoaded", function () {
  initNavigation();
  createBubbles();
  updateCurrentDate();
  initPrayerTimes();
  requestNotificationPermission();
});
/**
 * Fungsi untuk menampilkan tanggal saat ini dengan format lengkap
 * Menampilkan hari, tanggal, bulan dan tahun dalam Bahasa Indonesia
 */
function updateCurrentDate() {
  const dateElement = document.getElementById("current-date");
  if (!dateElement) return;

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const today = new Date();
  try {
    dateElement.textContent = today.toLocaleDateString("id-ID", options);
  } catch (error) {
    // Fallback jika locale id-ID tidak didukung
    console.warn("Locale id-ID tidak didukung, menggunakan en-US", error);
    dateElement.textContent = today.toLocaleDateString("en-US", options);
  }
}
/**
 * Fungsi untuk meminta izin notifikasi dengan pengecekan status
 * Menampilkan pesan jika notifikasi diblokir oleh pengguna
 */
function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.warn("Browser tidak mendukung notifikasi");
    return;
  }

  // Periksa status izin saat ini sebelum meminta
  if (Notification.permission === "default") {
    Notification.requestPermission()
      .then((permission) => {
        console.log("Status izin notifikasi:", permission);
      })
      .catch((error) => {
        console.error("Error saat meminta izin notifikasi:", error);
      });
  } else {
    console.log("Status izin notifikasi saat ini:", Notification.permission);
    // Jika izin diblokir, tampilkan pesan untuk membantu pengguna
    if (Notification.permission === "denied") {
      console.warn("Izin notifikasi diblokir. Pengguna perlu mengaktifkan izin di pengaturan browser.");
      // Tampilkan pesan ke pengguna tentang cara mengaktifkan notifikasi
      const notifElement = document.getElementById("notification-status");
      if (notifElement) {
        notifElement.textContent = "Notifikasi dinonaktifkan. Silakan aktifkan di pengaturan browser Anda.";
        notifElement.style.display = "block";
      }
    }
  }
}
// Variabel global untuk menyimpan waktu sholat dan audio adzan
let currentPrayerTimes = null;
let adhanAudio = null;

// Inisialisasi audio dengan penanganan error
try {
  adhanAudio = new Audio("https://raw.githubusercontent.com/islamic-network/cdn/master/islamic/audio/adhan/mishary-rashid-alafasy-128kbps/1.mp3");
  // Pra-muat audio untuk mengurangi delay saat pemutaran
  adhanAudio.preload = "auto";
  // Tangani error loading
  adhanAudio.onerror = function () {
    console.error("Error saat memuat file audio adzan");
  };
} catch (error) {
  console.error("Browser tidak mendukung Audio API:", error);
}
async function initPrayerTimes() {
  try {
    // Menggunakan koordinat default untuk Indonesia (Jakarta)
    let latitude = -6.2088;
    let longitude = 106.8456;
    // Coba dapatkan lokasi pengguna jika diizinkan
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            maximumAge: 60000,
          });
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        console.log("Menggunakan lokasi pengguna:", latitude, longitude);
      } catch (locError) {
        console.warn("Tidak dapat mengakses lokasi pengguna, menggunakan lokasi default:", locError);
      }
    }
    // Coba gunakan API Aladhan yang lebih stabil dan mendukung lebih banyak lokasi
    try {
      // Format tanggal untuk API (YYYY-MM-DD)
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];
      // Gunakan API Aladhan dengan parameter yang sesuai
      const aladhanUrl = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=11`;
      console.log("Mencoba API Aladhan:", aladhanUrl);
      const response = await fetch(aladhanUrl);
      if (!response.ok) {
        throw new Error(`API Aladhan error: ${response.status}`);
      }
      const data = await response.json();
      // Validasi data dari API Aladhan
      if (data && data.code === 200 && data.data && data.data.timings) {
        const timings = data.data.timings;
        // Format waktu dari API Aladhan (format 24 jam HH:MM)
        const times = {
          fajr: timings.Fajr || "--:--",
          dhuhr: timings.Dhuhr || "--:--",
          asr: timings.Asr || "--:--",
          maghrib: timings.Maghrib || "--:--",
          isha: timings.Isha || "--:--",
        };
        // Periksa apakah ada waktu yang tidak valid
        const hasInvalidTime = Object.values(times).some((time) => time === "--:--");
        if (hasInvalidTime) {
          console.warn("Beberapa waktu sholat tidak valid dari API Aladhan, mencoba API alternatif");
          throw new Error("Data waktu sholat tidak lengkap");
        } else {
          console.log("Berhasil mendapatkan waktu sholat dari API Aladhan:", times);
          currentPrayerTimes = times;
          updatePrayerTimesDisplay(currentPrayerTimes);

          // Pastikan interval tidak dibuat duplikat
          if (window._prayerCheckInterval) {
            clearInterval(window._prayerCheckInterval);
          }

          // Mulai interval untuk mengecek waktu sholat setiap menit
          window._prayerCheckInterval = setInterval(checkPrayerTime, 60000);
          return; // Keluar dari fungsi jika berhasil
        }
      } else {
        throw new Error("Format data API Aladhan tidak sesuai");
      }
    } catch (aladhanError) {
      console.warn("Gagal menggunakan API Aladhan, mencoba API alternatif:", aladhanError);
      // Lanjutkan ke API berikutnya jika Aladhan gagal
    }
    // Coba gunakan API Malaysia Prayer Times sebagai fallback
    try {
      const mptUrl = `https://mpt.i906.my/api/prayer/${latitude},${longitude}`;
      console.log("Mencoba API Malaysia Prayer Times:", mptUrl);
      const response = await fetch(mptUrl);
      if (!response.ok) {
        console.warn(`API MPT error: ${response.status}`);
        throw new Error(`API MPT error: ${response.status}`);
      }
      const data = await response.json();
      // Validasi data dengan lebih ketat
      if (data && data.data && data.data.times && Array.isArray(data.data.times) && data.data.times.length >= 7) {
        try {
          // Pastikan semua timestamp valid sebelum memformat
          const times = {
            fajr: data.data.times[0] ? formatTime(data.data.times[0]) : "--:--",
            dhuhr: data.data.times[2] ? formatTime(data.data.times[2]) : "--:--",
            asr: data.data.times[3] ? formatTime(data.data.times[3]) : "--:--",
            maghrib: data.data.times[5] ? formatTime(data.data.times[5]) : "--:--",
            isha: data.data.times[6] ? formatTime(data.data.times[6]) : "--:--",
          };
          // Periksa apakah ada waktu yang tidak valid
          const hasInvalidTime = Object.values(times).some((time) => time === "--:--" || time === "Invalid Date");
          if (hasInvalidTime) {
            console.warn("Beberapa waktu sholat tidak valid dari API MPT, menggunakan waktu default", times);
            throw new Error("Data waktu sholat tidak lengkap");
          } else {
            console.log("Berhasil mendapatkan waktu sholat dari API MPT:", times);
            currentPrayerTimes = times;
            updatePrayerTimesDisplay(currentPrayerTimes);

            // Pastikan interval tidak dibuat duplikat
            if (window._prayerCheckInterval) {
              clearInterval(window._prayerCheckInterval);
            }

            // Mulai interval untuk mengecek waktu sholat setiap menit
            window._prayerCheckInterval = setInterval(checkPrayerTime, 60000);
            return; // Keluar dari fungsi jika berhasil
          }
        } catch (formatError) {
          console.error("Error saat memformat waktu sholat dari API MPT:", formatError);
          throw formatError;
        }
      } else {
        console.error("Format data waktu sholat dari API MPT tidak sesuai:", data);
        throw new Error("Format data tidak sesuai");
      }
    } catch (mptError) {
      console.warn("Gagal menggunakan API MPT:", mptError);
      // Lanjutkan ke fallback jika semua API gagal
    }
    // Jika semua API gagal, gunakan waktu default
    console.warn("Semua API gagal, menggunakan waktu sholat default");
    useDefaultPrayerTimes();
  } catch (error) {
    console.error("Error mengambil data waktu sholat:", error);
    // Gunakan waktu default jika semua API gagal
    useDefaultPrayerTimes();
  }
}
// Fungsi untuk menggunakan waktu sholat default jika API gagal
function useDefaultPrayerTimes() {
  try {
    // Gunakan waktu default yang lebih sesuai dengan zona waktu pengguna
    const now = new Date();
    const isRamadhan = false; // Ini bisa diubah berdasarkan perhitungan kalender Hijriah

    // Waktu default yang disesuaikan dengan zona waktu Indonesia
    currentPrayerTimes = {
      fajr: "04:30",
      dhuhr: "12:15",
      asr: "15:30",
      maghrib: "18:10",
      isha: "19:30",
    };

    console.log("Menggunakan waktu sholat default");
    updatePrayerTimesDisplay(currentPrayerTimes);

    // Pastikan interval tidak dibuat duplikat
    if (window._prayerCheckInterval) {
      clearInterval(window._prayerCheckInterval);
    }

    // Periksa waktu sholat saat ini
    checkPrayerTime();

    // Simpan referensi interval untuk mencegah duplikasi
    window._prayerCheckInterval = setInterval(checkPrayerTime, 60000);
  } catch (error) {
    console.error("Error saat menggunakan waktu sholat default:", error);
  }
}

/**
 * Fungsi untuk memeriksa waktu sholat saat ini dan menandainya
 * Juga memainkan adzan jika waktu sholat tepat sama dengan waktu saat ini
 */
function checkPrayerTime() {
  if (!currentPrayerTimes) return;

  try {
    const now = new Date();
    let currentTime;

    try {
      // Coba gunakan toLocaleTimeString dengan opsi
      currentTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (formatError) {
      // Fallback manual jika browser tidak mendukung opsi formatting
      console.warn("Browser tidak mendukung opsi formatting waktu, menggunakan format manual", formatError);
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      currentTime = `${hours}:${minutes}`;
    }

    // Mapping nama waktu sholat dari kode ke nama yang ditampilkan
    const prayerNames = {
      fajr: "Subuh",
      dhuhr: "Dzuhur",
      asr: "Ashar",
      maghrib: "Maghrib",
      isha: "Isya",
    };

    // Hapus highlight dari semua item terlebih dahulu
    document.querySelectorAll(".prayer-item").forEach((item) => {
      item.classList.remove("current-prayer");
    });

    // Konversi waktu saat ini ke menit untuk perbandingan yang lebih mudah
    const currentMinutes = convertTimeToMinutes(currentTime);

    // Temukan waktu sholat berikutnya dan saat ini
    let nextPrayer = null;
    let currentPrayer = null;
    let minDiff = Infinity;

    for (const [key, time] of Object.entries(currentPrayerTimes)) {
      if (!time || time === "--:--") continue;

      const prayerMinutes = convertTimeToMinutes(time);

      // Jika waktu sholat sama persis dengan waktu saat ini
      if (time === currentTime) {
        playAdhan(prayerNames[key]);
        currentPrayer = key;
        break;
      }

      // Jika waktu sholat sudah lewat tapi masih dalam hari yang sama
      if (prayerMinutes <= currentMinutes) {
        currentPrayer = key;
      }

      // Cari waktu sholat berikutnya
      if (prayerMinutes > currentMinutes && prayerMinutes - currentMinutes < minDiff) {
        minDiff = prayerMinutes - currentMinutes;
        nextPrayer = key;
      }
    }

    // Highlight waktu sholat saat ini
    if (currentPrayer) {
      // Hanya scroll saat adzan (waktu sholat sama persis dengan waktu saat ini)
      const shouldScroll = currentTime === currentPrayerTimes[currentPrayer];
      highlightCurrentPrayer(currentPrayer, shouldScroll);
    } else if (nextPrayer) {
      // Jika tidak ada waktu sholat saat ini, highlight waktu sholat berikutnya tanpa scroll
      highlightCurrentPrayer(nextPrayer, false);
    }
  } catch (error) {
    console.error("Error saat memeriksa waktu sholat:", error);
  }
}
/**
 * Fungsi untuk mengkonversi format waktu "HH:MM" ke menit
 * @param {string} timeStr - String waktu dalam format "HH:MM"
 * @returns {number} - Total menit (jam * 60 + menit)
 */
function convertTimeToMinutes(timeStr) {
  // Validasi input dengan lebih ketat
  if (!timeStr || typeof timeStr !== "string" || timeStr === "--:--") return 0;

  try {
    // Pastikan format waktu sesuai dengan pola HH:MM
    if (!/^\d{1,2}:\d{2}$/.test(timeStr)) {
      console.warn("Format waktu tidak valid (bukan HH:MM):", timeStr);
      return 0;
    }

    const [hours, minutes] = timeStr.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      console.warn("Format waktu tidak valid (nilai di luar rentang):", timeStr);
      return 0;
    }
    return hours * 60 + minutes;
  } catch (error) {
    console.error("Error saat mengkonversi waktu ke menit:", error);
    return 0;
  }
}

/**
 * Fungsi untuk memutar adzan dan menampilkan notifikasi
 * @param {string} prayerName - Nama waktu sholat (Subuh, Dzuhur, dll)
 */
function playAdhan(prayerName) {
  if (!adhanAudio) {
    console.warn("Audio adzan tidak tersedia");
    return;
  }

  try {
    // Reset audio ke awal
    adhanAudio.currentTime = 0;

    // Tampilkan notifikasi jika diizinkan
    if (Notification.permission === "granted") {
      try {
        new Notification("Waktu Sholat", {
          body: `Sudah memasuki waktu sholat ${prayerName}`,
          icon: "/icon.png",
        });
      } catch (notifError) {
        console.error("Error menampilkan notifikasi:", notifError);
      }
    }

    // Mainkan adzan dengan penanganan error yang lebih baik
    const playPromise = adhanAudio.play();

    // Audio play() mengembalikan Promise di browser modern
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error("Error memutar adzan:", error);
        // Coba lagi setelah interaksi pengguna jika error disebabkan oleh kebijakan autoplay
        if (error.name === "NotAllowedError") {
          console.warn("Autoplay diblokir oleh browser. Adzan akan diputar setelah interaksi pengguna.");
        }
      });
    }
  } catch (error) {
    console.error("Error umum saat memutar adzan:", error);
  }
}

/**
 * Fungsi untuk menandai waktu sholat saat ini dengan highlight
 * @param {string} prayerKey - Kode waktu sholat (fajr, dhuhr, asr, maghrib, isha)
 * @param {boolean} shouldScroll - Apakah harus scroll ke elemen waktu sholat
 */
function highlightCurrentPrayer(prayerKey, shouldScroll = false) {
  if (!prayerKey) return;

  try {
    // Mapping dari kode waktu sholat ke nama yang ditampilkan
    const prayerMapping = {
      fajr: "Subuh",
      dhuhr: "Dzuhur",
      asr: "Ashar",
      maghrib: "Maghrib",
      isha: "Isya",
    };

    if (!prayerMapping[prayerKey]) {
      console.warn(`Kunci waktu sholat tidak valid: ${prayerKey}`);
      return;
    }

    // Cari elemen waktu sholat berdasarkan data-prayer-name
    const prayerName = prayerMapping[prayerKey];
    const currentPrayerElement = document.querySelector(`.prayer-item[data-prayer-name="${prayerName}"]`);

    if (currentPrayerElement) {
      // Tambahkan kelas untuk highlight
      currentPrayerElement.classList.add("current-prayer");

      // Scroll ke elemen waktu sholat saat ini hanya jika parameter shouldScroll adalah true
      if (shouldScroll) {
        currentPrayerElement.scrollIntoView({
          behavior: "smooth",
          inline: "center",
        });
      }
    } else {
      console.warn(`Elemen waktu sholat tidak ditemukan untuk: ${prayerName}`);
    }
  } catch (error) {
    console.error("Error saat highlight waktu sholat:", error);
  }
}

/**
 * Fungsi untuk memformat timestamp menjadi string waktu format 24 jam
 * @param {number} timestamp - Timestamp dalam detik
 * @returns {string} - Waktu dalam format "HH:MM"
 */
function formatTime(timestamp) {
  try {
    // Periksa apakah timestamp valid dengan pengecekan yang lebih ketat
    if (timestamp === null || timestamp === undefined || isNaN(Number(timestamp))) {
      console.warn("Timestamp tidak valid:", timestamp);
      return "--:--";
    }

    // Pastikan timestamp adalah angka
    const timestampNum = Number(timestamp);

    // Konversi timestamp ke Date object (timestamp dalam detik, perlu dikali 1000 untuk milidetik)
    const date = new Date(timestampNum * 1000);

    // Periksa apakah date valid
    if (isNaN(date.getTime())) {
      console.warn("Date tidak valid dari timestamp:", timestamp);
      return "--:--";
    }

    // Format waktu dalam format 24 jam (HH:MM) dengan fallback untuk browser yang tidak mendukung opsi tertentu
    try {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (formatError) {
      // Fallback manual jika browser tidak mendukung opsi formatting
      console.warn("Browser tidak mendukung opsi formatting waktu, menggunakan format manual", formatError);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    }
  } catch (error) {
    console.error("Error saat memformat waktu:", error);
    return "--:--";
  }
}

/**
 * Fungsi untuk memperbarui tampilan waktu sholat di UI
 * @param {Object} prayerTimes - Objek berisi waktu sholat dalam format {fajr: "04:30", dhuhr: "12:15", ...}
 */
function updatePrayerTimesDisplay(prayerTimes) {
  if (!prayerTimes || typeof prayerTimes !== "object") {
    console.warn("Data waktu sholat tidak tersedia atau tidak valid");
    return;
  }

  try {
    // Mapping dari nama Indonesia ke kode waktu sholat
    const prayerMapping = {
      Subuh: "fajr",
      Dzuhur: "dhuhr",
      Ashar: "asr",
      Maghrib: "maghrib",
      Isya: "isha",
    };

    // Periksa apakah DOM tersedia
    if (!document || !document.querySelectorAll) {
      console.error("DOM tidak tersedia untuk memperbarui tampilan waktu sholat");
      return;
    }

    // Menggunakan data-prayer-name attribute yang lebih kompatibel dengan semua browser
    const prayerItems = document.querySelectorAll(".prayer-item");

    if (prayerItems.length === 0) {
      console.warn("Tidak ada elemen prayer-item yang ditemukan di DOM");
    }

    prayerItems.forEach((item) => {
      try {
        const prayerName = item.getAttribute("data-prayer-name");
        const timeElement = item.querySelector(".prayer-time");

        if (!prayerName || !timeElement) {
          console.warn("Elemen waktu sholat tidak lengkap (tidak ada data-prayer-name atau .prayer-time)");
          return;
        }

        const prayerKey = prayerMapping[prayerName];

        // Validasi prayerKey
        if (!prayerKey) {
          console.warn(`Nama waktu sholat tidak dikenali: ${prayerName}`);
          timeElement.textContent = "--:--";
          return;
        }

        const prayerTime = prayerTimes[prayerKey];

        if (prayerTime && prayerTime !== "Invalid Date" && prayerTime !== "--:--") {
          timeElement.textContent = prayerTime;
        } else {
          // Fallback jika data tidak tersedia atau tidak valid
          timeElement.textContent = "--:--";
          console.warn(`Data waktu sholat untuk ${prayerName} tidak tersedia atau tidak valid`);
        }
      } catch (itemError) {
        console.error("Error saat memproses item waktu sholat:", itemError);
      }
    });

    // Setelah update, periksa waktu sholat saat ini
    setTimeout(() => {
      try {
        checkPrayerTime();
      } catch (checkError) {
        console.error("Error saat memeriksa waktu sholat setelah update:", checkError);
      }
    }, 0);
  } catch (error) {
    console.error("Error saat memperbarui tampilan waktu sholat:", error);
  }
}

/**
 * Fungsi untuk membuat efek gelembung pada latar belakang
 * Membuat container dan 10 gelembung dengan ukuran dan posisi acak
 */
function createBubbles() {
  try {
    // Periksa apakah DOM tersedia
    if (!document || !document.body) {
      console.warn("DOM tidak tersedia untuk membuat efek gelembung");
      return;
    }

    // Periksa apakah container sudah ada untuk mencegah duplikasi
    const existingContainer = document.querySelector(".bubbles-container");
    if (existingContainer) {
      console.log("Container gelembung sudah ada, tidak perlu membuat ulang");
      return;
    }

    const container = document.createElement("div");
    container.className = "bubbles-container";
    document.body.appendChild(container);

    // Membuat 10 gelembung dengan ukuran dan posisi acak
    const bubbleCount = 10;
    for (let i = 0; i < bubbleCount; i++) {
      try {
        const bubble = document.createElement("div");
        bubble.className = "bubble";

        // Ukuran antara 20px dan 70px
        const size = Math.random() * 50 + 20;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;

        // Posisi dan animasi acak
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.animationDuration = `${Math.random() * 3 + 2}s`;
        bubble.style.animationDelay = `${Math.random() * 2}s`;

        container.appendChild(bubble);
      } catch (bubbleError) {
        console.warn("Error saat membuat gelembung individu:", bubbleError);
        // Lanjutkan ke gelembung berikutnya
      }
    }
  } catch (error) {
    console.error("Error saat membuat efek gelembung:", error);
  }
}

/**
 * Fungsi untuk menginisialisasi navigasi aplikasi
 * Mengatur halaman awal dan event listener untuk tombol navigasi
 */
function initNavigation() {
  try {
    // Tampilkan halaman home secara default
    navigateToPage("home");

    // Tambahkan event listener untuk tombol navigasi
    const navItems = document.querySelectorAll(".nav-item[data-page]");
    navItems.forEach((item) => {
      item.addEventListener("click", function () {
        const page = this.getAttribute("data-page");
        if (!page) return;

        navigateToPage(page);
      });
    });
  } catch (error) {
    console.error("Error saat inisialisasi navigasi:", error);
  }
}

/**
 * Fungsi untuk menangani navigasi antar halaman
 * @param {string} page - ID halaman yang akan ditampilkan (tanpa suffix '-page')
 */
function navigateToPage(page) {
  if (!page) {
    console.error("Halaman tidak ditentukan");
    return;
  }

  try {
    // Validasi input
    if (typeof page !== "string") {
      console.error("Parameter halaman harus berupa string");
      return;
    }

    // Tambahkan suffix '-page' ke ID halaman
    const pageId = `${page}-page`;

    // Periksa apakah halaman ada sebelum mencoba menampilkannya
    const pageElement = document.getElementById(pageId);
    if (!pageElement) {
      console.warn(`Halaman dengan ID '${pageId}' tidak ditemukan`);
      // Tampilkan halaman default jika halaman yang diminta tidak ditemukan
      if (CONFIG && CONFIG.defaultPage) {
        console.log(`Menampilkan halaman default: ${CONFIG.defaultPage}`);
        showPage(CONFIG.defaultPage);
      }
      return;
    }

    // Gunakan fungsi showPage yang sudah ada untuk menampilkan halaman
    showPage(pageId);

    // Scroll ke atas halaman dengan penanganan error
    try {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (scrollError) {
      // Fallback untuk browser yang tidak mendukung opsi behavior
      console.warn("Browser tidak mendukung smooth scrolling, menggunakan scrollTo standar", scrollError);
      window.scrollTo(0, 0);
    }
  } catch (error) {
    console.error("Error saat navigasi halaman:", error);
    // Tampilkan halaman default jika terjadi error
    if (CONFIG && CONFIG.defaultPage) {
      try {
        showPage(CONFIG.defaultPage);
      } catch (fallbackError) {
        console.error("Error saat menampilkan halaman default:", fallbackError);
      }
    }
  }
}
