import { createRouter, createWebHistory } from 'vue-router'

// Beranda dimuat langsung (above-the-fold), sisanya lazy-loaded code splitting
import BerandaView from '../views/BerandaView.vue'

const routes = [
  { path: '/', name: 'beranda', component: BerandaView },
  { path: '/turnamen', name: 'turnamen', component: () => import('../views/TurnamenView.vue') },
  { path: '/jadwal', name: 'jadwal', component: () => import('../views/JadwalView.vue') },
  { path: '/statistik', name: 'statistik', component: () => import('../views/StatistikView.vue') },
  { path: '/tim', redirect: '/jadwal?tab=tim' },
  { path: '/tim/:id', name: 'detail-tim', component: () => import('../views/DetailTimView.vue') },
  { path: '/riwayat-juara', name: 'riwayat-juara', component: () => import('../views/RiwayatJuaraView.vue') },
  { path: '/berita', name: 'berita', component: () => import('../views/BeritaView.vue') },
  { path: '/berita/:id', name: 'detail-berita', component: () => import('../views/DetailBeritaView.vue') },
  { path: '/pendaftaran', name: 'pendaftaran', component: () => import('../views/PendaftaranView.vue') },
  { path: '/admin', name: 'admin', component: () => import('../views/AdminView.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
