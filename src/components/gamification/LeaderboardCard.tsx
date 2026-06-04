import Image from "next/image";
import { Trophy } from "lucide-react";
import { LeaderboardUser } from "@/types/leaderboard";

interface Props {
  users: LeaderboardUser[];
  currentUserId?: string;
}

export default function LeaderboardCard({ users, currentUserId }: Props) {
  const getMedal = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="text-yellow-500" />
        <div>
          <h2 className="text-xl font-bold">Leaderboard</h2>
          <p className="text-sm text-gray-500">
            Ranking de usuarios por story points completados
          </p>
        </div>
      </div>

      {users.length === 0 ? (
        <p className="text-gray-500">
          Aún no hay usuarios en el leaderboard.
        </p>
      ) : (
        <div className="space-y-3">
          {users.map((user, index) => {
            const isCurrentUser = user.userId === currentUserId;

            return (
              <div
                key={user.userId}
                className={`flex items-center justify-between rounded-xl border p-3 ${
                  isCurrentUser ? "bg-purple-50 border-purple-300" : "bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 text-center font-bold">
                    {getMedal(index)}
                  </div>

                  <Image
                    src={user.profileImageUrl || "/default-avatar.png"}
                    alt={`${user.name} ${user.lastname}`}
                    width={42}
                    height={42}
                    className="rounded-full object-cover"
                  />

                  <div>
                    <p className="font-semibold">
                      {user.name} {user.lastname}
                    </p>
                    {isCurrentUser && (
                      <p className="text-xs text-purple-600">Tú</p>
                    )}
                  </div>
                </div>

                <p className="font-bold text-purple-700">
                  {user.points} pts
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}