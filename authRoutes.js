/*
 * ARQUIVO: src/routes/authRoutes.js  →  ROTAS DE AUTENTICAÇÃO
 *
 * Rota = "quando chegar ESTE método + ESTE caminho, execute ESTA função".
 * O prefixo /auth é definido no app.js, então aqui o caminho é só o final.
 *
 * É CHAMADO POR: app.js        CHAMA: middlewares/auth.js e controllers/authController.js
 */
const router = require('express').Router(); // mini-aplicação só para agrupar rotas
const auth = require('../middlewares/auth');
const controller = require('../controllers/authController');

router.post('/register', controller.register); // POST /auth/register → pública
router.post('/login', controller.login); // POST /auth/login    → pública
router.get('/me', auth, controller.me); // GET  /auth/me       → protegida (passa pelo middleware antes)

module.exports = router;
