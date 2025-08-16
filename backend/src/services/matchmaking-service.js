import { PrismaClient } from '@prisma/client';

class MatchmakingService {
   constructor(prisma, notificationService) {
    this.prisma = prisma;
    this.notificationService = notificationService; // Armazena a instância
  }
async findAndCreateMatches() {
  console.log("Executando rotina de matchmaking...");

  // 1. Buscar todas as apostas que estão aguardando um oponente.
  const pendingBets = await this.prisma.directBet.findMany({
    where: { status: 'WAITING_OPPONENT' },
    orderBy: { createdAt: 'asc' },
  });

  // Agrupar apostas por critérios (valor, modalidade, plataforma, jogo)
  const betGroups = new Map();
  for (const bet of pendingBets) {
    // A chave de agrupamento garante que só combinaremos jogadores idênticos
    const key = `${bet.betAmount}-${bet.modality}-${bet.platform}-${bet.gameSlug}`;
    if (!betGroups.has(key)) {
      betGroups.set(key, []);
    }
    betGroups.get(key).push(bet);
  }

  // 2. Iterar sobre os grupos para tentar formar partidas
  for (const [key, bets] of betGroups.entries()) {
    while (bets.length >= 2) {
      const player1Bet = bets.shift();
      const player2Bet = bets.shift();

      // 3. Encontrar um mediador compatível e disponível
      const availableMediator = await this.prisma.mediationRequest.findFirst({
        where: {
          status: 'AVAILABLE',
          modalities: { has: player1Bet.modality }, // 'has' funciona para arrays no Prisma
          platforms: { has: player1Bet.platform },
        },
      });

      if (!availableMediator) {
        console.log(`Jogadores para [${key}] encontrados, mas nenhum mediador disponível. Devolvendo à fila.`);
        // Se não houver mediador, devolvemos os jogadores para o início da fila para a próxima tentativa
        bets.unshift(player1Bet, player2Bet);
        break; // Para de procurar neste grupo e vai para o próximo
      }

      // 4. Temos 2 jogadores e 1 mediador. Vamos criar a partida!
      console.log(`Criando partida para [${key}]...`);
      
try {
        // --- INÍCIO DA ALTERAÇÃO NA TRANSAÇÃO ---
        const { match, player1, player2 } = await this.prisma.$transaction(async (tx) => {
          // Buscamos os nomes dos jogadores dentro da transação
          const p1 = await tx.user.findUnique({ where: { id: player1Bet.playerId }, include: { profile: true } });
          const p2 = await tx.user.findUnique({ where: { id: player2Bet.playerId }, include: { profile: true } });

          const newMatch = await tx.match.create({
            data: {
              player1Id: player1Bet.playerId,
              player2Id: player2Bet.playerId,
              mediatorId: availableMediator.mediatorId,
              betAmount: player1Bet.betAmount,
              modality: player1Bet.modality,
              platform: player1Bet.platform,
              gameSlug: player1Bet.gameSlug, // Adicionado
              status: 'IN_PROGRESS',
            },
          });

          await tx.conversation.create({
            data: {
              matchId: newMatch.id,
              participants: { connect: [{ id: p1.id }, { id: p2.id }, { id: availableMediator.mediatorId }] },
            },
          });

          await tx.directBet.updateMany({
            where: { id: { in: [player1Bet.id, player2Bet.id] } },
            data: { status: 'MATCHED', matchId: newMatch.id },
          });

          await tx.mediationRequest.update({
            where: { id: availableMediator.id },
            data: { status: 'IN_MATCH' },
          });

          // **Criação das Notificações**
          const player1Name = p1.profile?.username || p1.nome;
          const player2Name = p2.profile?.username || p2.nome;
          const mediatorName = availableMediator.mediator.profile?.username || availableMediator.mediator.nome;

          // Notificação para Jogador 1
          await this.notificationService.createNotification(
            p1.id,
            'match_found_player',
            `Seu confronto 🏆 1v1 contra ${player2Name} foi encontrado e um mediador foi atribuído!`,
            { opponentId: p2.id, opponentName: player2Name, matchId: newMatch.id },
            `/match/${newMatch.id}`
          );

          // Notificação para Jogador 2
          await this.notificationService.createNotification(
            p2.id,
            'match_found_player',
            `Seu confronto 🏆 1v1 contra ${player1Name} foi encontrado e um mediador foi atribuído!`,
            { opponentId: p1.id, opponentName: player1Name, matchId: newMatch.id },
            `/match/${newMatch.id}`
          );

          // Notificação para o Mediador
          await this.notificationService.createNotification(
            availableMediator.mediatorId,
            'match_assigned_mediator',
            `Você foi atribuído para mediar um confronto ⚖️ 1v1 entre ${player1Name} e ${player2Name}.`,
            { player1Id: p1.id, player1Name, player2Id: p2.id, player2Name, matchId: newMatch.id },
            `/match/${newMatch.id}`
          );

          return { match: newMatch, player1: p1, player2: p2 };
        });


        console.log(`Partida ${match.id} criada com sucesso!`);

      } catch (error) {
        console.error("Falha na transação de criação de partida:", error);
        // Se a transação falhar, devolve os jogadores para a fila
        bets.unshift(player1Bet, player2Bet);
      }
    }
  }
}
  async joinBetQueue(userId, betAmount, modality, platform, gameSlug) {
    // Lógica para adicionar jogador à fila de apostas
    // 1. Criar um registro em DirectBet com status WAITING_OPPONENT
    // 2. Tentar encontrar um oponente e/ou mediador
    // 3. Se encontrar, criar um Match e Conversation
    // 4. Retornar status da fila ou detalhes do match
    console.log(`User ${userId} joining bet queue for ${betAmount} in ${modality} on ${platform} for ${gameSlug}`);
    // Exemplo simplificado:
    const bet = await this.prisma.directBet.create({
      data: {
        playerId: userId,
        betAmount: parseFloat(betAmount),
        modality,
        platform,
        gameSlug, // Adicionar gameSlug ao modelo DirectBet se necessário
        status: 'WAITING_OPPONENT',
      },
    });
    return { success: true, message: 'Entrou na fila de apostas', betId: bet.id };
  }

