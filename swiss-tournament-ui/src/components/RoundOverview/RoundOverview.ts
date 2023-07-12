import ko from "knockout";
import {
  tournamentState,
} from "../../state/TournamentState";
import { registerComponent } from "../Component";
import template from "./RoundOverview.html?raw";

import "../PairingResult/PairingResult"

const RoundOverviewVM = ({}) => {
  const { currentRound, completedRounds } = tournamentState;

  const pairings = ko.pureComputed(() => currentRound() ?? []);

  const roundNr = ko.pureComputed(() => {
    return completedRounds().length + 1;
  });

  return {
    roundNr,
    pairings,

    roundHasStarted: ko.pureComputed(() => {
      return pairings().some((p) => p.result() !== 0);
    })
  };
};

registerComponent("round-overview", RoundOverviewVM, template);
