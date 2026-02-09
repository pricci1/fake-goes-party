import type { GameAuthority, Unsubscribe } from "../interfaces/index.ts";
import type { GameEvent, GameSnapshot } from "../schemas/index.ts";

export class RemoteGameAuthority implements GameAuthority {
  private ws: WebSocket | null = null;
  private listeners = new Set<(snapshot: GameSnapshot) => void>();
  private currentSnapshot: GameSnapshot | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(
    private roomId: string,
    private partyHost: string = "localhost:1999"
  ) {
    this.connect();
  }

  private connect(): void {
    const protocol = this.partyHost.startsWith("localhost") ? "ws" : "wss";
    const url = `${protocol}://${this.partyHost}/parties/game/${this.roomId}`;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log("[RemoteGameAuthority] Connected");
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
    };

    this.ws.onmessage = (event) => {
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
    };

    this.ws.onclose = () => {
      console.log("[RemoteGameAuthority] Disconnected");
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error("[RemoteGameAuthority] WebSocket error:", error);
    };
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        "[RemoteGameAuthority] Max reconnect attempts reached. Giving up."
      );
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `[RemoteGameAuthority] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  dispatch(event: GameEvent): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("[RemoteGameAuthority] Cannot dispatch: not connected");
      return;
    }

    this.ws.send(JSON.stringify({ type: "event", event }));
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
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private notifyListeners(): void {
    if (!this.currentSnapshot) return;
    for (const listener of this.listeners) {
      listener(this.currentSnapshot);
    }
  }
}
