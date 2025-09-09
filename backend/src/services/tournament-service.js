// src/services/tournament-service.js

class TournamentService {
  async createTournament(data, creatorId) {
    console.log('🚀 Criando novo torneio com dados:', data);
    
    const { name, gameSlug, mode, platform, startsAt } = data;

    // Validação APRIMORADA e mais específica
    if (!name) throw new Error('O nome do torneio é obrigatório.');
    if (!gameSlug) throw new Error('O jogo (gameSlug) é obrigatório.');
    if (!mode) throw new Error('A modalidade (mode) é obrigatória.');
    if (!platform) throw new Error('A plataforma (platform) é obrigatória.');
    if (!startsAt) throw new Error('A data de início (startsAt) é obrigatória.');

    // Validação dos valores de ENUM (opcional, mas recomendado)
    const validModes = ['SOLO', 'DUO', 'SQUAD'];
    const validPlatforms = ['MOBILE', 'EMULATOR', 'MIXED'];
    if (!validModes.includes(mode)) throw new Error(`Modalidade inválida. Use uma de: ${validModes.join(', ')}`);
    if (!validPlatforms.includes(platform)) throw new Error(`Plataforma inválida. Use uma de: ${validPlatforms.join(', ')}`);

    const tournament = await this.prisma.tournament.create({
      data: {
        name,
        gameSlug,
        mode,
        platform,
        startsAt: new Date(startsAt),
        createdById: creatorId,
        teamSize: mode === 'SOLO' ? 1 : (mode === 'DUO' ? 2 : 4),
        status: 'UPCOMING',
        maxTeams: 48,
        registrationEndsAt: new Date(new Date(startsAt).getTime() - 3600 * 1000),
      },
    });

    return { success: true, message: 'Torneio criado com sucesso!', tournament };
  }
}

export default TournamentService;
