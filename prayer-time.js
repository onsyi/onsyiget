// API endpoint untuk waktu solat
const API_ENDPOINT = "https://api.waktusolat.app/v1/prayer-times/ktn01";

// Data waktu solat untuk wilayah Kelantan
let prayerTimesData = {
  name: "Kota Bharu",
  state: "Kelantan",
  prayer_times: {
    Subuh: "05:42",
    Zohor: "13:10",
    Asar: "16:34",
    Maghrib: "19:22",
    Isyak: "20:32",
  },
};

// Fungsi untuk memuat data waktu sholat dari API
async function loadPrayerTimes() {
  try {
    const response = await fetch(API_ENDPOINT);
    const data = await response.json();

    // Update prayer times data
    prayerTimesData.prayer_times = {
      Subuh: data.fajr,
      Zohor: data.dhuhr,
      Asar: data.asr,
      Maghrib: data.maghrib,
      Isyak: data.isha,
    };

    return [prayerTimesData];
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    return [prayerTimesData]; // Return cached data if API fails
  }
}

// Fungsi untuk menampilkan waktu solat
async function showPrayerTimes() {
  const prayerData = (await loadPrayerTimes())[0]; // Mengambil data Kota Bharu
  updatePrayerTimes(prayerData);
}

// Fungsi untuk memperbarui waktu solat secara otomatis
function startAutomaticUpdates() {
  // Update setiap 1 jam
  setInterval(async () => {
    await showPrayerTimes();
  }, 3600000);

  // Update saat pertama kali dimuat
  showPrayerTimes();
}

// Mulai pembaruan otomatis saat halaman dimuat
document.addEventListener("DOMContentLoaded", startAutomaticUpdates);

// Fungsi untuk memperbarui tampilan waktu solat
function updatePrayerTimes(cityData) {
  const prayerTimes = cityData.prayer_times;
  Object.entries(prayerTimes).forEach(([prayer, time]) => {
    const prayerItem = document.querySelector(`[data-prayer-name="${prayer}"] .prayer-time`);
    if (prayerItem) {
      prayerItem.textContent = time;
    }
  });

  // Update tanggal saat ini
  const currentDate = document.getElementById("current-date");
  const date = new Date();
  currentDate.textContent = date.toLocaleDateString("ms-MY", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Periksa waktu solat saat ini
  highlightCurrentPrayer();
}

// Fungsi untuk menyorot waktu solat saat ini
function highlightCurrentPrayer() {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const cityData = loadPrayerTimes()[0]; // Get Kota Bharu data directly

  // Reset semua indikator
  document.querySelectorAll(".prayer-indicator").forEach((indicator) => {
    indicator.classList.remove("active");
  });

  // Konversi semua waktu solat ke dalam menit untuk perbandingan
  const prayerTimesInMinutes = {};
  const currentTimeInMinutes = convertTimeToMinutes(currentTime);

  Object.entries(cityData.prayer_times).forEach(([prayer, time]) => {
    prayerTimesInMinutes[prayer] = convertTimeToMinutes(time);
  });

  // Tentukan solat saat ini
  let currentPrayer = null;
  let nextPrayer = null;

  const prayers = Object.keys(prayerTimesInMinutes);

  for (let i = 0; i < prayers.length; i++) {
    const prayer = prayers[i];
    const prayerTime = prayerTimesInMinutes[prayer];

    if (currentTimeInMinutes >= prayerTime) {
      currentPrayer = prayer;
      nextPrayer = prayers[(i + 1) % prayers.length];
    }
  }

  // Jika waktu saat ini setelah Isyak, maka waktu solat saat ini adalah Isyak
  if (!currentPrayer) {
    currentPrayer = prayers[prayers.length - 1]; // Isyak
    nextPrayer = prayers[0]; // Subuh (hari berikutnya)
  }

  // Tandai waktu solat saat ini
  const currentPrayerElement = document.querySelector(`[data-prayer-name="${currentPrayer}"] .prayer-indicator`);
  if (currentPrayerElement) {
    currentPrayerElement.classList.add("active");
  }
}

// Fungsi pembantu untuk mengonversi waktu (HH:MM) ke dalam menit
function convertTimeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Inisialisasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  showPrayerTimes();

  // Update highlight waktu solat setiap menit
  setInterval(() => {
    highlightCurrentPrayer();
  }, 60000);
});
