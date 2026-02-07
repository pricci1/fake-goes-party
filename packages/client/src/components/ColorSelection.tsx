import { useAtomValue } from "jotai";
import { gameSnapshotAtom } from "../atoms";
import { useGame } from "../providers/GameProvider";
import { AVAILABLE_COLORS } from "@fake-goes-party/shared";

export function ColorSelection() {
  const { dispatch } = useGame();
  const snapshot = useAtomValue(gameSnapshotAtom);

  if (!snapshot) return null;

  const { players, qmIndex } = snapshot.context;

  const artists = players.filter((_, i) => i !== qmIndex);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      <h2 className="text-2xl font-bold">Drawing Colors</h2>
      <ul className="space-y-2 w-full max-w-sm">
        {artists.map((player, i) => (
          <li key={player.id} className="flex items-center gap-3 border rounded px-3 py-2">
            <div
              className="w-6 h-6 rounded-full border"
              style={{ backgroundColor: AVAILABLE_COLORS[i % AVAILABLE_COLORS.length] }}
            />
            <span>{player.name}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={() => dispatch({ type: "COLORS_CHOSEN" })}
        className="bg-blue-600 text-white px-6 py-3 rounded text-lg"
      >
        Start Drawing
      </button>
    </div>
  );
}
