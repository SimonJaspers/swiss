import ko from "knockout";
import {
  ResultState,
  tournamentState,
} from "../../state/TournamentState";
import { registerComponent } from "../Component";
import template from "./RoundOverview.html?raw";

import "../PairingResult/PairingResult"

const RoundOverviewVM = ({}) => {
  const { currentRound, completedRounds } = tournamentState;

  const pairings = ko.pureComputed(() => currentRound() ?? []);

  const groups = ko.pureComputed(() => {
    const played: ResultState[] = [];
    const todo: ResultState[] = [];
    const byes: ResultState[] = [];

    for (const pairing of pairings()) {
      const { player1, player2, result } = pairing;

      if (player1.id === player2.id) {
        byes.push(pairing);
      } else if (result() !== 0) {
        played.push(pairing);
      } else {
        todo.push(pairing);
      }
    }

    return {
      played,
      todo,
      byes
    }
  })
  

  const roundNr = ko.pureComputed(() => {
    return completedRounds().length + 1;
  });

  return {
    roundNr,
    groups,

    roundHasStarted: ko.pureComputed(() => {
      return pairings().some((p) => p.result() !== 0);
    })
  };
};

registerComponent("round-overview", RoundOverviewVM, template);
