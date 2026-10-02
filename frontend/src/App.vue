<script setup>
import { onMounted, ref } from 'vue'
import { RouterView, RouterLink } from 'vue-router'
import { useUsuarioStore } from '@/stores/usuario'

const usuario = useUsuarioStore()
const nomeDigitado = ref('')
const senhaDigitada = ref('')
const criarConta = ref(false)
const enviando = ref(false)

const entrar = async () => {
  if (!nomeDigitado.value.trim() || !senhaDigitada.value) return
  enviando.value = true
  const ok = await usuario.entrar(nomeDigitado.value, senhaDigitada.value, criarConta.value)
  enviando.value = false
  if (ok) {
    nomeDigitado.value = ''
    senhaDigitada.value = ''
  }
}

const alternarModo = () => {
  criarConta.value = !criarConta.value
  usuario.error = null
}

// Registra o acesso de quem já se identificou antes
onMounted(() => {
  usuario.registrarAcesso()
})
</script>

<template>
  <div id="app">
    <header class="main-header">
      <h1>💰 Minhas Finanças</h1>
      <nav v-if="usuario.token" class="main-nav">
        <RouterLink to="/">Gastos</RouterLink>
        <RouterLink to="/feedback">Dar feedback</RouterLink>
        <RouterLink to="/registros">Meus registros</RouterLink>
        <RouterLink to="/admin">Admin</RouterLink>
        <span class="usuario-nome">Olá, {{ usuario.nome }}</span>
        <button class="btn-sair" @click="usuario.sair()">Sair</button>
      </nav>
    </header>

    <main v-if="!usuario.token" class="identificacao">
      <div class="identificacao-card">
        <h2>{{ criarConta ? 'Criar conta' : 'Bem-vindo(a)!' }}</h2>
        <p>{{ criarConta ? 'Escolha um nome e uma senha para usar o sistema.' : 'Entre com seu nome e senha.' }}</p>
        <form @submit.prevent="entrar">
          <label for="nome-usuario">Seu nome</label>
          <input id="nome-usuario" v-model="nomeDigitado" type="text" maxlength="80" required autofocus>
          <label for="senha-usuario">Senha</label>
          <input id="senha-usuario" v-model="senhaDigitada" type="password" minlength="4" required
            :autocomplete="criarConta ? 'new-password' : 'current-password'">
          <p v-if="usuario.error" class="erro-login">{{ usuario.error }}</p>
          <button type="submit" :disabled="enviando">
            {{ enviando ? 'Aguarde...' : (criarConta ? 'Criar conta' : 'Entrar') }}
          </button>
        </form>
        <p class="alternar-modo">
          {{ criarConta ? 'Já tem conta?' : 'Primeira vez aqui?' }}
          <button type="button" class="link" @click="alternarModo">
            {{ criarConta ? 'Entrar' : 'Criar conta' }}
          </button>
        </p>
      </div>
    </main>

    <RouterView v-else />

    <footer class="main-footer">
      <p>&copy; 2025 Projeto Uninter - Extensão</p>
    </footer>
  </div>
</template>

<style>
body {
  margin: 0;
  background-color: #f4f7f6;
  font-family: Arial, sans-serif;
  color: #333;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-header {
  background-color: #34495e;
  color: white;
  padding: 15px 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.main-header h1 {
  margin: 0;
  font-size: 1.5em;
}

.main-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 10px;
}

.main-nav a {
  color: #ecf0f1;
  text-decoration: none;
  padding: 4px 8px;
  border-radius: 4px;
}

.main-nav a.router-link-exact-active {
  background-color: #42b883;
}

.usuario-nome {
  font-size: 0.9em;
  color: #bdc3c7;
}

.btn-sair {
  background: transparent;
  color: #ecf0f1;
  border: 1px solid #ecf0f1;
  border-radius: 4px;
  padding: 3px 10px;
  cursor: pointer;
}

.identificacao {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

.identificacao-card {
  background: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-left: 5px solid #42b883;
  width: 100%;
  max-width: 400px;
}

.identificacao-card h2 { margin-top: 0; color: #2c3e50; }
.identificacao-card label { display: block; font-weight: bold; margin-bottom: 5px; color: #555; }
.identificacao-card input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  margin-bottom: 15px;
}
.erro-login { color: #c0392b; font-weight: bold; margin: 0 0 15px; }
.alternar-modo { margin: 15px 0 0; font-size: 0.9em; color: #555; }
.identificacao-card .alternar-modo .link {
  background: none;
  color: #42b883;
  padding: 0;
  text-decoration: underline;
}
.identificacao-card button:disabled { background: #a5a5a5; cursor: not-allowed; }
.identificacao-card button {
  background: #42b883;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.main-footer {
  margin-top: auto;
  background-color: #ecf0f1;
  color: #7f8c8d;
  padding: 10px 20px;
  text-align: center;
  font-size: 0.8em;
  border-top: 1px solid #ddd;
}
</style>
