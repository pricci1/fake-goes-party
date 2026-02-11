import { useAtomValue } from "jotai";
import { gameSnapshotAtom, myPlayerIndicesAtom, isMultiSeatAtom } from "../atoms";
import { useGame } from "../providers/GameProvider";

export function GameOver() {
  const { dispatch } = useGame();
  const snapshot = useAtomValue(gameSnapshotAtom);
  const myIndices = useAtomValue(myPlayerIndicesAtom);
  const isMultiSeat = useAtomValue(isMultiSeatAtom);

  if (!snapshot) return null;

  const { players, scores, winners } = snapshot.context;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      <h2 className="text-3xl font-bold">Game Over!</h2>

      <div className="text-center">
        <p className="text-xl">
          {winners.length === 1 ? (
            <>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-base font-semibold text-emerald-700">
                {winners[0].name}
              </span>
              {" "}wins!
            </>
          ) : (
            <>
              Winners:{" "}
              {winners.map((winner) => (
                <span
                  key={winner.id}
                  className="mx-1 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-base font-semibold text-emerald-700"
                >
                  {winner.name}
                </span>
              ))}
              !
            </>
          )}
        </p>
      </div>

      <div className="w-full max-w-sm">
        <h3 className="font-bold mb-2">Final Scores</h3>
        <ul className="space-y-1">
          {players.map((p, i) => (
            <li
              key={p.id}
              className={`flex justify-between border-b py-1 ${
                myIndices.includes(i) ? "text-slate-900" : "text-slate-600"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={myIndices.includes(i) ? "font-semibold" : ""}>
                  {p.name} {winners.some((w) => w.id === p.id) ? "🏆" : ""}
                </span>
                {myIndices.includes(i) && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    {isMultiSeat ? "This device" : "You"}
                  </span>
                )}
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
