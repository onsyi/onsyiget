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
    dhuhr: "Zohor",
    asr: "Asar",
    maghrib: "Maghrib",
    isha: "Isyak",
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
  // Add Malaysian cities
  cities: {
    DEFAULT: "Kuala Lumpur",
    LIST: [
      "Kuala Lumpur",
      "Johor Bahru",
      "Penang",
      "Kota Kinabalu",
      "Kuching",
      "Ipoh",
      "Melaka",
      "Shah Alam",
      "Kota Bharu",
      "Kuala Terengganu",
      "Seremban",
      "Alor Setar",
      "Putrajaya",
      "Miri",
      "Sandakan",
      "Petaling Jaya",
      "Subang Jaya",
      "Klang",
      "Kajang",
      "Batu Pahat",
      "Tawau",
      "Sibu",
      "Kulim",
      "Bintulu",
      "Kangar",
      "Labuan",
      "Kluang",
      "Taiping",
      "Butterworth",
      "Kuantan",
    ],
  },
  // Update calculation method
  prayerMethod: 3, // JAKIM Malaysia method
};

/**
 * Fungsi untuk menampilkan halaman yang dipilih
 * @param {string} pageId - ID halaman yang akan ditampilkan
 */
function showPage(pageId) {
  try {
    console.log("Showing page:", pageId);

    // Hide all pages
    document.querySelectorAll(".page-content").forEach((page) => {
      page.style.display = "none";
    });

    // Show selected page
    const selectedPage = document.getElementById(pageId);
    if (!selectedPage) {
      throw new Error(`Page not found: ${pageId}`);
    }
    selectedPage.style.display = "block";

    // Update navigation highlighting
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
    });

    const navItem = document.getElementById(`nav-${pageId.replace("-page", "")}`);
    if (navItem) {
      navItem.classList.add("active");
    }
  } catch (error) {
    console.error("Error showing page:", error);
  }
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
 * Enhanced Prayer Time Service
 */
class PrayerTimeService {
  // Koordinat kota-kota di Malaysia
  static cityCoordinates = {
    "Kuala Lumpur": { latitude: 3.139, longitude: 101.6869 },
    "Johor Bahru": { latitude: 1.4927, longitude: 103.7414 },
    Penang: { latitude: 5.4141, longitude: 100.3288 },
    "Kota Kinabalu": { latitude: 5.9804, longitude: 116.0735 },
    Kuching: { latitude: 1.5497, longitude: 110.3409 },
    // Tambahan kota-kota di Malaysia
    Ipoh: { latitude: 4.5975, longitude: 101.0901 },
    Melaka: { latitude: 2.1896, longitude: 102.2501 },
    "Shah Alam": { latitude: 3.0738, longitude: 101.5183 },
    "Kota Bharu": { latitude: 6.1331, longitude: 102.2386 },
    "Kuala Terengganu": { latitude: 5.3302, longitude: 103.1408 },
    Seremban: { latitude: 2.7297, longitude: 101.9381 },
    "Alor Setar": { latitude: 6.1264, longitude: 100.3685 },
    Putrajaya: { latitude: 2.9264, longitude: 101.6964 },
    Miri: { latitude: 4.3995, longitude: 113.9914 },
    Sandakan: { latitude: 5.8402, longitude: 118.1179 },
    // Kota-kota tambahan di Malaysia
    "Petaling Jaya": { latitude: 3.1073, longitude: 101.6067 },
    "Subang Jaya": { latitude: 3.0564, longitude: 101.5856 },
    Klang: { latitude: 3.0449, longitude: 101.4455 },
    Kajang: { latitude: 2.9927, longitude: 101.7909 },
    "Batu Pahat": { latitude: 1.8548, longitude: 102.9326 },
    Tawau: { latitude: 4.2498, longitude: 117.8871 },
    Sibu: { latitude: 2.3, longitude: 111.8167 },
    Kulim: { latitude: 5.3649, longitude: 100.5616 },
    Bintulu: { latitude: 3.1667, longitude: 113.0333 },
    Kangar: { latitude: 6.4414, longitude: 100.1986 },
    Labuan: { latitude: 5.2831, longitude: 115.2308 },
    Kluang: { latitude: 2.0251, longitude: 103.3328 },
    Taiping: { latitude: 4.8517, longitude: 100.7454 },
    Butterworth: { latitude: 5.3991, longitude: 100.3638 },
    Kuantan: { latitude: 3.8077, longitude: 103.326 },
  };

