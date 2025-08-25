// src/routes/matchmaking-routes.js (VERSÃO COM ESTATÍSTICAS)

import MatchmakingController from "../controllers/matchmaking-controller.js";

async function matchmakingRoutes(fastify, options) {
  const matchmakingService = options.matchmakingService; 
  
  if (!matchmakingService) {
    throw new Error("MatchmakingService não foi fornecido para as rotas.");
  }

  const matchmakingController = new MatchmakingController(matchmakingService);

  // ========== ROTAS EXISTENTES ==========

// Rotas de apostas (jogadores) - MODIFICADA com limitação
  fastify.post(
    "/bets/join-queue",
    { 
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Entrar na fila de apostas (com limitação para jogadores)',
        tags: ['Betting'],
        body: {
          type: 'object',
          required: ['betAmount', 'modality', 'platform', 'gameSlug'],
          properties: {
            betAmount: { type: 'number', minimum: 0.01, description: 'Valor da aposta' },
            modality: { type: 'string', description: 'Modalidade do jogo' },
            platform: { type: 'string', description: 'Plataforma do jogo' },
            gameSlug: { type: 'string', description: 'Identificador do jogo' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              betId: { type: 'string' },
              userType: { type: 'string', enum: ['admin', 'player'] }
            }
          },
          409: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              details: {
                type: 'object',
                properties: {
                  currentBets: { type: 'integer' },
                  maxAllowed: { type: 'integer' },
                  activeBets: { type: 'array' }
                }
              }
            }
          }
        }
      }
    },
    (request, reply) => matchmakingController.joinBetQueue(request, reply)
  );

  // NOVA ROTA: Verificar status de apostas do usuário
  fastify.get(
    "/bets/status",
    { 
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Obter status de apostas do usuário logado',
        tags: ['Betting'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              userType: { type: 'string', enum: ['admin', 'player'] },
              maxAllowed: { type: ['integer', 'string'] },
              currentActive: { type: 'integer' },
              canJoinNewBet: { type: 'boolean' },
              activeBets: { type: 'array' },
              activeMatches: { type: 'array' }
            }
          }
        }
      }
    },
    (request, reply) => matchmakingController.getUserBetStatus(request, reply)
  );

  // NOVA ROTA: Verificar se pode entrar em nova aposta
  fastify.get(
    "/bets/can-join",
    { 
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Verificar se o usuário pode entrar em uma nova aposta',
        tags: ['Betting'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              canJoin: { type: 'boolean' },
              reason: { type: 'string' },
              userType: { type: 'string', enum: ['admin', 'player'] },
              currentActive: { type: 'integer' },
              maxAllowed: { type: ['integer', 'string'] }
            }
          }
        }
      }
    },
    (request, reply) => matchmakingController.canJoinNewBet(request, reply)
  );


  // Rotas de mediação (mediadores)
  fastify.post(
    "/mediation/join-queue",
    { onRequest: [fastify.authenticate] },
    (request, reply) => matchmakingController.joinMediationQueue(request, reply)
  );

  fastify.post(
    "/mediation/complete",
    { onRequest: [fastify.authenticate] },
    (request, reply) => matchmakingController.completeMediation(request, reply)
  );

  // Rotas gerais de fila (sair da fila)
  fastify.post(
    "/queue/leave",
    { onRequest: [fastify.authenticate] },
    (request, reply) => matchmakingController.leaveQueue(request, reply)
  );

  // Rotas de confirmação de partida
  fastify.post(
    "/matches/:matchId/confirm",
    { onRequest: [fastify.authenticate] },
    (request, reply) => matchmakingController.confirmMatch(request, reply)
  );

  fastify.post(
    "/matches/:matchId/cancel",
    { onRequest: [fastify.authenticate] },
    (request, reply) => matchmakingController.cancelMatch(request, reply)
  );

  // Rotas de detalhes da partida
  fastify.get(
    "/matches/:matchId",
    { onRequest: [fastify.authenticate] },
    (request, reply) => matchmakingController.getMatchDetails(request, reply)
  );

  // Rotas de chat
  fastify.get(
    "/chat-history/:chatRoomId",
    { onRequest: [fastify.authenticate] },
    (request, reply) => matchmakingController.getChatHistory(request, reply)
  );

  fastify.post(
    "/chat/send-message",
    { onRequest: [fastify.authenticate] },
    (request, reply) => matchmakingController.sendMessage(request, reply)
  );
  
  fastify.get(
    "/conversations",
    { onRequest: [fastify.authenticate] },
    (request, reply) => matchmakingController.listUserConversations(request, reply)
  );

  // ========== NOVAS ROTAS DE ESTATÍSTICAS ==========

  // Estatísticas do usuário logado
  fastify.get(
    "/statistics/me",
    { 
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Buscar estatísticas do usuário logado',
        tags: ['Statistics'],
        querystring: {
          type: 'object',
          properties: {
            gameSlug: { 
              type: 'string', 
              description: 'Slug do jogo (opcional, se não informado retorna todos os jogos)' 
            }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              statistics: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    gameSlug: { type: 'string' },
                    totalMatches: { type: 'integer' },
                    wins: { type: 'integer' },
                    losses: { type: 'integer' },
                    winsWO: { type: 'integer' },
                    lossesWO: { type: 'integer' },
                    kills: { type: 'integer' },
                    assists: { type: 'integer' },
                    caps: { type: 'integer' },
                    matchesWithKills: { type: 'integer' },
                    matchesWithAssists: { type: 'integer' },
                    matchesWithCaps: { type: 'integer' },
                    derived: {
                      type: 'object',
                      properties: {
                        winRate: { type: 'number' },
                        avgKills: { type: ['number', 'null'] },
                        avgAssists: { type: ['number', 'null'] },
                        avgCaps: { type: ['number', 'null'] }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    (request, reply) => matchmakingController.getMyStatistics(request, reply)
  );

  // Estatísticas de um jogador específico
  fastify.get(
    "/statistics/player/:userId",
    { 
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Buscar estatísticas de um jogador específico',
        tags: ['Statistics'],
        params: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string', description: 'ID do usuário' }
          }
        },
        querystring: {
          type: 'object',
          properties: {
            gameSlug: { type: 'string', description: 'Slug do jogo (opcional)' }
          }
        }
      }
    },
    (request, reply) => matchmakingController.getPlayerStatistics(request, reply)
  );

  // Histórico de partidas do usuário logado
  fastify.get(
    "/matches/history/me",
    { 
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Buscar histórico de partidas do usuário logado',
        tags: ['Statistics'],
        querystring: {
          type: 'object',
          properties: {
            gameSlug: { type: 'string', description: 'Slug do jogo (opcional)' },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            offset: { type: 'integer', minimum: 0, default: 0 }
          }
        }
      }
    },
    (request, reply) => matchmakingController.getMyMatchHistory(request, reply)
  );

  // Histórico de partidas de um jogador específico
  fastify.get(
    "/matches/history/player/:userId",
    { 
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Buscar histórico de partidas de um jogador específico',
        tags: ['Statistics'],
        params: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string', description: 'ID do usuário' }
          }
        },
        querystring: {
          type: 'object',
          properties: {
            gameSlug: { type: 'string', description: 'Slug do jogo (opcional)' },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            offset: { type: 'integer', minimum: 0, default: 0 }
          }
        }
      }
    },
    (request, reply) => matchmakingController.getPlayerMatchHistory(request, reply)
  );

  // Ranking de jogadores
  fastify.get(
    "/ranking",
    { 
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Buscar ranking de jogadores',
        tags: ['Statistics'],
        querystring: {
          type: 'object',
          required: ['gameSlug'],
          properties: {
            gameSlug: { type: 'string', description: 'Slug do jogo (obrigatório)' },
            sortBy: { 
              type: 'string', 
              enum: ['winRate', 'totalMatches', 'wins', 'avgKills', 'avgAssists', 'avgCaps'],
              default: 'winRate',
              description: 'Campo para ordenação'
            },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
            offset: { type: 'integer', minimum: 0, default: 0 }
          }
        }
      }
    },
    (request, reply) => matchmakingController.getPlayersRanking(request, reply)
  );

  // ========== ROTAS DE ADMINISTRAÇÃO (OPCIONAL) ==========

  // Buscar estatísticas detalhadas de uma partida específica
  fastify.get(
    "/matches/:matchId/statistics",
    { 
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Buscar estatísticas detalhadas de uma partida',
        tags: ['Statistics'],
        params: {
          type: 'object',
          required: ['matchId'],
          properties: {
            matchId: { type: 'string', description: 'ID da partida' }
          }
        }
      }
    },
    async (request, reply) => {
      const { matchId } = request.params;
      
      try {
        const matchStats = await matchmakingService.prisma.matchStatistics.findUnique({
          where: { matchId: matchId },
          include: {
            match: {
              include: {
                player1: { include: { profile: true } },
                player2: { include: { profile: true } },
                mediator: { include: { profile: true } }
              }
            }
          }
        });

        if (!matchStats) {
          return reply.status(404).send({ success: false, message: 'Estatísticas da partida não encontradas.' });
        }

        return reply.send({ success: true, statistics: matchStats });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ success: false, message: 'Erro ao buscar estatísticas da partida.' });
      }
    }

    
  );
  
// Rota para estatísticas agregadas de um jogador com filtro de tempo
fastify.get(
  "/statistics/player/:userId/summary", // Usamos um nome diferente para não conflitar
  { 
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Buscar um resumo de estatísticas de um jogador com filtro de período',
      tags: ['Statistics'],
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string', description: 'ID do usuário' }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          gameSlug: { type: 'string', description: 'Slug do jogo (opcional, se não informado, agrega todos)' },
          period: { type: 'string', enum: ['monthly', 'all_time'], default: 'all_time', description: 'Período do filtro' }
        }
      }
    }
  },
  (request, reply) => matchmakingController.getPlayerStatsSummary(request, reply)
);

}

export default matchmakingRoutes;

