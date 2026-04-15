<script setup>
import { ref } from 'vue'

const driverForm = ref({
  name: '',
  phone: '',
  email: '',
  city: 'moanda',
})
const formSubmitted = ref(false)

function submitDriverForm() {
  formSubmitted.value = true
  setTimeout(() => (formSubmitted.value = false), 4000)
  driverForm.value = { name: '', phone: '', email: '', city: 'moanda' }
}

const features = [
  {
    title: 'Réservation instantanée',
    desc: 'Commandez un taxi en quelques secondes depuis votre téléphone.',
    icon: 'bolt',
  },
  {
    title: 'Suivi temps réel',
    desc: 'Suivez votre chauffeur en direct sur la carte jusqu\'à votre prise en charge.',
    icon: 'map',
  },
  {
    title: 'Paiement flexible',
    desc: 'Payez en espèces ou par Mobile Money, comme vous préférez.',
    icon: 'wallet',
  },
  {
    title: 'Tarifs transparents',
    desc: 'Connaissez le prix de votre course avant de confirmer. Pas de surprises.',
    icon: 'tag',
  },
  {
    title: 'Chauffeurs vérifiés',
    desc: 'Tous nos chauffeurs sont identifiés, formés et évalués par les passagers.',
    icon: 'shield',
  },
  {
    title: 'Support 24/7',
    desc: 'Une équipe disponible à tout moment pour vous assister en cas de besoin.',
    icon: 'headset',
  },
]

const services = [
  {
    name: 'Standard',
    desc: 'Courses quotidiennes à prix accessible pour tous vos déplacements en ville.',
    base: '500',
    km: '350',
    badge: null,
  },
  {
    name: 'Confort',
    desc: 'Véhicules récents et climatisés pour un trajet tout en confort.',
    base: '800',
    km: '500',
    badge: 'Populaire',
  },
  {
    name: 'VIP',
    desc: 'Service premium avec véhicules haut de gamme et chauffeurs d\'élite.',
    base: '1 500',
    km: '750',
    badge: null,
  },
]

const advantages = [
  { title: 'Revenus flexibles', desc: 'Gagnez selon votre disponibilité, à votre rythme.' },
  { title: 'Liberté d\'horaires', desc: 'Connectez-vous quand vous le souhaitez, pas de contrainte.' },
  { title: 'Formation gratuite', desc: 'Nous vous accompagnons pour démarrer sereinement.' },
  { title: 'Support dédié', desc: 'Une équipe à votre écoute pour vous aider au quotidien.' },
]
</script>

