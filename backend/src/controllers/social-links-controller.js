
export async function socialLinksRoutes(app) {
  // GET - Listar todas as redes sociais do usuário
  app.get('/social-links', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = request.user.id;
    const socialLinks = await request.server.prisma.socialLink.findMany({
      where: { userId },
    });
    return reply.send(socialLinks);
  });

  // POST - Adicionar nova rede social
  app.post('/social-links', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = request.user.id;
    const { platform, url } = request.body;
    const allowedPlatforms = ['discord', 'instagram', 'youtube', 'facebook'];

    if (!allowedPlatforms.includes(platform)) {
      return reply.status(400).send({ error: 'Plataforma inválida.' });
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return reply.status(400).send({ error: 'URL inválida.' });
    }

    const newLink = await request.server.prisma.socialLink.create({
      data: { userId, platform, url },
    });

    return reply.send({ message: 'Rede social adicionada com sucesso.', socialLink: newLink });
  });

  // PUT - Editar link de uma rede social existente
  app.put('/social-links/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = request.user.id;
    const { id } = request.params;
    const { url } = request.body;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return reply.status(400).send({ error: 'URL inválida.' });
    }

    try {
      const updatedLink = await request.server.prisma.socialLink.updateMany({
        where: { id, userId },
        data: { url },
      });

      if (updatedLink.count === 0) {
        return reply.status(404).send({ error: 'Rede social não encontrada ou não pertence ao usuário.' });
      }

      return reply.send({ message: 'Rede social atualizada com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar social link:', error);
      return reply.status(500).send({ error: 'Erro interno ao atualizar.' });
    }
  });

  // DELETE - Excluir rede social
  app.delete('/social-links/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = request.user.id;
    const { id } = request.params;

    try {
      const deletedLink = await request.server.prisma.socialLink.deleteMany({
        where: { id, userId },
      });

      if (deletedLink.count === 0) {
        return reply.status(404).send({ error: 'Rede social não encontrada ou não pertence ao usuário.' });
      }

      return reply.send({ message: 'Rede social excluída com sucesso.' });
    } catch (error) {
      console.error('Erro ao deletar social link:', error);
      return reply.status(500).send({ error: 'Erro interno ao deletar.' });
    }
  });
}
