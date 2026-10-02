// frontend/src/stores/admin.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')

function lerSenha() {
  try { return sessionStorage.getItem('adminSenha') || '' } catch { return '' }
}

export const useAdminStore = defineStore('admin', () => {
  // A senha fica só na sessão do navegador; fechar a aba encerra o acesso de admin
  const senha = ref(lerSenha())
  const logado = computed(() => !!senha.value)
  const error = ref(null)

  async function entrar(senhaDigitada) {
    error.value = null
    try {
      await axios.get(`${API_URL}/admin`, { headers: { 'x-admin-senha': senhaDigitada } })
      senha.value = senhaDigitada
      try { sessionStorage.setItem('adminSenha', senhaDigitada) } catch { /* storage indisponível */ }
      return true
    } catch (err) {
      error.value = err.response?.status === 401 ? 'Senha incorreta.' : 'Falha ao conectar com a API.'
      return false
    }
  }

  function sair() {
    senha.value = ''
    try { sessionStorage.removeItem('adminSenha') } catch { /* storage indisponível */ }
  }

  return { senha, logado, error, entrar, sair }
})
