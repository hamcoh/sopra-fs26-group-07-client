export interface User {
  id: string | null;
  name: string | null;
  username: string | null;
  avatarId: string | null;
  token: string | null;
  status: string | null;
  winCount: number;
  drawCount: number;
  winRatePercentage: number;
  totalGamesPlayed: number;
  totalPoints: number;
  rank: number;
}
