<script setup>
import { onMounted, ref } from 'vue'
import { useGastosStore } from '@/stores/gastos'

const store = useGastosStore()
const novoGasto = ref({
  descricao: '',
  valor: null,
  categoria: 'Outros'
})
const categorias = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Outros']

// Função assíncrona que contém a lógica de rede (Adicionar Gasto)
const submitGasto = async () => {
  const success = await store.addGasto({
    ...novoGasto.value,
    valor: parseFloat(novoGasto.value.valor)
  })

  if (success) {
    novoGasto.value.descricao = ''
    novoGasto.value.valor = null
    novoGasto.value.categoria = 'Outros'
  }
}

// Função síncrona que o template vai chamar no @submit.prevent
const handleSubmit = () => {
  if (!novoGasto.value.descricao || !novoGasto.value.valor) {
    alert('Preencha a descrição e o valor.')
    return
  }
  
  submitGasto()
}

// NOVO: Função para remover um gasto (inclui confirmação)
const removeGasto = (id) => {
    // Confirmação antes de excluir
    if (confirm('Tem certeza que deseja remover este gasto?')) {
        store.deleteGasto(id)
    }
}

// Busca os gastos ao carregar a página
onMounted(() => {
  store.fetchGastos()
})

// Função para formatar a data e o horário (formato dd/mm/yyyy hh:mm)
function formatDate(dateString) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleString('pt-BR', options);
}
</script>

<template>
  <div class="container">
    <h1>Controle de Gastos Vue/Node</h1>

    <div class="card total-card">
        <h2>Total de Gastos</h2>
        <p class="total-valor">R$ {{ store.totalGastos.toFixed(2) }}</p>
    </div>

    <div class="card form-card">
      <h2>Novo Gasto</h2>
      <form @submit.prevent="handleSubmit"> 
        <div class="input-group">
          <label for="descricao">Descrição</label>
          <input type="text" id="descricao" v-model="novoGasto.descricao" required>
        </div>
        
        <div class="input-group">
          <label for="valor">Valor (R$)</label>
          <input type="number" id="valor" v-model.number="novoGasto.valor" step="0.01" required min="0.01">
        </div>
        
        <div class="input-group">
          <label for="categoria">Categoria</label>
          <select id="categoria" v-model="novoGasto.categoria">
            <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
        
        <p v-if="store.erroAcao" class="error-message">Erro: {{ store.erroAcao }}</p>

        <button type="submit" class="btn-primary" :disabled="store.isAdding">
            {{ store.isAdding ? 'Adicionando...' : 'Adicionar Gasto' }}
        </button>
      </form>
    </div>

    <div class="card list-card">
      <h2>Gastos Recentes</h2>
      
      <p v-if="store.isLoading">Carregando gastos...</p>
      <p v-else-if="store.error" class="error-message">Erro: {{ store.error }}</p>
      
      <ul v-else-if="store.gastos.length > 0">
        <li v-for="gasto in store.gastos" :key="gasto._id">
          <div class="gasto-details">
            <span class="gasto-descricao">{{ gasto.descricao }}</span>
            <span class="gasto-categoria">{{ gasto.categoria }}</span>
          </div>
          
          <div class="gasto-actions">
            <div class="gasto-info">
              <span class="gasto-valor">R$ {{ gasto.valor.toFixed(2) }}</span>
              <span class="gasto-data">{{ formatDate(gasto.data) }}</span>
            </div>
            <button @click="removeGasto(gasto._id)" class="btn-delete" title="Remover Gasto">
                &times;
            </button>
          </div>
        </li>
      </ul>
      <p v-else>Nenhum gasto cadastrado ainda.</p>
    </div>
  </div>
</template>

<style scoped>
/* AJUSTE: Aumento do max-width para dar mais espaço aos inputs */
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
.input-group { margin-bottom: 15px; }
.input-group label { display: block; font-weight: bold; margin-bottom: 5px; color: #555; }
.input-group input, .input-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.btn-primary {
  background: #42b883;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}
.btn-primary:hover:not(:disabled) { background: #348f6c; }
.btn-primary:disabled { background: #a5a5a5; cursor: not-allowed; }

/* Estilo para o Cartão de Total */
.total-card {
    background: #f1f8e9; 
    border-left: 5px solid #66bb6a;
    text-align: center;
}
.total-valor {
    font-size: 2.2em;
    font-weight: bold;
    color: #388e3c; 
    margin: 10px 0 0 0;
}

/* LISTA DE GASTOS */
ul { list-style: none; padding: 0; }
li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px dashed #eee;
}
/* Detalhes do Gasto (Descrição e Categoria) */
.gasto-details {
  display: flex; 
  flex-direction: column; 
  align-items: flex-start;
  flex-grow: 1; 
}
.gasto-descricao { 
  font-weight: bold; 
  color: #2c3e50; 
  margin-bottom: 3px;
}
.gasto-categoria { 
  font-size: 0.8em; 
  color: #7f8c8d; 
  padding: 2px 5px;
  background-color: #ecf0f1; 
  border-radius: 3px;
}

/* Ações (Valor, Data e Botão de Deletar) */
.gasto-actions {
    display: flex;
    align-items: center;
}
.gasto-info {
  text-align: right;
  margin-right: 15px; /* Espaço entre info e botão de deletar */
}
.gasto-valor { font-weight: bold; color: #e74c3c; display: block; }
.gasto-data { font-size: 0.9em; color: #7f8c8d; display: block; margin-top: 3px; }

/* Botão de Excluir - NOVO ESTILO */
.btn-delete {
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 50%; /* Faz o botão ser redondo */
    width: 30px;
    height: 30px;
    font-size: 1.5em;
    line-height: 1;
    cursor: pointer;
    transition: background 0.3s;
    flex-shrink: 0; 
    padding: 0;
}
.btn-delete:hover {
    background: #c0392b;
}

.error-message { color: #c0392b; font-weight: bold; padding: 10px; background: #fbecec; border: 1px solid #c0392b; border-radius: 4px; }
</style>
