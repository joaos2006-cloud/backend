/*
 * ARQUIVO: src/controllers/authController.js  →  LÓGICA DE CADASTRO E LOGIN
 *
 * Controller = o "cérebro" de uma rota: recebe a requisição (req), valida, usa o model e responde (res).
 * Funções aqui: register (criar conta), login (entrar), me (quem sou eu).
 *
 * É CHAMADO POR: routes/authRoutes.js          USA: models (Usuario), bcryptjs, jsonwebtoken
 */
const bcrypt = require('bcryptjs'); // transforma a senha em HASH (e compara depois)
const jwt = require('jsonwebtoken'); // cria e confere tokens
const { Usuario } = require('../models');

// Expressão regular simples para conferir o formato "algo@algo.algo"
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Escolhe os campos que podem sair na resposta. NUNCA inclui senha ou hash.
function dadosPublicos(u) {
  return { id: u.id, nome: u.nome, email: u.email };
}

/* ---------- POST /auth/register ---------- */
exports.register = async (req, res, next) => {
  try {
    // req.body é o JSON enviado pelo front. String(...) garante texto; trim() tira espaços.
    const nome = String(req.body.nome || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase(); // minúsculo para não duplicar por maiúscula
    const senha = String(req.body.senha || '');

    // Validação no servidor (400 = entrada inválida). Nunca confie só na validação do front!
    if (nome.length < 2) return res.status(400).json({ erro: 'Informe o nome (mínimo 2 caracteres)' });
    if (!EMAIL_REGEX.test(email)) return res.status(400).json({ erro: 'E-mail inválido' });
    if (senha.length < 6) return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres' });

    // Já existe alguém com esse e-mail? → 409 (conflito)
    if (await Usuario.findOne({ where: { email } })) {
      return res.status(409).json({ erro: 'E-mail já cadastrado' });
    }

    // Hash: transforma a senha num texto irreversível. O 10 é o "custo" (quanto maior, mais lento e seguro).
    const senha_hash = await bcrypt.hash(senha, 10);

    const usuario = await Usuario.create({ nome, email, senha_hash }); // INSERT no banco
    res.status(201).json(dadosPublicos(usuario)); // 201 = criado
  } catch (err) {
    // Se dois cadastros simultâneos passarem pela checagem acima, o banco (UNIQUE) ainda segura
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ erro: 'E-mail já cadastrado' });
    }
    next(err); // erro inesperado → tratador do app.js (responde 500)
  }
};

/* ---------- POST /auth/login ---------- */
exports.login = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const senha = String(req.body.senha || '');

    if (!email || !senha) return res.status(400).json({ erro: 'Informe e-mail e senha' });

    const usuario = await Usuario.findOne({ where: { email } }); // SELECT ... WHERE email = ...

    // bcrypt.compare refaz o hash da senha digitada e compara com o hash guardado
    const ok = usuario && (await bcrypt.compare(senha, usuario.senha_hash));

    // Mesma mensagem para "e-mail não existe" e "senha errada": não revela quais e-mails existem
    if (!ok) return res.status(401).json({ erro: 'E-mail ou senha incorretos' });

    // Cria o TOKEN: guarda o id dentro, assina com o segredo e define validade
    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '2h',
    });

    res.json({ token, usuario: dadosPublicos(usuario) });
  } catch (err) {
    next(err);
  }
};

/* ---------- GET /auth/me ----------
 * Rota protegida: o middleware auth.js já conferiu o token e preencheu req.usuarioId.
 * O front usa isso ao recarregar a página para descobrir quem está logado.
 */
exports.me = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.usuarioId); // busca pela chave primária
    if (!usuario) return res.status(401).json({ erro: 'Usuário não encontrado' });
    res.json(dadosPublicos(usuario));
  } catch (err) {
    next(err);
  }
};
