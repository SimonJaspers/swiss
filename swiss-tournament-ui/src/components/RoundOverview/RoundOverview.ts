import ko from "knockout"
import { createRound } from "../../../../swiss/main";
import { resultStateToResult, resultToResultState, tournamentState } from "../../state/TournamentState";
import { registerComponent } from "../Component";
import template from "./RoundOverview.html?raw";



const RoundOverviewVM = ({}) => {
  const { tournament, currentRound, completedRounds, phase } = tournamentState;

  const roundNr = ko.pureComputed(() => {
    return completedRounds().length + 1
  });

  const pairings = ko.pureComputed(() => currentRound() ?? []);



  // TODO: limit to max rounds
  const maxRounds = ko.pureComputed(() => {
    const evenCompetitors = Math.floor(tournament().length / 2) * 2;
    
    return evenCompetitors - 1;
  });

  return {
    roundNr,
    pairings,

    roundHasStarted: ko.pureComputed(() => {
      return pairings().length && pairings().some(p => p.result() !== 0);
    }),

    completeRound: () => {
      const hasUnplayedGames = pairings().some(p => p.result() === 0 && p.player1 !== p.player2);

      if (hasUnplayedGames && !confirm("There are unplayed games this round. Proceeding means involved players do not receive any points.")) {
        return;
      }

      
      const completedRound = pairings().map(resultStateToResult);
      completedRounds.push(completedRound);

      const tournamentComplete = completedRounds().length === maxRounds();
      const nextRound = createRound(tournament(), completedRounds()).map(resultToResultState);

      if (tournamentComplete || nextRound.every(({ player1, player2 }) => player1.id === player2.id)) {
        currentRound(null);
        phase("completed")
      } else {
        currentRound(nextRound);
      }
    }
  }
  
}

registerComponent("round-overview", RoundOverviewVM, template)