  static async getPrayerTimes(cityName = null) {
    try {
      // Default koordinat untuk Kuala Lumpur jika geolokasi gagal
      let latitude = 3.139;
      let longitude = 101.6869;
      let usingDefaultLocation = false;
      let position = null;
      let selectedCity = cityName || localStorage.getItem("selectedCity") || APP_CONFIG.cities.DEFAULT;

      // Dapatkan tanggal hari ini untuk memastikan waktu sholat akurat
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0]; // Format YYYY-MM-DD

      // Jika kota dipilih, gunakan koordinat kota tersebut
      if (selectedCity && this.cityCoordinates[selectedCity]) {
        latitude = this.cityCoordinates[selectedCity].latitude;
        longitude = this.cityCoordinates[selectedCity].longitude;
        console.log(`Using coordinates for ${selectedCity}:`, { latitude, longitude });

        // Simpan pilihan kota di localStorage
        localStorage.setItem("selectedCity", selectedCity);

        // Update dropdown jika ada
        const citySelector = document.getElementById("city-selector");
        if (citySelector && citySelector.value !== selectedCity) {
          citySelector.value = selectedCity;
        }
      } else {
        // Jika tidak ada kota yang dipilih, coba gunakan geolokasi
        try {
          position = await this.getCurrentPosition();
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          console.log("Getting prayer times for:", { latitude, longitude });

          // Coba temukan kota terdekat berdasarkan koordinat pengguna
          const nearestCity = this.findNearestCity(latitude, longitude);
          if (nearestCity) {
            console.log(`Nearest city detected: ${nearestCity}`);
            // Simpan kota terdekat di localStorage
            localStorage.setItem("nearestCity", nearestCity);
          }
        } catch (geoError) {
          console.warn("Geolocation failed, using default location (Kuala Lumpur):", geoError);
          usingDefaultLocation = true;
        }
      }

      // Tambahkan timezone untuk Malaysia
      const url = `https://api.aladhan.com/v1/timings/${formattedDate}?latitude=${latitude}&longitude=${longitude}&method=${APP_CONFIG.prayerMethod}&timezone=Asia/Kuala_Lumpur`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Prayer API response:", data);

      if (!data || !data.data || !data.data.timings) {
        throw new Error("Invalid API response structure");
      }

      // Tampilkan status lokasi
      if (selectedCity && this.cityCoordinates[selectedCity]) {
        showLocationStatus("city", selectedCity);
      } else if (!usingDefaultLocation && position) {
        showLocationStatus("success", position.coords.accuracy);
      } else {
        showLocationStatus("default");
      }

      return this.formatPrayerTimes(data.data.timings);
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      showLocationStatus("default");
      return APP_CONFIG.defaultPrayerTimes;
    }
  }

  static getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      });
    });
  }

  // Fungsi untuk menemukan kota terdekat berdasarkan koordinat pengguna
  static findNearestCity(latitude, longitude) {
    if (!latitude || !longitude) return null;

    let nearestCity = null;
    let shortestDistance = Infinity;

    // Hitung jarak ke setiap kota
    Object.entries(this.cityCoordinates).forEach(([city, coords]) => {
      const distance = this.calculateDistance(latitude, longitude, coords.latitude, coords.longitude);

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestCity = city;
      }
    });

    // Jika jarak terlalu jauh (>50km), mungkin pengguna tidak berada di dekat kota di Malaysia
    // Dalam hal ini, kita akan menggunakan kota default
    if (shortestDistance > 50) {
      console.log(`Nearest city is ${nearestCity} but distance is ${shortestDistance.toFixed(2)}km, using default city`);
      return APP_CONFIG.cities.DEFAULT;
    }

    console.log(`Nearest city detected: ${nearestCity} (${shortestDistance.toFixed(2)}km away)`);
    return nearestCity;
  }

  // Fungsi untuk menghitung jarak antara dua koordinat (Haversine formula)
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius bumi dalam kilometer
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Jarak dalam kilometer
    return distance;
  }

  static deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  static formatPrayerTimes(timings) {
    return {
      fajr: this.formatTimeString(timings.Fajr),
      dhuhr: this.formatTimeString(timings.Dhuhr),
      asr: this.formatTimeString(timings.Asr),
      maghrib: this.formatTimeString(timings.Maghrib),
      isha: this.formatTimeString(timings.Isha),
      imsak: this.formatTimeString(timings.Imsak),
    };
  }

  static formatTimeString(timeStr) {
    try {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return "--:--";
    }
  }

  static getCurrentTime() {
    const now = new Date();
    return {
      hours: now.getHours().toString().padStart(2, "0"),
      minutes: now.getMinutes().toString().padStart(2, "0"),
      seconds: now.getSeconds().toString().padStart(2, "0"),
    };
  }

  static highlightNextPrayer(prayerTimes) {
    if (!prayerTimes) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    let nextPrayer = null;
    let nextPrayerTime = Infinity;

    Object.entries(prayerTimes).forEach(([prayer, time]) => {
      const [hours, minutes] = time.split(":").map(Number);
      const prayerMinutes = hours * 60 + minutes;

      if (prayerMinutes > currentMinutes && prayerMinutes < nextPrayerTime) {
        nextPrayer = prayer;
        nextPrayerTime = prayerMinutes;
      }
    });

    return nextPrayer;
  }

  static validatePrayerTimes(prayerTimes) {
    if (!prayerTimes) return false;
    const required = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
    return required.every((prayer) => {
      const time = prayerTimes[prayer];
      return time && /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
    });
  }
}

