import axios from 'axios';

const BASE_URL = 'https://cf-tracker-backend.onrender.com/api/cf'; // Standard Android Emulator loopback

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export interface UserInfo {
  handle: string;
  rating: string;
  rank: string;
  maxRating: string;
  maxRank: string;
  avatar: string;
}

export interface Submission {
  id: string;
  problem: string;
  verdict: string;
  language: string;
  difficulty: string;
  date: string;
  tags: string;
}

export interface DashboardData {
  user: UserInfo;
  stats: {
    totalSubmissions: number;
    solvedCount: number;
    currentStreak: number;
    verdictDistribution: Record<string, number>;
    languageDistribution: Record<string, number>;
    difficultyDistribution: Record<string, number>;
    tagPerformance: Record<string, { total: number; solved: number }>;
    activityHeatmap: Record<string, number>;
  };
  ratingGraph: Array<{
    date: string;
    rating: number;
    contest: string;
  }>;
}

export const cfApi = {
  getDashboard: async () => {
    const res = await api.get<DashboardData>('/dashboard');
    return res.data;
  },
  getSubmissions: async (params: {
    limit?: number;
    offset?: number;
    cursor?: string;
    minRating?: number;
    maxRating?: number;
    sortBy?: string;
    order?: string;
  }) => {
    const res = await api.get<{ data: Submission[]; pagination: any }>(
      '/submissions',
      { params },
    );
    return res.data;
  },
  getSource: async (id: string) => {
    const res = await api.get<{ id: string; source: string }>(`/source/${id}`);
    return res.data;
  },
  sync: async () => {
    const res = await api.post('/sync');
    return res.data;
  },
};
