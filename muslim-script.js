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

/**
 * Fungsi untuk menambahkan style CSS untuk animasi loading dots
 */
function addLoadingDotsStyle() {
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    .loading-dots:after {
      content: '.';
      animation: dots 1.5s steps(5, end) infinite;
    }
    
    @keyframes dots {
      0%, 20% { content: '.'; }
      40% { content: '..'; }
      60% { content: '...'; }
      80%, 100% { content: ''; }
    }
  `;
  document.head.appendChild(styleElement);
}
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

/**
 * Fungsi untuk inisialisasi audio adzan
 */
function initAdhanAudio() {
  try {
    adhanAudio = new Audio();
    adhanAudio.src = "https://raw.githubusercontent.com/islamic-network/cdn/master/islamic/audio/adhan/mishary-rashid-alafasy-128kbps/1.mp3";
    adhanAudio.preload = "none"; // Ubah ke 'none' untuk menghemat bandwidth

    // Tangani kegagalan loading
    adhanAudio.onerror = function (e) {
      console.error("Error loading adhan audio:", e);
      adhanAudio = null;
    };

    // Tambahkan event listener untuk memastikan audio siap
    adhanAudio.addEventListener("canplaythrough", () => {
      console.log("Adhan audio ready");
    });
  } catch (error) {
    console.error("Failed to initialize adhan audio:", error);
    adhanAudio = null;
  }
}

/**
 * Fungsi untuk mendapatkan jadwal sholat berdasarkan koordinat
 * @param {number} latitude - Latitude lokasi
 * @param {number} longitude - Longitude lokasi
 * @returns {Object} - Objek berisi waktu sholat
 */
async function getPrayerTimesByCoordinates(latitude, longitude) {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();

    // Menggunakan API Aladhan untuk mendapatkan jadwal sholat
    const response = await fetch(`https://api.aladhan.com/v1/timings/${date}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=2`);

    if (!response.ok) {
      throw new Error("Failed to fetch prayer times");
    }

    const data = await response.json();

    if (!data.data?.timings) {
      throw new Error("Invalid prayer times data format");
    }

    // Format waktu sholat sesuai kebutuhan aplikasi
    const prayerTimes = {
      fajr: data.data.timings.Fajr,
      dhuhr: data.data.timings.Dhuhr,
      asr: data.data.timings.Asr,
      maghrib: data.data.timings.Maghrib,
      isha: data.data.timings.Isha,
    };

    // Simpan di localStorage untuk cache
    try {
      localStorage.setItem("prayerTimes", JSON.stringify(prayerTimes));
      localStorage.setItem("prayerTimesDate", today.toISOString().split("T")[0]);
      localStorage.setItem("prayerTimesSource", "gps");
    } catch (storageError) {
      console.warn("Failed to cache prayer times:", storageError);
    }

    return prayerTimes;
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    throw error;
  }
}

/**
 * Fungsi untuk inisialisasi waktu sholat
 */
