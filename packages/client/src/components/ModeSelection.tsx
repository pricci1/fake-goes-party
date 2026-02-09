import { useSetAtom } from "jotai";
import { gameModeAtom, roomIdAtom } from "../atoms/modeAtoms";
import { generateRoomId, getRoomIdFromUrl, setRoomIdInUrl } from "../utils/roomId";

export function ModeSelection() {
  const setMode = useSetAtom(gameModeAtom);
  const setRoomId = useSetAtom(roomIdAtom);

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
        Local mode: Share one device between players.
        <br />
        Online mode: Each player uses their own device.
      </p>
    </div>
  );
}
