import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

export default fp(async function (fastify, opts) {
  const prisma = new PrismaClient();
  await prisma.$connect();
  fastify.decorate('prisma', prisma);
  fastify.addHook('onClose', async (instance, done) => {
    await fastify.prisma.$disconnect();
    done();
  });
});