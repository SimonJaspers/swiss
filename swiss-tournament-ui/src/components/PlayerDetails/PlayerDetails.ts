import ko from "knockout";
import template from "./PlayerDetails.html?raw";
import "./PlayerDetails.scss"
import { registerComponent } from "../Component";
import { Competitor, playerInResult, pointsForPlayerForResult } from "../../../../swiss/main";
import { TournamentPhase, tournamentState } from "../../state/TournamentState";

registerComponent(
  "player-details",
  (params: {
    player: Competitor;
    phase: ko.Observable<TournamentPhase>;
    tournament: ko.ObservableArray<Competitor>;
  }) => {
    const { phase, completedRounds } = tournamentState;

    const results = ko.pureComputed(() => {
      return completedRounds().map(
        r => {
          const playerGame = r.find(res => playerInResult(params.player, res))!;
          const points = pointsForPlayerForResult(params.player, playerGame);
          const isBye = playerGame.pairing[0].id === playerGame.pairing[1].id;

          return {
            points: isBye ? `(${points})` : points,
            style: isBye ? 'is-bye' : 
              points === 1 ? 'is-win' : points === 0 ? 'is-loss' : 'is-draw'
          };
        })
    })
    
    
    return {
      name: params.player.name,
      showDeregister: phase.map(p => p === "registration"),
      deregister: () => {
        if (params.phase() !== "registration")
          throw new Error(
            "Cannot remove players from a tournament that is no longer in registration phase",
          );

        params.tournament.remove((p) => p.id === params.player.id);
      },

      results
    };
  },
  template,
);
