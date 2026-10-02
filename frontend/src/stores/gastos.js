// frontend/src/stores/gastos.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useUsuarioStore } from './usuario'

const API_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')

export const useGastosStore = defineStore('gastos', () => {
  const usuario = useUsuarioStore()

  const gastos = ref([])
  const isLoading = ref(false)
  const isAdding = ref(false)
  const error = ref(null)
  const erroAcao = ref(null)

  // Getter para calcular o total de gastos
  const totalGastos = computed(() => {
    return gastos.value.reduce((total, gasto) => total + gasto.valor, 0)
  })

  // Ação para buscar os gastos do usuário atual
  async function fetchGastos() {
    gastos.value = []
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.get(`${API_URL}/gastos`, { headers: usuario.cabecalho })
      gastos.value = response.data
    } catch (err) {
      error.value = 'Falha ao buscar gastos. Verifique a API.'
      console.error('Erro ao buscar gastos:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Ação para adicionar um novo gasto
  async function addGasto(gastoData) {
    isAdding.value = true
    erroAcao.value = null
    try {
      const response = await axios.post(`${API_URL}/gastos`, gastoData, { headers: usuario.cabecalho })
      gastos.value.unshift(response.data)
      return true
    } catch (err) {
      erroAcao.value = 'Falha ao adicionar gasto.'
      console.error('Erro ao adicionar gasto:', err)
      return false
    } finally {
      isAdding.value = false
    }
  }

  // Ação para remover um gasto
  async function deleteGasto(id) {
    erroAcao.value = null
    try {
      await axios.delete(`${API_URL}/gastos/${id}`, { headers: usuario.cabecalho })
      // Remove o gasto do array local após a exclusão bem-sucedida na API
      gastos.value = gastos.value.filter(gasto => gasto._id !== id)
      return true
    } catch (err) {
      erroAcao.value = 'Falha ao remover gasto.'
      console.error('Erro ao remover gasto:', err)
      return false
    }
  }

  return { gastos, isLoading, isAdding, error, erroAcao, fetchGastos, addGasto, totalGastos, deleteGasto }
})
