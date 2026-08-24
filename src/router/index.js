import { createRouter, createWebHistory } from 'vue-router'
import BerandaView from '../views/BerandaView.vue'
import TurnamenView from '../views/TurnamenView.vue'
import JadwalView from '../views/JadwalView.vue'
import StatistikView from '../views/StatistikView.vue'
import TimView from '../views/TimView.vue'
import DetailTimView from '../views/DetailTimView.vue'
import AdminView from '../views/AdminView.vue'

const routes = [
  { path: '/', name: 'beranda', component: BerandaView },
  { path: '/turnamen', name: 'turnamen', component: TurnamenView },
  { path: '/jadwal', name: 'jadwal', component: JadwalView },
  { path: '/statistik', name: 'statistik', component: StatistikView },
  { path: '/tim', name: 'tim', component: TimView },
  { path: '/tim/:id', name: 'detail-tim', component: DetailTimView },
  { path: '/admin', name: 'admin', component: AdminView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
