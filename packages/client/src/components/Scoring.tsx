import { useAtomValue } from "jotai";
import { gameSnapshotAtom, myPlayerIndicesAtom, isMultiSeatAtom, aiQmAtom, currentPhaseAtom } from "@fake-goes-party/common";
import { useGame } from "@fake-goes-party/common";

export function Scoring() {
  const { dispatch } = useGame();
  const snapshot = useAtomValue(gameSnapshotAtom);
  const myIndices = useAtomValue(myPlayerIndicesAtom);
  const isMultiSeat = useAtomValue(isMultiSeatAtom);
  const aiQm = useAtomValue(aiQmAtom);
  const phase = useAtomValue(currentPhaseAtom);

  if (!snapshot) return null;

  if (phase === "aiEvaluateGuess") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
        <h2 className="text-2xl font-bold">Evaluating Guess...</h2>
        <p className="text-gray-500 animate-pulse">The AI is deciding if the guess is close enough</p>
      </div>
    );
  }

  const { players, scores, scoreMessage, fakeArtistIndex, fakeCaught, correctGuess, category, title } = snapshot.context;
  const fakeName = players[fakeArtistIndex ?? 0]?.name ?? "???";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      <h2 className="text-2xl font-bold">Round Over</h2>

      <div className="text-center space-y-2">
        <p>
          The Fake Artist was:{" "}
          <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-700">
            {fakeName}
          </span>
        </p>
        <p>
          Category:{" "}
          <strong className="text-slate-700">{category}</strong> — Title:{" "}
          <strong className="text-slate-700">{title}</strong>
        </p>
        {fakeCaught === true && (
          <p
            className={
              correctGuess
                ? "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700"
                : "rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-amber-700"
            }
          >
            {correctGuess
              ? `${fakeName} guessed correctly! ${aiQm ? "Fake Artist scores 2 points." : "Fake Artist and QM score 2 points."}`
              : `${fakeName} guessed wrong! Artists score 1 point each.`}
          </p>
        )}
        {fakeCaught === false && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-rose-700">
            {fakeName} wasn't caught! {aiQm ? "Fake Artist scores 2 points." : "Fake Artist and QM score 2 points."}
          </p>
        )}
        {scoreMessage && <p className="text-sm text-gray-500">{scoreMessage}</p>}
      </div>

      <div className="w-full max-w-sm">
        <h3 className="font-bold mb-2">Scores</h3>
        <ul className="space-y-1">
          {players.map((p, i) => (
            <li
              key={p.id}
              className={`flex justify-between border-b py-1 ${
                myIndices.includes(i) ? "text-slate-900" : "text-slate-600"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={myIndices.includes(i) ? "font-semibold" : ""}>{p.name}</span>
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
        onClick={() => dispatch({ type: "CONTINUE" })}
        className="bg-blue-600 text-white px-6 py-3 rounded text-lg"
      >
        Next Round
      </button>
    </div>
  );
}
