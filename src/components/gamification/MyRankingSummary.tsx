import { Trophy, Target } from "lucide-react";

interface Props {
  points: number;
  position: number | null;
}

export default function MyRankingSummary({ points, position }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-3">
        <Trophy className="text-yellow-500" />
        <div>
          <p className="text-sm text-gray-500">Mis puntos</p>
          <p className="text-2xl font-bold">{points}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-3">
        <Target className="text-purple-500" />
        <div>
          <p className="text-sm text-gray-500">Mi posición</p>
          <p className="text-2xl font-bold">
            {position ? `#${position}` : "Sin ranking"}
          </p>
        </div>
      </div>
    </div>
  );
}