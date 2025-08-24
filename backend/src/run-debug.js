//  
import { PrismaClient } from "@prisma/client"; // <-- CORREÇÃO AQUI
import { debugUserBetStatus } from "./debug-bet-status.js"

const prisma = new PrismaClient();

async function main() {
  const userIdToDebug = "aeae36f7-8726-4368-9889-789bff5d5b56"; // Substitua pelo ID real do usuário
  // Para que debugUserBetStatus possa interagir com o Prisma, você precisa passar a instância do prisma para ele
  // O script debug-bet-status.js que te dei não espera o prisma como argumento, ele apenas mostra as queries
  // Para realmente executar as queries, você precisaria modificar debug-bet-status.js para aceitar 'prisma' como argumento
  // Por enquanto, o script apenas imprimirá as queries que você pode rodar manualmente no seu banco.
  await debugUserBetStatus(userIdToDebug); 
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