async function initPrayerTimes() {
  try {
    // Menggunakan koordinat default untuk Indonesia (Jakarta)
    let latitude = -6.2088;
    let longitude = 106.8456;
    let locationSource = "default";
    let locationAccuracy = 0;

    // Tampilkan pesan untuk meminta izin lokasi
    const notifElement = document.getElementById("notification-status");
    if (notifElement) {
      notifElement.textContent = "Meminta akses lokasi untuk jadwal sholat yang akurat...";
      notifElement.style.display = "block";
      notifElement.style.color = "#3A6E3A";
    }

    // Coba dapatkan lokasi pengguna dengan akurasi tinggi khusus untuk mobile
    if (navigator.geolocation) {
      try {
        // Deteksi apakah pengguna menggunakan perangkat mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Gunakan pengaturan yang lebih agresif untuk mobile
        const geoOptions = {
          enableHighAccuracy: true, // Aktifkan akurasi tinggi untuk GPS
          timeout: isMobile ? 30000 : 15000, // Waktu tunggu lebih lama untuk mobile (30 detik)
          maximumAge: isMobile ? 60000 : 30000, // Cache lokasi lebih lama untuk mobile (1 menit)
        };

        console.log(`Mencoba mendapatkan lokasi dengan pengaturan: ${JSON.stringify(geoOptions)}`);

        // Tambahkan indikator loading untuk mobile
        if (isMobile && notifElement) {
          notifElement.innerHTML = "<i class='bi bi-geo-alt'></i> Mendapatkan lokasi GPS... <span class='loading-dots'></span>";
        }

        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, geoOptions);
        });

        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        locationSource = "gps";
        locationAccuracy = position.coords.accuracy;

        // Perbarui UI untuk menunjukkan lokasi berhasil didapatkan
        if (notifElement) {
          // Tampilkan akurasi lokasi untuk informasi pengguna
          const accuracyText = locationAccuracy < 100 ? `(akurasi: ${Math.round(locationAccuracy)} meter)` : "";

          notifElement.innerHTML = `<i class='bi bi-geo-alt-fill'></i> Menggunakan lokasi GPS Anda ${accuracyText}`;
          notifElement.style.color = "#3A6E3A";
          // Sembunyikan notifikasi setelah 5 detik
          setTimeout(() => {
            notifElement.style.display = "none";
          }, 5000);
        }

        console.log("Menggunakan lokasi GPS pengguna:", latitude, longitude, "akurasi:", locationAccuracy, "meter");

        // Simpan lokasi di localStorage untuk penggunaan berikutnya
        try {
          localStorage.setItem("prayerTimesLat", latitude);
          localStorage.setItem("prayerTimesLng", longitude);
          localStorage.setItem("prayerTimesAccuracy", locationAccuracy);
          localStorage.setItem("prayerTimesTimestamp", Date.now());
        } catch (storageError) {
          console.warn("Tidak dapat menyimpan lokasi di localStorage:", storageError);
        }

        // Dapatkan jadwal sholat berdasarkan koordinat
        const prayerTimes = await getPrayerTimesByCoordinates(latitude, longitude);

        // Update state dan UI
        currentPrayerTimes = prayerTimes;
        safeUpdatePrayerTimes(prayerTimes);

        if (notifElement) {
          notifElement.innerHTML = `<i class='bi bi-geo-alt-fill'></i> Jadwal sholat sesuai lokasi Anda`;
          notifElement.style.color = "#3A6E3A";
          setTimeout(() => {
            notifElement.style.display = "none";
          }, 5000);
        }
      } catch (error) {
        console.error("Error getting prayer times:", error);
        useDefaultPrayerTimes();
      }
    } else {
      useDefaultPrayerTimes();
    }
  } catch (error) {
    console.error("Error in prayer times initialization:", error);
    useDefaultPrayerTimes();
  }
}

/**
 * Fungsi untuk menggunakan waktu sholat default jika API gagal
 */
function useDefaultPrayerTimes() {
  try {
    // Gunakan waktu default yang lebih sesuai dengan zona waktu pengguna
    const now = new Date();
    const isRamadhan = false; // Ini bisa diubah berdasarkan perhitungan kalender Hijriah

    // Deteksi zona waktu pengguna berdasarkan offset
    const tzOffset = now.getTimezoneOffset() / -60; // Konversi ke jam (negatif karena getTimezoneOffset() memberikan nilai berlawanan)

    // Sesuaikan waktu default berdasarkan zona waktu Indonesia
    // WIB = UTC+7 (tzOffset = 7), WITA = UTC+8 (tzOffset = 8), WIT = UTC+9 (tzOffset = 9)
    let defaultTimes = {};

    if (tzOffset >= 8.5) {
      // WIT (UTC+9)
      defaultTimes = {
        fajr: "05:00",
        dhuhr: "12:30",
        asr: "15:45",
        maghrib: "18:30",
        isha: "19:45",
      };
      console.log("Menggunakan waktu default untuk WIT");
    } else if (tzOffset >= 7.5) {
      // WITA (UTC+8)
      defaultTimes = {
        fajr: "04:45",
        dhuhr: "12:15",
        asr: "15:30",
        maghrib: "18:20",
        isha: "19:35",
      };
      console.log("Menggunakan waktu default untuk WITA");
    } else {
      // WIB (UTC+7) atau lainnya
      defaultTimes = {
        fajr: "04:30",
        dhuhr: "12:00",
        asr: "15:15",
        maghrib: "18:10",
        isha: "19:25",
      };
      console.log("Menggunakan waktu default untuk WIB");
    }

    // Sesuaikan waktu untuk Ramadhan jika diperlukan
    if (isRamadhan) {
      // Waktu imsak biasanya 10 menit sebelum Subuh
      defaultTimes.fajr = adjustTimeByMinutes(defaultTimes.fajr, -10);
      console.log("Menyesuaikan waktu untuk Ramadhan");
    }

    currentPrayerTimes = defaultTimes;
    console.log("Menggunakan waktu sholat default:", currentPrayerTimes);

    // Perbarui notifikasi status
    const notifElement = document.getElementById("notification-status");
    if (notifElement) {
      notifElement.innerHTML = "<i class='bi bi-info-circle'></i> Menggunakan jadwal sholat perkiraan. Aktifkan GPS untuk jadwal yang akurat.";
      notifElement.style.display = "block";
      notifElement.style.color = "#ff9800"; // Warna oranye untuk peringatan
      // Sembunyikan notifikasi setelah 8 detik
      setTimeout(() => {
        notifElement.style.display = "none";
      }, 8000);
    }

    safeUpdatePrayerTimes(currentPrayerTimes);

    // Pastikan interval tidak dibuat duplikat
    if (window._prayerCheckInterval) {
      clearInterval(window._prayerCheckInterval);
    }

    // Periksa waktu sholat saat ini
    checkPrayerTime();

    // Simpan referensi interval untuk mencegah duplikasi
    window._prayerCheckInterval = setInterval(checkPrayerTime, 60000);

    // Simpan waktu default di localStorage sebagai fallback terakhir
    try {
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];
      localStorage.setItem("prayerTimes", JSON.stringify(currentPrayerTimes));
      localStorage.setItem("prayerTimesDate", dateStr);
      localStorage.setItem("prayerTimesSource", "default");
    } catch (storageError) {
      console.warn("Tidak dapat menyimpan waktu sholat default di localStorage:", storageError);
    }
  } catch (error) {
    console.error("Error saat menggunakan waktu sholat default:", error);
  }
}

