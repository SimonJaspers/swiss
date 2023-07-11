import "./style.scss"
import {createRanking, type Competitor, pointsForPlayerForResult, createRound, playerInResult} from "../../swiss/main";
import ko from "knockout";

import "./knockout-extend";
import "./components/RankedPlayerRow/RankedPlayerRow";
import "./components/Ranking/Ranking";
import "./components/RoundOverview/RoundOverview";

import { resultToResultState, tournamentState } from "./state/TournamentState";
import { uiState } from "./state/UiState";

const { phase, tournament, completedRounds, currentRound } = tournamentState;
const { id: selectedPlayerId } = uiState;

const selectedPlayer = ko.pureComputed(() => 
  tournament().find(p => p.id === selectedPlayerId()) ?? null
)

// TODO: How do we solve this in a better way?
const _clearSelectedIdFromUiStateIfPlayerNoLongerExists = ko.computed(() => {
  if (selectedPlayerId() && !selectedPlayer()) {
    selectedPlayerId(null);
  }
}).extend({ deferred: true });
_clearSelectedIdFromUiStateIfPlayerNoLongerExists;

const startTournament = () => {
  if (phase() !== "registration")
    throw new Error("Cannot start a tournament that is not in registration phase");

  currentRound(
    createRound(tournament(), completedRounds()).map(resultToResultState)
  )
  phase("in_progress");
}

const restartTournament = () => {
  if (phase() === "registration") 
    throw new Error("Cannot restart a tournament that hasn't started");

  const hasResults = currentRound()?.some(r => r.result() !== 0);
  if (hasResults && !confirm("Proceeding will keep registered players but clear all results")) return;

  completedRounds([]);
  currentRound(null);

  phase("registration");
}

const startNewTournament = () => {
  if (!confirm("Proceeding will delete all current tournament data")) return;

  tournament([]);
  currentRound(null);
  completedRounds([]);
  phase("registration");
}

const completeTournament = () => {
  if (phase() !== "in_progress") 
    throw new Error("Cannot complete a tournament that is not in progress");

  
  // TODO: include current round?
  phase("completed");
}



const removePlayer = (player: Competitor) => {
  tournament.remove(p => p.id === player.id);
  if (selectedPlayerId() === player.id) selectedPlayerId(null);
}

// Tournament
const tournamentVM = {
  phase,
  state: tournament,

  selectedPlayerId,

  start: startTournament,
  restart: restartTournament,
  complete: completeTournament,
  reset: startNewTournament,
}

const clock = ko.observable(new Date());
setInterval(() => clock(new Date()), 1000);


const ranking = ko.pureComputed(() => {
  return createRanking(tournament(), completedRounds()).map(({ player: p, rank, score, tieBreakScore }) => {
    const playedGames = completedRounds()
      .flat()
      .filter(r => playerInResult(p, r));

    const wins = playedGames.filter(r => pointsForPlayerForResult(p, r) === 1);
    const draws = playedGames.filter(r => pointsForPlayerForResult(p, r) === 0.5);
    const losses = playedGames.filter(r => r.score !== 0 && pointsForPlayerForResult(p, r) === 0);
    
    return ({
      ...p,
      rank,
      score: `${score}`,
      tieBreakScore: `(${tieBreakScore})`,
      record: {
        win: wins.length,
        lose: losses.length,
        draw: draws.length
      },
      resultLabels: playedGames.map(r => 
        pointsForPlayerForResult(p, r)
      )
    })
  })
});

const vm = {
  // $root state
  tournament,
  phase,
  
  tournamentVM,

  removePlayer,
  ranking,
  currentRound,

  time: ko.pureComputed(() => {
    const now = clock();

    return now.toLocaleTimeString(undefined, { hour12: false })
  }),

  selectedPlayer,
  selectedPlayerId,
  deleteTournament: () => {
    if (!confirm("Proceeding will delete all players and results")) return;

    selectedPlayer(null);
    tournament([]);
  }
}


ko.applyBindings(vm);

window.ko = ko;
