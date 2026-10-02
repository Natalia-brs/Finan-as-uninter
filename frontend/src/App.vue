<script setup>
import { onMounted, ref } from 'vue'
import { RouterView, RouterLink } from 'vue-router'
import { useUsuarioStore } from '@/stores/usuario'

const usuario = useUsuarioStore()
const nomeDigitado = ref('')

const entrar = async () => {
  if (!nomeDigitado.value.trim()) return
  await usuario.identificar(nomeDigitado.value)
  nomeDigitado.value = ''
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
      <nav v-if="usuario.nome" class="main-nav">
        <RouterLink to="/">Gastos</RouterLink>
        <RouterLink to="/feedback">Dar feedback</RouterLink>
        <RouterLink to="/registros">Registros</RouterLink>
        <span class="usuario-nome">Olá, {{ usuario.nome }}</span>
        <button class="btn-sair" @click="usuario.sair()">Sair</button>
      </nav>
    </header>

    <main v-if="!usuario.nome" class="identificacao">
      <div class="identificacao-card">
        <h2>Bem-vindo(a)!</h2>
        <p>Informe seu nome para começar a usar o sistema.</p>
        <form @submit.prevent="entrar">
          <label for="nome-usuario">Seu nome</label>
          <input id="nome-usuario" v-model="nomeDigitado" type="text" maxlength="80" required autofocus>
          <button type="submit">Entrar</button>
        </form>
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