  async joinMediationQueue(mediatorId, modalities, platforms) {
    // Lógica para adicionar mediador à fila de mediação
    // 1. Criar/atualizar um registro em MediationRequest
    // 2. Tentar encontrar uma partida que precise de mediador
    // 3. Se encontrar, atribuir mediador ao Match
    console.log(`Mediator ${mediatorId} joining mediation queue for modalities: ${modalities}, platforms: ${platforms}`);
    const mediationRequest = await this.prisma.mediationRequest.upsert({
      where: { mediatorId: mediatorId },
      update: { status: 'AVAILABLE', modalities, platforms },
      create: { mediatorId: mediatorId, status: 'AVAILABLE', modalities, platforms },
    });
    return { success: true, message: 'Entrou na fila de mediação', requestId: mediationRequest.id };
  }

  async leaveQueue(userId, role) {
    // Lógica para remover usuário da fila (aposta ou mediação)
    console.log(`User ${userId} leaving ${role} queue`);
    if (role === 'player') {
      await this.prisma.directBet.updateMany({
        where: { playerId: userId, status: 'WAITING_OPPONENT' },
        data: { status: 'CANCELED' },
      });
    } else if (role === 'mediator') {
      await this.prisma.mediationRequest.updateMany({
        where: { mediatorId: userId, status: 'AVAILABLE' },
        data: { status: 'OFFLINE' },
      });
    }
    return { success: true, message: 'Saiu da fila' };
  }

  async completeMediation(mediatorId, matchId, result) {
    // Lógica para mediador finalizar a partida
    // 1. Atualizar status do Match e resultado
    // 2. Distribuir recompensas/penalidades
    // 3. Atualizar estatísticas do mediador
    console.log(`Mediator ${mediatorId} completing match ${matchId} with result ${result}`);
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: { status: 'COMPLETED', result: result },
    });
    // Lógica de recompensa e atualização de estatísticas do mediador aqui
    return { success: true, message: 'Mediação finalizada', match };
  }

  async getMatchDetails(matchId) {
    // Lógica para obter detalhes de uma partida
    console.log(`Fetching details for match ${matchId}`);
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { player1: true, player2: true, mediator: true, conversation: true },
    });
    return { success: true, match };
  }

  async getChatHistory(chatRoomId) {
    // Lógica para obter histórico de mensagens do chat
    console.log(`Fetching chat history for room ${chatRoomId}`);
    const conversation = await this.prisma.conversation.findUnique({
      where: { matchId: chatRoomId }, // Assumindo chatRoomId é o matchId
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    return { success: true, messages: conversation?.messages || [] };
  }

  async sendMessage(chatRoomId, senderId, content, messageType) {
    // Lógica para enviar mensagem no chat
    console.log(`Sending message in room ${chatRoomId} from ${senderId}: ${content}`);
    const message = await this.prisma.message.create({
      data: {
        conversation: { connect: { matchId: chatRoomId } },
        sender: { connect: { id: senderId } },
        content,
      },
    });
    return { success: true, message };
  }

  // Adicione outras funções de matchmaking e mediação conforme necessário
}

export default MatchmakingService;

