// Fungsi untuk memuat data waktu sholat dari file JSON lokal
async function loadPrayerTimes() {
  try {
    const response = await fetch("https://onsyi.github.io/onsyiget/prayer-time.json");
    const data = await response.json();
    return data.cities;
  } catch (error) {
    console.error("Error loading prayer times:", error);
    return [];
  }
}

// Fungsi untuk mengisi dropdown kota
async function populateCitySelector() {
  const citySelector = document.getElementById("city-selector");
  const cities = await loadPrayerTimes();

  cities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city.name;
    option.textContent = `${city.name}, ${city.state}`;
    citySelector.appendChild(option);
  });

  // Set kota default dan tampilkan waktu sholat
  if (cities.length > 0) {
    citySelector.value = cities[0].name;
    updatePrayerTimes(cities[0]);
  }
}

// Fungsi untuk memperbarui tampilan waktu sholat
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
}

// Event listener untuk perubahan kota
document.getElementById("city-selector").addEventListener("change", async (event) => {
  const cities = await loadPrayerTimes();
  const selectedCity = cities.find((city) => city.name === event.target.value);
  if (selectedCity) {
    updatePrayerTimes(selectedCity);
  }
});

// Inisialisasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  populateCitySelector();
});