/**
 * Update prayer time display and highlighting
 */
function updatePrayerTimesDisplay(prayerTimes) {
  if (!prayerTimes) return;

  try {
    // Update times
    Object.entries(APP_CONFIG.prayerNames).forEach(([key, name]) => {
      const timeElement = document.querySelector(`[data-prayer-name="${name}"] .prayer-time`);
      if (timeElement) {
        timeElement.textContent = prayerTimes[key] || "--:--";
      }
    });

    // Update current time
    const currentTime = PrayerTimeService.getCurrentTime();
    const timeElement = document.getElementById("current-time");
    if (timeElement) {
      timeElement.textContent = `${currentTime.hours}:${currentTime.minutes}:${currentTime.seconds}`;
    }

    // Tampilkan informasi lokasi
    const selectedCity = localStorage.getItem("selectedCity") || localStorage.getItem("nearestCity") || APP_CONFIG.cities.DEFAULT;
    const locationElement = document.getElementById("location-info");
    if (locationElement) {
      locationElement.textContent = selectedCity;
    }

    // Perbarui tanggal jika belum diperbarui
    const dateElement = document.getElementById("current-date");
    if (dateElement && dateElement.textContent === "Loading...") {
      updateCurrentDate();
    }

    // Highlight next prayer
    const nextPrayer = PrayerTimeService.highlightNextPrayer(prayerTimes);
    updatePrayerHighlight(nextPrayer);
  } catch (error) {
    console.error("Error updating prayer display:", error);
  }
}

/**
 * Check current prayer time and update UI accordingly
 */
function checkPrayerTime() {
  if (!currentPrayerTimes) {
    console.warn("No prayer times available");
    return;
  }

  try {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    let currentPrayer = null;
    let nextPrayer = null;

    // Convert prayer times to minutes and find current/next prayer
    const prayerList = Object.entries(currentPrayerTimes).filter(([key]) => key !== "imsak");
    const sortedPrayers = prayerList.sort((a, b) => {
      const timeA = a[1].split(":").map(Number);
      const timeB = b[1].split(":").map(Number);
      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
    });

    for (let i = 0; i < sortedPrayers.length; i++) {
      const [prayer, time] = sortedPrayers[i];
      const [hours, minutes] = time.split(":").map(Number);
      const prayerMinutes = hours * 60 + minutes;

      if (currentTime < prayerMinutes) {
        currentPrayer = i > 0 ? sortedPrayers[i - 1][0] : sortedPrayers[sortedPrayers.length - 1][0];
        nextPrayer = prayer;
        break;
      }
    }

    // If we're after the last prayer of the day
    if (!nextPrayer) {
      currentPrayer = sortedPrayers[sortedPrayers.length - 1][0];
      nextPrayer = sortedPrayers[0][0];
    }

    // Update UI highlighting
    updatePrayerHighlight(currentPrayer, nextPrayer);

    // Play Adhan if it's exactly prayer time
    const currentTimeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    Object.entries(currentPrayerTimes).forEach(([prayer, time]) => {
      if (time === currentTimeStr) {
        playAdhan(prayer);
      }
    });
  } catch (error) {
    console.error("Error checking prayer time:", error);
  }
}

