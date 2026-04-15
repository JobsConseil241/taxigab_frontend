import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { auth: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('../views/DashboardView.vue') },
      { path: 'rides', name: 'Rides', component: () => import('../views/RidesView.vue') },
      { path: 'drivers', name: 'Drivers', component: () => import('../views/DriversView.vue') },
      { path: 'users', name: 'Users', component: () => import('../views/UsersView.vue') },
      { path: 'formulas', name: 'Formulas', component: () => import('../views/FormulasView.vue') },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const token = localStorage.getItem('taxigab_admin_token')
  if (to.meta.auth && !token) return { name: 'Login' }
  if (to.meta.guest && token) return { name: 'Dashboard' }
})

export default router
