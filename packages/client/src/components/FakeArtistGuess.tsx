import { useState } from "react";
import { useAtomValue } from "jotai";
import { gameSnapshotAtom, canActAtom, actingPlayerNameAtom, isMultiSeatAtom } from "../atoms";
import { useGame } from "../providers/GameProvider";
import { DevicePassGuard } from "./DevicePassGuard";

export function FakeArtistGuess() {
  const { dispatch } = useGame();
  const snapshot = useAtomValue(gameSnapshotAtom);
  const canAct = useAtomValue(canActAtom);
  const actingPlayerName = useAtomValue(actingPlayerNameAtom);
  const isMultiSeat = useAtomValue(isMultiSeatAtom);
  const [guess, setGuess] = useState("");

  if (!snapshot) return null;

  const { fakeArtistIndex, players, category } = snapshot.context;
  const fakeName = players[fakeArtistIndex ?? 0]?.name ?? "???";

  const content = (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      <h2 className="text-2xl font-bold">You were caught, {fakeName}!</h2>
      <p className="text-gray-500">But you can still win — guess the title!</p>
      <p className="text-lg">Category: <strong>{category}</strong></p>

      <div className="flex gap-2 w-full max-w-sm">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && guess.trim() && dispatch({ type: "GUESS_TITLE", guess: guess.trim() })}
          placeholder="What was the title?"
          className="border rounded px-3 py-2 flex-1"
          autoFocus
        />
        <button
          onClick={() => dispatch({ type: "GUESS_TITLE", guess: guess.trim() })}
          disabled={!guess.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Guess
        </button>
      </div>
    </div>
  );

  if (!canAct) {
    return content;
  }

  return (
    <DevicePassGuard playerName={actingPlayerName ?? fakeName} canAct={canAct} isMultiSeat={isMultiSeat}>
      {content}
    </DevicePassGuard>
  );
}
