import ko from "knockout";
import { registerComponent } from "../Component";
import { tournamentState } from "../../state/TournamentState";
import template from "./PlayerRegistrationForm.html?raw";

const { phase, tournament } = tournamentState;

const addPlayer = (name: string) => {
  const maxId = tournament().reduce((max, player) => Math.max(max, Number(player.id)), 0);

  tournament.push({
    id: (maxId + 1).toString(),
    name
  })
}

const PlayerRegistrationFormVM = ({}) => {
  const nameInput = ko.observable("");
  const register = () => {
    if (phase() !== "registration") 
      throw new Error("Tournament is not in registartion phase; cannot register player");

    const name = nameInput().trim();

    if (name.length === 0)
      throw new Error("Cannot register a player without a name");

    if (tournament().some(p => p.name === name))
      throw new Error(`Tournament already has a player named ‘${name}’`);

    addPlayer(name);
    nameInput("");
  }

  return {
    name: nameInput,
    register
  }
}

registerComponent("player-registration-form", PlayerRegistrationFormVM, template)