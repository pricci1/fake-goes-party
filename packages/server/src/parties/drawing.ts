import type * as Party from "partykit/server";
import { StrokeSchema, type Stroke } from "@fake-goes-party/shared";
import type { ServerMessage, ClientMessage } from "./types.ts";

export default class DrawingParty implements Party.Server {
  private strokes: Stroke[] = [];

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection): void | Promise<void> {
    // Send all existing strokes to newly connected client
    for (const stroke of this.strokes) {
      conn.send(JSON.stringify({ type: "stroke", stroke } as ServerMessage));
    }
  }

  onMessage(message: string, sender: Party.Connection): void | Promise<void> {
    try {
      const clientMsg = JSON.parse(message) as ClientMessage;

      if (clientMsg.type === "stroke") {
        const parsed = StrokeSchema.safeParse(clientMsg.stroke);
        if (!parsed.success) {
          sender.send(
            JSON.stringify({
              type: "error",
              error: "Invalid stroke",
              details: parsed.error,
            })
          );
          return;
        }

        const validStroke = parsed.data;
        this.strokes.push(validStroke);

        // Broadcast to all clients
        const message: ServerMessage = { type: "stroke", stroke: validStroke };
        this.room.broadcast(JSON.stringify(message));
      }

      if (clientMsg.type === "clear") {
        this.strokes = [];
        this.room.broadcast(JSON.stringify({ type: "clear" } as ServerMessage));
      }
    } catch (error) {
      sender.send(
        JSON.stringify({ type: "error", error: "Failed to parse message" })
      );
    }
  }
}
