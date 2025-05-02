 // Inisialisasi aplikasi saat DOM telah dimuat
      document.addEventListener("DOMContentLoaded", function() {
        initNavigation();
        createBubbles();
        updateCurrentDate();
        initPrayerTimes();
        // Minta izin notifikasi saat aplikasi dimuat
        requestNotificationPermission();
      });
      /**
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
       * Menampilkan pesan jika notifikasi diblokir oleh pengguna
       */
      function requestNotificationPermission() {
        if (!("Notification" in window)) {
          console.warn("Browser tidak mendukung notifikasi");
          return;
        }
        // Periksa status izin saat ini sebelum meminta
        if (Notification.permission === "default") {
          Notification.requestPermission().then((permission) => {
            console.log("Status izin notifikasi:", permission);
          }).catch((error) => {
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
      let adhanAudio = new Audio("https://raw.githubusercontent.com/islamic-network/cdn/master/islamic/audio/adhan/mishary-rashid-alafasy-128kbps/1.mp3");
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
            const aladhanUrl = https: //api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=11;
              console.log("Mencoba API Aladhan:", aladhanUrl);
            const response = await fetch(aladhanUrl);
            if (!response.ok) {
              throw new Error(API Aladhan error: $ {
                response.status
              });
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
                // Mulai interval untuk mengecek waktu sholat setiap menit
                setInterval(checkPrayerTime, 60000);
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
            const mptUrl = https: //mpt.i906.my/api/prayer/${latitude},${longitude};
              console.log("Mencoba API Malaysia Prayer Times:", mptUrl);
            const response = await fetch(mptUrl);
            if (!response.ok) {
              console.warn(API MPT error: $ {
                response.status
              });
              throw new Error(API MPT error: $ {
                response.status
              });
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
                  // Mulai interval untuk mengecek waktu sholat setiap menit
                  setInterval(checkPrayerTime, 60000);
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
        currentPrayerTimes = {
          fajr: "04:30",
          dhuhr: "12:15",
          asr: "15:30",
          maghrib: "18:10",
          isha: "19:30",
        };
        updatePrayerTimesDisplay(currentPrayerTimes);
        checkPrayerTime();
        setInterval(checkPrayerTime, 60000);
      }
      /**
       * Fungsi untuk memeriksa waktu sholat saat ini dan menandainya
       * Juga memainkan adzan jika waktu sholat tepat sama dengan waktu saat ini
       */
      function checkPrayerTime() {
        if (!currentPrayerTimes) return;
        try {
          const now = new Date();
          const currentTime = now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
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
        if (!timeStr || timeStr === "--:--") return 0;
        try {
          const [hours, minutes] = timeStr.split(":").map(Number);
          if (isNaN(hours) || isNaN(minutes)) {
            console.warn("Format waktu tidak valid:", timeStr);
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
        // Reset audio ke awal
        adhanAudio.currentTime = 0;
        // Tampilkan notifikasi jika diizinkan
        if (Notification.permission === "granted") {
          try {
            new Notification("Waktu Sholat", {
              body: Sudah memasuki waktu sholat $ {
                prayerName
              },
              icon: "/icon.png",
            });
          } catch (notifError) {
            console.error("Error menampilkan notifikasi:", notifError);
          }
        }
        // Mainkan adzan
        adhanAudio.play().catch((error) => {
          console.error("Error memutar adzan:", error);
        });
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
            console.warn(Kunci waktu sholat tidak valid: $ {
              prayerKey
            });
            return;
          }
          // Cari elemen waktu sholat berdasarkan data-prayer-name
          const prayerName = prayerMapping[prayerKey];
          const currentPrayerElement = document.querySelector(.prayer - item[data - prayer - name = "${prayerName}"]);
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
            console.warn(Elemen waktu sholat tidak ditemukan untuk: $ {
              prayerName
            });
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
          // Periksa apakah timestamp valid
          if (!timestamp || isNaN(Number(timestamp))) {
            console.warn("Timestamp tidak valid:", timestamp);
            return "--:--";
          }
          // Konversi timestamp ke Date object (timestamp dalam detik, perlu dikali 1000 untuk milidetik)
          const date = new Date(Number(timestamp) * 1000);
          // Periksa apakah date valid
          if (isNaN(date.getTime())) {
            console.warn("Date tidak valid dari timestamp:", timestamp);
            return "--:--";
          }
          // Format waktu dalam format 24 jam (HH:MM)
          return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
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
        if (!prayerTimes) {
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
          // Menggunakan data-prayer-name attribute yang lebih kompatibel dengan semua browser
          document.querySelectorAll(".prayer-item").forEach((item) => {
            const prayerName = item.getAttribute("data-prayer-name");
            const timeElement = item.querySelector(".prayer-time");
            if (!prayerName || !timeElement) return;
            const prayerKey = prayerMapping[prayerName];
            const prayerTime = prayerKey ? prayerTimes[prayerKey] : null;
            if (prayerKey && prayerTime && prayerTime !== "Invalid Date" && prayerTime !== "--:--") {
              timeElement.textContent = prayerTime;
            } else {
              // Fallback jika data tidak tersedia atau tidak valid
              timeElement.textContent = "--:--";
              console.warn(Data waktu sholat untuk $ {
                  prayerName
                }
                tidak tersedia atau tidak valid);
            }
          });
          // Setelah update, periksa waktu sholat saat ini
          checkPrayerTime();
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
          const container = document.createElement("div");
          container.className = "bubbles-container";
          document.body.appendChild(container);
          // Membuat 10 gelembung dengan ukuran dan posisi acak
          const bubbleCount = 10;
          for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement("div");
            bubble.className = "bubble";
            // Ukuran antara 20px dan 70px
            const size = Math.random() * 50 + 20;
            bubble.style.width = $ {
              size
            }
            px;
            bubble.style.height = $ {
              size
            }
            px;
            // Posisi dan animasi acak
            bubble.style.left = $ {
              Math.random() * 100
            } % ;
            bubble.style.animationDuration = $ {
              Math.random() * 3 + 2
            }
            s;
            bubble.style.animationDelay = $ {
              Math.random() * 2
            }
            s;
            container.appendChild(bubble);
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
          // Set halaman awal (home) sebagai aktif
          const homeNavItem = document.querySelector('.nav-item[data-page="home"]');
          if (homeNavItem) {
            homeNavItem.classList.add("active");
          }
          // Tambahkan event listener untuk tombol navigasi
          const navItems = document.querySelectorAll(".nav-item[data-page]");
          navItems.forEach((item) => {
            item.addEventListener("click", function() {
              const page = this.getAttribute("data-page");
              if (!page) return;
              navigateToPage(page);
              // Tandai item navigasi yang aktif
              navItems.forEach((nav) => nav.classList.remove("active"));
              this.classList.add("active");
            });
          });
        } catch (error) {
          console.error("Error saat inisialisasi navigasi:", error);
        }
      }
      /**
       * Fungsi untuk menangani navigasi antar halaman
       * @param {string} page - ID halaman yang akan ditampilkan
       */
      function navigateToPage(page) {
        if (!page) {
          console.error("Halaman tidak ditentukan");
          return;
        }
        try {
          // Sembunyikan semua halaman
          document.querySelectorAll(".page-content").forEach((p) => (p.style.display = "none"));
          // Tampilkan halaman yang dipilih
          const selectedPage = document.getElementById($ {
            page
          } - page);
          if (selectedPage) {
            selectedPage.style.display = "block";
            // Scroll ke atas halaman
            window.scrollTo(0, 0);
          } else {
            console.warn(Halaman dengan ID '${page}-page'
              tidak ditemukan);
            // Fallback ke halaman home jika halaman tidak ditemukan
            const homePage = document.getElementById("home-page");
            if (homePage) {
              homePage.style.display = "block";
            }
          }
        } catch (error) {
          console.error("Error saat navigasi halaman:", error);
        }
      }
