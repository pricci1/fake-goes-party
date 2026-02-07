import { useState } from "react";
import { useAtomValue } from "jotai";
import { gameSnapshotAtom } from "../atoms";
import { useGame } from "../providers/GameProvider";
import { DevicePassGuard } from "./DevicePassGuard";

export function VotingScreen() {
  const { dispatch } = useGame();
  const snapshot = useAtomValue(gameSnapshotAtom);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [currentVoterIdx, setCurrentVoterIdx] = useState(0);

  if (!snapshot) return null;

  const { players, drawOrder } = snapshot.context;

  // Voters are all artists (everyone except QM)
  const voterIndices = drawOrder ?? [];

  if (currentVoterIdx >= voterIndices.length) {
    // All votes collected — submit
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
        <h2 className="text-2xl font-bold">All votes in!</h2>
        <button
          onClick={() => dispatch({ type: "SUBMIT_VOTES", votes })}
          className="bg-blue-600 text-white px-6 py-3 rounded text-lg"
        >
          Reveal Results
        </button>
      </div>
    );
  }

  const voterPlayerIndex = voterIndices[currentVoterIdx]!;
  const voter = players[voterPlayerIndex]!;

  // Candidates: all artists except the current voter
  const candidates = voterIndices
    .filter((idx) => idx !== voterPlayerIndex)
    .map((idx) => ({ index: idx, player: players[idx]! }));

  const handleVote = (votedForIndex: number) => {
    setVotes((prev) => ({ ...prev, [String(voterPlayerIndex)]: votedForIndex }));
    setCurrentVoterIdx((prev) => prev + 1);
  };

  return (
    <DevicePassGuard playerName={voter.name} key={voterPlayerIndex}>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
        <h2 className="text-2xl font-bold">Who is the Fake Artist?</h2>
        <p className="text-gray-500">{voter.name}, cast your vote:</p>

        <div className="flex flex-col gap-2 w-full max-w-sm">
          {candidates.map(({ index, player }) => (
            <button
              key={index}
              onClick={() => handleVote(index)}
              className="border rounded px-4 py-3 text-left hover:bg-gray-100"
            >
              {player.name}
            </button>
          ))}
        </div>
      </div>
    </DevicePassGuard>
  );
}
