/**
 * Takes raw votes (voterIndex → votedForIndex) and returns
 * a tally (votedForIndex → count).
 */
export function tallyVotes(
  votes: Record<string, number>
): Record<string, number> {
  const tally: Record<string, number> = {};
  for (const votedFor of Object.values(votes)) {
    const key = String(votedFor);
    tally[key] = (tally[key] ?? 0) + 1;
  }
  return tally;
}

/**
 * Determines if the fake artist was caught by the vote.
 * Caught = fake has the unique highest vote count (no tie).
 */
export function isFakeCaught(
  votes: Record<string, number>,
  fakeArtistIndex: number
): boolean {
  const tally = tallyVotes(votes);
  const counts = Object.values(tally);
  if (counts.length === 0) return false;
  const maxVotes = Math.max(...counts);
  const topPlayers = Object.keys(tally).filter(
    (k) => tally[k] === maxVotes
  );
  return topPlayers.length === 1 && topPlayers[0] === String(fakeArtistIndex);
}
