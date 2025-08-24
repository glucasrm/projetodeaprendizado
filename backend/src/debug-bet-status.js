// debug-bet-status.js - Script para investigar o problema de apostas ativas

// Este script simula a lógica de checkActiveUserBets para debug
// Execute no console do navegador ou como script Node.js

const debugUserBetStatus = async (userId) => {
  console.log(`🔍 Debugando status de apostas para usuário: ${userId}`);
  
  try {
    // 1. Verificar apostas diretas (directBet)
    console.log('\n📋 Verificando apostas diretas (directBet):');
    
    // Simular query: SELECT * FROM directBet WHERE playerId = userId AND status IN ('WAITING_OPPONENT', 'MATCHED')
    const activeBetsQuery = `
      SELECT id, status, gameSlug, betAmount, createdAt, matchId 
      FROM directBet 
      WHERE playerId = '${userId}' 
      AND status IN ('WAITING_OPPONENT', 'MATCHED')
      ORDER BY createdAt DESC
    `;
    console.log('Query para apostas ativas:', activeBetsQuery);
    
    // 2. Verificar partidas ativas (match)
    console.log('\n🎮 Verificando partidas ativas (match):');
    
    // Simular query: SELECT * FROM match WHERE (player1Id = userId OR player2Id = userId) AND status IN ('PENDING_CONFIRMATION', 'IN_PROGRESS')
    const activeMatchesQuery = `
      SELECT id, status, gameSlug, betAmount, createdAt 
      FROM match 
      WHERE (player1Id = '${userId}' OR player2Id = '${userId}') 
      AND status IN ('PENDING_CONFIRMATION', 'IN_PROGRESS')
      ORDER BY createdAt DESC
    `;
    console.log('Query para partidas ativas:', activeMatchesQuery);
    
    // 3. Verificar se usuário é admin
    console.log('\n👑 Verificando se usuário é admin:');
    const userQuery = `
      SELECT id, isAdmin 
      FROM User 
      WHERE id = '${userId}'
    `;
    console.log('Query para verificar admin:', userQuery);
    
    console.log('\n⚠️ POSSÍVEIS CAUSAS DO PROBLEMA:');
    console.log('1. Apostas com status WAITING_OPPONENT ou MATCHED não finalizadas');
    console.log('2. Partidas com status PENDING_CONFIRMATION ou IN_PROGRESS não finalizadas');
    console.log('3. Campo isAdmin não existe ou está null');
    console.log('4. Dados inconsistentes no banco (apostas órfãs)');
    console.log('5. Cache ou transação não commitada');
    
    console.log('\n🔧 COMANDOS PARA INVESTIGAR NO BANCO:');
    console.log('-- Verificar apostas do usuário:');
    console.log(`SELECT * FROM directBet WHERE playerId = '${userId}' ORDER BY createdAt DESC LIMIT 10;`);
    
    console.log('\n-- Verificar partidas do usuário:');
    console.log(`SELECT * FROM match WHERE player1Id = '${userId}' OR player2Id = '${userId}' ORDER BY createdAt DESC LIMIT 10;`);
    
    console.log('\n-- Verificar se é admin:');
    console.log(`SELECT id, isAdmin FROM User WHERE id = '${userId}';`);
    
    console.log('\n-- Limpar apostas órfãs (CUIDADO - apenas para debug):');
    console.log(`UPDATE directBet SET status = 'COMPLETED' WHERE playerId = '${userId}' AND status IN ('WAITING_OPPONENT', 'MATCHED');`);
    
  } catch (error) {
    console.error('❌ Erro no debug:', error);
  }
};

// Para usar no frontend (console do navegador):
if (typeof window !== 'undefined') {
  window.debugUserBetStatus = debugUserBetStatus;
  console.log('✅ Função debugUserBetStatus disponível no console');
  console.log('💡 Use: debugUserBetStatus("SEU_USER_ID_AQUI")');
}

// Para usar no backend (Node.js):
if (typeof module !== 'undefined') {
  module.exports = { debugUserBetStatus };
}

// Função adicional para verificar dados específicos
const checkSpecificUserData = async (userId) => {
  console.log(`\n🎯 Verificação específica para usuário: ${userId}`);
  
  // Simular as queries exatas que o código faz
  console.log('\n1️⃣ Query de apostas ativas (exata do código):');
  console.log(`
    const activeBets = await prisma.directBet.findMany({
      where: {
        playerId: '${userId}',
        status: {
          in: ['WAITING_OPPONENT', 'MATCHED']
        }
      },
      include: {
        match: {
          select: {
            id: true,
            status: true,
            gameSlug: true,
            betAmount: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  `);
  
  console.log('\n2️⃣ Query de partidas ativas (exata do código):');
  console.log(`
    const activeMatches = await prisma.match.findMany({
      where: {
        OR: [
          { player1Id: '${userId}' },
          { player2Id: '${userId}' }
        ],
        status: {
          in: ['PENDING_CONFIRMATION', 'IN_PROGRESS']
        }
      },
      select: {
        id: true,
        status: true,
        gameSlug: true,
        betAmount: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  `);
  
  console.log('\n3️⃣ Query de usuário (exata do código):');
  console.log(`
    const user = await prisma.user.findUnique({
      where: { id: '${userId}' },
      select: { id: true, isAdmin: true }
    });
  `);
};

export { debugUserBetStatus };

