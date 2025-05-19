// This file contains mock football data and helper functions

// Mock data for live matches
export const mockLiveMatches = [
  {
    id: 10001,
    homeTeam: { id: 1, name: "Manchester United", shortName: "MUN" },
    awayTeam: { id: 2, name: "Liverpool", shortName: "LIV" },
    tournament: {
      id: 1,
      name: "Premier League",
      uniqueTournament: {
        id: 1,
        name: "Premier League",
        category: {
          id: 1,
          name: "England",
          slug: "england",
        },
      },
    },
    status: { description: "78'", code: 1, type: "inprogress" },
    homeScore: { current: 2 },
    awayScore: { current: 1 },
  },
  {
    id: 10002,
    homeTeam: { id: 3, name: "Barcelona", shortName: "BAR" },
    awayTeam: { id: 4, name: "Real Madrid", shortName: "RMA" },
    tournament: {
      id: 2,
      name: "La Liga",
      uniqueTournament: {
        id: 2,
        name: "La Liga",
        category: {
          id: 2,
          name: "Spain",
          slug: "spain",
        },
      },
    },
    status: { description: "12'", code: 1, type: "inprogress" },
    homeScore: { current: 0 },
    awayScore: { current: 0 },
  },
  {
    id: 10003,
    homeTeam: { id: 5, name: "Bayern Munich", shortName: "BAY" },
    awayTeam: { id: 6, name: "Borussia Dortmund", shortName: "DOR" },
    tournament: {
      id: 3,
      name: "Bundesliga",
      uniqueTournament: {
        id: 3,
        name: "Bundesliga",
        category: {
          id: 3,
          name: "Germany",
          slug: "germany",
        },
      },
    },
    status: { description: "HT", code: 1, type: "inprogress" },
    homeScore: { current: 3 },
    awayScore: { current: 2 },
  },
  {
    id: 10004,
    homeTeam: { id: 7, name: "PSG", shortName: "PSG" },
    awayTeam: { id: 8, name: "Marseille", shortName: "MAR" },
    tournament: {
      id: 4,
      name: "Ligue 1",
      uniqueTournament: {
        id: 4,
        name: "Ligue 1",
        category: {
          id: 4,
          name: "France",
          slug: "france",
        },
      },
    },
    status: { description: "56'", code: 1, type: "inprogress" },
    homeScore: { current: 1 },
    awayScore: { current: 1 },
  },
  {
    id: 10005,
    homeTeam: { id: 9, name: "Juventus", shortName: "JUV" },
    awayTeam: { id: 10, name: "AC Milan", shortName: "MIL" },
    tournament: {
      id: 5,
      name: "Serie A",
      uniqueTournament: {
        id: 5,
        name: "Serie A",
        category: {
          id: 5,
          name: "Italy",
          slug: "italy",
        },
      },
    },
    status: { description: "89'", code: 1, type: "inprogress" },
    homeScore: { current: 0 },
    awayScore: { current: 2 },
  },
];

// Mock match statistics
export const mockMatchStatistics = {
  10001: {
    possession: { home: 45, away: 55 },
    shots: { home: 12, away: 15 },
    shotsOnTarget: { home: 5, away: 7 },
    corners: { home: 4, away: 6 },
    fouls: { home: 10, away: 8 },
    yellowCards: { home: 2, away: 3 },
    redCards: { home: 0, away: 0 },
  },
  10002: {
    possession: { home: 60, away: 40 },
    shots: { home: 3, away: 2 },
    shotsOnTarget: { home: 1, away: 0 },
    corners: { home: 1, away: 1 },
    fouls: { home: 2, away: 3 },
    yellowCards: { home: 0, away: 1 },
    redCards: { home: 0, away: 0 },
  },
  10003: {
    possession: { home: 52, away: 48 },
    shots: { home: 10, away: 8 },
    shotsOnTarget: { home: 6, away: 4 },
    corners: { home: 5, away: 3 },
    fouls: { home: 7, away: 9 },
    yellowCards: { home: 1, away: 2 },
    redCards: { home: 0, away: 0 },
  },
  10004: {
    possession: { home: 65, away: 35 },
    shots: { home: 14, away: 6 },
    shotsOnTarget: { home: 5, away: 3 },
    corners: { home: 7, away: 2 },
    fouls: { home: 8, away: 12 },
    yellowCards: { home: 1, away: 3 },
    redCards: { home: 0, away: 0 },
  },
  10005: {
    possession: { home: 40, away: 60 },
    shots: { home: 8, away: 16 },
    shotsOnTarget: { home: 2, away: 8 },
    corners: { home: 3, away: 9 },
    fouls: { home: 14, away: 6 },
    yellowCards: { home: 3, away: 1 },
    redCards: { home: 1, away: 0 },
  },
};

// Mock lineups
export const mockLineups = {
  10001: {
    home: {
      formation: "4-3-3",
      players: [
        { name: "De Gea", position: "GK", number: 1 },
        { name: "Wan-Bissaka", position: "RB", number: 29 },
        { name: "Varane", position: "CB", number: 19 },
        { name: "Maguire", position: "CB", number: 5 },
        { name: "Shaw", position: "LB", number: 23 },
        { name: "Casemiro", position: "CDM", number: 18 },
        { name: "Fernandes", position: "CAM", number: 8 },
        { name: "Eriksen", position: "CM", number: 14 },
        { name: "Sancho", position: "RW", number: 25 },
        { name: "Rashford", position: "LW", number: 10 },
        { name: "Martial", position: "ST", number: 9 },
      ],
    },
    away: {
      formation: "4-3-3",
      players: [
        { name: "Alisson", position: "GK", number: 1 },
        { name: "Alexander-Arnold", position: "RB", number: 66 },
        { name: "Van Dijk", position: "CB", number: 4 },
        { name: "Konaté", position: "CB", number: 5 },
        { name: "Robertson", position: "LB", number: 26 },
        { name: "Fabinho", position: "CDM", number: 3 },
        { name: "Henderson", position: "CM", number: 14 },
        { name: "Thiago", position: "CM", number: 6 },
        { name: "Salah", position: "RW", number: 11 },
        { name: "Diaz", position: "LW", number: 23 },
        { name: "Núñez", position: "ST", number: 27 },
      ],
    },
  },
};

// Helper function to get match details
export const getMatchDetails = (matchId: number) => {
  // In a real app, this would fetch from an API
  // For now, we'll return mock data
  return {
    id: matchId,
    statistics:
      mockMatchStatistics[matchId as keyof typeof mockMatchStatistics],
    lineups: mockLineups[matchId as keyof typeof mockLineups],
  };
};
