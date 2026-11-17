/*
 * ARQUIVO: src/routes/criancaRoutes.js  →  ROTAS DAS CRIANÇAS
 *
 * O prefixo /criancas é definido no app.js.
 * router.use(auth) coloca o middleware de autenticação ANTES de todas as rotas abaixo:
 * qualquer requisição sem token válido leva 401 e nem chega ao controller.
 *
 * É CHAMADO POR: app.js        CHAMA: middlewares/auth.js e controllers/criancaController.js
 */
const router = require('express').Router();
const auth = require('../middlewares/auth');
const controller = require('../controllers/criancaController');

router.use(auth); // todas as rotas a seguir exigem JWT válido

router.get('/', controller.listar); // GET    /criancas
router.get('/:id', controller.detalhar); // GET    /criancas/5        (":id" vira req.params.id)
router.post('/', controller.criar); // POST   /criancas
router.put('/:id', controller.atualizar); // PUT    /criancas/5
router.delete('/:id', controller.excluir); // DELETE /criancas/5
router.post('/:id/checkin', controller.checkin); // POST   /criancas/5/checkin   (extra)
router.post('/:id/checkout', controller.checkout); // POST   /criancas/5/checkout  (extra)

module.exports = router;
