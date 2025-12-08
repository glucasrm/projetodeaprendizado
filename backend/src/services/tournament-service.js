// src/services/tournament-service.js

class TournamentService {
async create(userId, tournamentData) {
    // Desestruture os dados DENTRO do método
    const { name, gameSlug, mode, platform, startsAt } = tournamentData;

    // Agora a validação funciona como esperado
    if (!name || name.trim() === '') {
        throw new Error('O nome do torneio é obrigatório.');
    }
    if (!gameSlug) {
        throw new Error('O jogo (gameSlug) é obrigatório.');
    }
    if (!mode) {
        throw new Error('A modalidade (mode) é obrigatória.');
    }
    // Adicione outras validações conforme necessário...

    // Resto da sua lógica para criar o torneio no banco de dados
    // Exemplo:
    const tournament = await this.prisma.tournament.create({
        data: {
            name,
            gameSlug,
            mode,
            platform,
            startsAt: new Date(startsAt),
            organizerId: userId,
             teamSize: mode === 'SOLO' ? 1 : (mode === 'DUO' ? 2 : 4),
            status: 'UPCOMING',
            maxTeams: 48,
            registrationEndsAt: new Date(new Date(startsAt).getTime() - 3600 * 1000),
        }
    });

    return { success: true, tournament };
}
}

export default TournamentService;
