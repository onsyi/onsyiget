// Data waktu solat Malaysia (embedded langsung untuk menghindari masalah fetch di Android)
const malaysianPrayerTimesData = {
  "cities": [
    {
      "name": "Kuala Lumpur",
      "state": "Federal Territory",
      "prayer_times": {
        "Subuh": "05:45",
        "Zohor": "13:15",
        "Asar": "16:35",
        "Maghrib": "19:20",
        "Isyak": "20:35"
      }
    },
    {
      "name": "Johor Bahru",
      "state": "Johor",
      "prayer_times": {
        "Subuh": "05:50",
        "Zohor": "13:20",
        "Asar": "16:40",
        "Maghrib": "19:25",
        "Isyak": "20:40"
      }
    },
    {
      "name": "Penang",
      "state": "Pulau Pinang",
      "prayer_times": {
        "Subuh": "05:55",
        "Zohor": "13:25",
        "Asar": "16:45",
        "Maghrib": "19:30",
        "Isyak": "20:45"
      }
    },
    {
      "name": "Malacca",
      "state": "Melaka",
      "prayer_times": {
        "Subuh": "05:48",
        "Zohor": "13:18",
        "Asar": "16:38",
        "Maghrib": "19:23",
        "Isyak": "20:38"
      }
    },
    {
      "name": "Kota Kinabalu",
      "state": "Sabah",
      "prayer_times": {
        "Subuh": "05:40",
        "Zohor": "13:10",
        "Asar": "16:30",
        "Maghrib": "19:15",
        "Isyak": "20:30"
      }
    }
  ]
};

// Fungsi untuk memuat data waktu solat (sekarang menggunakan data yang sudah disematkan)
function loadPrayerTimes() {
  return malaysianPrayerTimesData.cities;
}

// Fungsi untuk mengisi dropdown kota
function populateCitySelector() {
  const citySelector = document.getElementById("city-selector");
  const cities = loadPrayerTimes();

  // Kosongkan dropdown terlebih dahulu
  citySelector.innerHTML = '';

  cities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city.name;
    option.textContent = `${city.name}, ${city.state}`;
    citySelector.appendChild(option);
  });

  // Set kota default dan tampilkan waktu solat
  if (cities.length > 0) {
    citySelector.value = cities[0].name;
    updatePrayerTimes(cities[0]);
  }
}

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
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const selectedCity = document.getElementById("city-selector").value;
  const cityData = loadPrayerTimes().find(city => city.name === selectedCity);
  
  if (!cityData) return;
  
  // Reset semua indikator
  document.querySelectorAll('.prayer-indicator').forEach(indicator => {
    indicator.classList.remove('active');
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
    currentPrayerElement.classList.add('active');
  }
}

// Fungsi pembantu untuk mengonversi waktu (HH:MM) ke dalam menit
function convertTimeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Event listener untuk perubahan kota
document.getElementById("city-selector").addEventListener("change", (event) => {
  const cities = loadPrayerTimes();
  const selectedCity = cities.find((city) => city.name === event.target.value);
  if (selectedCity) {
    updatePrayerTimes(selectedCity);
  }
});

// Inisialisasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  populateCitySelector();
  
  // Update waktu solat setiap menit
  setInterval(() => {
    const selectedCity = document.getElementById("city-selector").value;
    const cityData = loadPrayerTimes().find(city => city.name === selectedCity);
    if (cityData) {
      highlightCurrentPrayer();
    }
  }, 60000);
});
