import type { GameSnapshot, Stroke } from "@fake-goes-party/shared";

export interface ServerMessage {
  type: "snapshot" | "stroke" | "clear";
  snapshot?: GameSnapshot;
  stroke?: Stroke;
}

export interface ClientMessage {
  type: "event" | "stroke" | "clear";
  event?: unknown;
  stroke?: unknown;
}
