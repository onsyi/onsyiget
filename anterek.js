<script>
  // Handle search button click
  document.getElementById("ybcari").addEventListener("click", function () {
    var searchValue = document.querySelector("input[name='ycari']").value;
    console.log("Search value:", searchValue); // Debugging log
    var lokasi = "https://jgjk.mobi/act/search/" + encodeURIComponent(searchValue);
    console.log("Redirecting to:", lokasi); // Debugging log
    window.location.replace(lokasi);
  });

  // Load first data set
  var halaman1 = 1;
  function get_data1() {
    $.ajax({
      url: "https://onsyime.my.id/bumdesgo1.php",
      data: { halaman: halaman1 },
      method: "POST",
      dataType: "JSON",
      success: function (data) {
        console.log("Data received for halaman1:", data); // Debugging log
        try {
          var xhtml = "";
          data.forEach(function (element) {
            xhtml += `
              <div class="col-s5">
                <a href="https://jgjk.mobi/p/${element.Gambar.substr(-17, 13)}">
                  <div class="OnsyiCard1">
                    <span class="ribbons-wrapper ribbon5">Promo</span>
                    <span class="OnsyiNew1">Fast Food</span>
                    <img class="OnsyiImage1" src="${element.Gambar}" alt="Image">
                    <span class="OnsyiLogo1">BUMDesGo</span>
                    <span class="star1"><i class="fa-solid fa-star bx-flashing" style="color: orange; font-size: 13px;"></i> 4.6</span>
                    <h6 class="OnsyiText-Judul1">${element.Nama}</h6>
                    <span class="thin1">Produk</span>
                    <span class="thin2">BUMDes</span>
                    <b class="OnsyiText-Harga1">${element.Harga}</b>
                    <span class="cart1 bx-tada"><i class="fa-solid fa-circle-plus" style="font-size: 17px;"></i></span>
                  </div>
                </a>
              </div>
            `;
          });
          document.getElementById("satu").innerHTML += xhtml;
        } catch (err) {
          console.error("Error processing data for halaman1:", err); // Debugging log
          alert("Terjadi Kesalahan. 01\n\n" + err.message);
        }
      },
      error: function (err) {
        console.error("AJAX error for halaman1:", err); // Debugging log
        alert("Terjadi Kesalahan. 02\n\n" + err.message);
      },
    });
    halaman1++;
  }
  get_data1();

  // Load second data set
  var halaman2 = 1;
  function get_data2() {
    $.ajax({
      url: "https://onsyime.my.id/bumdesgo2.php",
      data: { halaman: halaman2 },
      method: "POST",
      dataType: "JSON",
      success: function (data) {
        console.log("Data received for halaman2:", data); // Debugging log
        try {
          var xhtml = "";
          data.forEach(function (element) {
            xhtml += `
              <div class="col-s5">
                <a href="https://jgjk.mobi/p/${element.Gambar.substr(-17, 13)}">
                  <div class="OnsyiCard2">
                    <span class="ribbons-wrapper ribbon6">Promo</span>
                    <span class="OnsyiLogo2">BUMDesGo</span>
                    <img class="OnsyiImage2" src="${element.Gambar}" alt="Image">
                    <h6 class="OnsyiText-Judul2">${element.Nama}</h6>
                    <span class="thin3">BUMDes UMKM</span>
                    <span class="star2"><i class="fa-solid fa-star bx-flashing" style="color: orange; font-size: 13px;"></i> 4.6 • 300+ rating</span>
                    <b class="OnsyiText-Harga2">${element.Harga}</b>
                  </div>
                </a>
              </div>
            `;
          });
          document.getElementById("dua").innerHTML += xhtml;
        } catch (err) {
          console.error("Error processing data for halaman2:", err); // Debugging log
          alert("Terjadi Kesalahan. 01\n\n" + err.message);
        }
      },
      error: function (err) {
        console.error("AJAX error for halaman2:", err); // Debugging log
        alert("Terjadi Kesalahan. 02\n\n" + err.message);
      },
    });
    halaman2++;
  }
  get_data2();

  // Activate selected tab
  const list = document.querySelectorAll(".list");
  function activelink() {
    list.forEach((item) => item.classList.remove("active"));
    this.classList.add("active");
  }
  list.forEach((item) => item.addEventListener("click", activelink));

  // Open page in tab navigation
  function openPage(pageName, elmnt, color) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].style.backgroundColor = "";
    }
    document.getElementById(pageName).style.display = "block";
    elmnt.style.backgroundColor = color;
  }
  // Get the element with id="defaultOpen" and click on it
  document.getElementById("defaultOpen").click();
</script>

<script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
<script nomodule src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"></script>
