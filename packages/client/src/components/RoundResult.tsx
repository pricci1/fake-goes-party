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
          <h2 className="text-3xl font-bold">The Fake Artist got away!</h2>
          <p className="text-xl">It was <strong>{fakeName}</strong>!</p>
          <p className="text-gray-500">The Fake Artist and QM each score 2 points.</p>
        </>
      )}
    </div>
  );
}
