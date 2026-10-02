// frontend/src/stores/feedbacks.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

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

  // Busca feedbacks e acessos para a tela de administração
  async function fetchRegistros() {
    isLoading.value = true
    error.value = null
    try {
      const [resFeedbacks, resAcessos] = await Promise.all([
        axios.get(`${API_URL}/feedbacks`),
        axios.get(`${API_URL}/acessos`)
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
