/*
 * ARQUIVO: src/config/banco.js  →  CONEXÃO COM O BANCO (PostgreSQL / Supabase)
 *
 * Cria UM objeto "sequelize" que representa a conexão. Todos os models usam esse mesmo objeto.
 * Os dados de conexão vêm do .env: assim a senha nunca fica no código.
 *
 * É CHAMADO POR: os models (Usuario.js, Crianca.js) e models/index.js
 */
require('dotenv').config();
const { Sequelize } = require('sequelize'); // Sequelize = o ORM (traduz JavaScript em SQL)

// Opções comuns às duas formas de conexão
const opcoes = {
  dialect: 'postgres', // qual banco estamos usando (o driver "pg" faz a conversa de fato)
  logging: false, // true mostraria cada SQL no terminal (bom para estudar!)
  // Bancos em nuvem (Supabase) exigem conexão criptografada (SSL)
  dialectOptions: process.env.DB_SSL === 'true' ? { ssl: { require: true, rejectUnauthorized: false } } : {},
};

// Duas formas de configurar: uma URL única (Supabase) OU variáveis separadas (Postgres local)
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, opcoes) // ex.: postgresql://usuario:senha@host:5432/postgres
  : new Sequelize(
      process.env.DB_NAME || 'ministerio_infantil', // nome do banco
      process.env.DB_USER || 'postgres', // usuário
      process.env.DB_PASSWORD || '', // senha
      { ...opcoes, host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT) || 5432 }
    );

module.exports = sequelize;
