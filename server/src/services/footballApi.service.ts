import axios from 'axios';
import { env } from '../utils/env.js';

const footballApi = axios.create({
  baseURL: 'https://api.football-data.org/v4',
  timeout: 8000,
  headers: {
    'X-Auth-Token': env.FOOTBALL_DATA_API_KEY,
  },
});

export interface FootballGame {
  id: number;
  utcDate: string;
  status: string;
  score: {
    fullTime: {
      home: number | null;
      away: number | null;
    };
  };
  homeTeam: { name: string };
  awayTeam: { name: string };
}

export const fetchFinishedGames = async (): Promise<FootballGame[]> => {
  if (!env.FOOTBALL_DATA_API_KEY) return [];
  
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await footballApi.get(`/competitions/${env.API_COMPETITION_ID}/matches`, {
        params: { status: 'FINISHED' },
        validateStatus: (status) => status < 500,
      });

      if (response.status >= 400) {
        throw new Error(`API externa retornou status ${response.status}`);
      }

      return response.data.matches ?? [];
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
        continue;
      }
    }
  }

  console.error('Erro ao buscar jogos da API externa:', lastError);
  return [];
};
