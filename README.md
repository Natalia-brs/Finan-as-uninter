# 💰 Minhas Finanças

Sistema web para controle de gastos pessoais, desenvolvido para a disciplina **Atividade Extensionista II** (Uninter), com foco em educação financeira e inclusão digital na comunidade local.

## Funcionalidades

- Cadastro, listagem e remoção de gastos por categoria
- Total de gastos calculado automaticamente
- Identificação do usuário e registro de acessos (nome, data e horário)
- Formulário de feedback (nota, facilidade de uso, recomendação e comentários)
- Tela de registros com o fluxo de acessos e os feedbacks recebidos

## Tecnologias

- **Frontend:** Vue 3, Vite, Pinia, Vue Router, Axios
- **Backend:** Node.js, Express, Mongoose
- **Banco de dados:** MongoDB
- **Infraestrutura:** Docker e Docker Compose

## Como executar

1. Copie `.env.example` para `.env` e preencha as variáveis.
2. Na raiz do projeto, rode:

```bash
docker compose up --build
```

3. Acesse `http://localhost:5173`.

## Rotas da API

| Método | Rota | Descrição |
|---|---|---|
| GET/POST | `/api/gastos?usuario=nome` | Lista e cadastra os gastos do usuário |
| DELETE | `/api/gastos/:id?usuario=nome` | Remove um gasto do usuário |
| GET/POST | `/api/acessos` | Lista e registra acessos |
| GET/POST | `/api/feedbacks` | Lista e registra feedbacks |
