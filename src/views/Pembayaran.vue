<template>
  <div class="main-panel">
    <div class="content-wrapper">
      <div class="row">
        <div class="col-lg-12 grid-margin stretch-card">
          <div class="card">
            <div class="card-body">
              <h4 class="card-title">Data Pembayaran</h4>
              <p class="card-description float-right">
                <b-button
                  variant="success"
                  v-b-modal.modalPembayaran
                  v-on:click="Add"
                >
                  <i class="mdi mdi-plus btn-icon-prepend"></i>Tambah
                </b-button>
              </p>

              <div class="table-responsive">
                <b-table striped hover :items="pembayaran" :fields="fields">
                  <template v-slot:cell(SPP)="data">
                    {{
                      "#" +
                      data.item.sppid +
                      " - " +
                      months[data.item.bulan - 1] +
                      " " +
                      data.item.tahun
                    }}
                  </template>

                  <template v-slot:cell(Aksi)="data">
                    <b-button
                      size="sm"
                      variant="secondary"
                      v-on:click="Print(data.item)"
                    >
                      <i
                        class="mdi mdi-file-document-box-outline btn-icon-prepend"
                      ></i
                      >Print </b-button
                    >&nbsp;
                    <b-button
                      size="sm"
                      variant="danger"
                      v-on:click="Drop(data.item.id)"
                    >
                      <i class="mdi mdi-delete btn-icon-prepend"></i> Hapus
                    </b-button>
                  </template>
                </b-table>

                <b-pagination
                  v-model="currentPage"
                  :per-page="perPage"
                  :total-rows="rows"
                  align="center"
                  v-on:input="pagination"
                ></b-pagination>

                <b-toast id="loadingToast" title="Processing Data" no-auto-hide>
                  <b-spinner label="Spinning" variant="success"></b-spinner>
                  <strong class="text-success">Loading...</strong>
                </b-toast>
                <b-toast id="message" title="Message">
                  <strong class="text-success">{{ message }}</strong>
                </b-toast>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <b-modal id="modalPembayaran" @ok="Save">
      <template v-slot:modal-title> Form Pembayaran </template>
      <form ref="form">
        <div class="form-group">
          <label for="id_petugas" class="col-form-label">Nama Petugas</label>
          <b-form-select
            id="id_petugas"
            v-model="id_petugas"
            :options="nama_petugas"
          ></b-form-select>
        </div>

        <div class="form-group">
          <label for="id_siswa" class="col-form-label">Nama Siswa</label>
          <b-form-select
            id="id_siswa"
            v-on:change="getSppDropdown"
            v-model="id_siswa"
            :options="nama_siswa"
          ></b-form-select>
        </div>

        <div class="form-group">
          <label for="tanggal_pembayaran" class="col-form-label"
            >Tanggal Pembayaran</label
          >
          <b-form-input type="date" v-model="tanggal_pembayaran"></b-form-input>
        </div>

        <div class="form-group">
          <label for="id_spp" class="col-form-label">SPP</label>
          <b-form-select
            id="id_spp"
            v-on:change="sppFilter(id_spp)"
            v-model="id_spp"
            :options="tahun"
          ></b-form-select>
        </div>
        
        {{ ttlbyr }}
        <div class="form-group">
          <label for="jumlah_bayar" class="col-form-label">Jumlah Bayar</label>
          <b-form-input
            type="text"
            v-model="jumlah_bayar"
            placeholder="Jumlah Bayar"
          ></b-form-input>
        </div>
      </form>
    </b-modal>
    <vue-html2pdf
      :show-layout="false"
      :float-layout="true"
      :enable-download="true"
      :preview-modal="true"
      :paginate-elements-by-height="1400"
      filename="BuktiPembayaran"
      :pdf-quality="2"
      :manual-pagination="false"
      pdf-format="a4"
      pdf-orientation="portrait"
      pdf-content-width="800px"
      @progress="onProgress($event)"
      @hasStartedGeneration="hasStartedGeneration()"
      @hasGenerated="hasGenerated($event)"
      ref="html2Pdf"
    >
      <section slot="pdf-content">
        <h2>Bukti Pembayaran</h2>
        <h6>
          -----------------------------------------------------------------
        </h6>
        <h5>Nama Siswa : {{ pdftoprint.nama_siswa }}</h5>
        <h5>Nama Petugas : {{ pdftoprint.nama_petugas }}</h5>
        <h5>
          SPP :
          {{
            "#" +
            pdftoprint.sppid +
            " - " +
            months[pdftoprint.bulan - 1] +
            " " +
            pdftoprint.tahun
          }}
        </h5>
        <h5>Tanggal : {{ pdftoprint.tanggal_pembayaran }}</h5>
        <h5>
          Jumlah Bayar : Rp.
          {{ Number(pdftoprint.jumlah_bayar).toLocaleString() }}
        </h5>
      </section>
    </vue-html2pdf>
  </div>
