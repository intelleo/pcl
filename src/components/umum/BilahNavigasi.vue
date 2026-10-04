<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "../../composables/useAuth.js";
import {
  Trophy,
  Calendar,
  Users,
  BarChart3,
  Shield,
  Menu,
  X,
  ShieldCheck,
  Newspaper,
  Crown,
  LogOut,
} from "lucide-vue-next";
import logoPcl from "@/assets/img/logoo.webp";

const router = useRouter();
const route = useRoute();
const menuTerbuka = ref(false);
const { adminAktif, terotentikasi, keluarAdmin } = useAuth();

const daftarMenu = [
  { nama: "Beranda", rute: "/", ikon: Trophy },
  { nama: "Turnamen", rute: "/turnamen", ikon: Shield },
  { nama: "Jadwal & Tim", rute: "/jadwal", ikon: Calendar },
  { nama: "Statistik", rute: "/statistik", ikon: BarChart3 },
  { nama: "Riwayat Juara", rute: "/riwayat-juara", ikon: Crown },
  { nama: "Berita", rute: "/berita", ikon: Newspaper },
];

function navigasi(rute) {
  menuTerbuka.value = false;
  router.push(rute);
}

function handleLogout() {
  keluarAdmin();
  router.push("/");
}
</script>

<template>
  <header
    class="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 sm:h-[72px]">
        <div
          class="flex items-center gap-3 cursor-pointer group"
          @click="navigasi('/')"
        >
          <div
            class="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 group-hover:border-ucl-500/50 transition-colors overflow-hidden"
          >
            <img
              :src="logoPcl"
              alt="PCL Logo"
              class="w-full h-full object-contain p-0.5"
              loading="eager"
              decoding="async"
            />
          </div>
          <div class="leading-tight">
            <span
              class="font-display text-base sm:text-lg font-semibold tracking-tight text-ink-900 block"
            >
              Peak <span class="text-gold-600">Champions League</span>
            </span>
            <p
              class="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400 hidden sm:block mt-0.5"
            >
              Flash Tournament 2026
            </p>
          </div>
        </div>

        <nav class="hidden md:flex items-stretch self-stretch gap-1">
          <button
            v-for="item in daftarMenu"
            :key="item.rute"
            @click="navigasi(item.rute)"
            class="relative px-3 text-sm font-medium transition-colors cursor-pointer focus:outline-none focus-visible:text-ucl-600"
            :class="
              route.path === item.rute || (item.rute === '/admin' && route.path.startsWith('/admin'))
                ? 'text-ucl-600 font-semibold'
                : 'text-slate-600 hover:text-ink-900'
            "
          >
            <span class="flex items-center gap-1.5 h-full">
              <component
                :is="item.ikon"
                class="w-4 h-4"
                :class="
                  route.path === item.rute || (item.rute === '/admin' && route.path.startsWith('/admin')) ? 'text-ucl-600' : 'text-slate-400'
                "
              />
              {{ item.nama }}
            </span>
            <span
              v-if="route.path === item.rute || (item.rute === '/admin' && route.path.startsWith('/admin'))"
              aria-hidden="true"
              class="absolute inset-x-2 bottom-0 h-[3px] rounded-t-full bg-ucl-600"
            ></span>
          </button>
        </nav>

        <!-- Admin Badge & Logout (Desktop) - Hanya saat Terotentikasi -->
        <div v-if="terotentikasi" class="hidden md:flex items-center gap-2 ml-2">
          <button
            @click="navigasi('/admin')"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors cursor-pointer"
            :class="route.path.startsWith('/admin') ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'"
          >
            <ShieldCheck class="w-3.5 h-3.5" />
            {{ adminAktif?.nama || 'Admin' }}
          </button>
          <button
            @click="handleLogout"
            class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Keluar Admin"
          >
            <LogOut class="w-4 h-4" />
          </button>
        </div>

        <div class="md:hidden flex items-center">
          <button
            @click="menuTerbuka = !menuTerbuka"
            class="p-2 rounded-lg text-slate-500 hover:text-ink-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Buka menu"
          >
            <component :is="menuTerbuka ? X : Menu" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="-translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-1 opacity-0"
    >
      <div
        v-if="menuTerbuka"
        class="md:hidden absolute inset-x-0 top-full border-b border-slate-200 bg-white shadow-lift"
      >
        <nav class="px-4 py-3 space-y-1">
          <button
            v-for="item in daftarMenu"
            :key="item.rute"
            @click="navigasi(item.rute)"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer"
            :class="
              route.path === item.rute
                ? 'text-ucl-600 bg-ucl-50 font-semibold'
                : 'text-slate-600 hover:text-ink-900 hover:bg-slate-50'
            "
          >
            <component
              :is="item.ikon"
              class="w-4 h-4"
              :class="
                route.path === item.rute ? 'text-ucl-600' : 'text-slate-400'
              "
            />
            {{ item.nama }}
          </button>

          <!-- Mobile Admin Section - Hanya saat Terotentikasi -->
          <div v-if="terotentikasi" class="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between px-3">
            <button
              @click="navigasi('/admin')"
              class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700"
            >
              <ShieldCheck class="w-4 h-4 text-emerald-600" />
              {{ adminAktif?.nama || 'Admin PCL' }}
            </button>
            <button
              @click="handleLogout"
              class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <LogOut class="w-3.5 h-3.5" />
              Keluar
            </button>
          </div>
        </nav>
      </div>
    </Transition>
  </header>
</template>
