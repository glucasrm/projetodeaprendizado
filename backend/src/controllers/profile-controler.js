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
        // CORREÇÃO: Buscar o PERFIL pelo userId e garantir que o userId seja selecionado.
        const profile = await request.server.prisma.profile.findUnique({
          where: { userId: userId },
          select: {
            userId: true, // <-- ESSA LINHA É A CHAVE: Inclui o ID do usuário
            username: true,
            avatar: true,
            banner: true,
            bio: true,
            // Você pode incluir o relacionamento com 'User' aqui se precisar de mais dados do usuário principal
            // user: {
            //   select: {
            //     nome: true,
            //     email: true,
            //   }
            // }
          },
        });

        if (!profile) {
          // Se o perfil não for encontrado, retorne um objeto com o userId para o frontend
          return reply.status(200).send({
            userId: userId, // Garante que o ID do usuário sempre seja retornado
            username: null,
            avatar: null,
            banner: null,
            bio: null,
          });
        }

        // Retorna o objeto do perfil que agora inclui o userId
        return reply.send(profile);
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
