<template>
  <div class="main-panel">
    <div class="content-wrapper">
      <div class="row">
        <div class="col-lg-12 grid-margin stretch-card">
          <div class="card">
            <div class="card-body">
              <h4 class="card-title">Data Siswa</h4>
              <p class="card-description float-right">
                <b-button
                  variant="success"
                  v-b-modal.modalSiswa
                  v-on:click="Add"
                >
                  <i class="mdi mdi-plus btn-icon-prepend"></i>Tambah
                </b-button>
              </p>
              
              <b-table striped hover :items="siswa" :fields="fields">
                <template v-slot:cell(kelas)="data">
                  {{ data.item.kelas + " " + data.item.kompetensi_keahlian }}
                </template>
                
                <template v-slot:cell(Aksi)="data">
                  <b-button
                    size="sm"
                    variant="info"
                    v-on:click="Edit(data.item)"
                    v-b-modal.modalSiswa
                  >
                    <i class="mdi mdi-pencil btn-icon-prepend"></i>
                    Ubah </b-button
                  >&nbsp;

                  <b-button
                    size="sm"
                    variant="danger"
                    v-on:click="Drop(data.item.id)"
                  >
                    <i class="mdi mdi-delete btn-icon-prepend"></i>Hapus
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
      <b-modal id="modalSiswa" @ok="Save">
        <template v-slot:modal-title> Form Siswa </template>
        <form ref="form">
          <div class="form-group">
            <label for="nis" class="col-form-label">NIS</label>
            <b-form-input
              type="text"
              v-model="nis"
              id="nis"
              placeholder="NIS"
            ></b-form-input>
          </div>

          <div class="form-group">
            <label for="nama" class="col-form-label">Nama Siswa</label>
            <b-form-input
              type="text"
              v-model="nama"
              id="nama"
              placeholder="Nama"
            ></b-form-input>
          </div>

          <div class="form-group">
            <label for="nama" class="col-form-label">Username Siswa</label>
            <b-form-input
              type="text"
              v-model="username"
              id="nama"
              placeholder="Userame"
            ></b-form-input>
          </div>

          <div class="form-group">
            <label for="nama" class="col-form-label">Password Siswa</label>
            <b-form-input
              type="passord"
              v-model="password"
              id="nama"
              placeholder="Password"
            ></b-form-input>
          </div>

          <div class="form-group">
            <label for="id_kelas" class="col-form-label">Kelas</label>
            <b-form-select
              id="id_kelas"
              v-model="id_kelas"
              :options="kelas"
            ></b-form-select>
          </div>

          <div class="form-group">
            <label for="alamat" class="col-form-label">Alamat</label>
            <b-form-input
              type="text"
              v-model="alamat"
              placeholder="Alamat"
            ></b-form-input>
          </div>

          <div class="form-group">
            <label for="no_telp" class="col-form-label">No. Telp</label>
            <b-form-input
              type="text"
              v-model="no_telp"
              placeholder="No. Telp"
            ></b-form-input>
          </div>
        </form>
      </b-modal>
    </div>
  </div>
</template>

<script>
module.exports = {
  data: function () {
    return {
      search: "",
      id: "",
      id_petugas: "",
      id_kelas: "",
      id_spp: "",
      nis: "",
      nama: "",
      alamat: "",
      no_telp: "",
      action: "",
      message: "",
      currentPage: 1,
      rows: 0,
      perPage: 10,
      key: "",
      siswa: [],
      fields: ["id", "nis", "nama_siswa", "kelas", "alamat", "no_telp", "Aksi"],
      kelas: [],
      SPP: [],
      username: "",
      password: "",
    };
  },

  methods: {
    getData: function () {
      let conf = { headers: { Authorization: "Bearer " + this.key } };
      let offset = (this.currentPage - 1) * this.perPage;
      this.$bvToast.show("loadingToast");
      this.axios
        .get("/siswa/" + this.perPage + "/" + offset, conf)
        .then((response) => {
          console.log(response.data);
          if (response.data.status == 1) {
            this.$bvToast.hide("loadingToast");
            this.siswa = response.data.siswa;
            this.rows = response.data.count;
          } else {
            this.$bvToast.hide("loadingToast");
            this.message = "Gagal menampilkan data siswa.";
            this.$bvToast.show("message");
            this.$router.push({ name: "Login" });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },

    getKelasDropdown: function () {
      // ambil data kelas untuk dropdown
      let conf = { headers: { Authorization: "Bearer " + this.key } };
      this.axios.get("/kelas", conf).then((response) => {
        let json_kelas = response.data.kelas;
        let list_kelas = [];
        json_kelas.forEach((element) => {
          list_kelas.push({
            value: element.id,
            text: element.nama_kelas + " " + element.kompetensi_keahlian,
          });
        });
        this.kelas = list_kelas;
      });
    },

    // getSppDropdown: function(){
    //     // ambil data spp untuk dropdown
    //     let conf = { headers: { "Authorization" : 'Bearer ' + this.key } };
    //     this.axios.get("/spp", conf)
    //     .then(response => {
    //         let json_spp = response.data.spp;
    //         let list_spp = []
    //         json_spp.forEach(element => {
    //             list_spp.push({value: element.id, text: element.tahun})
    //         });
    //         this.tahun = list_spp
    //     })
    // },

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
      this.id_kelas = "";
      // this.id_spp = ""
      this.nis = "";
      this.nama = "";
      this.alamat = "";
      this.no_telp = "";
      this.getKelasDropdown();
      // this.getSppDropdown()
    },

    Edit: function (item) {
      this.getKelasDropdown();
      // this.getSppDropdown()
      this.action = "update";
      this.id = item.id;
      this.id_kelas = item.id_kelas;
      this.nis = item.nis;
      this.nama = item.nama_siswa;
      this.username = item.username;
      this.alamat = item.alamat;
      this.no_telp = item.no_telp;
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

        form.append("id_kelas", this.id_kelas);
        form.append("id_spp", this.id_spp);
        form.append("nis", this.nis);
        form.append("nama", this.nama);
        form.append("username", this.username);
        form.append("password", this.password);
        form.append("alamat", this.alamat);
        form.append("no_telp", this.no_telp);
        this.axios
          .post("/siswa", form, conf)
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
          id_kelas: this.id_kelas,
          username: this.username,
          password: this.password,
          nis: this.nis,
          nama: this.nama,
          alamat: this.alamat,
          no_telp: this.no_telp,
        };
        this.axios
          .put("/siswa/" + this.id, form, conf)
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
          .delete("/siswa/" + id, conf)
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