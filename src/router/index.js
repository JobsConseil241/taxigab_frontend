import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../layouts/VitrineLayout.vue'),
    meta: { public: true },
    children: [
      { path: '', name: 'Vitrine', component: () => import('../views/vitrine/LandingPage.vue') },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/dashboard',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { auth: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('../views/DashboardView.vue') },
      { path: 'live', name: 'LiveRides', component: () => import('../views/LiveRidesView.vue') },
      { path: 'revenue', name: 'Revenue', component: () => import('../views/RevenueView.vue') },
      { path: 'rides', name: 'Rides', component: () => import('../views/RidesView.vue') },
      { path: 'drivers', name: 'Drivers', component: () => import('../views/DriversView.vue') },
      { path: 'users', name: 'Users', component: () => import('../views/UsersView.vue') },
      { path: 'admins', name: 'Admins', component: () => import('../views/AdminsView.vue') },
      { path: 'formulas', name: 'Formulas', component: () => import('../views/FormulasView.vue') },
      { path: 'vehicles', name: 'Vehicles', component: () => import('../views/VehiclesView.vue') },
      { path: 'settings', name: 'Settings', component: () => import('../views/SettingsView.vue') },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (to.matched.some(r => r.meta.public)) return
  const token = localStorage.getItem('taxigab_admin_token')
  if (to.meta.auth && !token) return { name: 'Login' }
  if (to.meta.guest && token) return { name: 'Dashboard' }
})

export default router