/**
 * Update prayer highlighting in the UI
 */
function updatePrayerHighlight(currentPrayer, nextPrayer) {
  try {
    if (!currentPrayerTimes) {
      console.warn("No prayer times available for highlighting");
      return;
    }

    // Remove existing highlights
    document.querySelectorAll(".prayer-item").forEach((item) => {
      item.classList.remove("current", "next");
    });

    // Add new highlights
    if (currentPrayer) {
      const currentElement = document.querySelector(`[data-prayer-name="${APP_CONFIG.prayerNames[currentPrayer]}"]`);
      if (currentElement) currentElement.classList.add("current");
    }

    if (nextPrayer) {
      const nextElement = document.querySelector(`[data-prayer-name="${APP_CONFIG.prayerNames[nextPrayer]}"]`);
      if (nextElement) nextElement.classList.add("next");
    }
  } catch (error) {
    console.error("Error updating prayer highlights:", error);
  }
}

/**
 * Play Adhan audio for prayer time
 */
function playAdhan(prayer) {
  try {
    if (!adhanAudio) {
      console.warn("Adhan audio not initialized");
      return;
    }

    // Show notification
    if (Notification.permission === "granted") {
      new Notification(`Time for ${APP_CONFIG.prayerNames[prayer]}`, {
        body: "حي على الصلاة - Come to prayer",
        icon: "/path/to/your/icon.png",
      });
    }

    // Play adhan
    adhanAudio.play().catch((error) => {
      console.error("Error playing adhan:", error);
    });
  } catch (error) {
    console.error("Error in playAdhan:", error);
  }
}

/**
 * Initialize prayer times with city selection
 */
/**
 * Fungsi untuk menggunakan waktu sholat default
 * Digunakan ketika terjadi error dalam mendapatkan waktu sholat dari API
 */
function useDefaultPrayerTimes() {
  console.log("Using default prayer times");
  // Gunakan waktu default dari konfigurasi
  const defaultTimes = APP_CONFIG.defaultPrayerTimes;

  // Update UI dengan waktu default
  updateUIWithPrayerTimes(defaultTimes);

  // Tampilkan notifikasi bahwa menggunakan waktu default
  showLocationStatus("default");
}

/**
 * Fungsi untuk memperbarui tampilan tanggal saat ini
 */
function updateCurrentDate() {
  try {
    const dateElement = document.getElementById("current-date");
    if (!dateElement) return;

    const now = new Date();

    // Format tanggal dalam Bahasa Indonesia
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    let dateString;

    try {
      // Coba gunakan formatter Bahasa Indonesia
      dateString = now.toLocaleDateString("ms-MY", options);
    } catch (localeError) {
      console.warn("Locale not supported, using default format", localeError);
      // Fallback ke format manual
      const days = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];
      const months = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];

      dateString = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    }

    dateElement.textContent = dateString;
  } catch (error) {
    console.error("Error updating current date:", error);
  }
}

/**
 * Initialize prayer times with city selection
 */
