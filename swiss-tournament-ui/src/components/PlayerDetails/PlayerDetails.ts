import template from "./PlayerDetails.html?raw";
import { registerComponent } from "../Component";
import { Competitor } from "../../../../swiss/main";
import { TournamentPhase } from "../../state/TournamentState";

registerComponent("player-details", (params: {
  player: Competitor,
  phase: ko.Observable<TournamentPhase>,
  tournament: ko.ObservableArray<Competitor>
}) => {


  return {
    name: params.player.name,
    deregister: () => {
      if (params.phase() !== "registration")
        throw new Error("Cannot remove players from a tournament that is no longer in registration phase");
      
      params.tournament.remove(p => p.id === params.player.id);
    }
    
  }
}, template)