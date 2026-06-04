export interface LeaderboardUser {
  userId: string;
  name: string;
  lastname: string;
  profileImageUrl?: string | null;
  points: number;
}