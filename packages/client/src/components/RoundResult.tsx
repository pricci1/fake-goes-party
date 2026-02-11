import { useAtomValue } from "jotai";
import { gameSnapshotAtom } from "../atoms";

export function RoundResult() {
  const snapshot = useAtomValue(gameSnapshotAtom);
  if (!snapshot) return null;

  const { fakeArtistIndex, players, fakeCaught } = snapshot.context;
  const fakeName = players[fakeArtistIndex ?? 0]?.name ?? "???";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      {fakeCaught === false && (
        <>
          <h2 className="text-3xl font-bold text-rose-700">The Fake Artist got away!</h2>
          <p className="text-xl">
            It was{" "}
            <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-base font-semibold text-rose-700">
              {fakeName}
            </span>
            !
          </p>
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-rose-700">
            The Fake Artist and QM each score 2 points.
          </p>
        </>
      )}
    </div>
  );
}
