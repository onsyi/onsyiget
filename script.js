// Script untuk interaksi UI
document.addEventListener("DOMContentLoaded", function () {
  // Fungsi untuk tombol See All kategori
  const categoriesSeeAll = document.getElementById("categoriesSeeAll");
  if (categoriesSeeAll) {
    categoriesSeeAll.addEventListener("click", function (e) {
      e.preventDefault();
      const categoriesModal = new bootstrap.Modal(document.getElementById("categoriesModal"));
      categoriesModal.show();
    });
  }

  // Inisialisasi Bootstrap tabs
  const triggerTabList = document.querySelectorAll('[data-bs-toggle="tab"]');
  triggerTabList.forEach((triggerEl) => {
    const tabTrigger = new bootstrap.Tab(triggerEl);

    triggerEl.addEventListener("click", (event) => {
      event.preventDefault();
      tabTrigger.show();
    });
  });

  // Aktifkan tab pertama secara default
  const firstTab = document.querySelector("#nav-home-tab");
  if (firstTab) {
    const homeTab = new bootstrap.Tab(firstTab);
    homeTab.show();
  }

  // Tambahkan event listener untuk perubahan tab
  const tabEl = document.querySelector('button[data-bs-toggle="tab"]');
  if (tabEl) {
    tabEl.addEventListener("shown.bs.tab", (event) => {
      // Simpan tab aktif di localStorage agar tetap aktif setelah refresh
      localStorage.setItem("activeTab", event.target.id);
    });
  }

  // Cek apakah ada tab yang tersimpan di localStorage
  const activeTab = localStorage.getItem("activeTab");
  if (activeTab) {
    const tabToActivate = document.querySelector("#" + activeTab);
    if (tabToActivate) {
      const tab = new bootstrap.Tab(tabToActivate);
      tab.show();
    }
  }

  // Simulasi data produk (bisa diganti dengan data dari API)
  const products = [
    {
      name: "Organic Apples",
      category: "Fruits",
      rating: 4.8,
      image: "https://via.placeholder.com/100",
    },
    {
      name: "Fresh Broccoli",
      category: "Vegetables",
      rating: 4.6,
      image: "https://via.placeholder.com/100",
    },
  ];

  // Fungsi untuk menampilkan produk
  function displayProducts() {
    const productContainer = document.querySelector(".best-selling-section .row");

    // Bersihkan container
    productContainer.innerHTML = "";

    // Tambahkan produk ke container
    products.forEach((product) => {
      const productHTML = `
                  <div class="col-6">
                      <div class="product-card p-2">
                          <div class="product-rating">
                              <i class="fas fa-star text-warning"></i>
                              <span>${product.rating}</span>
                          </div>
                          <div class="product-image text-center py-2">
                              <img src="${product.image}" alt="${product.name}" class="img-fluid">
                          </div>
                          <div class="product-info">
                              <h6 class="mb-1">${product.name}</h6>
                              <p class="text-muted mb-0">${product.category}</p>
                          </div>
                      </div>
                  </div>
              `;

      productContainer.innerHTML += productHTML;
    });
  }

  // Panggil fungsi untuk menampilkan produk
  displayProducts();
});
