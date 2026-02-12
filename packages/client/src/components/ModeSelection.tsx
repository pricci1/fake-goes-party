import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { previousRemoteRoomIdsAtom } from "../atoms/playerIdentityAtoms";
import { gameModeAtom, roomIdAtom } from "../atoms/modeAtoms";
import { generateRoomId, getRoomIdFromUrl, setRoomIdInUrl } from "../utils/roomId";

export function ModeSelection() {
  const setMode = useSetAtom(gameModeAtom);
  const setRoomId = useSetAtom(roomIdAtom);
  const previousRoomIds = useAtomValue(previousRemoteRoomIdsAtom);

  // Auto-join if room ID in URL
  useEffect(() => {
    const roomId = getRoomIdFromUrl();
    if (roomId) {
      console.log("[ModeSelection] auto-joining room", roomId);
      setRoomId(roomId);
      setMode("remote");
    }
  }, [setMode, setRoomId]);

  const handleLocalMode = () => {
    setMode("local");
  };

  const handleCreateRoom = () => {
    const roomId = generateRoomId();
    setRoomId(roomId);
    setRoomIdInUrl(roomId);
    setMode("remote");
  };

  const handleJoinRoom = () => {
    const roomId = getRoomIdFromUrl();
    if (!roomId) {
      alert("No room ID in URL. Please use a link from the host.");
      return;
    }
    setRoomId(roomId);
    setMode("remote");
  };

  const handleJoinPreviousRoom = (roomId: string) => {
    setRoomId(roomId);
    setRoomIdInUrl(roomId);
    setMode("remote");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-8">
      <h1 className="text-4xl font-bold">Fake Goes Party</h1>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <button
          onClick={handleLocalMode}
          className="bg-blue-600 text-white px-8 py-4 rounded text-xl hover:bg-blue-700"
        >
          Play Locally (Pass Device)
        </button>

        <button
          onClick={handleCreateRoom}
          className="bg-green-600 text-white px-8 py-4 rounded text-xl hover:bg-green-700"
        >
          Create Online Room
        </button>

        <button
          onClick={handleJoinRoom}
          className="bg-purple-600 text-white px-8 py-4 rounded text-xl hover:bg-purple-700"
        >
          Join Online Room
        </button>
      </div>

      <p className="text-sm text-gray-500 text-center max-w-md">
        <span className="font-semibold text-gray-700">Local Mode:</span> Share one device between players, offline.
        <br />
        <span className="font-semibold text-gray-700">Remote Mode:</span> Online room. Single or multiple players per device.
      </p>

      {previousRoomIds.length > 0 ? (
        <div className="flex flex-col items-center gap-3 w-full max-w-md">
          <p className="text-sm font-semibold text-gray-700">Previous Rooms</p>
          <div className="flex flex-col gap-2 w-full">
            {previousRoomIds.map((roomId) => (
              <button
                key={roomId}
                onClick={() => handleJoinPreviousRoom(roomId)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
              >
                {roomId}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
