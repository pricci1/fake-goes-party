import { useState } from "react";
import { useAtomValue } from "jotai";
import {
  gameSnapshotAtom,
  myPlayerIndicesAtom,
  isMultiSeatAtom,
} from "../atoms";
import { useGame } from "../providers/GameProvider";
import { DevicePassGuard } from "./DevicePassGuard";

export function CardReveal() {
  const { dispatch } = useGame();
  const snapshot = useAtomValue(gameSnapshotAtom);
  const myIndices = useAtomValue(myPlayerIndicesAtom);
  const [currentStep, setCurrentStep] = useState(0);
  const [cardVisible, setCardVisible] = useState(false);
  const isMultiSeat = useAtomValue(isMultiSeatAtom);

  if (!snapshot) return null;

  const { players, qmIndex, fakeArtistIndex, category, title, cardsRevealed } =
    snapshot.context;

  if (currentStep >= myIndices.length) {
    const artistIndices = players
      .map((_, index) => index)
      .filter((index) => index !== qmIndex);
    const allArtistsReady = artistIndices.every(
      (index) => cardsRevealed[String(index)]
    );
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
        {allArtistsReady ? (
          <>
            <h2 className="text-2xl font-bold">All cards revealed!</h2>
            <p className="text-gray-500">Waiting to move to the next phase.</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold">Waiting for others...</h2>
            <p className="text-gray-500">All artists must reveal their cards.</p>
          </>
        )}
      </div>
    );
  }

  const playerIndex = myIndices[currentStep]!;
  const player = players[playerIndex]!;
  const isQM = playerIndex === qmIndex;
  const isFake = playerIndex === fakeArtistIndex;

  const cardContent = isQM
    ? { role: "Question Master", detail: `Category: ${category} | Title: ${title}` }
    : isFake
      ? { role: "Fake Artist", detail: `Category: ${category}` }
      : { role: "Artist", detail: `Category: ${category} | Title: ${title}` };

  const handleNext = () => {
    if (!isQM) {
      dispatch({ type: "CARDS_REVEALED", playerIndex });
    }
    setCardVisible(false);
    setCurrentStep((prev) => prev + 1);
  };

  return (
    <DevicePassGuard playerName={player.name} key={currentStep} canAct={true} isMultiSeat={isMultiSeat}>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
        <h2 className="text-xl">
          Your card,{" "}
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-base font-semibold text-blue-700">
            {player.name}
          </span>
          :
        </h2>

        {!cardVisible ? (
          <button
            onClick={() => setCardVisible(true)}
            className="bg-gray-800 text-white px-6 py-3 rounded text-lg"
          >
            Tap to reveal
          </button>
        ) : (
          <div className="border-2 rounded-lg p-6 text-center space-y-2">
            <p
              className={`text-lg font-bold ${
                isFake ? "text-rose-700" : isQM ? "text-blue-700" : "text-emerald-700"
              }`}
            >
              {cardContent.role}
            </p>
            <p className="text-md">{cardContent.detail}</p>
          </div>
        )}

        {cardVisible && (
          <button
            onClick={handleNext}
            className="bg-blue-600 text-white px-6 py-3 rounded text-lg mt-4"
          >
            Got it — Next player
          </button>
        )}
      </div>
    </DevicePassGuard>
  );
}
