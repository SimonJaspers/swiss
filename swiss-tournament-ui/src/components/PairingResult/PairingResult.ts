import { ScoringOption } from "../../../../swiss/main";
import { ResultState } from "../../state/TournamentState";
import { registerComponent } from "../Component";
import { RadioGroupOption } from "../RadioGroup/RadioGroup";
import template from "./PairingResult.html?raw";
import "./PairingResult.scss"

import "../RadioGroup/RadioGroup"

registerComponent("pairing-result", ({ pairing }: { pairing: ResultState }) => {

  const resultOptions: RadioGroupOption<ScoringOption>[] = [
    { label: `${pairing.player1.name} won`, value: 1 },
    { label: `Draw`, value: 0.5 },
    { label: `${pairing.player2.name} won`, value: -1 },
    { label: `Not played`, value: 0 },
  ]

  return {
    isBye: pairing.player1.id === pairing.player2.id,
    label: `${pairing.player1.name} vs. ${pairing.player2.name}`,
    resultOptions,
    result: pairing.result
  }
}, template);