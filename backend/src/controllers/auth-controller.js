// src/controllers/auth-controller.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const loginUser = async (request, reply) => {
  const { email, senha } = request.body;

  if (!email || !senha) {
    return reply.status(400).send({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const user = await request.server.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return reply.status(401).send({ error: 'Usuário não encontrado.' });
    }

    const senhaCorreta = await bcrypt.compare(senha, user.passwordHash);

    if (!senhaCorreta) {
      return reply.status(401).send({ error: 'Senha incorreta.' });
    }

    const secret = process.env.JWT_SECRET || 'chave_forte_teste';
    console.log("Secret usado para assinatura:", secret); // <-- ADICIONE ESTA LINHA


    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'chave_forte_teste',
      { expiresIn: '1h' }
    );

    return reply.send({
      message: 'Login realizado com sucesso.',
      token,
      user: {
        id: user.id,
        nome: user.nome,
        sobrenome: user.sobrenome,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    return reply.status(500).send({ error: 'Erro no login.' });
  }
};

export const registerUser = async (request, reply) => {
  const { nome, sobrenome, email, telefone, senha } = request.body;

  if (!nome || !sobrenome || !email || !telefone || !senha) {
    return reply.status(400).send({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    const existingUser = await request.server.prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return reply.status(400).send({ error: 'Email já está em uso.' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const user = await request.server.prisma.user.create({
      data: {
        nome,
        sobrenome,
        email,
        telefone,
        passwordHash: hashedPassword,
      },
    });

    return reply.status(201).send({
      message: 'Usuário registrado com sucesso.',
      user: {
        id: user.id,
        nome: user.nome,
        sobrenome: user.sobrenome,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    return reply.status(500).send({ error: 'Erro ao registrar usuário.' });
  }
};