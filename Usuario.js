/*
 * ARQUIVO: src/models/Usuario.js  →  MODELO DA TABELA "usuarios"
 *
 * Um "model" é a descrição de uma tabela em JavaScript. O Sequelize usa isso para:
 *   - criar a tabela (sync), - montar os SELECT/INSERT/UPDATE/DELETE por você.
 *
 * USA: config/banco.js        É USADO POR: models/index.js e controllers
 */
const { DataTypes } = require('sequelize'); // tipos de coluna (INTEGER, STRING...)
const sequelize = require('../config/banco');

const Usuario = sequelize.define(
  'Usuario', // nome do model dentro do código
  {
    // Cada linha abaixo é uma COLUNA da tabela
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }, // chave primária, numeração automática
    nome: { type: DataTypes.STRING(100), allowNull: false }, // allowNull:false = obrigatório
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true }, // unique = não repete e-mail
    senha_hash: { type: DataTypes.STRING(100), allowNull: false }, // NUNCA a senha pura: só o hash do bcrypt
  },
  {
    tableName: 'usuarios', // nome real da tabela no banco
    createdAt: 'created_at', // a coluna de "data de criação" se chama created_at
    updatedAt: false, // não usamos coluna de "última atualização"
  }
);

module.exports = Usuario;
