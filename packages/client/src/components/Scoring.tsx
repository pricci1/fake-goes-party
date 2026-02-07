import { useAtomValue } from "jotai";
import { gameSnapshotAtom } from "../atoms";
import { useGame } from "../providers/GameProvider";

export function Scoring() {
  const { dispatch } = useGame();
  const snapshot = useAtomValue(gameSnapshotAtom);

  if (!snapshot) return null;

  const { players, scores, scoreMessage, fakeArtistIndex, fakeCaught, correctGuess, category, title } = snapshot.context;
  const fakeName = players[fakeArtistIndex ?? 0]?.name ?? "???";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      <h2 className="text-2xl font-bold">Round Over</h2>

      <div className="text-center space-y-1">
        <p>The Fake Artist was: <strong>{fakeName}</strong></p>
        <p>Category: <strong>{category}</strong> — Title: <strong>{title}</strong></p>
        {fakeCaught === true && (
          <p>
            {correctGuess
              ? `${fakeName} guessed correctly! Fake Artist and QM score 2 points.`
              : `${fakeName} guessed wrong! Artists score 1 point each.`}
          </p>
        )}
        {fakeCaught === false && (
          <p>{fakeName} wasn't caught! Fake Artist and QM score 2 points.</p>
        )}
        {scoreMessage && <p className="text-sm text-gray-500">{scoreMessage}</p>}
      </div>

      <div className="w-full max-w-sm">
        <h3 className="font-bold mb-2">Scores</h3>
        <ul className="space-y-1">
          {players.map((p, i) => (
            <li key={p.id} className="flex justify-between border-b py-1">
              <span>{p.name}</span>
              <span className="font-mono">{scores[i] ?? 0}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => dispatch({ type: "CONTINUE" })}
        className="bg-blue-600 text-white px-6 py-3 rounded text-lg"
      >
        Next Round
      </button>
    </div>
  );
}
