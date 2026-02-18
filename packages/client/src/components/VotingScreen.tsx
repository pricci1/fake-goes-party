import { useState } from "react";
import { useAtomValue } from "jotai";
import {
  gameSnapshotAtom,
  myPlayerIndicesAtom,
  isMultiSeatAtom,
  actingPlayerIndexAtom,
  allPlayersOnDeviceAtom,
  gameModeAtom,
} from "@fake-goes-party/common";
import { useGame } from "@fake-goes-party/common";
import { DevicePassGuard } from "./DevicePassGuard";
import { SpectatorCanvas } from "./SpectatorCanvas";

export function VotingScreen() {
  const { dispatch } = useGame();
  const snapshot = useAtomValue(gameSnapshotAtom);
  const myIndices = useAtomValue(myPlayerIndicesAtom);
  const [showCanvas, setShowCanvas] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [quickSubmitted, setQuickSubmitted] = useState(false);
  const isMultiSeat = useAtomValue(isMultiSeatAtom);
  const allPlayersOnDevice = useAtomValue(allPlayersOnDeviceAtom);
  const mode = useAtomValue(gameModeAtom);
  const actingPlayerIndex = useAtomValue(actingPlayerIndexAtom);

  if (!snapshot) return null;

  if (showCanvas) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
        <h2 className="text-2xl font-bold">Review the drawing</h2>
        <SpectatorCanvas />
        <button
          onClick={() => setShowCanvas(false)}
          className="rounded bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Continue to Voting
        </button>
      </div>
    );
  }

  const { players, drawOrder, votes: submittedVotes } = snapshot.context;

  const voterIndices = drawOrder ?? [];
  const myVoterIndices = voterIndices.filter((idx) => myIndices.includes(idx));
  const pendingVotes = voterIndices.filter(
    (index) => submittedVotes[String(index)] === undefined
  );
  const isQuickVoting = mode === "local" || (isMultiSeat && allPlayersOnDevice);

  if (isQuickVoting) {
    const fakeArtistIndex = snapshot.context.fakeArtistIndex;
    if (quickSubmitted || pendingVotes.length === 0) {
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

    if (fakeArtistIndex === null || fakeArtistIndex === undefined) return null;

    const nonFakeIndex = players.findIndex((_, idx) => idx !== fakeArtistIndex);

    const handleQuickVote = (fakeCaught: boolean) => {
      const confirmed = window.confirm(
        fakeCaught
          ? "Confirm: the Fake Artist was caught?"
          : "Confirm: the Fake Artist got away?"
      );
      if (!confirmed) return;
      const votedForIndex = fakeCaught
        ? fakeArtistIndex
        : nonFakeIndex >= 0
        ? nonFakeIndex
        : fakeArtistIndex;
      for (const voterIndex of voterIndices) {
        dispatch({
          type: "SUBMIT_VOTES",
          voterIndex,
          votedForIndex,
        });
      }
      setQuickSubmitted(true);
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
        <h2 className="text-2xl font-bold">Was the Fake Artist caught?</h2>
        <p className="text-gray-500 text-center max-w-md">
          Everyone votes together. Tap one option to submit the group decision.
        </p>
        <div className="flex w-full max-w-sm flex-col gap-3">
          <button
            onClick={() => handleQuickVote(true)}
            className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-left font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            Fake Artist Caught
          </button>
          <button
            onClick={() => handleQuickVote(false)}
            className="rounded border border-rose-200 bg-rose-50 px-4 py-3 text-left font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            Fake Artist Got Away
          </button>
        </div>
      </div>
    );
  }

  if (currentStep >= myVoterIndices.length) {
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
