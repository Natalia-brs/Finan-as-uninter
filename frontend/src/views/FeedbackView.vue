<script setup>
import { ref } from 'vue'
import { useUsuarioStore } from '@/stores/usuario'
import { useFeedbacksStore } from '@/stores/feedbacks'

const usuario = useUsuarioStore()
const store = useFeedbacksStore()

const opcoesFacilidade = ['Muito fácil', 'Fácil', 'Razoável', 'Difícil']
const enviando = ref(false)
const enviado = ref(false)
const feedback = ref({
  nota: 0,
  facilidade: '',
  recomendaria: true,
  comentario: ''
})

const handleSubmit = async () => {
  if (!feedback.value.nota || !feedback.value.facilidade) {
    alert('Escolha uma nota e a facilidade de uso.')
    return
  }

  enviando.value = true
  const success = await store.enviarFeedback({
    ...feedback.value,
    nome: usuario.nome
  })
  enviando.value = false

  if (success) {
    enviado.value = true
    feedback.value = { nota: 0, facilidade: '', recomendaria: true, comentario: '' }
  }
}
</script>

<template>
  <div class="container">
    <h1>Avalie o Sistema</h1>

    <div v-if="enviado" class="card sucesso-card">
      <h2>Obrigado pelo feedback! 🙏</h2>
      <p>Sua opinião foi registrada e vai ajudar a melhorar o projeto.</p>
      <button class="btn-primary" @click="enviado = false">Enviar outro feedback</button>
    </div>

    <div v-else class="card form-card">
      <h2>Sua opinião</h2>
      <form @submit.prevent="handleSubmit">
        <div class="input-group">
          <label>Nome</label>
          <input type="text" :value="usuario.nome" disabled>
        </div>

        <div class="input-group">
          <label>Nota geral para o sistema</label>
          <div class="estrelas" role="radiogroup" aria-label="Nota de 1 a 5">
            <button
              v-for="n in 5"
              :key="n"
              type="button"
              role="radio"
              :aria-checked="feedback.nota === n"
              :aria-label="`${n} de 5`"
              :class="['estrela', { ativa: n <= feedback.nota }]"
              @click="feedback.nota = n"
            >★</button>
          </div>
        </div>

        <div class="input-group">
          <label for="facilidade">O sistema foi fácil de usar?</label>
          <select id="facilidade" v-model="feedback.facilidade" required>
            <option disabled value="">Selecione</option>
            <option v-for="op in opcoesFacilidade" :key="op" :value="op">{{ op }}</option>
          </select>
        </div>

        <div class="input-group">
          <label>Você recomendaria para alguém?</label>
          <label class="radio"><input type="radio" v-model="feedback.recomendaria" :value="true"> Sim</label>
          <label class="radio"><input type="radio" v-model="feedback.recomendaria" :value="false"> Não</label>
        </div>

        <div class="input-group">
          <label for="comentario">Comentários e sugestões</label>
          <textarea id="comentario" v-model="feedback.comentario" rows="4" maxlength="1000"></textarea>
        </div>

        <p v-if="store.error" class="error-message">Erro: {{ store.error }}</p>

        <button type="submit" class="btn-primary" :disabled="enviando">
          {{ enviando ? 'Enviando...' : 'Enviar Feedback' }}
        </button>
      </form>
    </div>
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
.sucesso-card { border-left: 5px solid #66bb6a; background: #f1f8e9; text-align: center; }
h2 { color: #2c3e50; margin-top: 0; padding-bottom: 10px; margin-bottom: 20px; }
.input-group { margin-bottom: 15px; }
.input-group > label { display: block; font-weight: bold; margin-bottom: 5px; color: #555; }
.input-group input[type="text"], .input-group select, .input-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-family: inherit;
}
.radio { display: inline-block; margin-right: 20px; font-weight: normal; }
.estrelas { display: flex; gap: 5px; }
.estrela {
  background: none;
  border: none;
  font-size: 2em;
  color: #ccc;
  cursor: pointer;
  padding: 0;
}
.estrela.ativa { color: #f1c40f; }
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
.error-message { color: #c0392b; font-weight: bold; padding: 10px; background: #fbecec; border: 1px solid #c0392b; border-radius: 4px; }
</style>
