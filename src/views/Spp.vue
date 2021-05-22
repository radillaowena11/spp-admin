<template>
  <div class="main-panel">
    <div class="content-wrapper">
      <div class="row">
        <div class="col-lg-12 grid-margin stretch-card">
          <div class="card">
            <div class="card-body">
              <h4 class="card-title">Data SPP</h4>
              <p class="card-description float-right">
                <b-button variant="success" v-b-modal.modalSpp v-on:click="Add">
                  <i class="mdi mdi-plus btn-icon-prepend"></i> Tambah
                </b-button>
              </p>
              <div class="table-responsive">
                <b-table striped hover :items="spp" :fields="fields">
                  <template v-slot:cell(bulan)="data">
                    {{ months[data.item.bulan - 1] }}
                  </template>

                  <template v-slot:cell(Aksi)="data">
                    <b-button
                      size="sm"
                      variant="info"
                      v-on:click="Edit(data.item)"
                      v-b-modal.modalSpp
                    >

                      <i class="mdi mdi-pencil btn-icon-prepend"></i>
                      Ubah </b-button
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
                  <b-spinner variant="success" label="Spinning"></b-spinner>
                  <strong class="text-success">Loading ...</strong>
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

    <b-modal id="modalSpp" @ok="Save">
      <template v-slot:modal-title> Form SPP </template>
      <form ref="form">
        <div class="form-group">
          <label for="tahun" class="col-form-label">Tahun</label>
          <input
            type="number"
            class="form-control"
            name="tahun"
            id="tahun"
            placeholder="Tahun"
            v-model="tahun"
          />
        </div>
        <div class="form-group">
          <label for="tahun" class="col-form-label">Bulan</label>
          <b-form-select
            id="id_kelas"
            v-model="bulan"
            :options="bulan_op"
          ></b-form-select>
        </div>
        <div class="form-group">
          <label for="tahun" class="col-form-label">Siswa</label>
          <b-form-select
            id="id_kelas"
            v-model="id_siswa"
            :options="siswa"
          ></b-form-select>
        </div>
        <div class="form-group">
          <label for="nominal" class="col-form-label">Nominal</label>
          <input
            type="number"
            class="form-control"
            name="nominal"
            id="nominal"
            placeholder="Nominal"
            v-model="nominal"
          />
        </div>
      </form>
    </b-modal>
  </div>
</template>

<script>
// const { default: func }=require("../../vue-temp/vue-editor-bridge");

module.exports = {
  data: function () {
    return {
      search: "",
      id: "",
      tahun: 0,
      bulan: 0,
      bulan_op: [
        { value: "1", text: "Januari" },
        { value: "2", text: "Febuari" },
        { value: "3", text: "Maret" },
        { value: "4", text: "April" },
        { value: "5", text: "Mei" },
        { value: "6", text: "Juni" },
        { value: "7", text: "Juli" },
        { value: "8", text: "Agustus" },
        { value: "9", text: "September" },
        { value: "10", text: "Oktober" },
        { value: "11", text: "November" },
        { value: "12", text: "Desember" },
      ],
      siswa: [],
      id_siswa: "",
      nominal: 0,
      action: "",
      message: "",
      currentPage: 1,
      rows: 0,
      perPage: 10,
      key: "",
      spp: [],
      fields: ["id", "nama", "bulan", "tahun", "nominal", "Aksi"],
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
    getData: function () {
      let conf = { headers: { Authorization: "Bearer " + this.key } };
      let offset = (this.currentPage - 1) * this.perPage;
      this.$bvToast.show("loadingToast");
      this.axios
        .get("/spp/" + this.perPage + "/" + offset, conf)
        .then((response) => {
          if (response.data.status == 1) {
            this.$bvToast.hide("loadingToast");
            this.spp = response.data.spp;
            this.rows = response.data.count;
          } else {
            this.$bvToast.hide("loadingToast");
            this.message = "Gagal menampilkan data spp.";
            this.$bvToast.show("message");
            this.$router.push({ name: "login" });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    getSiswaDropdown: function () {
      // ambil data kelas untuk dropdown
      let conf = { headers: { Authorization: "Bearer " + this.key } };
      this.axios.get("/siswa", conf).then((response) => {
        let json_siswa = response.data.siswa;
        let list_siswa = [];
        json_siswa.forEach((element) => {
          list_siswa.push({ value: element.id, text: element.nama_siswa });
        });
        this.siswa = list_siswa;
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
      this.getSiswaDropdown();
      this.action = "insert";
      this.id_siswa = 0;
      this.bulan = 0;
      this.tahun = 0;
      this.nominal = 0;
      console.log("testing");
    },

    Edit: function (item) {
      this.getSiswaDropdown();
      this.action = "update";
      this.id = item.id;
      this.id_siswa = item.id_siswa;
      this.bulan = item.bulan;
      this.tahun = item.tahun;
      this.nominal = item.nominal;
      console.log("testing");
    },

    Save: function () {
      let conf = { headers: { Authorization: "Bearer " + this.key } };
      this.$bvToast.show("loadingToast");
      if (this.action === "insert") {
        let form = new FormData();
        form.append("id_siswa", this.id_siswa);
        form.append("bulan", this.bulan);
        form.append("tahun", this.tahun);
        form.append("nominal", this.nominal);
        console.log(form);

        this.axios
          .post("/spp", form, conf)
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
          bulan: this.bulan,
          tahun: this.tahun,
          nominal: this.nominal,
          id_siswa: this.id_siswa,
        };
        console.log(form);
        this.axios
          .put("/spp/" + this.id, form, conf)
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
          .delete("/spp/" + id, conf)
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
};
</script>