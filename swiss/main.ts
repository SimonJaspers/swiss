const Score = {
  Player1Won: 1,
  Player2Won: -1,
  Draw: 0.5,
  NotPlayed: 0,
} as const;

export type ScoringOption = (typeof Score)[keyof typeof Score];

export type Competitor = {
  name: string;
  id: string;
};

export type Pairing = [Competitor, Competitor];

export type Result = {
  pairing: Pairing;
  score: ScoringOption;
};

export type Round = Result[];

export type Rank = {
  player: Competitor;
  rank: number;
  score: number;
  tieBreakScore: number;
};

export type Tournament = Competitor[];

// Utilities
export const playerInResult = (player: Competitor, result: Result): boolean => {
  const [p1, p2] = result.pairing;
  return p1.id === player.id || p2.id === player.id;
};

export const playerWon = (player: Competitor, result: Result): boolean => {
  const [p1, p2] = result.pairing;
  const winner =
    result.score === Score.Player1Won
      ? p1
      : result.score === Score.Player2Won
      ? p2
      : null;

  if (!winner) return false;
  return player.id === winner.id;
};

export const pointsForPlayerForResult = (
  player: Competitor,
  result: Result
) => {
  if (playerInResult(player, result)) {
    if (result.score === 0.5) return 0.5;
    if (playerWon(player, result)) return 1;
  }

  return 0;
};

export const calculateScore = (player: Competitor, rounds: Round[]): number => {
  return rounds
    .flat()
    .map((result) => pointsForPlayerForResult(player, result))
    .reduce((total: number, score) => total + score, 0);
};

const calculateBuchholzScore = (
  player: Competitor,
  rounds: Round[],
  playerScores: Map<string, number>
): number => {
  const wins = rounds.flat().filter((result) => playerWon(player, result));
  const playersInWonGames = wins.flatMap((result) => result.pairing);

  return playersInWonGames.reduce((total, playerOrOpponent) => {
    if (playerOrOpponent.id === player.id) return total;

    const opponentScore = playerScores.get(playerOrOpponent.id);
    if (opponentScore === undefined) {
      throw new Error("Player has result against unscored opponent");
    }

    return total + opponentScore;
  }, 0);
};

// TODO: refactor
export const createRanking = (
  tournament: Tournament,
  rounds: Round[]
): Rank[] => {
  const playerScores = new Map(
    tournament.map((c) => [c.id, calculateScore(c, rounds)])
  );
  const tieBreakScores = new Map(
    tournament.map((c) => [
      c.id,
      calculateBuchholzScore(c, rounds, playerScores),
    ])
  );

  const rankedPlayers = Array.from(tournament).sort((p1, p2) => {
    const s1 = playerScores.get(p1.id)!;
    const s2 = playerScores.get(p2.id)!;
    if (s1 !== s2) return s2 - s1;

    const b1 = tieBreakScores.get(p1.id)!;
    const b2 = tieBreakScores.get(p2.id)!;
    if (b1 !== b2) return b2 - b1;

    return p1.id.localeCompare(p2.id, undefined, { numeric: true });
  });

  let rank = 0;
  const ranks: Rank[] = [];

  for (let i = 0; i < rankedPlayers.length; i += 1) {
    const player = rankedPlayers[i];
    const score = playerScores.get(player.id)!;
    const tieBreakScore = tieBreakScores.get(player.id)!;

    const prev = ranks.at(-1);
    if (!prev || prev.score > score || prev.tieBreakScore > tieBreakScore) {
      rank = i + 1;
    }

    ranks.push({
      player,
      score,
      tieBreakScore,
      rank,
    });
  }

  return ranks;
};

export const createRound = (tournament: Tournament, rounds: Round[]): Round => {
  const pairings = createPairings(tournament, rounds);

  const newRound: Round = pairings.map((pairing) => ({
    pairing,
    // People with a bye get awarded a point. This makes it so that they can escape
    // the last place and be included in the regular pairings again.
    score: pairing[0].id === pairing[1].id ? Score.Player1Won : Score.NotPlayed,
  }));

  return newRound;
};

export const createPairings = (
  tournament: Tournament,
  rounds: Round[]
): Pairing[] => {
  // TODO: option to differentiate between [p1, p2] and [p2, p1] (i.e. players play twice, alternating who starts the game)
  const ranking = createRanking(tournament, rounds);

  // Pairs of players that need to play each other.
  // If a player cannot be paired, they will be paired to
  // themselves
  const pairs: Pairing[] = [];
  const pairingQueue = new Set(ranking.map((p) => p.player));
  const playerHistoryIncludingSelf = new Map(
    tournament.map((p) => [p.id, new Set([p.id])])
  );

  for (const {
    pairing: [p1, p2],
  } of rounds.flat()) {
    playerHistoryIncludingSelf.get(p1.id)!.add(p2.id);
    playerHistoryIncludingSelf.get(p2.id)!.add(p1.id);
  }

  while (pairingQueue.size > 0) {
    const player1 = pairingQueue.values().next().value as Competitor; // TODO
    let player2 = player1;

    pairingQueue.delete(player1);

    // Find a player2
    for (const candidate of pairingQueue) {
      if (!playerHistoryIncludingSelf.get(player1.id)!.has(candidate.id)) {
        player2 = candidate;
        break;
      }
    }

    pairs.push([player1, player2]);
    pairingQueue.delete(player2);
  }

  return pairs;
};
