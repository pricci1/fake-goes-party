import type { DrawSync } from "../interfaces/index.ts";
import type { Stroke } from "../schemas/index.ts";
import type { Unsubscribe } from "../interfaces/index.ts";

export class RemoteDrawSync implements DrawSync {
  private ws: WebSocket | null = null;
  private strokes: Stroke[] = [];
  private listeners = new Set<(stroke: Stroke) => void>();
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
    const url = `${protocol}://${this.partyHost}/parties/drawing/${this.roomId}`;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log("[RemoteDrawSync] Connected");
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data as string);

        if (message.type === "stroke") {
          this.strokes.push(message.stroke as Stroke);
          this.notifyListeners(message.stroke as Stroke);
        }

        if (message.type === "clear") {
          this.strokes = [];
        }

        if (message.type === "error") {
          console.error("[RemoteDrawSync] Server error:", message);
        }
      } catch (error) {
        console.error("[RemoteDrawSync] Failed to parse message:", error);
      }
    };

    this.ws.onclose = () => {
      console.log("[RemoteDrawSync] Disconnected");
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error("[RemoteDrawSync] WebSocket error:", error);
    };
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        "[RemoteDrawSync] Max reconnect attempts reached. Giving up."
      );
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `[RemoteDrawSync] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  pushStroke(stroke: Stroke): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("[RemoteDrawSync] Cannot push stroke: not connected");
      return;
    }

    this.ws.send(JSON.stringify({ type: "stroke", stroke }));
  }

  onStroke(listener: (stroke: Stroke) => void): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getStrokes(): Stroke[] {
    return [...this.strokes];
  }

  clear(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("[RemoteDrawSync] Cannot clear: not connected");
      return;
    }

    this.ws.send(JSON.stringify({ type: "clear" }));
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private notifyListeners(stroke: Stroke): void {
    for (const listener of this.listeners) {
      listener(stroke);
    }
  }
}
