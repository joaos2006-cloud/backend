/*
 * ARQUIVO: src/middlewares/auth.js  →  MIDDLEWARE DE AUTENTICAÇÃO
 *
 * Middleware = uma função que roda ANTES do controller. Aqui ela funciona como um porteiro:
 *   - sem token válido → barra a requisição com 401
 *   - com token válido → descobre QUEM é o usuário e deixa passar (next)
 *
 * O front envia o token no cabeçalho:   Authorization: Bearer <token>
 *
 * É USADO POR: authRoutes.js (só em /auth/me) e criancaRoutes.js (todas as rotas)
 */
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.headers.authorization; // ex.: "Bearer eyJhbGciOi..."

  // 1) O cabeçalho precisa existir e começar com "Bearer "
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token ausente' });
  }

  try {
    // 2) header.split(' ')[1] pega só o token (depois do "Bearer ").
    //    jwt.verify confere a ASSINATURA (usando o JWT_SECRET) e se NÃO EXPIROU.
    //    Se algo estiver errado, ele lança um erro e cai no catch.
    const payload = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);

    // 3) payload é o que colocamos dentro do token no login ({ id }).
    //    Guardamos em req para o controller usar. ESTE é o id que filtra os dados por usuário.
    req.usuarioId = payload.id;

    next(); // libera: segue para o próximo passo (o controller)
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
};
