/*
 * ARQUIVO: src/app.js  →  CONFIGURAÇÃO DO EXPRESS
 *
 * Aqui montamos a "esteira" por onde passa TODA requisição:
 *   CORS → leitura do JSON → rotas → (se nada responder) 404 → (se der erro) tratador de erros
 * A ORDEM dos app.use() importa: o Express executa de cima para baixo.
 *
 * É CHAMADO POR: server.js
 * CHAMA: routes/authRoutes.js e routes/criancaRoutes.js
 */
const express = require('express');
const cors = require('cors');

const app = express(); // cria a aplicação

/* ---------- CORS ----------
 * Por segurança o navegador só deixa um site (o front) chamar a API se a API
 * disser "esse endereço pode". Essa permissão é o CORS.
 * FRONTEND_URL (no .env) guarda o(s) endereço(s) liberado(s), separados por vírgula.
 */
const origens = (process.env.FRONTEND_URL || '')
  .split(',') // separa por vírgula
  .map((o) => o.trim().replace(/\/$/, '')) // tira espaços e a barra final
  .filter(Boolean); // remove itens vazios

app.use(
  cors({
    origin(origin, callback) {
      // "origin" vazio = ferramentas como Insomnia/Postman (não são navegadores): liberamos.
      // Com origin = navegador: só passa se estiver na lista.
      if (!origin || origens.includes(origin)) return callback(null, true);
      return callback(new Error('Origem não permitida pelo CORS'));
    },
  })
);

// Faz o Express entender corpo de requisição em JSON e colocar em req.body
app.use(express.json());

// Rota de teste: abrir a URL da API no navegador mostra que ela está viva
app.get('/', (req, res) => res.json({ status: 'ok', api: 'Check-in Ministério Infantil' }));

// Cada prefixo entrega as requisições para um arquivo de rotas:
app.use('/auth', require('./routes/authRoutes')); // /auth/register, /auth/login, /auth/me
app.use('/criancas', require('./routes/criancaRoutes')); // /criancas, /criancas/:id ...

// Se chegou aqui, nenhuma rota respondeu: o caminho não existe
app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));

/* ---------- Tratador de erros ----------
 * Qualquer controller que chamar next(erro) cai aqui.
 * Tem 4 parâmetros (err, req, res, next): é assim que o Express reconhece um tratador de erros.
 * Nunca devolvemos detalhes internos ao usuário (poderiam expor segredos).
 */
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON inválido' });
  if (err.message === 'Origem não permitida pelo CORS') return res.status(403).json({ erro: err.message });
  console.error(err); // o detalhe real fica só no log do servidor
  res.status(500).json({ erro: 'Erro interno do servidor' }); // o usuário vê algo genérico
});

module.exports = app; // exporta para o server.js usar
