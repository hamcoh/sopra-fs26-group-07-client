export interface User {
  id: string | null;
  name: string | null;
  username: string | null;
  avatarId: string | null;
  token: string | null;
  status: string | null;
  winCount: number;
  winRatePercentage: number;
  totalGamesPlayed: number;
  totalPoints: number;
  rank: number;
}
