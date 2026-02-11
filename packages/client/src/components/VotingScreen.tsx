import { useState } from "react";
import { useAtomValue } from "jotai";
import {
  gameSnapshotAtom,
  myPlayerIndicesAtom,
  isMultiSeatAtom,
  actingPlayerIndexAtom,
} from "../atoms";
import { useGame } from "../providers/GameProvider";
import { DevicePassGuard } from "./DevicePassGuard";

export function VotingScreen() {
  const { dispatch } = useGame();
  const snapshot = useAtomValue(gameSnapshotAtom);
  const myIndices = useAtomValue(myPlayerIndicesAtom);
  const [currentStep, setCurrentStep] = useState(0);
  const isMultiSeat = useAtomValue(isMultiSeatAtom);
  const actingPlayerIndex = useAtomValue(actingPlayerIndexAtom);

  if (!snapshot) return null;

  const { players, drawOrder, votes: submittedVotes } = snapshot.context;

  const voterIndices = drawOrder ?? [];
  const myVoterIndices = voterIndices.filter((idx) => myIndices.includes(idx));

  if (currentStep >= myVoterIndices.length) {
    const pendingVotes = voterIndices.filter(
      (index) => submittedVotes[String(index)] === undefined
    );
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
        {pendingVotes.length === 0 ? (
          <>
            <h2 className="text-2xl font-bold">All votes in!</h2>
            <p className="text-gray-500">Waiting to reveal results.</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold">Waiting for votes...</h2>
            <p className="text-gray-500">Still waiting on {pendingVotes.length}.</p>
          </>
        )}
      </div>
    );
  }

  const voterPlayerIndex = myVoterIndices[currentStep]!;
  const voter = players[voterPlayerIndex]!;

  const candidates = voterIndices
    .filter((idx) => idx !== voterPlayerIndex)
    .map((idx) => ({ index: idx, player: players[idx]! }));

  const handleVote = (votedForIndex: number) => {
    dispatch({
      type: "SUBMIT_VOTES",
      voterIndex: voterPlayerIndex,
      votedForIndex,
    });
    setCurrentStep((prev) => prev + 1);
  };

  return (
    <DevicePassGuard playerName={voter.name} key={voterPlayerIndex} canAct={true} isMultiSeat={isMultiSeat}>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
        <h2 className="text-2xl font-bold">Who is the Fake Artist?</h2>
        <p className="text-gray-500">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
            {voter.name}
          </span>
          , cast your vote:
        </p>

        <div className="flex flex-col gap-2 w-full max-w-sm">
          {candidates.map(({ index, player }) => (
            <button
              key={index}
              onClick={() => handleVote(index)}
              className={`border rounded px-4 py-3 text-left transition ${
                index === actingPlayerIndex
                  ? "border-blue-200 bg-blue-50 font-semibold text-blue-800"
                  : "hover:bg-gray-100"
              }`}
            >
              {player.name}
            </button>
          ))}
        </div>
      </div>
    </DevicePassGuard>
  );
}
