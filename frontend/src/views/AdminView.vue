<script setup>
import { ref } from 'vue'
import { useAdminStore } from '@/stores/admin'
import RegistrosView from './RegistrosView.vue'

const admin = useAdminStore()
const senhaDigitada = ref('')
const entrando = ref(false)

const entrar = async () => {
  if (!senhaDigitada.value) return
  entrando.value = true
  await admin.entrar(senhaDigitada.value)
  entrando.value = false
  senhaDigitada.value = ''
}
</script>

<template>
  <div v-if="admin.logado">
    <div class="admin-barra">
      <span>Modo administrador</span>
      <button class="btn-sair-admin" @click="admin.sair()">Sair do admin</button>
    </div>
    <RegistrosView admin />
  </div>

  <div v-else class="container">
    <div class="card form-card">
      <h2>Área do Administrador</h2>
      <p>Digite a senha de administrador para ver os acessos e feedbacks de todos os usuários.</p>
      <form @submit.prevent="entrar">
        <label for="senha-admin">Senha</label>
        <input id="senha-admin" v-model="senhaDigitada" type="password" required autofocus>
        <p v-if="admin.error" class="error-message">{{ admin.error }}</p>
        <button type="submit" class="btn-primary" :disabled="entrando">
          {{ entrando ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: Arial, sans-serif;
}
.card {
  background: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.form-card { border-left: 5px solid #34495e; }
h2 { color: #2c3e50; margin-top: 0; }
label { display: block; font-weight: bold; margin-bottom: 5px; color: #555; }
input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  margin-bottom: 15px;
}
.btn-primary {
  background: #34495e;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-primary:disabled { background: #a5a5a5; cursor: not-allowed; }
.error-message { color: #c0392b; font-weight: bold; padding: 10px; background: #fbecec; border: 1px solid #c0392b; border-radius: 4px; }

.admin-barra {
  max-width: 900px;
  width: calc(100% - 40px);
  margin: 20px auto 0;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #34495e;
  color: #ecf0f1;
  border-radius: 6px;
  box-sizing: border-box;
}
.btn-sair-admin {
  background: transparent;
  color: #ecf0f1;
  border: 1px solid #ecf0f1;
  border-radius: 4px;
  padding: 3px 10px;
  cursor: pointer;
}
</style>
