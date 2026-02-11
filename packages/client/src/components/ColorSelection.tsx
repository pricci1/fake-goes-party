import { useAtomValue } from "jotai";
import { gameSnapshotAtom, myPlayerIndicesAtom, isMultiSeatAtom } from "../atoms";
import { useGame } from "../providers/GameProvider";
import { AVAILABLE_COLORS } from "@fake-goes-party/shared";

export function ColorSelection() {
  const { dispatch } = useGame();
  const snapshot = useAtomValue(gameSnapshotAtom);
  const myIndices = useAtomValue(myPlayerIndicesAtom);
  const isMultiSeat = useAtomValue(isMultiSeatAtom);

  if (!snapshot) return null;

  const { players, qmIndex } = snapshot.context;

  const artists = players.filter((_, i) => i !== qmIndex);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      <h2 className="text-2xl font-bold">Drawing Colors</h2>
      <ul className="space-y-2 w-full max-w-sm">
        {artists.map((player, i) => {
          const playerIndex = players.findIndex((p) => p.id === player.id);
          const isMe = playerIndex >= 0 && myIndices.includes(playerIndex);
          return (
            <li
              key={player.id}
              className={`flex items-center gap-3 border rounded px-3 py-2 ${
                isMe ? "border-blue-200 bg-blue-50" : ""
              }`}
            >
            <div
              className="w-6 h-6 rounded-full border"
              style={{ backgroundColor: AVAILABLE_COLORS[i % AVAILABLE_COLORS.length] }}
            />
            <span className={isMe ? "font-semibold text-blue-900" : ""}>{player.name}</span>
            {isMe && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                {isMultiSeat ? "This device" : "You"}
              </span>
            )}
          </li>
          );
        })}
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
