    // src/controllers/profile-controller.js
    import { randomUUID } from 'crypto';
    import fs from 'fs';
    import path from 'path';
    import util from 'util';
    import { pipeline } from 'stream';


    const pump = util.promisify(pipeline);

    /**
     * Salva arquivo no disco local
     */
    async function saveFile(part, folder = 'uploads') {
      const ext = path.extname(part.filename);
      const filename = `${randomUUID()}${ext}`;
      const uploadDir = path.resolve(`./public/${folder}`);

      // Cria a pasta, se não existir
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const filepath = path.join(uploadDir, filename);
      await pump(part.file, fs.createWriteStream(filepath));
      return `/public/${folder}/${filename}`; // URL que será salva no banco ou retornada
    }

    export async function profileRoutes(app) {
      // Rota pública de perfil por username (mantida, mas não será usada para userId)
      app.get('/public/:encodedUsername', async (request, reply) => {
        const { encodedUsername } = request.params;

        // Decode Base64
        let username;
        try {
          username = Buffer.from(encodedUsername, 'base64').toString('utf8');
        } catch (error) {
          return reply.status(400).send({ message: 'Username inválido na URL.' });
        }

        // Buscar o perfil pelo username decodificado
        const profile = await app.prisma.profile.findUnique({
          where: { username },
          select: {
            userId: true,
            username: true,
            avatar: true,
            banner: true,
            bio: true,
            user: {
              select: {
                nome: true,
                socialLinks: true,
              },
            },
          },
        });

        if (!profile) {
          return reply.status(404).send({ message: 'Perfil não encontrado' });
        }

        return reply.send(profile);
      });

      // NOVA Rota pública de perfil por userId (UUID)
      app.get('/public/id/:userId', async (request, reply) => {
        const { userId } = request.params;
        app.log.info(`Requisição de perfil público para userId: ${userId}`); // Log para verificar o ID

        try {
          // Buscar o perfil pelo userId
          const profile = await app.prisma.profile.findUnique({
            where: { userId: userId }, // Buscar pelo userId diretamente
            select: {
              userId: true,
              username: true,
              avatar: true,
              banner: true,
              bio: true,
              user: { // Certifique-se de que o relacionamento 'user' está configurado corretamente no Prisma Schema
                select: {
                  nome: true,
                  socialLinks: true,
                },
              },
            },
          });

          if (!profile) {
            app.log.warn(`Perfil não encontrado para o ID: ${userId}`); // Log se o perfil não for encontrado
            return reply.status(404).send({ message: 'Perfil não encontrado para o ID fornecido' });
          }

          app.log.info(`Perfil encontrado para o ID: ${userId}`); // Log se o perfil for encontrado
          return reply.send(profile);
        } catch (error) {
          app.log.error(`Erro ao buscar perfil por ID (${userId}):`, error); // Log detalhado do erro
          return reply.status(500).send({
            error: 'Erro interno do servidor ao buscar perfil.',
            details: error.message // Inclua a mensagem de erro para depuração
          });
        }
      });


      // Rota para buscar o perfil do usuário autenticado
      app.get(
        '/',
        { preHandler: [app.authenticate] },
        async (request, reply) => {
          const userId = request.user.sub;

          if (!userId) {
            return reply.status(401).send({ error: 'Usuário não autenticado.' });
          }

          try {
            const user = await request.server.prisma.user.findUnique({
              where: { id: userId },
              include: {
                profile: {
                  select: {
                    username: true,
                    avatar: true,
                    banner: true,
                    bio: true,
                  }
                }
              },
            });

            if (!user) {
              return reply.status(404).send({ error: 'Usuário não encontrado.' });
            }

            return reply.status(200).send({
              userId: user.id,
              username: user.profile?.username || null,
              avatar: user.profile?.avatar || null,
              banner: user.profile?.banner || null,
              bio: user.profile?.bio || null,
              balance: user.balance,
              isAdmin: user.isAdmin,
              nome: user.nome,
              socialLinks: user.socialLinks
            });
          } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            return reply.status(500).send({ error: 'Erro interno do servidor ao buscar perfil.' });
          }
        }
      );

      // Rota para criar ou atualizar o perfil do usuário
      app.post(
        '/',
        { preHandler: [app.authenticate] },
        async function (request, reply) {
          const parts = request.parts();

          let avatar = null;
          let banner = null;
          let username = '';
          let bio = '';

          for await (const part of parts) {
            if (part.file) {
              if (part.fieldname === 'avatar') {
                avatar = await saveFile(part, 'avatars');
              } else if (part.fieldname === 'banner') {
                banner = await saveFile(part, 'banners');
              }
            } else {
              if (part.fieldname === 'username') username = part.value;
              if (part.fieldname === 'bio') bio = part.value;
            }
          }

          const userId = request.user.sub;

          if (!username || !username.trim()) {
            return reply.status(400).send({ error: 'Username é obrigatório.' });
          }

          const normalizedUsername = username.trim().toLowerCase();

          if (normalizedUsername.length < 3 || normalizedUsername.length > 20) {
            return reply.status(400).send({ error: 'Username deve ter entre 3 e 20 caracteres.' });
          }

          const isValidUsername = /^[a-z0-9_]+$/.test(normalizedUsername);
          if (!isValidUsername) {
            return reply.status(400).send({ error: 'Username só pode conter letras minúsculas, números e underscore.' });
          }

          if (bio && bio.length > 160) {
            return reply.status(400).send({ error: 'A bio não pode exceder 160 caracteres.' });
          }

          try {
            const existingProfileWithUsername = await request.server.prisma.profile.findUnique({
              where: { username: normalizedUsername },
            });

            if (existingProfileWithUsername && existingProfileWithUsername.userId !== userId) {
              return reply.status(400).send({ error: 'Username já em uso por outro usuário.' });
            }

            const updatedProfile = await request.server.prisma.profile.upsert({
              where: { userId: userId },
              update: {
                username: normalizedUsername,
                avatar: avatar || undefined,
                banner: banner || undefined,
                bio: bio || undefined,
              },
              create: {
                userId: userId,
                username: normalizedUsername,
                avatar: avatar,
                banner: banner,
                bio: bio,
              },
            });

            return reply.send({
              message: 'Perfil atualizado com sucesso.',
              profile: {
                userId: updatedProfile.userId,
                username: updatedProfile.username,
                avatar: updatedProfile.avatar,
                banner: updatedProfile.banner,
                bio: updatedProfile.bio,
              },
            });
          } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
              return reply.status(400).send({ error: 'Username já em uso.' });
            }
            return reply.status(500).send({ error: 'Erro interno do servidor ao atualizar perfil.' });
          }
        }
      );
    }
    