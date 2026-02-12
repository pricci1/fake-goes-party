import { z } from "zod";
import { PlayerSchema } from "./player.ts";

const AddPlayerEvent = z.object({
  type: z.literal("ADD_PLAYER"),
  player: PlayerSchema,
});

const RemovePlayerEvent = z.object({
  type: z.literal("REMOVE_PLAYER"),
  playerIndex: z.number().int().min(0),
});

const StartGameEvent = z.object({
  type: z.literal("START_GAME"),
});

const SetCategoryEvent = z.object({
  type: z.literal("SET_CATEGORY"),
  category: z.string().min(1),
  title: z.string().min(1),
  fakeArtistIndex: z.number().int().min(0),
});

const CardsRevealedEvent = z.object({
  type: z.literal("CARDS_REVEALED"),
  playerIndex: z.number().int().min(0),
});

const ColorsChosenEvent = z.object({
  type: z.literal("COLORS_CHOSEN"),
});

const MarkMadeEvent = z.object({
  type: z.literal("MARK_MADE"),
});

const SubmitVotesEvent = z.object({
  type: z.literal("SUBMIT_VOTES"),
  voterIndex: z.number().int().min(0),
  votedForIndex: z.number().int().min(0),
});

const GuessTitleEvent = z.object({
  type: z.literal("GUESS_TITLE"),
  guess: z.string(),
});

const ContinueEvent = z.object({
  type: z.literal("CONTINUE"),
});

const PlayAgainEvent = z.object({
  type: z.literal("PLAY_AGAIN"),
});

const SetAiQmEvent = z.object({
  type: z.literal("SET_AI_QM"),
  enabled: z.boolean(),
});

export const GameEventSchema = z.discriminatedUnion("type", [
  AddPlayerEvent,
  RemovePlayerEvent,
  StartGameEvent,
  SetCategoryEvent,
  CardsRevealedEvent,
  ColorsChosenEvent,
  MarkMadeEvent,
  SubmitVotesEvent,
  GuessTitleEvent,
  ContinueEvent,
  PlayAgainEvent,
  SetAiQmEvent,
]);

export type GameEvent = z.infer<typeof GameEventSchema>;