/**
 * Fungsi untuk menyesuaikan waktu dengan menambah atau mengurangi menit
 * @param {string} timeStr - String waktu dalam format "HH:MM"
 * @param {number} minutesToAdd - Jumlah menit yang akan ditambahkan (negatif untuk mengurangi)
 * @returns {string} - Waktu yang telah disesuaikan dalam format "HH:MM"
 */
function adjustTimeByMinutes(timeStr, minutesToAdd) {
  try {
    if (!timeStr || typeof timeStr !== "string" || !/^\d{1,2}:\d{2}$/.test(timeStr)) {
      return timeStr;
    }

    const [hours, minutes] = timeStr.split(":").map(Number);

    // Konversi ke total menit, tambahkan penyesuaian, lalu konversi kembali ke jam:menit
    let totalMinutes = hours * 60 + minutes + minutesToAdd;

    // Tangani overflow/underflow
    while (totalMinutes < 0) totalMinutes += 24 * 60;
    totalMinutes = totalMinutes % (24 * 60);

    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;

    return `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;
  } catch (error) {
    console.error("Error saat menyesuaikan waktu:", error);
    return timeStr;
  }
}

/**
 * Fungsi untuk memeriksa waktu sholat saat ini dan menandainya
 * Juga memainkan adzan jika waktu sholat tepat sama dengan waktu saat ini
 */
function checkPrayerTime() {
  if (!currentPrayerTimes || typeof currentPrayerTimes !== "object") {
    console.warn("Prayer times not available");
    return;
  }

  try {
    const now = new Date();
    const currentTime = now
      .toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(/^24:/, "00:"); // Handle midnight

    // Validasi format waktu
    if (!/^\d{2}:\d{2}$/.test(currentTime)) {
      throw new Error("Invalid time format");
    }

    let currentPrayer = null;
    let nextPrayer = null;

    // Sort prayer times untuk memudahkan pengecekan
    const sortedPrayers = Object.entries(currentPrayerTimes)
      .filter(([_, time]) => time && time !== "--:--")
      .sort((a, b) => convertTimeToMinutes(a[1]) - convertTimeToMinutes(b[1]));

    // Cari waktu sholat saat ini dan berikutnya
    for (let i = 0; i < sortedPrayers.length; i++) {
      const [prayer, time] = sortedPrayers[i];

      if (time === currentTime) {
        currentPrayer = prayer;
        nextPrayer = sortedPrayers[(i + 1) % sortedPrayers.length][0];
        playAdhan(getPrayerName(prayer));
        break;
      }

      if (convertTimeToMinutes(time) > convertTimeToMinutes(currentTime)) {
        nextPrayer = prayer;
        currentPrayer = sortedPrayers[i - 1 > -1 ? i - 1 : sortedPrayers.length - 1][0];
        break;
      }
    }

    updatePrayerHighlight(currentPrayer, nextPrayer);
  } catch (error) {
    console.error("Error checking prayer time:", error);
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
  if (!timestamp || isNaN(Number(timestamp))) {
    return "--:--";
  }

  try {
    const date = new Date(Number(timestamp) * (String(timestamp).length <= 10 ? 1000 : 1));

    if (isNaN(date.getTime())) {
      return "--:--";
    }

    // Format waktu dengan fallback
    try {
      return date
        .toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(/^24:/, "00:");
    } catch {
      // Manual formatting fallback
      return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    }
  } catch (error) {
    console.error("Error formatting time:", error);
    return "--:--";
  }
}

// Bagian dari fungsi initPrayerTimes
try {
  // Inisialisasi kode lainnya
  initAdhanAudio();
  initNavigation();
  createBubbles();
  updateCurrentDate();
  requestNotificationPermission();
} catch (error) {
  // Handle any errors that occur during API calls or data processing
  console.error("Error during prayer times initialization:", error);

  // Try to use default prayer times as fallback
  const defaultTimes = {
    fajr: "04:30",
    dhuhr: "12:00",
    asr: "15:00",
    maghrib: "18:00",
    isha: "19:30",
  };

  currentPrayerTimes = defaultTimes;
  safeUpdatePrayerTimes(defaultTimes);

  // Update notification to show error
  const notifElement = document.getElementById("notification-status");
  if (notifElement) {
    notifElement.innerHTML = "<i class='bi bi-exclamation-triangle'></i> Gagal mendapatkan jadwal sholat. Menggunakan waktu default.";
    notifElement.style.color = "#ff6b6b";
  }

  // Fallback to default prayer times if all APIs and cached data fail
  console.warn("Menggunakan waktu sholat default karena semua sumber data gagal");

  // Gunakan defaultTimes yang sudah didefinisikan di blok catch sebelumnya
  if (!currentPrayerTimes) {
    currentPrayerTimes = defaultTimes;
    safeUpdatePrayerTimes(defaultTimes);
  }

  // Update notification status
  if (notifElement) {
    notifElement.innerHTML = "<i class='bi bi-exclamation-triangle'></i> Menggunakan jadwal default. Periksa koneksi internet Anda.";
    notifElement.style.color = "#ff6b6b";
    // Hide notification after 10 seconds
    setTimeout(() => {
      notifElement.style.display = "none";
    }, 10000);
  }

  // Start prayer time check interval even with default times
  if (window._prayerCheckInterval) {
    clearInterval(window._prayerCheckInterval);
  }
  window._prayerCheckInterval = setInterval(checkPrayerTime, 60000);
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

/**
 * Fungsi untuk menangani error dengan fallback
 * @param {Function} fn - Fungsi yang akan dijalankan
 * @param {Function|any} fallback - Fallback jika terjadi error
 * @returns {Function} - Fungsi yang aman dijalankan
 */
function errorBoundary(fn, fallback) {
  return (...args) => {
    try {
      return fn(...args);
    } catch (error) {
      console.error(`Error in ${fn.name}:`, error);
      return typeof fallback === "function" ? fallback(...args) : fallback;
    }
  };
}

// Gunakan error boundary untuk fungsi-fungsi kritis
const safeUpdatePrayerTimes = errorBoundary(updatePrayerTimesDisplay, () => {
  // Fallback ke tampilan default
  document.querySelectorAll(".prayer-time").forEach((el) => (el.textContent = "--:--"));
});

/**
 * Fungsi untuk menginisialisasi event listener
 * Menambahkan handler untuk DOMContentLoaded dan interval
 * @returns {Function} - Fungsi untuk membersihkan event listener
 */
function initEventListeners() {
  const cleanupFunctions = [];

  try {
    // DOMContentLoaded handler
    const domLoadedHandler = () => {
      initAdhanAudio();
      initNavigation();
      createBubbles();
      updateCurrentDate();
      initPrayerTimes();
      requestNotificationPermission();
    };

    document.addEventListener("DOMContentLoaded", domLoadedHandler);
    cleanupFunctions.push(() => document.removeEventListener("DOMContentLoaded", domLoadedHandler));

    // Tambahkan cleanup untuk interval
    if (window._prayerCheckInterval) {
      clearInterval(window._prayerCheckInterval);
    }
    window._prayerCheckInterval = setInterval(checkPrayerTime, 60000);
    cleanupFunctions.push(() => clearInterval(window._prayerCheckInterval));

    // Return cleanup function
    return () => cleanupFunctions.forEach((cleanup) => cleanup());
  } catch (error) {
    console.error("Error initializing event listeners:", error);
    cleanupFunctions.forEach((cleanup) => cleanup());
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  try {
    initAdhanAudio();
    initNavigation();
    createBubbles();
    updateCurrentDate();
    initPrayerTimes();
    requestNotificationPermission();
  } catch (error) {
    console.error("Error during initialization:", error);

    // Use default prayer times as fallback
    const defaultTimes = {
      fajr: "04:30",
      dhuhr: "12:00",
      asr: "15:00",
      maghrib: "18:00",
      isha: "19:30",
    };

    currentPrayerTimes = defaultTimes;
    safeUpdatePrayerTimes(defaultTimes);

    // Update notification
    const notifElement = document.getElementById("notification-status");
    if (notifElement) {
      notifElement.innerHTML = "<i class='bi bi-exclamation-triangle'></i> Failed to initialize. Using default times.";
      notifElement.style.color = "#ff6b6b";
    }
  }
});