</template>

<script>
import VueHtml2pdf from "vue-html2pdf";

export default {
  data: function () {
    return {
      search: "",
      id: "",
      id_petugas: "",
      id_siswa: "",
      id_spp: "",
      tanggal_pembayaran: "",
      jumlah_bayar: "",
      action: "",
      message: "",
      currentPage: 1,
      rows: 0,
      ttlbyr: 100,
      perPage: 10,
      key: "",
      pdftoprint: [],
      pembayaran: [],
      fields: [
        "id",
        "nis",
        "nama_siswa",
        "nama_petugas",
        "SPP",
        "tanggal_pembayaran",
        "jumlah_bayar",
        "Aksi",
      ],
      nama_petugas: [],
      nis: [],
      nama_siswa: [],
      SPP: [],
      spp_arr: [],
      tahun: [],
      months: [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Augustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ],
    };
  },

  methods: {
    sppFilter(id_spp) {
      try {
        this.ttlbyr = this.spp_arr.filter((d) => d.id === id_spp)[0].nominal;
      } catch (error) {
        this.ttlbyr = 0;
      }
    },
    Print(item) {
      this.pdftoprint = item;
      this.generateReport();
    },
    generateReport() {
      this.$refs.html2Pdf.generatePdf();
    },
    getData: function () {
      let conf = { headers: { Authorization: "Bearer " + this.key } };
      let offset = (this.currentPage - 1) * this.perPage;
      this.$bvToast.show("loadingToast");
      this.axios
        .get("/pembayaran/" + this.perPage + "/" + offset, conf)
        .then((response) => {
          if (response.data.status == 1) {
            this.$bvToast.hide("loadingToast");
            this.pembayaran = response.data.pembayaran;
            this.rows = response.data.count;
          } else {
            this.$bvToast.hide("loadingToast");
            this.message = "Gagal menampilkan data pembayaran semua siswa.";
            this.$bvToast.show("message");
            this.$router.push({ name: "login" });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },

    getPetugasDropdown: function () {
      // ambil data petugas untuk dropdown
      let conf = { headers: { Authorization: "Bearer " + this.key } };
      this.axios.get("/petugas", conf).then((response) => {
        let json_user = response.data.user;
        let list_user = [];
        json_user.forEach((element) => {
          list_user.push({ value: element.id, text: element.nama_petugas });
        });
        this.nama_petugas = list_user;
      });
    },

    getSiswaDropdown: function () {
      let conf = { headers: { Authorization: "Bearer " + this.key } };
      this.axios.get("/siswa", conf).then((response) => {
        let json_siswa = response.data.siswa;
        let list_siswa = [];
        json_siswa.forEach((element) => {
          list_siswa.push({ value: element.id, text: element.nama_siswa });
        });
        this.nama_siswa = list_siswa;
      });
    },

    getSppDropdown: function () {
      let conf = { headers: { Authorization: "Bearer " + this.key } };
      this.axios.get("/spp/siswa/" + this.id_siswa, conf).then((response) => {
        let json_spp = response.data.spp;
        let list_spp = [];
        json_spp.forEach((element) => {
          list_spp.push({
            value: element.id,
            text:
              "#" +
              element.id +
              " - " +
              this.months[element.bulan - 1] +
              " " +
              element.tahun,
          });
        });
        this.tahun = list_spp;
        this.spp_arr = json_spp;
      });
    },

    pagination: function () {
      if (this.search == "") {
        this.getData();
      } else {
        this.searching();
      }
    },

    Add: function () {
      this.action = "insert";
      this.id = "";
      this.id_petugas = this.$store.getters.userDetail.id;
      this.id_siswa = "";
      this.id_spp = "";
      this.tanggal_pembayaran = "";
      this.jumlah_bayar = "";
      this.getPetugasDropdown();
      this.getSiswaDropdown();
      // this.getSppDropdown()
    },

    Edit: function () {
      this.id_siswa = item.id_siswa;
      this.getPetugasDropdown();
      this.getSiswaDropdown();
      this.getSppDropdown();
      this.action = "update";
      this.id = item.id;
      this.id_petugas = item.id_petugas;
      this.id_spp = item.id_spp;
      this.tanggal_pembayaran = item.tanggal_pembayaran;
      this.jumlah_bayar = item.jumlah_bayar;
    },

    Save: function () {
      let conf = { headers: { Authorization: "Bearer " + this.key } };
      this.$bvToast.show("loadingToast");

      if (this.action === "insert") {
        let form = new FormData();
        this.axios.get("/login/check", conf).then((response) => {
          if (response.data.auth == false || response.data.status == 0) {
            this.$store.commit("logout");
          }
        });

        form.append("id_petugas", this.id_petugas);
        form.append("id_siswa", this.id_siswa);
        form.append("id_spp", this.id_spp);
        form.append("tanggal_pembayaran", this.tanggal_pembayaran);
        form.append("jumlah_bayar", this.jumlah_bayar);
        this.axios
          .post("/pembayaran", form, conf)
          .then((response) => {
            this.$bvToast.hide("loadingToast");
            if (this.search == "") {
              this.getData();
            } else {
              this.searching();
            }
            this.message = response.data.message;
            this.$bvToast.show("message");
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        let form = {
          id_petugas: this.id_petugas,
          id_siswa: this.id_siswa,
          id_spp: this.id_spp,
          tanggal_pembayaran: this.tanggal_pembayaran,
          jumlah_bayar: this.jumlah_bayar,
        };
        this.axios
          .put("/pembayaran/" + this.id, form, conf)
          .then((response) => {
            this.$bvToast.hide("loadingToast");
            if (this.search == "") {
              this.getData();
            } else {
              this.searching();
            }
            this.message = response.data.message;
            this.$bvToast.show("message");
          })
          .catch((error) => {
            console.log(error);
          });
      }
    },

    Drop: function (id) {
      let conf = { headers: { Authorization: "Bearer " + this.key } };
      if (confirm("Apakah anda yakin ingin menghapus data ini?")) {
        this.$bvToast.show("loadingToast");
        this.axios
          .delete("/pembayaran" + id, conf)
          .then((response) => {
            this.getData();
            this.$bvToast.hide("loadingToast");
            this.message = response.data.message;
            this.$bvToast.show("message");
          })
          .catch((error) => {
            console.log(error);
          });
      }
    },

    Drop: function (id) {
      let conf = { headers: { Authorization: "Bearer " + this.key } };
      if (confirm("Apakah anda yakin ingin menghapus data ini?")) {
        this.$bvToast.show("loadingToast");
        this.axios
          .delete("/pembayaran/" + id, conf)
          .then((response) => {
            this.getData();
            this.$bvToast.hide("loadingToast");
            this.message = response.data.message;
            this.$bvToast.show("message");
          })
          .catch((error) => {
            console.log(error);
          });
      }
    },
  },

  mounted() {
    this.key = localStorage.getItem("Authorization");
    this.getData();
  },
  components: {
    VueHtml2pdf,
  },
};
</script>