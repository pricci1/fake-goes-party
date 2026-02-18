import { useState } from "react";
import { useAtomValue } from "jotai";
import { gameSnapshotAtom, canActAtom, actingPlayerNameAtom, isMultiSeatAtom } from "@fake-goes-party/common";
import { useGame } from "@fake-goes-party/common";
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
      <h2 className="text-2xl font-bold text-amber-700">
        You were caught,{" "}
        <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-base font-semibold text-amber-800">
          {fakeName}
        </span>
        !
      </h2>
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-amber-700">
        But you can still win — guess the title!
      </p>
      <p className="text-lg">
        Category:{" "}
        <strong className="text-slate-700">{category}</strong>
      </p>

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
          className="bg-amber-600 text-white px-4 py-2 rounded disabled:opacity-50"
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
