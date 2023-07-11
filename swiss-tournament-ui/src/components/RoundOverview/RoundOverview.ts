import ko from "knockout";
import { createRound } from "../../../../swiss/main";
import {
  resultStateToResult,
  resultToResultState,
  tournamentState,
} from "../../state/TournamentState";
import { registerComponent } from "../Component";
import template from "./RoundOverview.html?raw";

const RoundOverviewVM = ({}) => {
  const { tournament, currentRound, completedRounds, phase } = tournamentState;

  const pairings = ko.pureComputed(() => currentRound() ?? []);

  const roundNr = ko.pureComputed(() => {
    return completedRounds().length + 1;
  });

  const maxRounds = ko.pureComputed(() => {
    const evenCompetitors = Math.floor(tournament().length / 2) * 2;

    return evenCompetitors - 1;
  });

  return {
    roundNr,
    pairings,

    roundHasStarted: ko.pureComputed(() => {
      return pairings().some((p) => p.result() !== 0);
    }),

    completeRound: () => {
      const hasUnplayedGames = pairings().some(
        (p) => p.result() === 0 && p.player1 !== p.player2,
      );

      if (
        hasUnplayedGames &&
        !confirm(
          "There are unplayed games this round. Proceeding means involved players do not receive any points.",
        )
      ) {
        return;
      }

      // Register current round as completed
      const completedRound = pairings().map(resultStateToResult);
      completedRounds.push(completedRound);

      // Check if we need to start a new round
      const tournamentComplete = completedRounds().length === maxRounds();
      const nextRound = createRound(tournament(), completedRounds()).map(
        resultToResultState,
      );

      // TODO: figure out if the part after || can ever be true
      if (
        tournamentComplete ||
        nextRound.every(({ player1, player2 }) => player1.id === player2.id)
      ) {
        currentRound(null);
        phase("completed");
      } else {
        currentRound(nextRound);
      }
    },
  };
};

registerComponent("round-overview", RoundOverviewVM, template);