async function initPrayerTimes() {
  try {
    // Tampilkan loading state
    document.querySelectorAll(".prayer-time").forEach((el) => {
      el.textContent = "Loading...";
    });

    // Perbarui tampilan tanggal
    updateCurrentDate();

    // Perbarui tanggal setiap hari pada tengah malam
    const updateDateAtMidnight = () => {
      const now = new Date();
      const night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // besok
        0,
        0,
        0 // 00:00:00
      );
      const msToMidnight = night.getTime() - now.getTime();

      // Set timeout untuk memperbarui tanggal pada tengah malam
      setTimeout(() => {
        updateCurrentDate();
        // Perbarui waktu sholat untuk tanggal baru
        const currentCity = localStorage.getItem("selectedCity") || APP_CONFIG.cities.DEFAULT;
        PrayerTimeService.getPrayerTimes(currentCity).then((times) => {
          if (times) {
            updatePrayerTimesDisplay(times);
            updateUIWithPrayerTimes(times);
          }
        });
        // Set ulang untuk malam berikutnya
        updateDateAtMidnight();
      }, msToMidnight);
    };

    // Mulai pembaruan tanggal otomatis
    updateDateAtMidnight();

    // Inisialisasi dropdown kota
    initCitySelector();

    // Ambil kota dari localStorage atau gunakan default
    const savedCity = localStorage.getItem("selectedCity") || APP_CONFIG.cities.DEFAULT;
    const prayerTimes = await PrayerTimeService.getPrayerTimes(savedCity);
    if (!prayerTimes) throw new Error("Failed to fetch prayer times");

    // Update display
    updatePrayerTimesDisplay(prayerTimes);
    updateUIWithPrayerTimes(prayerTimes);

    // Update prayer times hourly
    setInterval(async () => {
      const currentCity = localStorage.getItem("selectedCity") || APP_CONFIG.cities.DEFAULT;
      const newTimes = await PrayerTimeService.getPrayerTimes(currentCity);
      if (newTimes) {
        updatePrayerTimesDisplay(newTimes);
        updateUIWithPrayerTimes(newTimes);
      }
    }, 3600000);
  } catch (error) {
    console.error("Prayer times initialization failed:", error);
    useDefaultPrayerTimes();
  }
}

/**
 * Inisialisasi dropdown pemilihan kota
 */
function initCitySelector() {
  const citySelector = document.getElementById("city-selector");
  if (!citySelector) return;

  // Kosongkan dropdown terlebih dahulu
  citySelector.innerHTML = "";

  // Tambahkan semua kota dari konfigurasi ke dropdown (diurutkan abjad)
  const sortedCities = [...APP_CONFIG.cities.LIST].sort();
  sortedCities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    citySelector.appendChild(option);
  });

  // Coba gunakan kota terdekat jika tersedia
  const nearestCity = localStorage.getItem("nearestCity");

  // Set nilai awal dari localStorage, kota terdekat, atau default
  const savedCity = localStorage.getItem("selectedCity") || nearestCity || APP_CONFIG.cities.DEFAULT;
  citySelector.value = savedCity;

  // Jika tidak ada kota yang tersimpan, coba gunakan geolokasi
  if (!localStorage.getItem("selectedCity") && !nearestCity) {
    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Cari kota terdekat berdasarkan koordinat
          const nearestCity = PrayerTimeService.findNearestCity(latitude, longitude);
          if (nearestCity) {
            localStorage.setItem("nearestCity", nearestCity);
            localStorage.setItem("selectedCity", nearestCity);
            citySelector.value = nearestCity;

            // Perbarui waktu sholat berdasarkan kota terdekat
            const prayerTimes = await PrayerTimeService.getPrayerTimes(nearestCity);
            if (prayerTimes) {
              updatePrayerTimesDisplay(prayerTimes);
              updateUIWithPrayerTimes(prayerTimes);
              showLocationStatus("city", nearestCity);
            }
          }
        },
        (error) => {
          console.warn("Geolocation failed, using default city:", error);
          // Gunakan kota default
          const defaultCity = APP_CONFIG.cities.DEFAULT;
          localStorage.setItem("selectedCity", defaultCity);
          citySelector.value = defaultCity;
          showLocationStatus("default");
        },
        APP_CONFIG.geoOptions
      );
    } catch (geoError) {
      console.warn("Geolocation not supported, using default city");
      // Gunakan kota default
      const defaultCity = APP_CONFIG.cities.DEFAULT;
      localStorage.setItem("selectedCity", defaultCity);
      citySelector.value = defaultCity;
      showLocationStatus("default");
    }
  }

  // Perbarui waktu sholat berdasarkan kota yang dipilih
  PrayerTimeService.getPrayerTimes(savedCity).then((prayerTimes) => {
    if (prayerTimes) {
      updatePrayerTimesDisplay(prayerTimes);
      updateUIWithPrayerTimes(prayerTimes);
      showLocationStatus("city", savedCity);
    }
  });

  // Tambahkan event listener untuk perubahan kota
  citySelector.addEventListener("change", async function () {
    const selectedCity = this.value;
    console.log(`City changed to: ${selectedCity}`);
    localStorage.setItem("selectedCity", selectedCity);

    // Tampilkan loading state
    document.querySelectorAll(".prayer-time").forEach((el) => {
      el.textContent = "Loading...";
    });

    // Dapatkan waktu sholat untuk kota yang dipilih
    const prayerTimes = await PrayerTimeService.getPrayerTimes(selectedCity);
    if (prayerTimes) {
      updatePrayerTimesDisplay(prayerTimes);
      updateUIWithPrayerTimes(prayerTimes);
      showLocationStatus("city", selectedCity);
    }
  });
}

