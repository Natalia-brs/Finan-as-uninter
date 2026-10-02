<script setup>
import { computed, onMounted } from 'vue'
import { useFeedbacksStore } from '@/stores/feedbacks'

const store = useFeedbacksStore()

const mediaNotas = computed(() => {
  if (!store.feedbacks.length) return '-'
  const soma = store.feedbacks.reduce((total, f) => total + f.nota, 0)
  return (soma / store.feedbacks.length).toFixed(1)
})

const usuariosUnicos = computed(() => new Set(store.acessos.map(a => a.nome.toLowerCase())).size)

onMounted(() => {
  store.fetchRegistros()
})

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}
</script>

<template>
  <div class="container">
    <h1>Registros de Uso</h1>

    <p v-if="store.isLoading">Carregando registros...</p>
    <p v-else-if="store.error" class="error-message">Erro: {{ store.error }}</p>

    <template v-else>
      <div class="resumo">
        <div class="card resumo-card">
          <span class="resumo-valor">{{ store.acessos.length }}</span>
          <span>Acessos</span>
        </div>
        <div class="card resumo-card">
          <span class="resumo-valor">{{ usuariosUnicos }}</span>
          <span>Usuários</span>
        </div>
        <div class="card resumo-card">
          <span class="resumo-valor">{{ store.feedbacks.length }}</span>
          <span>Feedbacks</span>
        </div>
        <div class="card resumo-card">
          <span class="resumo-valor">{{ mediaNotas }}</span>
          <span>Nota média</span>
        </div>
      </div>

      <div class="card list-card">
        <h2>Fluxo de Acessos</h2>
        <div class="tabela-scroll">
          <table v-if="store.acessos.length > 0">
            <thead>
              <tr><th>Usuário</th><th>Data e horário</th></tr>
            </thead>
            <tbody>
              <tr v-for="acesso in store.acessos" :key="acesso._id">
                <td>{{ acesso.nome }}</td>
                <td>{{ formatDateTime(acesso.dataHora) }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else>Nenhum acesso registrado ainda.</p>
        </div>
      </div>

      <div class="card form-card">
        <h2>Feedbacks Recebidos</h2>
        <ul v-if="store.feedbacks.length > 0">
          <li v-for="fb in store.feedbacks" :key="fb._id">
            <div class="fb-topo">
              <strong>{{ fb.nome }}</strong>
              <span class="fb-data">{{ formatDateTime(fb.data) }}</span>
            </div>
            <div class="fb-detalhes">
              <span class="estrelas" :aria-label="`Nota ${fb.nota} de 5`">{{ '★'.repeat(fb.nota) }}{{ '☆'.repeat(5 - fb.nota) }}</span>
              <span class="tag">{{ fb.facilidade }}</span>
              <span class="tag">{{ fb.recomendaria ? 'Recomendaria' : 'Não recomendaria' }}</span>
            </div>
            <p v-if="fb.comentario" class="fb-comentario">"{{ fb.comentario }}"</p>
          </li>
        </ul>
        <p v-else>Nenhum feedback recebido ainda.</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}
h1 { text-align: center; color: #34495e; margin-bottom: 30px; }
.card {
  background: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}
.form-card { border-left: 5px solid #42b883; }
.list-card { border-left: 5px solid #3498db; }
h2 { color: #2c3e50; margin-top: 0; padding-bottom: 10px; margin-bottom: 20px; }

.resumo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}
.resumo-card {
  margin-bottom: 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  color: #7f8c8d;
  padding: 15px;
}
.resumo-valor { font-size: 2em; font-weight: bold; color: #2c3e50; }

.tabela-scroll { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 10px; border-bottom: 1px solid #eee; }
th { background: #ecf0f1; color: #2c3e50; }

ul { list-style: none; padding: 0; margin: 0; }
li { padding: 15px 0; border-bottom: 1px dashed #eee; }
.fb-topo { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 5px; }
.fb-data { font-size: 0.9em; color: #7f8c8d; }
.fb-detalhes { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 5px; }
.estrelas { color: #f1c40f; font-size: 1.2em; }
.tag {
  font-size: 0.8em;
  color: #7f8c8d;
  padding: 2px 5px;
  background-color: #ecf0f1;
  border-radius: 3px;
}
.fb-comentario { margin: 8px 0 0; color: #555; font-style: italic; }
.error-message { color: #c0392b; font-weight: bold; padding: 10px; background: #fbecec; border: 1px solid #c0392b; border-radius: 4px; }
</style>
