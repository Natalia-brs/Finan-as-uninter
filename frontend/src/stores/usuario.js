// frontend/src/stores/usuario.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

function lerStorage(storage, chave) {
  try { return storage.getItem(chave) } catch { return null }
}
function gravarStorage(storage, chave, valor) {
  try { storage.setItem(chave, valor) } catch { /* storage indisponível */ }
}

export const useUsuarioStore = defineStore('usuario', () => {
  const nome = ref(lerStorage(localStorage, 'usuarioNome') || '')

  // Registra o acesso uma vez por sessão do navegador
  async function registrarAcesso() {
    if (!nome.value || lerStorage(sessionStorage, 'acessoRegistrado')) return
    try {
      await axios.post(`${API_URL}/acessos`, { nome: nome.value })
      gravarStorage(sessionStorage, 'acessoRegistrado', '1')
    } catch (err) {
      console.error('Erro ao registrar acesso:', err)
    }
  }

  async function identificar(novoNome) {
    nome.value = novoNome.trim()
    gravarStorage(localStorage, 'usuarioNome', nome.value)
    await registrarAcesso()
  }

  function sair() {
    nome.value = ''
    try {
      localStorage.removeItem('usuarioNome')
      sessionStorage.removeItem('acessoRegistrado')
    } catch { /* storage indisponível */ }
  }

  return { nome, identificar, registrarAcesso, sair }
})
