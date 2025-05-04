/**
 * Script untuk Muslim App E-Wallet
 * Aplikasi untuk menampilkan jadwal sholat dan fitur e-wallet
 */

// Variabel konfigurasi aplikasi
const APP_CONFIG = {
  // App settings
  defaultPage: "home-page",
  navItems: {
    home: "nav-home",
    profile: "nav-profile",
  },
  // Prayer settings
  prayerNames: {
    fajr: "Subuh",
    dhuhr: "Dzuhur",
    asr: "Ashar",
    maghrib: "Maghrib",
    isha: "Isya",
  },
  // Default times
  defaultPrayerTimes: {
    fajr: "04:30",
    dhuhr: "12:00",
    asr: "15:00",
    maghrib: "18:00",
    isha: "19:30",
  },
  // Calculation methods
  calculationMethods: {
    MUIS_SINGAPORE: 11,
    JAKIM_MALAYSIA: 3,
    MUHAMMADIYAH: 14,
    MWL: 3,
  },
  // Geolocation options
  geoOptions: {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 300000,
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
    document.getElementById(APP_CONFIG.navItems.home)?.classList.add("active");
  } else if (pageId === "profile-page") {
    document.getElementById(APP_CONFIG.navItems.profile)?.classList.add("active");
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
    const date = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Use correct calculation method based on location
    const method = getCalculationMethod(latitude, longitude);

    const url = `https://api.aladhan.com/v1/timings/${date}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=${method}&adjustment=1&school=1&midnightMode=1&timezonestring=${timezone}`;

    console.log("Fetching prayer times from:", url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Raw prayer time data:", data);

    if (!data.data?.timings) {
      throw new Error("Invalid prayer times data format");
    }

    // Format times consistently
    const prayerTimes = {
      fajr: formatTimeString(data.data.timings.Fajr),
      dhuhr: formatTimeString(data.data.timings.Dhuhr),
      asr: formatTimeString(data.data.timings.Asr),
      maghrib: formatTimeString(data.data.timings.Maghrib),
      isha: formatTimeString(data.data.timings.Isha),
    };

    console.log("Formatted prayer times:", prayerTimes);

    // Validate times before saving
    if (!validatePrayerTimes(prayerTimes)) {
      throw new Error("Invalid prayer times received");
    }

    // Save to localStorage with metadata
    const metadata = {
      date: `${year}-${month}-${date}`,
      latitude,
      longitude,
      timezone,
      method,
      lastUpdate: new Date().toISOString(),
    };

    localStorage.setItem("prayerTimes", JSON.stringify(prayerTimes));
    localStorage.setItem("prayerTimesMetadata", JSON.stringify(metadata));

    return prayerTimes;
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    throw error;
  }
}

/**
 * Fungsi untuk menyesuaikan waktu dengan timezone lokal
 * @param {string} timeStr - String waktu dalam format "HH:MM"
 * @returns {string} - Waktu yang telah disesuaikan dalam format "HH:MM"
 */
function convertToLocalTime(timeStr) {
  try {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date
      .toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      .replace(/^24:/, "00:");
  } catch (error) {
    console.error("Error converting time:", error);
    return timeStr;
  }
}

/**
 * Fungsi untuk validasi waktu sholat yang diterima
 * @param {Object} prayerTimes - Objek berisi waktu sholat
 * @returns {boolean} - True jika waktu sholat valid, false jika tidak
 */
function validatePrayerTimes(prayerTimes) {
  const required = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  return required.every((prayer) => {
    const time = prayerTimes[prayer];
    return time && timeRegex.test(time);
  });
}

/**
 * Fungsi untuk menentukan metode perhitungan waktu sholat berdasarkan koordinat
 * @param {number} latitude - Latitude lokasi
 * @param {number} longitude - Longitude lokasi
 * @returns {number} - Metode perhitungan waktu sholat
 */
function getCalculationMethod(latitude, longitude) {
  // Indonesia
  if (latitude >= -11.0 && latitude <= 6.0 && longitude >= 95.0 && longitude <= 141.0) {
    return APP_CONFIG.calculationMethods.MUHAMMADIYAH;
  }
  // Malaysia
  else if (latitude >= 0.0 && latitude <= 7.0 && longitude >= 100.0 && longitude <= 120.0) {
    return APP_CONFIG.calculationMethods.JAKIM_MALAYSIA;
  }
  // Singapore
  else if (latitude >= 1.0 && latitude <= 2.0 && longitude >= 103.0 && longitude <= 104.0) {
    return APP_CONFIG.calculationMethods.MUIS_SINGAPORE;
  }
  // Default to MWL for other locations
  return APP_CONFIG.calculationMethods.MWL;
}

/**
 * Fungsi untuk menggunakan waktu sholat default jika API gagal
 */
function useDefaultPrayerTimes() {
  const defaultTimes = APP_CONFIG.defaultPrayerTimes;

  updateUIWithPrayerTimes(defaultTimes);
  showLocationStatus("default");
}

/**
 * Fungsi untuk menampilkan status lokasi
 * @param {string} type - Jenis status lokasi ('success', 'cache', 'default')
 * @param {number|null} accuracy - Akurasi lokasi dalam meter (opsional)
 */
function showLocationStatus(type, accuracy = null) {
  const notifElement = document.getElementById("notification-status");
  if (!notifElement) return;

  let message = "";
  let color = "";

  switch (type) {
    case "success":
      message = `<i class='bi bi-geo-alt-fill'></i> Using location based prayer times (accuracy: ${Math.round(accuracy)}m)`;
      color = "#4aaf4f";
      break;
    case "cache":
      message = "<i class='bi bi-clock-history'></i> Using cached prayer times";
      color = "#ff9800";
      break;
    case "default":
      message = "<i class='bi bi-exclamation-triangle'></i> Using default prayer times";
      color = "#ff6b6b";
      break;
  }

  notifElement.innerHTML = message;
  notifElement.style.color = color;
  notifElement.style.display = "block";

  setTimeout(() => {
    notifElement.style.display = "none";
  }, 5000);
}

/**
 * Fungsi untuk inisialisasi waktu sholat
 */
async function initPrayerTimes() {
  try {
    if (!navigator.geolocation) {
      throw new Error("Geolocation not supported");
    }

    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, APP_CONFIG.geoOptions);
    });

    const { latitude, longitude, accuracy } = position.coords;
    console.log(`Location obtained: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);

    // Check GPS accuracy
    if (accuracy > 100000) {
      // If accuracy worse than 100km
      console.warn("Low GPS accuracy, using cached data if available");
      const cached = getCachedPrayerTimes();
      if (cached) {
        updateUIWithPrayerTimes(cached);
        showLocationStatus("cache");
        return;
      }
      useDefaultPrayerTimes();
      return;
    }

    const prayerTimes = await getPrayerTimesByCoordinates(latitude, longitude);
    updateUIWithPrayerTimes(prayerTimes);
    showLocationStatus("success", accuracy);
  } catch (error) {
    console.error("Error initializing prayer times:", error);
    const cached = getCachedPrayerTimes();
    if (cached) {
      updateUIWithPrayerTimes(cached);
      showLocationStatus("cache");
    } else {
      useDefaultPrayerTimes();
    }
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
  if (!currentPrayerTimes) {
    console.warn("No prayer times available");
    return;
  }

  const now = new Date();
  const currentTime = now
    .toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(/^24:/, "00:");

  console.log("Checking prayer time at:", currentTime);
  console.log("Available prayer times:", currentPrayerTimes);

  const prayerList = Object.entries(currentPrayerTimes);
  let currentPrayer = null;
  let nextPrayer = null;

  // Convert current time to minutes for comparison
  const currentMinutes = convertTimeToMinutes(currentTime);

  // Sort prayer times and find current/next prayers
  const sortedPrayers = prayerList.filter(([_, time]) => time && time !== "--:--").sort((a, b) => convertTimeToMinutes(a[1]) - convertTimeToMinutes(b[1]));

  for (let i = 0; i < sortedPrayers.length; i++) {
    const prayerMinutes = convertTimeToMinutes(sortedPrayers[i][1]);

    if (currentMinutes < prayerMinutes) {
      currentPrayer = i > 0 ? sortedPrayers[i - 1][0] : sortedPrayers[sortedPrayers.length - 1][0];
      nextPrayer = sortedPrayers[i][0];
      break;
    }
  }

  // If we're after the last prayer of the day
  if (!nextPrayer) {
    currentPrayer = sortedPrayers[sortedPrayers.length - 1][0];
    nextPrayer = sortedPrayers[0][0];
  }

  console.log("Current prayer:", currentPrayer);
  console.log("Next prayer:", nextPrayer);

  // Update UI
  updatePrayerHighlight(currentPrayer, nextPrayer);
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
    const prayerMapping = APP_CONFIG.prayerNames;

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

// Add missing updatePrayerHighlight function
function updatePrayerHighlight(currentPrayer, nextPrayer) {
  try {
    // Remove existing highlights
    document.querySelectorAll(".prayer-item").forEach((item) => {
      item.classList.remove("current", "next");
    });

    // Add highlight for current prayer
    if (currentPrayer) {
      const currentElement = document.querySelector(`[data-prayer-name="${currentPrayer}"]`);
      if (currentElement) currentElement.classList.add("current");
    }

    // Add highlight for next prayer
    if (nextPrayer) {
      const nextElement = document.querySelector(`[data-prayer-name="${nextPrayer}"]`);
      if (nextElement) nextElement.classList.add("next");
    }
  } catch (error) {
    console.error("Error updating prayer highlights:", error);
  }
}

// Fix prayer name mapping
const PRAYER_NAMES = APP_CONFIG.prayerNames;

function getPrayerName(key) {
  return PRAYER_NAMES[key.toLowerCase()] || key;
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
  const defaultTimes = APP_CONFIG.defaultPrayerTimes;

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
    const prayerMapping = APP_CONFIG.prayerNames;

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

        const prayerKey = Object.keys(prayerMapping).find((key) => prayerMapping[key] === prayerName);

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
      if (APP_CONFIG && APP_CONFIG.defaultPage) {
        console.log(`Menampilkan halaman default: ${APP_CONFIG.defaultPage}`);
        showPage(APP_CONFIG.defaultPage);
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
    if (APP_CONFIG && APP_CONFIG.defaultPage) {
      try {
        showPage(APP_CONFIG.defaultPage);
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
      CurrencyService.initSaldoObserver();
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

// Cleanup Utility
const cleanup = {
  intervals: new Set(),
  observers: new Set(),

  addInterval(interval) {
    this.intervals.add(interval);
  },

  addObserver(observer) {
    this.observers.add(observer);
  },

  clear() {
    this.intervals.forEach(clearInterval);
    this.intervals.clear();

    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  },
};

// Main initialization
function initializeApp() {
  try {
    // Clear any existing intervals/observers
    cleanup.clear();

    // Initialize core features
    initAdhanAudio();
    initNavigation();
    createBubbles();
    updateCurrentDate();

    // Initialize prayer times
    initPrayerTimes().catch((error) => {
      console.error("Prayer times initialization failed:", error);
      useDefaultPrayerTimes();
    });

    // Initialize other features
    requestNotificationPermission();
    CurrencyService.initSaldoObserver();

    // Set up prayer time checking interval
    const interval = setInterval(checkPrayerTime, 60000);
    cleanup.addInterval(interval);
  } catch (error) {
    console.error("App initialization failed:", error);
    handleInitializationError();
  }
}

// Start the app
document.addEventListener("DOMContentLoaded", initializeApp);

/**
 * Fungsi untuk memformat waktu string secara konsisten
 * @param {string} timeStr - String waktu dalam format "HH:MM"
 * @returns {string} - Waktu yang diformat dalam format "HH:MM"
 */
function formatTimeString(timeStr) {
  try {
    const [hours, minutes] = timeStr.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      throw new Error("Invalid time format");
    }
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  } catch (error) {
    console.error("Error formatting time:", error);
    return "--:--";
  }
}

/**
 * Fungsi untuk memperbarui UI dengan waktu sholat
 * @param {Object} prayerTimes - Objek berisi waktu sholat
 */
function updateUIWithPrayerTimes(prayerTimes) {
  try {
    currentPrayerTimes = prayerTimes;

    // Update each prayer time element
    Object.entries(APP_CONFIG.prayerNames).forEach(([key, name]) => {
      const timeElement = document.querySelector(`[data-prayer-name="${name}"] .prayer-time`);
      if (timeElement) {
        timeElement.textContent = prayerTimes[key] || "--:--";
      }
    });

    // Check current prayer time immediately
    checkPrayerTime();

    // Setup interval for checking prayer times
    if (window._prayerCheckInterval) {
      clearInterval(window._prayerCheckInterval);
    }
    window._prayerCheckInterval = setInterval(checkPrayerTime, 60000);
  } catch (error) {
    console.error("Error updating UI:", error);
  }
}

/**
 * Retrieves cached prayer times from localStorage
 * @returns {Object|null} Cached prayer times or null if not available
 */
function getCachedPrayerTimes() {
  try {
    const cached = localStorage.getItem("prayerTimes");
    const metadata = localStorage.getItem("prayerTimesMetadata");

    if (!cached || !metadata) {
      return null;
    }

    const parsedMetadata = JSON.parse(metadata);
    const today = new Date().toISOString().split("T")[0];

    // Check if cache is from today
    if (parsedMetadata.date !== today) {
      return null;
    }

    return JSON.parse(cached);
  } catch (error) {
    console.error("Error reading cached prayer times:", error);
    return null;
  }
}

// Currency Service
class CurrencyService {
  static convertToRM(amount) {
    try {
      if (!amount?.includes("Rp")) return amount;

      const numericValue = amount.replace("Rp", "").replace(/\./g, "").replace(/\s/g, "").trim();

      const value = parseInt(numericValue, 10);
      if (isNaN(value)) return amount;

      return new Intl.NumberFormat("ms-MY", {
        style: "currency",
        currency: "MYR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
        .format(value / 1000)
        .replace("MYR", "RM");
    } catch (error) {
      console.error("Error converting currency:", error);
      return amount;
    }
  }

  static initSaldoObserver() {
    const saldoElement = document.getElementById("saldo");
    if (!saldoElement) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          const newValue = saldoElement.textContent;
          if (newValue?.includes("Rp")) {
            saldoElement.textContent = this.convertToRM(newValue);
          }
        }
      });
    });

    observer.observe(saldoElement, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    // Initial conversion
    if (saldoElement.textContent.includes("Rp")) {
      saldoElement.textContent = this.convertToRM(saldoElement.textContent);
    }
  }
}
