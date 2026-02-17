import { describe, expect, test } from "bun:test";
import { LocalGameAuthority } from "../../authorities/LocalGameAuthority.ts";
import type { GameSnapshot } from "@fake-goes-party/shared";

function createAuthority(playerCount = 4) {
  const auth = new LocalGameAuthority();
  for (let i = 0; i < playerCount; i++) {
    auth.dispatch({
      type: "ADD_PLAYER",
      player: { id: `p${i}`, name: `Player${i}` },
    });
  }
  return auth;
}

describe("LocalGameAuthority", () => {
  test("getSnapshot returns lobby state initially", () => {
    const auth = new LocalGameAuthority();
    expect(auth.getSnapshot().state).toBe("lobby");
  });

  test("subscribe fires on dispatch", () => {
    const auth = createAuthority();
    const snapshots: GameSnapshot[] = [];
    auth.subscribe((s) => snapshots.push(s));
    auth.dispatch({ type: "START_GAME" });
    expect(snapshots.length).toBeGreaterThan(0);
    expect(snapshots[snapshots.length - 1]!.state).toBe("categorySelection");
  });

  test("unsubscribe stops notifications", () => {
    const auth = createAuthority();
    const snapshots: GameSnapshot[] = [];
    const unsub = auth.subscribe((s) => snapshots.push(s));
    auth.dispatch({ type: "START_GAME" });
    const count = snapshots.length;
    unsub();
    auth.dispatch({
      type: "SET_CATEGORY",
      category: "A",
      title: "B",
      fakeArtistIndex: 2,
    });
    expect(snapshots.length).toBe(count);
  });

  test("ADD_PLAYER adds player to context", () => {
    const auth = new LocalGameAuthority();
    auth.dispatch({
      type: "ADD_PLAYER",
      player: { id: "p1", name: "Alice" },
    });
    expect(auth.getSnapshot().context.players).toEqual([
      { id: "p1", name: "Alice" },
    ]);
  });

  test("REMOVE_PLAYER removes player from context", () => {
    const auth = createAuthority(3);
    auth.dispatch({ type: "REMOVE_PLAYER", playerIndex: 1 });
    expect(auth.getSnapshot().context.players.length).toBe(2);
  });

  test("full game loop works end-to-end", () => {
    const auth = createAuthority(4);
    auth.dispatch({ type: "START_GAME" });
    auth.dispatch({
      type: "SET_CATEGORY",
      category: "Animals",
      title: "Cat",
      fakeArtistIndex: 2,
    });
    auth.dispatch({ type: "CARDS_REVEALED", playerIndex: 1 });
    auth.dispatch({ type: "CARDS_REVEALED", playerIndex: 2 });
    auth.dispatch({ type: "CARDS_REVEALED", playerIndex: 3 });
    auth.dispatch({ type: "COLORS_CHOSEN" });

    const artistCount = auth.getSnapshot().context.drawOrder.length;
    for (let round = 0; round < 2; round++) {
      for (let i = 0; i < artistCount; i++) {
        auth.dispatch({ type: "MARK_MADE" });
      }
    }

    expect(auth.getSnapshot().state).toBe("voting");
    auth.dispatch({
      type: "SUBMIT_VOTES",
      voterIndex: 1,
      votedForIndex: 3,
    });
    auth.dispatch({
      type: "SUBMIT_VOTES",
      voterIndex: 2,
      votedForIndex: 3,
    });
    auth.dispatch({
      type: "SUBMIT_VOTES",
      voterIndex: 3,
      votedForIndex: 1,
    });
    expect(auth.getSnapshot().state).toBe("scoring");
  });
});

describe("LocalGameAuthority — event validation", () => {
  test("rejects event with missing required fields", () => {
    const auth = createAuthority();
    const snapshots: GameSnapshot[] = [];
    auth.subscribe((s) => snapshots.push(s));
    // @ts-expect-error — intentionally invalid event
    auth.dispatch({ type: "SET_CATEGORY" });
    expect(auth.getSnapshot().state).toBe("lobby");
    expect(snapshots.length).toBe(0);
  });

  test("rejects event with unknown type", () => {
    const auth = createAuthority();
    const snapshots: GameSnapshot[] = [];
    auth.subscribe((s) => snapshots.push(s));
    // @ts-expect-error — intentionally invalid event
    auth.dispatch({ type: "EXPLODE" });
    expect(auth.getSnapshot().state).toBe("lobby");
    expect(snapshots.length).toBe(0);
  });

  test("accepts valid events after validation", () => {
    const auth = createAuthority();
    auth.dispatch({ type: "START_GAME" });
    expect(auth.getSnapshot().state).toBe("categorySelection");
  });
});
