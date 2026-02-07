import { useAtomValue } from "jotai";
import { gameSnapshotAtom } from "../atoms";
import { useGame } from "../providers/GameProvider";

export function GameOver() {
  const { dispatch } = useGame();
  const snapshot = useAtomValue(gameSnapshotAtom);

  if (!snapshot) return null;

  const { players, scores, winners } = snapshot.context;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      <h2 className="text-3xl font-bold">Game Over!</h2>

      <div className="text-center">
        <p className="text-xl">
          {winners.length === 1
            ? `${winners[0].name} wins!`
            : `Winners: ${winners.map((w) => w.name).join(", ")}!`}
        </p>
      </div>

      <div className="w-full max-w-sm">
        <h3 className="font-bold mb-2">Final Scores</h3>
        <ul className="space-y-1">
          {players.map((p, i) => (
            <li key={p.id} className="flex justify-between border-b py-1">
              <span>
                {p.name} {winners.some((w) => w.id === p.id) ? "🏆" : ""}
              </span>
              <span className="font-mono">{scores[i] ?? 0}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => dispatch({ type: "PLAY_AGAIN" })}
        className="bg-green-600 text-white px-6 py-3 rounded text-lg"
      >
        Play Again
      </button>
    </div>
  );
}
