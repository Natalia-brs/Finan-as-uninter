// frontend/src/stores/usuario.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')

function lerStorage(storage, chave) {
  try { return storage.getItem(chave) } catch { return null }
}
function gravarStorage(storage, chave, valor) {
  try { storage.setItem(chave, valor) } catch { /* storage indisponível */ }
}

export const useUsuarioStore = defineStore('usuario', () => {
  const nome = ref(lerStorage(localStorage, 'usuarioNome') || '')
  const token = ref(lerStorage(localStorage, 'usuarioToken') || '')
  const error = ref(null)
  const cabecalho = computed(() => ({ Authorization: `Bearer ${token.value}` }))

  function guardarSessao(dados) {
    nome.value = dados.nome
    token.value = dados.token
    gravarStorage(localStorage, 'usuarioNome', dados.nome)
    gravarStorage(localStorage, 'usuarioToken', dados.token)
    gravarStorage(sessionStorage, 'acessoRegistrado', '1')
  }

  // Registra o acesso uma vez por sessão do navegador
  async function registrarAcesso() {
    if (!token.value || lerStorage(sessionStorage, 'acessoRegistrado')) return
    try {
      await axios.post(`${API_URL}/acessos`, {}, { headers: cabecalho.value })
      gravarStorage(sessionStorage, 'acessoRegistrado', '1')
    } catch (err) {
      if (err.response?.status === 401) sair()
      else console.error('Erro ao registrar acesso:', err)
    }
  }

  async function entrar(nomeDigitado, senha, criarConta = false) {
    error.value = null
    try {
      const rota = criarConta ? 'cadastro' : 'login'
      const { data } = await axios.post(`${API_URL}/${rota}`, { nome: nomeDigitado.trim(), senha })
      guardarSessao(data)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Falha ao conectar com a API.'
      return false
    }
  }

  function sair() {
    nome.value = ''
    token.value = ''
    try {
      localStorage.removeItem('usuarioNome')
      localStorage.removeItem('usuarioToken')
      sessionStorage.removeItem('acessoRegistrado')
    } catch { /* storage indisponível */ }
  }

  return { nome, token, error, cabecalho, entrar, registrarAcesso, sair }
})
