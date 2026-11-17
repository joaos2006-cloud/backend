/*
 * ARQUIVO: src/controllers/criancaController.js  →  LÓGICA DO CRUD DAS CRIANÇAS
 *
 * Funções: listar, detalhar, criar, atualizar, excluir, checkin, checkout.
 * REGRA DE OURO deste arquivo: toda consulta filtra por usuario_id = req.usuarioId.
 * Assim cada professor só enxerga e mexe nas PRÓPRIAS crianças.
 *
 * É CHAMADO POR: routes/criancaRoutes.js (depois do middleware auth.js)    USA: models (Crianca)
 */
const { Crianca } = require('../models');

/* ---------- Validação ----------
 * Confere os campos que vieram do front. Retorna { erro } se algo estiver errado
 * ou { dados } com os campos já limpos (sem espaços e só os permitidos).
 * Pegamos campo por campo (não usamos req.body inteiro) para ninguém "injetar" campos como usuario_id.
 */
function validar(body) {
  const nome = String(body.nome || '').trim();
  const responsavel = String(body.responsavel || '').trim();
  const turma = String(body.turma || '');
  const nascimento = String(body.data_nascimento || '');
  const telefone = String(body.telefone_responsavel || '').trim();
  const observacoes = String(body.observacoes || '').trim();

  if (nome.length < 2) return { erro: 'Informe o nome da criança' };
  if (responsavel.length < 2) return { erro: 'Informe o nome do responsável' };
  if (!Crianca.TURMAS.includes(turma)) {
    return { erro: `Turma inválida. Use: ${Crianca.TURMAS.join(', ')}` };
  }
  // Data no formato AAAA-MM-DD e que realmente exista (Date.parse devolve NaN se for inválida)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(nascimento) || isNaN(Date.parse(nascimento))) {
    return { erro: 'Data de nascimento inválida (use AAAA-MM-DD)' };
  }
  if (new Date(nascimento) > new Date()) return { erro: 'A data de nascimento não pode ser futura' };
  if (telefone && !/^[\d\s()+-]{8,20}$/.test(telefone)) return { erro: 'Telefone inválido' };

  return {
    dados: {
      nome,
      responsavel,
      turma,
      data_nascimento: nascimento,
      telefone_responsavel: telefone || null, // vazio vira NULL no banco
      observacoes: observacoes || null,
    },
  };
}

/* ---------- Busca segura de UMA criança ----------
 * Usada por detalhar, atualizar, excluir, checkin e checkout.
 * 1) confere se o :id da URL é um número válido (400)
 * 2) procura a criança com ESSE id E que seja DESTE usuário (404 se não achar)
 * Se o id existir mas for de outro usuário, o resultado é o mesmo: 404.
 * Retorna a criança, ou null depois de já ter respondido o erro.
 */
async function buscarPropria(req, res) {
  const id = Number(req.params.id); // req.params.id vem da URL (/criancas/5 → "5")
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ erro: 'Identificador inválido' });
    return null;
  }
  const crianca = await Crianca.findOne({ where: { id, usuario_id: req.usuarioId } });
  if (!crianca) {
    res.status(404).json({ erro: 'Criança não encontrada' });
    return null;
  }
  return crianca;
}

/* GET /criancas → lista só as do usuário, em ordem alfabética */
exports.listar = async (req, res, next) => {
  try {
    const criancas = await Crianca.findAll({
      where: { usuario_id: req.usuarioId },
      order: [['nome', 'ASC']],
    });
    res.json(criancas);
  } catch (err) {
    next(err);
  }
};

/* GET /criancas/:id → detalhe de uma */
exports.detalhar = async (req, res, next) => {
  try {
    const crianca = await buscarPropria(req, res);
    if (crianca) res.json(crianca); // se for null, a resposta de erro já foi enviada
  } catch (err) {
    next(err);
  }
};

/* POST /criancas → cadastra */
exports.criar = async (req, res, next) => {
  try {
    const { erro, dados } = validar(req.body);
    if (erro) return res.status(400).json({ erro });

    // usuario_id vem do TOKEN, nunca do corpo: o usuário não consegue cadastrar em nome de outro
    const crianca = await Crianca.create({ ...dados, usuario_id: req.usuarioId });
    res.status(201).json(crianca);
  } catch (err) {
    next(err);
  }
};

/* PUT /criancas/:id → edita */
exports.atualizar = async (req, res, next) => {
  try {
    const crianca = await buscarPropria(req, res);
    if (!crianca) return;

    const { erro, dados } = validar(req.body);
    if (erro) return res.status(400).json({ erro });

    await crianca.update(dados); // UPDATE no banco
    res.json(crianca);
  } catch (err) {
    next(err);
  }
};

/* DELETE /criancas/:id → exclui */
exports.excluir = async (req, res, next) => {
  try {
    const crianca = await buscarPropria(req, res);
    if (!crianca) return;
    await crianca.destroy(); // DELETE no banco
    res.json({ mensagem: 'Criança excluída' });
  } catch (err) {
    next(err);
  }
};

/* POST /criancas/:id/checkin → marca presença e grava a hora */
exports.checkin = async (req, res, next) => {
  try {
    const crianca = await buscarPropria(req, res);
    if (!crianca) return;
    if (crianca.status === 'presente') {
      return res.status(409).json({ erro: 'A criança já está com check-in feito' });
    }
    await crianca.update({ status: 'presente', ultimo_checkin: new Date() });
    res.json(crianca);
  } catch (err) {
    next(err);
  }
};

/* POST /criancas/:id/checkout → marca a saída */
exports.checkout = async (req, res, next) => {
  try {
    const crianca = await buscarPropria(req, res);
    if (!crianca) return;
    if (crianca.status === 'ausente') {
      return res.status(409).json({ erro: 'A criança não está com check-in ativo' });
    }
    await crianca.update({ status: 'ausente' });
    res.json(crianca);
  } catch (err) {
    next(err);
  }
};
