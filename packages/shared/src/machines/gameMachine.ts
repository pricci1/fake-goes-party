import {
  createMachine,
  state,
  transition,
  immediate,
  guard,
  reduce,
} from "robot3";
import type { GameContext } from "../schemas/index.ts";
import { MIN_PLAYERS } from "../constants/index.ts";
import {
  getQmIndex,
  getArtistIndices,
  getArtistIndicesSet,
  isFakeCaught,
  findWinners,
  applyScoring,
} from "../logic/index.ts";

export function createGameMachine(initialContext: GameContext) {
  const machine = createMachine(
    "lobby",
    {
      lobby: state(
        transition(
          "START_GAME",
          "setupQM",
          guard((ctx: GameContext) => ctx.players.length >= MIN_PLAYERS),
          reduce((ctx: GameContext) => ({ ...ctx, round: 0 }))
        )
      ),

      setupQM: state(
        immediate(
          "categorySelection",
          reduce((ctx: GameContext) => {
            const qmIndex = ctx.aiQm
              ? -1
              : getQmIndex(ctx.round, ctx.players.length);
            return {
              ...ctx,
              qmIndex,
              fakeArtistIndex: null,
              category: "",
              title: "",
              cardsRevealed: {},
              votes: {},
              drawRound: 0,
              cards: [],
              currentDrawerIdx: 0,
              drawOrder: [],
              fakeCaught: null,
              fakeGuess: "",
              correctGuess: null,
              scoreMessage: "",
            };
          })
        )
      ),

      categorySelection: state(
        transition(
          "SET_CATEGORY",
          "cardDistribution",
          reduce((ctx: GameContext, ev: any) => {
            const artists = getArtistIndices(
              ctx.players.length,
              ctx.qmIndex
            );
            const cards = artists.map((i) => ({
              playerIndex: i,
              isFake: i === ev.fakeArtistIndex,
            }));
            return {
              ...ctx,
              category: ev.category,
              title: ev.title,
              fakeArtistIndex: ev.fakeArtistIndex,
              cardsRevealed: {},
              cards,
            };
          })
        )
      ),

      cardDistribution: state(
        transition(
          "CARDS_REVEALED",
          "colorSelection",
          guard((ctx: GameContext, ev: any) => {
            const artists = getArtistIndicesSet(
              ctx.players.length,
              ctx.qmIndex
            );
            if (!artists.has(ev.playerIndex)) {
              return false;
            }
            const revealed = {
              ...ctx.cardsRevealed,
              [String(ev.playerIndex)]: true,
            };
            for (const index of artists) {
              if (revealed[String(index)] !== true) {
                return false;
              }
            }
            return true;
          }),
          reduce((ctx: GameContext, ev: any) => ({
            ...ctx,
            cardsRevealed: getArtistIndicesSet(
              ctx.players.length,
              ctx.qmIndex
            ).has(ev.playerIndex)
              ? {
                  ...ctx.cardsRevealed,
                  [String(ev.playerIndex)]: true,
                }
              : ctx.cardsRevealed,
          }))
        ),
        transition(
          "CARDS_REVEALED",
          "cardDistribution",
          reduce((ctx: GameContext, ev: any) => ({
            ...ctx,
            cardsRevealed: getArtistIndicesSet(
              ctx.players.length,
              ctx.qmIndex
            ).has(ev.playerIndex)
              ? {
                  ...ctx.cardsRevealed,
                  [String(ev.playerIndex)]: true,
                }
              : ctx.cardsRevealed,
          }))
        )
      ),

      colorSelection: state(
        transition(
          "COLORS_CHOSEN",
          "drawingPhase",
          reduce((ctx: GameContext) => {
            const artists = getArtistIndices(
              ctx.players.length,
              ctx.qmIndex
            );
            return {
              ...ctx,
              drawRound: 1,
              currentDrawerIdx: 0,
              drawOrder: artists,
            };
          })
        )
      ),

      drawingPhase: state(
        transition(
          "MARK_MADE",
          "checkDrawing",
          reduce((ctx: GameContext) => ({
            ...ctx,
            currentDrawerIdx: ctx.currentDrawerIdx + 1,
          }))
        )
      ),

      checkDrawing: state(
        immediate(
          "drawingPhase",
          guard(
            (ctx: GameContext) =>
              ctx.currentDrawerIdx < ctx.drawOrder.length
          )
        ),
        immediate(
          "drawingPhase",
          guard((ctx: GameContext) => ctx.drawRound < ctx.maxDrawRounds),
          reduce((ctx: GameContext) => ({
            ...ctx,
            drawRound: ctx.drawRound + 1,
            currentDrawerIdx: 0,
          }))
        ),
        immediate("voting")
      ),

      voting: state(
        transition(
          "SUBMIT_VOTES",
          "evaluateVotes",
          guard((ctx: GameContext, ev: any) => {
            const artists = getArtistIndicesSet(
              ctx.players.length,
              ctx.qmIndex
            );
            if (!artists.has(ev.voterIndex)) {
              return false;
            }
            const votes = {
              ...ctx.votes,
              [String(ev.voterIndex)]: ev.votedForIndex,
            };
            for (const index of artists) {
              if (votes[String(index)] === undefined) {
                return false;
              }
            }
            return true;
          }),
          reduce((ctx: GameContext, ev: any) => ({
            ...ctx,
            votes: getArtistIndicesSet(
              ctx.players.length,
              ctx.qmIndex
            ).has(ev.voterIndex)
              ? {
                  ...ctx.votes,
                  [String(ev.voterIndex)]: ev.votedForIndex,
                }
              : ctx.votes,
          }))
        ),
        transition(
          "SUBMIT_VOTES",
          "voting",
          reduce((ctx: GameContext, ev: any) => ({
            ...ctx,
            votes: getArtistIndicesSet(
              ctx.players.length,
              ctx.qmIndex
            ).has(ev.voterIndex)
              ? {
                  ...ctx.votes,
                  [String(ev.voterIndex)]: ev.votedForIndex,
                }
              : ctx.votes,
          }))
        )
      ),

      evaluateVotes: state(
        immediate(
          "scoreFakeWins",
          guard((ctx: GameContext) => {
            return !isFakeCaught(ctx.votes, ctx.fakeArtistIndex!);
          }),
          reduce((ctx: GameContext) => ({ ...ctx, fakeCaught: false }))
        ),
        immediate(
          "fakeArtistGuess",
          reduce((ctx: GameContext) => ({ ...ctx, fakeCaught: true }))
        )
      ),

      scoreFakeWins: state(
        immediate(
          "scoring",
          reduce((ctx: GameContext) => {
            const result = applyScoring({
              scores: ctx.scores,
              qmIndex: ctx.qmIndex,
              fakeArtistIndex: ctx.fakeArtistIndex!,
              fakeCaught: false,
              correctGuess: null,
              playerCount: ctx.players.length,
            });
            return {
              ...ctx,
              scores: result.scores,
              scoreMessage: result.scoreMessage,
            };
          })
        )
      ),

      fakeArtistGuess: state(
        transition(
          "GUESS_TITLE",
          "evaluateGuess",
          reduce((ctx: GameContext, ev: any) => ({
            ...ctx,
            fakeGuess: ev.guess,
          }))
        )
      ),

      evaluateGuess: state(
        immediate(
          "scoring",
          guard(
            (ctx: GameContext) =>
              ctx.fakeGuess.trim().toLowerCase() ===
              ctx.title.trim().toLowerCase()
          ),
          reduce((ctx: GameContext) => {
            const result = applyScoring({
              scores: ctx.scores,
              qmIndex: ctx.qmIndex,
              fakeArtistIndex: ctx.fakeArtistIndex!,
              fakeCaught: true,
              correctGuess: true,
              playerCount: ctx.players.length,
            });
            return {
              ...ctx,
              scores: result.scores,
              correctGuess: true,
              scoreMessage: result.scoreMessage,
            };
          })
        ),
        immediate(
          "aiEvaluateGuess",
          guard((ctx: GameContext) => ctx.aiGuessEval),
          reduce((ctx: GameContext) => ctx)
        ),
        immediate(
          "scoring",
          reduce((ctx: GameContext) => {
            const result = applyScoring({
              scores: ctx.scores,
              qmIndex: ctx.qmIndex,
              fakeArtistIndex: ctx.fakeArtistIndex!,
              fakeCaught: true,
              correctGuess: false,
              playerCount: ctx.players.length,
            });
            return {
              ...ctx,
              scores: result.scores,
              correctGuess: false,
              scoreMessage: result.scoreMessage,
            };
          })
        )
      ),

      aiEvaluateGuess: state(
        transition(
          "AI_GUESS_RESULT",
          "scoring",
          reduce((ctx: GameContext, ev: any) => {
            const result = applyScoring({
              scores: ctx.scores,
              qmIndex: ctx.qmIndex,
              fakeArtistIndex: ctx.fakeArtistIndex!,
              fakeCaught: true,
              correctGuess: ev.correct,
              playerCount: ctx.players.length,
            });
            return {
              ...ctx,
              scores: result.scores,
              correctGuess: ev.correct,
              scoreMessage: result.scoreMessage,
            };
          })
        )
      ),

      scoring: state(transition("CONTINUE", "checkWinner")),

      checkWinner: state(
        immediate(
          "gameOver",
          guard((ctx: GameContext) =>
            ctx.scores.some((s) => s >= ctx.winThreshold)
          ),
          reduce((ctx: GameContext) => {
            const winners = findWinners(
              ctx.scores,
              ctx.players,
              ctx.winThreshold
            );
            return { ...ctx, winners };
          })
        ),
        immediate(
          "setupQM",
          reduce((ctx: GameContext) => ({
            ...ctx,
            round: ctx.round + 1,
            scoreMessage: "",
            fakeGuess: "",
            correctGuess: null,
            fakeCaught: null,
          }))
        )
      ),

      gameOver: state(
        transition(
          "PLAY_AGAIN",
          "lobby",
          reduce((ctx: GameContext) => ({
            ...ctx,
            scores: ctx.players.map(() => 0),
            round: 0,
            winners: [],
            scoreMessage: "",
          }))
        )
      ),
    },
    (ctx: GameContext) => ctx
  );
  return { machine, initialContext };
}
