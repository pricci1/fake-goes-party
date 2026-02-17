import PartySocket from "partysocket";
import type { GameAuthority, Unsubscribe } from "@fake-goes-party/shared";
import type { GameEvent, GameSnapshot } from "@fake-goes-party/shared";

export class RemoteGameAuthority implements GameAuthority {
  private socket: PartySocket;
  private listeners = new Set<(snapshot: GameSnapshot) => void>();
  private currentSnapshot: GameSnapshot | null = null;

  constructor(roomId: string, partyHost: string = "localhost:1999") {
    this.socket = new PartySocket({
      host: partyHost,
      room: roomId,
      party: "game",
    });

    this.socket.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(event.data as string);

        if (message.type === "snapshot") {
          this.currentSnapshot = message.snapshot;
          this.notifyListeners();
        }

        if (message.type === "error") {
          console.error("[RemoteGameAuthority] Server error:", message);
        }
      } catch (error) {
        console.error("[RemoteGameAuthority] Failed to parse message:", error);
      }
    });
  }

  dispatch(event: GameEvent): void {
    this.socket.send(JSON.stringify({ type: "event", event }));
  }

  subscribe(listener: (snapshot: GameSnapshot) => void): Unsubscribe {
    this.listeners.add(listener);
    if (this.currentSnapshot) {
      listener(this.currentSnapshot);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot(): GameSnapshot {
    if (!this.currentSnapshot) {
      throw new Error("No snapshot available yet");
    }
    return this.currentSnapshot;
  }

  disconnect(): void {
    this.socket.close();
  }

  private notifyListeners(): void {
    if (!this.currentSnapshot) return;
    for (const listener of this.listeners) {
      listener(this.currentSnapshot);
    }
  }
}
