
          document.getElementById("ybcari").addEventListener("click", function () {
            var lokasi = "https://jgjk.mobi/act/search/" + $("input[name='ycari']").val();
            window.location.replace(lokasi);
          });



    // Fungsi untuk menampilkan popup tertentu
    function showPopup(popupId) {
        document.getElementById(popupId).style.display = "flex";
    }

    // Fungsi untuk menyembunyikan popup tertentu
    function hidePopup(popupId) {
        document.getElementById(popupId).style.display = "none";
    }

    // Fungsi aksi ketika klik "Lanjut"
    function continueAction(url) {
        window.location.href = url; // Ganti dengan URL tujuan
    }
    
    
   var halaman = 1;

      function get_data() {
        $.ajax({
          url: 'https://onsyime.my.id/antarek-food.php',
          data: { halaman: halaman },
          method: 'POST',
          dataType: 'JSON',
          success: function(data) {
            try {
              var xhtml = '';
              data.forEach(function(element) {
                xhtml += '<div class="col-6 col-md-4 col-lg-3 d-flex justify-content-center">';
                xhtml += '<a href="https://jgjk.mobi/p/' + element.Gambar.substr(-17, 13) + '">';
                xhtml += '<div class="OnsyiCard3">';
                xhtml += '<span class="OnsyiNew3">Best Seller</span>';
                xhtml += '<img class="OnsyiImage3" src="' + element.Gambar + '">';
                xhtml += '<div class="star3"><i class="fa-solid fa-star" style="color: #fff; font-size: 13px;"></i> 4.6 • 300+ rating</div>';
                xhtml += '<h6 class="OnsyiText-Judul3">' + element.Nama + '</h6>';
                xhtml += '<span class="thin3">Mitra Antarek</span>';
                xhtml += '<div class="OnsyiText-Harga3">' + element.Harga + '</div>';
                xhtml += '</div>';
                xhtml += '</a></div>';
              });

              document.getElementById('empat').innerHTML += xhtml;

              if (data.length === 0) {
                document.getElementById('selanjutnyaBtn').style.display = 'none';
                document.getElementById('lastPageMessage').style.display = 'block';
              }
            } catch (err) {
              console.error('Parsing Error:', err);
              alert('Terjadi Kesalahan. 01\n\n' + err.message);
            }
          },
          error: function(err) {
            console.error('Request Error:', err);
            alert('Terjadi Kesalahan. 02\n\n' + err.responseText);
          }
        });
        halaman++;
      }

      $(document).ready(function() {
        get_data();
      });