/**
 * Fungsi untuk menampilkan status lokasi
 * @param {string} type - Jenis status lokasi ('success', 'cache', 'default', 'city')
 * @param {number|string|null} param - Akurasi lokasi dalam meter atau nama kota (opsional)
 */
function showLocationStatus(type, param = null) {
  const notifElement = document.getElementById("notification-status");
  const locationInfoElement = document.getElementById("location-info");
  if (!notifElement) return;

  let message = "";
  let locationInfo = "";
  let color = "";

  switch (type) {
    case "success":
      message = `<i class='bi bi-geo-alt-fill'></i> Menggunakan lokasi saat ini (akurasi: ${Math.round(param)}m)`;
      locationInfo = `<i class='bi bi-geo-alt'></i> Lokasi saat ini`;
      color = "#4aaf4f";
      break;
    case "cache":
      message = "<i class='bi bi-clock-history'></i> Menggunakan waktu sholat tersimpan";
      locationInfo = `<i class='bi bi-clock-history'></i> Data tersimpan`;
      color = "#ff9800";
      break;
    case "city":
      message = `<i class='bi bi-geo-alt-fill'></i> Menggunakan waktu sholat untuk ${param}`;
      locationInfo = `<i class='bi bi-building'></i> ${param}`;
      color = "#4aaf4f";
      break;
    case "default":
      message = "<i class='bi bi-exclamation-triangle'></i> Menggunakan waktu sholat default";
      locationInfo = `<i class='bi bi-building'></i> ${APP_CONFIG.cities.DEFAULT}`;
      color = "#ff6b6b";
      break;
  }

  notifElement.innerHTML = message;
  notifElement.style.color = color;
  notifElement.style.display = "block";

  if (locationInfoElement) {
    locationInfoElement.innerHTML = locationInfo;
  }

  setTimeout(() => {
    notifElement.style.display = "none";
  }, 5000);
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
 */
function initEventListeners() {
  try {
    // Navigation listeners
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (item.dataset.page) {
          e.preventDefault();
          showPage(item.dataset.page);
        }
      });
    });

    // Initialize prayer times
    initPrayerTimes().catch((error) => {
      console.error("Failed to initialize prayer times:", error);
      document.querySelector(".prayer-list").innerHTML = `
        <div class="error-message">
          Unable to load prayer times. Please check your connection.
        </div>
      `;
    });
  } catch (error) {
    console.error("Error initializing event listeners:", error);
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
    console.log("Initializing Muslim App...");

    // Inisialisasi komponen UI
    updateCurrentDate();
    addLoadingDotsStyle();
    createBubbles();

    // Inisialisasi audio adzan
    initAdhanAudio();

    // Inisialisasi navigasi
    initNavigation();

    // Minta izin notifikasi
    requestNotificationPermission();

    // Inisialisasi waktu sholat
    initPrayerTimes();

    // Setup cleanup
    const cleanupFunctions = [];

    try {
      // Add cleanup for observers if CurrencyService exists
      if (typeof CurrencyService !== "undefined" && CurrencyService.initSaldoObserver) {
        const saldoObserver = CurrencyService.initSaldoObserver();
        if (saldoObserver && typeof cleanup !== "undefined") {
          cleanup.addObserver(saldoObserver);
        }
      }
    } catch (observerError) {
      console.warn("Error setting up observers:", observerError);
    }

    console.log("Muslim App initialized successfully");

    // Return cleanup function
    return () => cleanupFunctions.forEach((fn) => fn());
  } catch (error) {
    console.error("App initialization failed:", error);
    // Fallback to default prayer times if initialization fails
    try {
      useDefaultPrayerTimes();
    } catch (fallbackError) {
      console.error("Even fallback initialization failed:", fallbackError);
    }
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
      if (!amount || typeof amount !== "string") {
        console.warn("Invalid amount provided:", amount);
        return amount;
      }
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