<template>
  <!-- ===== HERO ===== -->
  <section id="accueil" class="relative min-h-screen flex items-center bg-brand-navy overflow-hidden">
    <!-- Background pattern -->
    <div class="absolute inset-0 opacity-[0.04]" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 40px 40px;" />
    <!-- Orange glow -->
    <div class="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-brand-orange/10 blur-3xl" />

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-0 w-full">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <!-- Text -->
        <div>
          <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/15 text-brand-orange text-xs font-semibold tracking-wide uppercase mb-6">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-orange" />
            Disponible à Moanda
          </span>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
            Votre taxi à<br>
            <span class="text-brand-orange">Moanda</span>, en un clic
          </h1>
          <p class="mt-5 text-lg text-white/60 max-w-lg leading-relaxed">
            Commandez un VTC en quelques secondes. Suivez votre chauffeur en temps réel et payez simplement.
          </p>
          <div class="mt-8 flex flex-wrap gap-4">
            <a href="#telecharger" class="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold rounded-xl transition-colors shadow-lg shadow-brand-orange/25">
              Commander une course
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <a href="#devenir-chauffeur" class="inline-flex items-center gap-2 px-6 py-3.5 border-2 border-white/20 hover:border-white/40 text-white font-semibold rounded-xl transition-colors">
              Devenir chauffeur
            </a>
          </div>
          <!-- Stats -->
          <div class="mt-12 flex gap-10">
            <div>
              <p class="text-2xl font-extrabold text-white">500+</p>
              <p class="text-sm text-white/40">Courses / mois</p>
            </div>
            <div>
              <p class="text-2xl font-extrabold text-white">50+</p>
              <p class="text-sm text-white/40">Chauffeurs actifs</p>
            </div>
            <div>
              <p class="text-2xl font-extrabold text-white">3</p>
              <p class="text-sm text-white/40">Villes couvertes</p>
            </div>
          </div>
        </div>

        <!-- Phone mockup -->
        <div class="hidden lg:flex justify-center">
          <div class="relative">
            <!-- Phone frame -->
            <div class="w-[280px] h-[560px] rounded-[3rem] border-[6px] border-white/10 bg-brand-purple/80 backdrop-blur shadow-2xl flex flex-col items-center overflow-hidden">
              <!-- Status bar -->
              <div class="w-full px-6 pt-4 pb-2 flex items-center justify-between">
                <span class="text-[10px] text-white/60 font-medium">9:41</span>
                <div class="w-20 h-5 bg-white/10 rounded-full" />
                <div class="flex gap-1">
                  <div class="w-3 h-3 rounded-sm bg-white/30" />
                  <div class="w-3 h-3 rounded-sm bg-white/30" />
                </div>
              </div>
              <!-- App content placeholder -->
              <div class="flex-1 w-full px-4 py-4 flex flex-col">
                <div class="text-white font-bold text-sm mb-3">Bonjour, Richard</div>
                <div class="text-white/50 text-xs mb-4">Où allez-vous ?</div>
                <!-- Search bar -->
                <div class="bg-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2 mb-4">
                  <svg class="w-4 h-4 text-brand-orange" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <span class="text-xs text-white/40">Rechercher une destination...</span>
                </div>
                <!-- Map placeholder -->
                <div class="flex-1 rounded-2xl bg-white/5 relative overflow-hidden">
                  <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 1px 1px, white 0.5px, transparent 0); background-size: 20px 20px;" />
                  <!-- Pin -->
                  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                    <div class="w-6 h-6 bg-brand-orange rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                      <div class="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <div class="w-0.5 h-3 bg-brand-orange mx-auto" />
                  </div>
                  <!-- Nearby drivers -->
                  <div class="absolute top-[35%] left-[30%] w-4 h-4 bg-brand-purple rounded-full border border-white/50 flex items-center justify-center">
                    <svg class="w-2.5 h-2.5 text-brand-orange" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6H7l-4 8h2l1-2h8l1 2h2l-4-8z" /></svg>
                  </div>
                  <div class="absolute top-[55%] left-[65%] w-4 h-4 bg-brand-purple rounded-full border border-white/50 flex items-center justify-center">
                    <svg class="w-2.5 h-2.5 text-brand-orange" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6H7l-4 8h2l1-2h8l1 2h2l-4-8z" /></svg>
                  </div>
                </div>
              </div>
            </div>
            <!-- Glow behind phone -->
            <div class="absolute -inset-10 bg-brand-orange/5 blur-3xl rounded-full -z-10" />
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
      <span class="text-xs text-white/30 uppercase tracking-widest">Découvrir</span>
      <svg class="w-5 h-5 text-white/30" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    </div>
  </section>

  <!-- ===== FONCTIONNALITES ===== -->
  <section id="fonctionnalites" class="py-20 lg:py-28 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-2xl mx-auto mb-14">
        <span class="text-sm font-semibold text-brand-orange uppercase tracking-wider">Fonctionnalités</span>
        <h2 class="mt-3 text-3xl lg:text-4xl font-extrabold text-brand-navy tracking-tight">
          Tout ce qu'il faut pour un trajet parfait
        </h2>
        <p class="mt-4 text-brand-navy/50 leading-relaxed">
          Une application pensée pour simplifier vos déplacements au quotidien, avec toutes les fonctionnalités essentielles.
        </p>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <div
          v-for="f in features"
          :key="f.title"
          class="group p-6 lg:p-8 rounded-2xl border border-gray-100 hover:border-brand-orange/20 hover:shadow-lg hover:shadow-brand-orange/5 transition-all"
        >
          <!-- Icon -->
          <div class="w-12 h-12 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-5 group-hover:bg-brand-orange group-hover:text-white transition-colors">
            <!-- Bolt -->
            <svg v-if="f.icon === 'bolt'" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
            </svg>
            <!-- Map -->
            <svg v-if="f.icon === 'map'" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
            </svg>
            <!-- Wallet -->
            <svg v-if="f.icon === 'wallet'" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1 0-6h.75A2.25 2.25 0 0 1 18 6v0m3 6v6.75A2.25 2.25 0 0 1 18.75 21H5.25A2.25 2.25 0 0 1 3 18.75V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25v6.75Z" />
            </svg>
            <!-- Tag -->
            <svg v-if="f.icon === 'tag'" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />
            </svg>
            <!-- Shield -->
            <svg v-if="f.icon === 'shield'" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            <!-- Headset -->
            <svg v-if="f.icon === 'headset'" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-brand-navy mb-2">{{ f.title }}</h3>
          <p class="text-sm text-brand-navy/50 leading-relaxed">{{ f.desc }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== SERVICES ===== -->
  <section id="services" class="py-20 lg:py-28 bg-brand-lavande">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-2xl mx-auto mb-14">
        <span class="text-sm font-semibold text-brand-orange uppercase tracking-wider">Nos Services</span>
        <h2 class="mt-3 text-3xl lg:text-4xl font-extrabold text-brand-navy tracking-tight">
          Une formule pour chaque besoin
        </h2>
        <p class="mt-4 text-brand-navy/50 leading-relaxed">
          Du trajet quotidien au déplacement premium, choisissez le service qui vous convient.
        </p>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
        <div
          v-for="(s, i) in services"
          :key="s.name"
          :class="[
            'relative bg-white rounded-2xl p-8 flex flex-col transition-all',
            i === 1 ? 'ring-2 ring-brand-orange shadow-xl shadow-brand-orange/10 scale-[1.02]' : 'shadow-sm hover:shadow-lg',
          ]"
        >
          <!-- Badge -->
          <span
            v-if="s.badge"
            class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-orange text-white text-xs font-bold rounded-full shadow"
          >{{ s.badge }}</span>

          <!-- Service icon -->
          <div
            :class="[
              'w-14 h-14 rounded-2xl flex items-center justify-center mb-6',
              i === 0 ? 'bg-brand-navy/5 text-brand-navy' : i === 1 ? 'bg-brand-orange/10 text-brand-orange' : 'bg-brand-purple/10 text-brand-purple',
            ]"
          >
            <!-- Standard car -->
            <svg v-if="i === 0" class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.122-.504 1.122-1.125v-4.5m-16.5 0L5.25 6.75h13.5l2.25 7.5m-16.5 0h16.5" />
            </svg>
            <!-- Comfort sparkle -->
            <svg v-if="i === 1" class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
            </svg>
            <!-- VIP star -->
            <svg v-if="i === 2" class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            </svg>
          </div>

          <h3 class="text-xl font-bold text-brand-navy mb-2">{{ s.name }}</h3>
          <p class="text-sm text-brand-navy/50 leading-relaxed mb-6">{{ s.desc }}</p>

          <!-- Pricing -->
          <div class="mt-auto">
            <div class="flex items-baseline gap-1 mb-1">
              <span class="text-3xl font-extrabold text-brand-navy">{{ s.base }}</span>
              <span class="text-sm text-brand-navy/40 font-medium">FCFA</span>
            </div>
            <p class="text-xs text-brand-navy/40 mb-5">Prise en charge + {{ s.km }} FCFA/km</p>
            <a
              href="#telecharger"
              :class="[
                'block w-full text-center py-3 rounded-xl text-sm font-semibold transition-colors',
                i === 1
                  ? 'bg-brand-orange text-white hover:bg-brand-orange-dark'
                  : 'bg-brand-navy/5 text-brand-navy hover:bg-brand-navy/10',
              ]"
            >Choisir</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== TELECHARGER ===== -->
  <section id="telecharger" class="py-20 lg:py-28 bg-brand-navy overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <!-- Text -->
        <div>
          <span class="text-sm font-semibold text-brand-orange uppercase tracking-wider">Télécharger</span>
          <h2 class="mt-3 text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Téléchargez l'application<br>Taxi Gab
          </h2>
          <p class="mt-4 text-white/50 leading-relaxed max-w-lg">
            Disponible sur Android et iOS. Installez l'application et commandez votre premier trajet en moins d'une minute.
          </p>

          <!-- Store buttons -->
          <div class="mt-8 flex flex-wrap gap-4">
            <!-- Google Play -->
            <a href="#" class="inline-flex items-center gap-3 px-5 py-3 bg-white/10 hover:bg-white/15 rounded-xl transition-colors">
              <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814 13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92Zm10.89 10.893 2.302 2.302-10.937 6.333 8.635-8.635ZM17.76 11.1l2.994 1.733a1 1 0 0 1 0 1.734L17.76 16.3l-2.56-2.56 2.56-2.64ZM5.864 2.658 16.8 9.004l-2.302 2.303L5.864 2.658Z" />
              </svg>
              <div>
                <div class="text-[10px] text-white/50 uppercase leading-none">Disponible sur</div>
                <div class="text-sm font-semibold text-white">Google Play</div>
              </div>
            </a>
            <!-- App Store -->
            <a href="#" class="inline-flex items-center gap-3 px-5 py-3 bg-white/10 hover:bg-white/15 rounded-xl transition-colors">
              <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z" />
              </svg>
              <div>
                <div class="text-[10px] text-white/50 uppercase leading-none">Télécharger sur</div>
                <div class="text-sm font-semibold text-white">App Store</div>
              </div>
            </a>
          </div>

          <!-- QR Code placeholder -->
          <div class="mt-8 flex items-center gap-4">
            <div class="w-20 h-20 rounded-xl bg-white p-2 flex items-center justify-center">
              <div class="w-full h-full rounded bg-brand-navy/10 grid grid-cols-4 grid-rows-4 gap-0.5 p-1">
                <div class="bg-brand-navy rounded-sm" /><div class="bg-brand-navy rounded-sm" /><div class="bg-brand-navy rounded-sm" /><div />
                <div class="bg-brand-navy rounded-sm" /><div /><div class="bg-brand-navy rounded-sm" /><div class="bg-brand-navy rounded-sm" />
                <div class="bg-brand-navy rounded-sm" /><div class="bg-brand-navy rounded-sm" /><div /><div class="bg-brand-navy rounded-sm" />
                <div /><div class="bg-brand-navy rounded-sm" /><div class="bg-brand-navy rounded-sm" /><div class="bg-brand-navy rounded-sm" />
              </div>
            </div>
            <div>
              <p class="text-sm font-medium text-white">Scannez pour télécharger</p>
              <p class="text-xs text-white/40">Ouvrez l'appareil photo de votre téléphone</p>
            </div>
          </div>
        </div>

        <!-- Phone mockup -->
        <div class="hidden lg:flex justify-center">
          <div class="relative">
            <div class="w-[260px] h-[520px] rounded-[3rem] border-[6px] border-white/10 bg-gradient-to-b from-brand-purple to-brand-navy shadow-2xl flex flex-col items-center p-6 pt-10">
              <div class="w-20 h-1.5 bg-white/20 rounded-full mb-8" />
              <div class="w-16 h-16 rounded-2xl bg-brand-orange flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6H7l-4 8h2l1-2h8l1 2h2l-4-8zm-4.4 5L10 7.5 11.4 11H8.6z" />
                </svg>
              </div>
              <span class="text-white font-extrabold text-lg mb-1">Taxi Gab</span>
              <span class="text-white/40 text-xs mb-8">Votre VTC à Moanda</span>
              <div class="w-full space-y-3">
                <div class="h-3 bg-white/10 rounded-full w-full" />
                <div class="h-3 bg-white/10 rounded-full w-3/4" />
                <div class="h-3 bg-white/10 rounded-full w-5/6" />
              </div>
              <div class="mt-auto w-full">
                <div class="h-10 bg-brand-orange/30 rounded-xl w-full" />
              </div>
            </div>
            <div class="absolute -inset-10 bg-brand-orange/5 blur-3xl rounded-full -z-10" />
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== DEVENIR CHAUFFEUR ===== -->
  <section id="devenir-chauffeur" class="py-20 lg:py-28 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <!-- Advantages -->
        <div>
          <span class="text-sm font-semibold text-brand-orange uppercase tracking-wider">Devenir chauffeur</span>
          <h2 class="mt-3 text-3xl lg:text-4xl font-extrabold text-brand-navy tracking-tight">
            Rejoignez la flotte<br>Taxi Gab
          </h2>
          <p class="mt-4 text-brand-navy/50 leading-relaxed max-w-lg">
            Devenez chauffeur partenaire et accédez à une clientèle grandissante à Moanda, Mounana et Bakoumba.
          </p>

          <div class="mt-8 space-y-5">
            <div
              v-for="a in advantages"
              :key="a.title"
              class="flex gap-4"
            >
              <div class="shrink-0 w-10 h-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <h4 class="font-bold text-brand-navy">{{ a.title }}</h4>
                <p class="text-sm text-brand-navy/50">{{ a.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div class="bg-brand-lavande rounded-2xl p-8 lg:p-10">
          <h3 class="text-xl font-bold text-brand-navy mb-6">Postuler maintenant</h3>

          <div v-if="formSubmitted" class="mb-6 p-4 rounded-xl bg-green-50 border border-green-200">
            <div class="flex items-center gap-2 text-green-700">
              <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span class="text-sm font-medium">Votre candidature a bien été envoyée !</span>
            </div>
          </div>

          <form @submit.prevent="submitDriverForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-brand-navy mb-1.5">Nom complet</label>
              <input
                v-model="driverForm.name"
                type="text"
                required
                placeholder="Jean Mouloungui"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm transition-all"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-brand-navy mb-1.5">Téléphone</label>
              <input
                v-model="driverForm.phone"
                type="tel"
                required
                placeholder="+241 XX XX XX XX"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm transition-all"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-brand-navy mb-1.5">Email</label>
              <input
                v-model="driverForm.email"
                type="email"
                required
                placeholder="jean@email.com"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm transition-all"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-brand-navy mb-1.5">Ville</label>
              <select
                v-model="driverForm.city"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm transition-all bg-white"
              >
                <option value="moanda">Moanda</option>
                <option value="mounana">Mounana</option>
                <option value="bakoumba">Bakoumba</option>
              </select>
            </div>
            <button
              type="submit"
              class="w-full py-3 bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold rounded-xl transition-colors shadow-lg shadow-brand-orange/25"
            >
              Postuler
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>
