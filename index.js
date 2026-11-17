/*
 * ARQUIVO: src/models/index.js  →  JUNTA OS MODELS E DEFINE O RELACIONAMENTO
 *
 * Por que existe? Para os outros arquivos importarem tudo de um lugar só:
 *   const { Usuario, Crianca, sequelize } = require('../models');
 *
 * RELACIONAMENTO (1 usuário : N crianças):
 *   hasMany   → "um usuário TEM MUITAS crianças"
 *   belongsTo → "uma criança PERTENCE A um usuário"
 */
const sequelize = require('../config/banco');
const Usuario = require('./Usuario');
const Crianca = require('./Crianca');

Usuario.hasMany(Crianca, { foreignKey: 'usuario_id', as: 'criancas' });
Crianca.belongsTo(Usuario, { foreignKey: 'usuario_id' });

module.exports = { sequelize, Usuario, Crianca };
