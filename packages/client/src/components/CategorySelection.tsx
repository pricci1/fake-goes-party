import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { gameSnapshotAtom, canActAtom, actingPlayerNameAtom, isMultiSeatAtom, aiQmAtom, gameModeAtom, aiQmLanguageAtom, suggestingAtom, aiSuggestAtom } from "@fake-goes-party/common";
import { useGame } from "@fake-goes-party/common";
import { DevicePassGuard } from "./DevicePassGuard";
import { AI_QM_LANGUAGES } from "@fake-goes-party/shared";

export function CategorySelection() {
  const { dispatch } = useGame();
  const snapshot = useAtomValue(gameSnapshotAtom);
  const aiQm = useAtomValue(aiQmAtom);
  const canAct = useAtomValue(canActAtom);
  const actingPlayerName = useAtomValue(actingPlayerNameAtom);
  const isMultiSeat = useAtomValue(isMultiSeatAtom);
  const gameMode = useAtomValue(gameModeAtom);
  const aiQmLanguage = useAtomValue(aiQmLanguageAtom);
  const suggesting = useAtomValue(suggestingAtom);
  const aiSuggest = useSetAtom(aiSuggestAtom);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [suggestLanguage, setSuggestLanguage] = useState(aiQmLanguage);

  if (!snapshot) return null;

  const qmIndex = snapshot.context.qmIndex;
  const qmName = snapshot.context.players[qmIndex]?.name ?? "QM";
  const playerCount = snapshot.context.players.length;

  if (aiQm) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
        <h2 className="text-2xl font-bold">AI Question Master</h2>
        <p className="text-gray-500 animate-pulse">Choosing a category and title...</p>
      </div>
    );
  }

  const handleSuggest = async () => {
    const result = await aiSuggest({ playerCount, language: suggestLanguage });
    if (result) {
      setCategory(result.category);
      setTitle(result.title);
    }
  };

  const submit = () => {
    if (!category.trim() || !title.trim()) return;

    // Generate fakeArtistIndex outside the machine to keep it pure
    // Must be a non-QM player
    const artistIndices = Array.from({ length: playerCount }, (_, i) => i).filter(i => i !== qmIndex);
    const fakeArtistIndex = artistIndices[Math.floor(Math.random() * artistIndices.length)];

    dispatch({
      type: "SET_CATEGORY",
      category: category.trim(),
      title: title.trim(),
      fakeArtistIndex,
    });
  };

  const content = (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      <h2 className="text-2xl font-bold">
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-base font-semibold text-blue-700">
          {qmName}
        </span>
        {" "}is the Question Master
      </h2>
      <p className="text-gray-500">Pick a category and a secret title for everyone to draw.</p>
      <p className="text-sm text-gray-400">Don't let anyone else see the title!</p>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (e.g. Animals)"
          className="border rounded px-3 py-2"
          autoFocus
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Secret title (e.g. Cat)"
          className="border rounded px-3 py-2"
        />
        {gameMode === "remote" && (
          <>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Language:</label>
              <select
                value={suggestLanguage}
                onChange={(e) => setSuggestLanguage(e.target.value as typeof suggestLanguage)}
                className="border rounded px-2 py-1 text-sm"
              >
                {AI_QM_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSuggest}
              disabled={suggesting}
              type="button"
              className="border border-blue-600 text-blue-600 px-4 py-2 rounded disabled:opacity-50"
            >
              {suggesting ? "Generating..." : "✨ AI Suggest"}
            </button>
          </>
        )}
        <button
          onClick={submit}
          disabled={!category.trim() || !title.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Confirm
        </button>
      </div>
    </div>
  );

  if (!canAct) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
        <h2 className="text-2xl font-bold">
          Waiting for{" "}
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-base font-semibold text-blue-700">
            {actingPlayerName ?? qmName}
          </span>
        </h2>
        <p className="text-gray-500">The Question Master is choosing the category and title.</p>
        <p className="text-sm text-gray-400">Hold tight — don't peek!</p>
      </div>
    );
  }

  return (
    <DevicePassGuard playerName={actingPlayerName ?? qmName} canAct={canAct} isMultiSeat={isMultiSeat}>
      {content}
    </DevicePassGuard>
  );
}
