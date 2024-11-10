
          function getData(halaman, targetDiv) {
  console.log("Mengambil data untuk halaman:", halaman, "Target div:", targetDiv); // Debugging

  $.ajax({
    url: "https://onsyime.my.id/antarek-food.php",
    data: {
      halaman: halaman,
    },
    method: "POST",
    dataType: "JSON",
    success: function (data) {
      try {
        if (Array.isArray(data)) {
          let xhtml = "";
          data.forEach(function (element) {
            console.log("Proses item:", element); // Debugging setiap elemen

            xhtml += '<div class="col-s5">';
            xhtml += '<a href="https://jgjk.mobi/p/' + element.Gambar.substr(-17, 13) + '">';
            xhtml += '<div class="OnsyiCard1">';
            xhtml += '<span class="ribbon5">Promo</span>';
            xhtml += '<span class="OnsyiNew1">Bestseller</span>';
            xhtml += '<img class="OnsyiImage1" src="' + element.Gambar + '">';
            xhtml += '<span class="star1"><i class="fa-solid fa-star bx-flashing" style="color: orange; font-size: 13px;"></i> 4.6</span>';
            xhtml += '<h6 class="OnsyiText-Judul1">' + element.Nama + "</h6>";
            xhtml += '<span class="thin1">Terbaru</span>';
            xhtml += '<span class="thin2">Umkm</span>';
            xhtml += '<strong class="OnsyiText-Harga1">' + element.Harga + "</strong>";
            xhtml += '<span class="cart1 bx-tada"><i class="fa-solid fa-circle-plus" style="font-size: 14px;"></i></span>';
            xhtml += "</div>";
            xhtml += "</a>";
            xhtml += "</div>";
          });
          document.getElementById(targetDiv).innerHTML += xhtml;
        } else {
          console.error("Data tidak valid.");
          alert("Data tidak valid.");
        }
      } catch (err) {
        console.error("Terjadi kesalahan:", err);
        alert("Terjadi Kesalahan. 01\n\n" + (err.message || "Error tidak diketahui."));
      }
    },
    error: function (err) {
      console.error("Terjadi kesalahan:", err); // Melihat kesalahan yang terjadi
      alert("Terjadi Kesalahan. 02\n\n" + (err.statusText || "Error tidak diketahui."));
    },
  });
}

// Memanggil fungsi untuk elemen pertama (id="satu")
let halamanPertama = 1;
getData(halamanPertama, "satu");

// Memanggil fungsi untuk elemen kedua (id="dua")
let halamanKedua = 2;
getData(halamanKedua, "dua");

// Memanggil fungsi untuk elemen kedua (id="tiga")
let halamanKetiga = 3;
getData(halamanKetiga, "tiga");


