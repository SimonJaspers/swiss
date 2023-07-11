import { createRanking, playerInResult, pointsForPlayerForResult } from "../../../../swiss/main";
import { registerComponent } from "../Component";
import template from "./Ranking.html?raw"
import "./Ranking.scss";

import ko from "knockout";

import "../PlayerDetails/PlayerDetails"
import "../PlayerRegistrationForm/PlayerRegistrationForm";
import { uiState } from "../../state/UiState";
import { tournamentState } from "../../state/TournamentState";

registerComponent("ranking", (_params: {}) => {
  const { id: selectedPlayerId } = uiState;
  const { tournament, phase, completedRounds } = tournamentState;

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
        score,
        tieBreakScore,
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

  return {
    ranking,
    selectedPlayerId,

    showRegistrationForm: phase.map(current => current === "registration")
  }
}, template)