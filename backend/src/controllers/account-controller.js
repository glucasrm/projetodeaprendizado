export async function accountRoutes(app) {
  // Rota para buscar as informações pessoais do usuário
  app.get(
    '/account-info',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const userId = request.user.id;

      try {
        const user = await request.server.prisma.user.findUnique({
          where: { id: userId },
          select: {
            nome: true,
            sobrenome: true,
            email: true,
            telefone: true,
            dataNascimento: true,
            genero: true,
          },
        });

        if (!user) {
          return reply.status(404).send({ error: 'Usuário não encontrado.' });
        }

        return reply.send(user);
      } catch (error) {
        console.error('Erro ao buscar informações pessoais:', error);
        return reply.status(500).send({ error: 'Erro interno ao buscar informações pessoais.' });
      }
    }
  );

  // Rota para atualizar as informações pessoais do usuário
  app.post(
    '/account-info',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const userId = request.user.id;
      const { nome, sobrenome, telefone, dataNascimento, genero } = request.body;

      try {
        const updatedUser = await request.server.prisma.user.update({
          where: { id: userId },
          data: {
            nome: nome || undefined,
            sobrenome: sobrenome || undefined,
            telefone: telefone || undefined,
            dataNascimento: dataNascimento ? new Date(dataNascimento) : undefined,
            genero: genero || undefined,
          },
        });

        return reply.send({
          message: 'Informações pessoais atualizadas com sucesso.',
          user: {
            nome: updatedUser.nome,
            sobrenome: updatedUser.sobrenome,
            email: updatedUser.email,
            telefone: updatedUser.telefone,
            dataNascimento: updatedUser.dataNascimento,
            genero: updatedUser.genero,
          },
        });
      } catch (error) {
        console.error('Erro ao atualizar informações pessoais:', error);
        return reply.status(500).send({ error: 'Erro interno ao atualizar informações pessoais.' });
      }
    }
  );
}
