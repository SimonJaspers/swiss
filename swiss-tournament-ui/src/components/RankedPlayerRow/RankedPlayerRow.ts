import ko from "knockout";
import "./RankedPlayerRow.scss";
import template from "./RankedPlayerRow.html?raw";
import { registerComponent } from "../Component";
import { uiState } from "../../state/UiState";
import { tournamentState } from "../../state/TournamentState";

type RankedPlayerParams = {
  rank: number;
  name: string;
  score: number;
  tieBreakScore: number;
  record: { win: number; loss: number; draw: number };
  id: string;
};

const RankedPlayerRowVM = ({
  id,
  rank,
  name,
  score,
  record,
  tieBreakScore,
}: RankedPlayerParams) => {
  const { phase } = tournamentState;
  const { id: selectedPlayerId } = uiState;

  return {
    rank,
    name,
    score,
    tieBreakScore,
    record,
    isSelected: ko.pureComputed(() => {
      return selectedPlayerId() === id;
    }),

    rankClass: ko.pureComputed(() => {
      if (phase() === "completed") {
        switch (rank) {
          case 1:
            return "is-gold";
          case 2:
            return "is-silver";
          case 3:
            return "is-bronze";
        }
      }

      return "";
    }),

    handleClick: () => {
      if (selectedPlayerId() !== id) selectedPlayerId(id);
      else selectedPlayerId(null);
    },
  };
};

registerComponent("ranked-player-row", RankedPlayerRowVM, template);
