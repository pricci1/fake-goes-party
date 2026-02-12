import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  playersAtom,
  gameSnapshotAtom,
  registerPlayerIdAtom,
  myPlayerIndicesAtom,
  isMultiSeatAtom,
} from "../atoms";
import { gameModeAtom, roomIdAtom, isSpectatorAtom } from "../atoms/modeAtoms";
import { useGame } from "../providers/GameProvider";
import { MIN_PLAYERS } from "@fake-goes-party/shared";

export function Lobby() {
  const { dispatch } = useGame();
  const players = useAtomValue(playersAtom);
  const myIndices = useAtomValue(myPlayerIndicesAtom);
  const isMultiSeat = useAtomValue(isMultiSeatAtom);
  const snapshot = useAtomValue(gameSnapshotAtom);
  const mode = useAtomValue(gameModeAtom);
  const roomId = useAtomValue(roomIdAtom);
  const aiQm = snapshot?.context.aiQm ?? false;
  const registerPlayerId = useSetAtom(registerPlayerIdAtom);
  const setSpectator = useSetAtom(isSpectatorAtom);
  const [name, setName] = useState("");

  const addPlayer = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const playerId = crypto.randomUUID();
    dispatch({
      type: "ADD_PLAYER",
      player: { id: playerId, name: trimmed },
    });
    registerPlayerId(playerId);
    setName("");
  };

  const removePlayer = (index: number) => {
    dispatch({ type: "REMOVE_PLAYER", playerIndex: index });
  };

  const startGame = () => {
    if (players.length < MIN_PLAYERS) {
      alert(`Need at least ${MIN_PLAYERS} players to start`);
      return;
    }
    dispatch({ type: "START_GAME" });
  };

  const handleCopyLink = () => {
    if (!roomId) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    alert("Link copied! Share it with other players.");
  };

  const canStart = players.length >= MIN_PLAYERS;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      <h1 className="text-3xl font-bold">Fake Goes Party</h1>

      {mode === "remote" && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4 max-w-md w-full">
          <p className="text-sm font-semibold mb-2">Room Code:</p>
          <p className="font-mono text-xs mb-3 break-all">{roomId}</p>
          <button
            onClick={handleCopyLink}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 w-full"
          >
            Copy Invite Link
          </button>
          <button
            onClick={() => setSpectator(true)}
            disabled={myIndices.length > 0}
            title={myIndices.length > 0 ? "You already joined as a player on this device" : undefined}
            className="mt-2 bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-200 w-full border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            👀 Join as Spectator
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addPlayer()}
          placeholder="Player name"
          className="border rounded px-3 py-2"
          autoFocus
        />
        <button
          onClick={addPlayer}
          disabled={!name.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Add
        </button>
      </div>

      <ul className="w-full max-w-sm space-y-2">
        {players.map((p, i) => (
          <li
            key={p.id}
            className={`flex justify-between items-center border rounded px-3 py-2 ${
              myIndices.includes(i) ? "border-blue-200 bg-blue-50" : ""
            }`}
          >
            <span className="flex items-center gap-2">
              <span className={myIndices.includes(i) ? "font-semibold text-blue-900" : ""}>
                {p.name}
              </span>
              {myIndices.includes(i) && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  {isMultiSeat ? "This device" : "You"}
                </span>
              )}
            </span>
            <button
              onClick={() => removePlayer(i)}
              className="text-red-500 text-sm"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <p className="text-sm text-gray-500">
        {players.length} / {MIN_PLAYERS} players minimum
      </p>

      {mode === "remote" && (
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={aiQm}
            onChange={() => dispatch({ type: "SET_AI_QM", enabled: !aiQm })}
            className="w-4 h-4 accent-purple-600"
          />
          <span className="text-sm text-gray-700">
            AI Question Master
          </span>
          <span className="text-xs text-gray-400">
            (no player sits out)
          </span>
        </label>
      )}

      <button
        onClick={startGame}
        disabled={!canStart}
        className="bg-green-600 text-white px-6 py-3 rounded text-lg disabled:opacity-50"
      >
        Start Game
      </button>
    </div>
  );
}
