/*
 * ARQUIVO: src/seed.js  →  DADOS DE EXEMPLO (rodado à mão, não faz parte da API)
 *
 * Cria um usuário de demonstração com 2 crianças FICTÍCIAS, para você testar sem cadastrar tudo.
 * Uso:  npm run seed      (login: demo@igreja.com / senha 123456)
 * Pode rodar mais de uma vez: se o usuário já existir, ele não duplica (findOrCreate).
 * USA: models/index.js e bcryptjs
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Usuario, Crianca } = require('./models');

(async () => {
  await sequelize.sync();
  const [usuario] = await Usuario.findOrCreate({
    where: { email: 'demo@igreja.com' },
    defaults: { nome: 'Professora Demo', senha_hash: await bcrypt.hash('123456', 10) },
  });

  if ((await Crianca.count({ where: { usuario_id: usuario.id } })) === 0) {
    await Crianca.bulkCreate([
      {
        usuario_id: usuario.id,
        nome: 'Ana Souza (exemplo)',
        data_nascimento: '2021-03-14',
        turma: 'Maternal',
        responsavel: 'Carla Souza',
        telefone_responsavel: '(49) 99999-0001',
        observacoes: 'Alergia a amendoim',
      },
      {
        usuario_id: usuario.id,
        nome: 'Pedro Lima (exemplo)',
        data_nascimento: '2016-08-02',
        turma: 'Juniores',
        responsavel: 'Marcos Lima',
        telefone_responsavel: '(49) 99999-0002',
      },
    ]);
  }
  console.log('Seed concluído. Login: demo@igreja.com / 123456');
  await sequelize.close();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
