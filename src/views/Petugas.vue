<template>
  <div class="main-panel">
    <div class="content-wrapper">
      <div class="row">
        <div class="col-lg-12 grid-margin stretch-card">
          <div class="card">
            <div class="card-body">
              <h4 class="card-title">Data Petugas</h4>
              <p class="card-description float-right">
                <b-button
                  variant="success"
                  v-b-modal.modalUser
                  v-on:click="Add"
                >
                  <i class="mdi mdi-plus btn-icon-prepend"></i>
                  Tambah</b-button
                >
              </p>

              <b-table
                class="table table-striped"
                striped
                hover
                :items="user"
                :fields="fields"
              >

                <template v-slot:cell(level)="data">
                  <b-badge variant="warning">{{ data.item.level }}</b-badge>
                </template>

                <template v-slot:cell(Aksi)="data">
                  <b-button
                    size="sm"
                    variant="info"
                    v-on:click="Edit(data.item)"
                    v-b-modal.modalUser
                  >
                    <i class="mdi mdi-pencil btn-icon-prepend"></i>
                    Ubah</b-button
                  >&nbsp;

                  <b-button
                    size="sm"
                    variant="danger"
                    v-on:click="Drop(data.item.id)"
                  >
                    <i class="mdi mdi-delete btn-icon-prepend"></i>
                    Hapus</b-button
                  >
                </template>
              </b-table>

              <b-pagination
                v-model="currentPage"
                :per-page="perPage"
                :total-rows="rows"
                align="center"
                v-on:input="pagination"
              >
              </b-pagination>

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

        <b-modal id="modalUser" @ok="Save">
          <template v-slot:modal-title>Form Petugas</template>
          <form ref="form">
            <div class="form-group">
              <label for="nama_petugas" class="col-form-label"
                >Nama Petugas</label>
              <input
                type="text"
                name="nama_petugas"
                class="form-control"
                id="nama_petugas"
                placeholder="Nama Petugas"
                v-model="nama_petugas"
              />
            </div>

            <div class="form-group">
              <label for="username" class="col-form-label">Username</label>
              <input
                type="text"
                name="username"
                class="form-control"
                id="username"
                placeholder="Username"
                v-model="username"
              />
            </div>

            <div class="form-group">
              <label for="password" class="col-form-label">Password</label>
              <input
                type="password"
                name="password"
                class="form-control"
                id="password"
                placeholder="Password"
                v-model="password"
              />
            </div>
            
            <div class="form-group">
              <label for="level" class="col-form-label">level</label>
              <select
                class="form-control"
                name="level"
                id="level"
                v-model="level"
              >
                <option value="admin" checked>Admin</option>
                <option value="petugas">Petugas</option>
              </select>
            </div>
          </form>
        </b-modal>
      </div>
    </div>
  </div>
</template>

<script>
module.exports = {
  data: function () {
    return {
      search: "",
      id: "",
      nama_petugas: "",
      username: "",
      password: "",
      level: "",
      action: "",
      message: "",
      currentPage: 1,
      rows: 0,
      perPage: 10,
      key: "",
      user: [],
      fields: ["id", "nama_petugas", "username", "level", "Aksi"],
    };
  },

  methods: {
    getData: function () {
      let conf = { headers: { Authorization: "Bearer " + this.key } };
      let offset = (this.currentPage - 1) * this.perPage;
      this.$bvToast.show("loadingToast");
      this.axios
        .get("/petugas/" + this.perPage + "/" + offset, conf)
        .then((response) => {
          if (response.data.status == 1) {
            this.$bvToast.hide("loadingToast");
            this.user = response.data.user;
            this.rows = response.data.count;
          } else {
            this.$bvToast.hide("loadingToast");
            this.message = "Gagal menampilkan data petugas.";
            this.$bvToast.show("message");
            this.$router.push({ name: "login" });
          }
        })
        .catch((error) => {
          console.log(error);
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
      this.nama_petugas = "";
      this.username = "";
      (this.password = ""), (this.level = "");
    },

    Edit: function (item) {
      this.action = "update";
      this.id = item.id;
      this.nama_petugas = item.nama_petugas;
      this.username = item.username;
      this.password = item.password;
      this.level = item.level;
    },

    Save: function () {
      let conf = { headers: { Authorization: "Bearer " + this.key } };
      this.$bvToast.show("loadingToast");
      if (this.action === "insert") {
        let form = new FormData();
        form.append("id", this.id);
        form.append("nama_petugas", this.nama_petugas);
        form.append("username", this.username);
        form.append("password", this.password);
        form.append("level", this.level);

        this.axios
          .post("/petugas", form, conf)
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
          nama_petugas: this.nama_petugas,
          username: this.username,
          password: this.password,
          level: this.level,
        };
        this.axios
          .put("/petugas/" + this.id, form, conf)
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
          .delete("/petugas/" + id, conf)
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