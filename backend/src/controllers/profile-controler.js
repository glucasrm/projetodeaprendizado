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
  // Rota pública de perfil por username
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
      select: { // Adicionando select para garantir que userId seja incluído
        userId: true, // <-- Adicionado para garantir que o ID do usuário seja retornado
        username: true,
        avatar: true,
        banner: true,
        bio: true,
        user: {
          select: {
            nome: true,
            socialLinks: true,
            // Adicione balance e isAdmin aqui se o perfil público precisar dessas informações.
            // Geralmente, o perfil público não exibe saldo ou status de admin.
            // balance: true,
            // isAdmin: true,
          },
        },
      },
    });

    if (!profile) {
      return reply.status(404).send({ message: 'Perfil não encontrado' });
    }

    return reply.send(profile);
  });



  // Rota para buscar o perfil do usuário autenticado
  app.get(
    '/',
    { preHandler: [app.authenticate] }, // Protege a rota com autenticação
    async (request, reply) => {
      const userId = request.user.id; // Obtém o ID do usuário autenticado do token

      if (!userId) {
        // Esta validação é redundante se o preHandler app.authenticate funcionar corretamente,
        // mas é um bom fallback.
        return reply.status(401).send({ error: 'Usuário não autenticado.' });
      }

      try {
        // AJUSTE AQUI: Buscar o usuário diretamente para obter balance e isAdmin,
        // e incluir o perfil relacionado.
        const user = await request.server.prisma.user.findUnique({
          where: { id: userId },
          include: {
            profile: { // Inclui o perfil do usuário
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
          // Isso não deve acontecer se o JWT for válido e o user ID existir,
          // mas é um bom fallback.
          return reply.status(404).send({ error: 'Usuário não encontrado.' });
        }

        // Retorna os dados combinados do usuário e do perfil
        return reply.status(200).send({
          userId: user.id,
          username: user.profile?.username || null, // Se o perfil não foi criado, username será null
          avatar: user.profile?.avatar || null,
          banner: user.profile?.banner || null,
          bio: user.profile?.bio || null,
          balance: user.balance, // <-- AGORA INCLUÍDO!
          isAdmin: user.isAdmin, // <-- AGORA INCLUÍDO!
          nome: user.nome, // Exemplo, se você quiser o nome também
          socialLinks: user.socialLinks // Exemplo, se você quiser os links sociais
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
    { preHandler: [app.authenticate] }, // Protege a rota com autenticação
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

      const userId = request.user.id; // Obtém o ID do usuário autenticado

      // Validação do Username
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

      // Validação da Bio
      if (bio && bio.length > 160) {
        return reply.status(400).send({ error: 'A bio não pode exceder 160 caracteres.' });
      }

      try {
        // Verifica se o username já está em uso por OUTRO usuário
        const existingProfileWithUsername = await request.server.prisma.profile.findUnique({
          where: { username: normalizedUsername },
        });

        if (existingProfileWithUsername && existingProfileWithUsername.userId !== userId) {
          return reply.status(400).send({ error: 'Username já em uso por outro usuário.' });
        }

        // Lógica de UPSERT
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

        // Retorne o objeto do perfil atualizado, incluindo o userId
        return reply.send({
          message: 'Perfil atualizado com sucesso.',
          profile: {
            userId: updatedProfile.userId, // Garante que o userId seja retornado
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