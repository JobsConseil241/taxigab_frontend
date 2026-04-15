import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('taxigab_admin_token') || '')
  const loading = ref(false)
  const error = ref('')

  const isLoggedIn = computed(() => !!token.value)

  async function login(email, password) {
    loading.value = true
    error.value = ''
    try {
      const { data } = await api.post('/auth/login', {
        email,
        password,
        device_name: 'admin-panel',
      })
      token.value = data.token
      user.value = data.user
      localStorage.setItem('taxigab_admin_token', data.token)
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur de connexion'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      const { data } = await api.get('/auth/me')
      user.value = data.user
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('taxigab_admin_token')
  }

  return { user, token, loading, error, isLoggedIn, login, fetchMe, logout }
})
