import Vue from "vue";
import VueRouter from "vue-router";
// import Home from '../views/Home.vue'
import Login from "../views/Login.vue";
import PdfPembayaran from "../views/PdfPembayaran.vue";
import Petugas from "../views/Petugas.vue";
import Kelas from "../views/Kelas.vue";
import Spp from "../views/Spp.vue";
import Siswa from "../views/Siswa.vue";
import Pembayaran from "../views/Pembayaran.vue";
import Navbar from "../views/Layouts/Navbar.vue";
import Footer from "../views/Layouts/Footer.vue";
import Sidebar from "../views/Layouts/Sidebar.vue";
import store from "../store";

// const originalPush = VueRouter.prototype.push;
// VueRouter.prototype.push = function push(location) {
//   return originalPush.call(this, location).catch((err) => err);
// };
Vue.use(VueRouter);

const routes = [
  {
    path: "/pdf",
    name: "PdfPembayaran",
    components: { default: PdfPembayaran },
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/petugas",
    name: "Petugas",
    components: {
      default: Petugas,
      header: Navbar,
      sidebar: Sidebar,
      footer: Footer,
    },
    meta: { requiresAuth: true },
  },
  
  {
    path: "/kelas",
    name: "Kelas",
    components: {
      default: Kelas,
      header: Navbar,
      sidebar: Sidebar,
      footer: Footer,
    },
    meta: { requiresAuth: true },
  },
  {
    path: "/spp",
    name: "Spp",
    components: {
      default: Spp,
      header: Navbar,
      sidebar: Sidebar,
      footer: Footer,
    },
    meta: { requiresAuth: true },
  },
  {
    path: "/siswa",
    name: "Siswa",
    components: {
      default: Siswa,
      header: Navbar,
      sidebar: Sidebar,
      footer: Footer,
    },
    meta: { requiresAuth: true },
  },
  {
    path: "/pembayaran",
    name: "Pembayaran",
    components: {
      default: Pembayaran,
      header: Navbar,
      sidebar: Sidebar,
      footer: Footer,
    },
    meta: { requiresAuth: true },
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes: routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (store.getters.isLoggedIn) {
      next();
      return;
    }
    next("/login");
  } else {
    next();
  }
});

export default router;
