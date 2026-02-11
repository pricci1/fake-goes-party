import { useState } from "react";
import { useAtomValue } from "jotai";
import { gameSnapshotAtom, myPlayerIndicesAtom } from "../atoms";
import { useGame } from "../providers/GameProvider";
import { DevicePassGuard } from "./DevicePassGuard";

export function CardReveal() {
  const { dispatch } = useGame();
  const snapshot = useAtomValue(gameSnapshotAtom);
  const myIndices = useAtomValue(myPlayerIndicesAtom);
  const [currentStep, setCurrentStep] = useState(0);
  const [cardVisible, setCardVisible] = useState(false);

  if (!snapshot) return null;

  const { players, qmIndex, fakeArtistIndex, category, title } = snapshot.context;

  if (currentStep >= myIndices.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
        <h2 className="text-2xl font-bold">All cards revealed!</h2>
        <button
          onClick={() => dispatch({ type: "CARDS_REVEALED" })}
          className="bg-blue-600 text-white px-6 py-3 rounded text-lg"
        >
          Continue
        </button>
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
    setCardVisible(false);
    setCurrentStep((prev) => prev + 1);
  };

  return (
    <DevicePassGuard playerName={player.name} key={currentStep}>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
        <h2 className="text-xl">Your card, {player.name}:</h2>

        {!cardVisible ? (
          <button
            onClick={() => setCardVisible(true)}
            className="bg-gray-800 text-white px-6 py-3 rounded text-lg"
          >
            Tap to reveal
          </button>
        ) : (
          <div className="border-2 rounded-lg p-6 text-center space-y-2">
            <p className="text-lg font-bold">{cardContent.role}</p>
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
