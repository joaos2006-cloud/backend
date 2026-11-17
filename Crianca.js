/*
 * ARQUIVO: src/models/Crianca.js  →  MODELO DA TABELA "criancas"
 *
 * É a tabela "do tema" que o professor pediu (a entidade do domínio).
 * A coluna usuario_id é a CHAVE ESTRANGEIRA: liga cada criança ao usuário (professor) que a cadastrou.
 *
 * USA: config/banco.js        É USADO POR: models/index.js e criancaController.js
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/banco');

// Listas fixas (categoria/situação). O controller usa TURMAS para validar o que chega do front.
const TURMAS = ['Berçário', 'Maternal', 'Jardim', 'Juniores', 'Pré-adolescentes'];
const STATUS = ['ausente', 'presente'];

const Crianca = sequelize.define(
  'Crianca',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' }, // FK: aponta para usuarios.id
      onDelete: 'CASCADE', // se o usuário for apagado, as crianças dele também são
    },
    nome: { type: DataTypes.STRING(100), allowNull: false },
    data_nascimento: { type: DataTypes.DATEONLY, allowNull: false }, // só data (sem hora) → campo de DATA exigido
    turma: { type: DataTypes.STRING(30), allowNull: false }, // categoria
    responsavel: { type: DataTypes.STRING(100), allowNull: false },
    telefone_responsavel: { type: DataTypes.STRING(20) }, // sem allowNull:false = opcional
    observacoes: { type: DataTypes.TEXT }, // texto descritivo longo (alergias etc.)
    status: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'ausente' }, // situação: ausente/presente
    ultimo_checkin: { type: DataTypes.DATE }, // data E hora do último check-in
  },
  { tableName: 'criancas', createdAt: 'created_at', updatedAt: false }
);

// Penduramos as listas no model para os controllers poderem usar (Crianca.TURMAS)
Crianca.TURMAS = TURMAS;
Crianca.STATUS = STATUS;

module.exports = Crianca;
