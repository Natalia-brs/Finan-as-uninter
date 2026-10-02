// frontend/src/stores/feedbacks.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useUsuarioStore } from './usuario'
import { useAdminStore } from './admin'

const API_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')

export const useFeedbacksStore = defineStore('feedbacks', () => {
  const feedbacks = ref([])
  const acessos = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  async function enviarFeedback(dados) {
    error.value = null
    try {
      await axios.post(`${API_URL}/feedbacks`, dados)
      return true
    } catch (err) {
      error.value = 'Falha ao enviar feedback.'
      console.error('Erro ao enviar feedback:', err)
      return false
    }
  }

  // Busca feedbacks e acessos: o admin vê os de todos, o usuário só os próprios
  async function fetchRegistros({ admin = false } = {}) {
    feedbacks.value = []
    acessos.value = []
    isLoading.value = true
    error.value = null
    const config = admin
      ? { headers: { 'x-admin-senha': useAdminStore().senha } }
      : { params: { usuario: useUsuarioStore().nome } }
    try {
      const [resFeedbacks, resAcessos] = await Promise.all([
        axios.get(`${API_URL}/feedbacks`, config),
        axios.get(`${API_URL}/acessos`, config)
      ])
      feedbacks.value = resFeedbacks.data
      acessos.value = resAcessos.data
    } catch (err) {
      error.value = 'Falha ao buscar registros. Verifique a API.'
      console.error('Erro ao buscar registros:', err)
    } finally {
      isLoading.value = false
    }
  }

  return { feedbacks, acessos, isLoading, error, enviarFeedback, fetchRegistros }
})
