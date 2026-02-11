import { useState, useEffect } from "react";
import { useAtomValue } from "jotai";
import { myPlayerIndicesAtom } from "../atoms";

interface Props {
  playerName: string;
  children: React.ReactNode;
}

export function DevicePassGuard({ playerName, children }: Props) {
  const myIndices = useAtomValue(myPlayerIndicesAtom);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
  }, [playerName]);

  const isMultiSeat = myIndices.length > 1;

  if (!isMultiSeat || ready) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      <h2 className="text-2xl font-bold">Pass the device to</h2>
      <p className="text-4xl font-bold">{playerName}</p>
      <button
        onClick={() => setReady(true)}
        className="bg-blue-600 text-white px-6 py-3 rounded text-lg mt-4"
      >
        I'm {playerName} — Ready!
      </button>
    </div>
  );
}
