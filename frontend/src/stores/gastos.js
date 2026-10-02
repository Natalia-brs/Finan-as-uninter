// frontend/src/stores/gastos.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')

export const useGastosStore = defineStore('gastos', () => {
  const gastos = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Getter para calcular o total de gastos
  const totalGastos = computed(() => {
    return gastos.value.reduce((total, gasto) => total + gasto.valor, 0)
  })

  // Ação para buscar todos os gastos
  async function fetchGastos() {
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.get(`${API_URL}/gastos`)
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
    try {
      const response = await axios.post(`${API_URL}/gastos`, gastoData)
      gastos.value.unshift(response.data)
      return true
    } catch (err) {
      error.value = 'Falha ao adicionar gasto.'
      console.error('Erro ao adicionar gasto:', err)
      return false
    }
  }
  
  // Ação para remover um gasto - NOVA AÇÃO
  async function deleteGasto(id) {
      error.value = null; 
      try {
          await axios.delete(`${API_URL}/gastos/${id}`)
          // Remove o gasto do array local após a exclusão bem-sucedida na API
          gastos.value = gastos.value.filter(gasto => gasto._id !== id)
          return true
      } catch (err) {
          error.value = 'Falha ao remover gasto.'
          console.error('Erro ao remover gasto:', err)
          return false
      }
  }


  // Inclua a nova ação no retorno
  return { gastos, isLoading, error, fetchGastos, addGasto, totalGastos, deleteGasto }
})