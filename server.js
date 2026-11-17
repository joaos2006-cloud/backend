/*
 * ARQUIVO: server.js  →  PONTO DE ENTRADA DA API
 *
 * É o único arquivo que você executa (node server.js ou npm run dev).
 * Ele NÃO tem regras do sistema; só prepara tudo e "liga" o servidor:
 *   1. carrega o .env            2. confere o segredo do JWT
 *   3. conecta no banco          4. cria as tabelas (se faltarem)
 *   5. começa a escutar uma porta
 *
 * CHAMA: src/app.js (o Express configurado) e src/models/index.js (banco).
 */
require('dotenv').config(); // lê o arquivo .env e coloca as variáveis em process.env
const app = require('./src/app'); // o Express já configurado (rotas, CORS...)
const { sequelize } = require('./src/models'); // a conexão com o banco

// Em hospedagem (Render) a porta vem do ambiente; local usamos 3000
const PORT = process.env.PORT || 3000;

async function iniciar() {
  try {
    // Sem segredo não dá para assinar/conferir tokens: melhor nem iniciar
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET não definido no ambiente');

    await sequelize.authenticate(); // testa a conexão com o banco (PostgreSQL)
    await sequelize.sync(); // cria as tabelas a partir dos models SE ainda não existirem (não apaga dados)

    // Começa a ouvir requisições. A partir daqui a API está no ar.
    app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
  } catch (erro) {
    // Se algo falhar (banco fora, .env errado), mostra o motivo e encerra
    console.error('Falha ao iniciar a API:', erro.message);
    process.exit(1);
  }
}

iniciar();
