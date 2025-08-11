import { PrismaClient } from '@prisma/client';

class MatchmakingService {
  constructor(prisma) {
    this.prisma = prisma;
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

