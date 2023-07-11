import { Competitor, Result, ScoringOption } from "../../../swiss/main";
import ko from "knockout";
import { createSyncedModel } from "./syncedModel_localStorage";

const STORAGE_KEY = "TOURNAMENT_STATE";

export type TournamentPhase = "registration" | "in_progress" | "completed";

type PlainTournamentState = {
  phase: TournamentPhase;
  tournament: Competitor[];
  completedRounds: Result[][];
  currentRound: Result[] | null;
};

type ResultState = {
  player1: Competitor;
  player2: Competitor;
  result: ko.Observable<ScoringOption>;
};

type TournamentState = {
  phase: ko.Observable<TournamentPhase>;
  tournament: ko.ObservableArray<Competitor>;
  completedRounds: ko.ObservableArray<Result[]>;
  currentRound: ko.Observable<ResultState[] | null>;
};

const [state, _dispose] = createSyncedModel(
  STORAGE_KEY,
  {
    phase: ko.observable<TournamentPhase>("registration"),
    tournament: ko.observableArray<Competitor>([]),
    completedRounds: ko.observableArray<Result[]>([]),
    currentRound: ko.observable(null),
  },
  stringifyState,
  writeStringifiedState
);

export function resultStateToResult(rState: ResultState): Result {
  return {
    pairing: [rState.player1, rState.player2],
    score: rState.result(),
  };
}

export function resultToResultState(result: Result): ResultState {
  return {
    player1: result.pairing[0],
    player2: result.pairing[1],
    result: ko.observable(result.score),
  };
}

export const tournamentState: TournamentState = state;

function stringifyState(state: TournamentState) {
  const plainState: PlainTournamentState = {
    phase: state.phase(),
    tournament: state.tournament(),
    completedRounds: state.completedRounds(),
    currentRound: state.currentRound()?.map(resultStateToResult) ?? null,
  };

  return JSON.stringify(plainState);
}

function writeStringifiedState(
  model: TournamentState,
  stringifiedState: string
) {
  const plainState = JSON.parse(stringifiedState) as PlainTournamentState;

  model.phase(plainState.phase);
  model.tournament(plainState.tournament);
  model.completedRounds(plainState.completedRounds);

  // TODO: don't create new viewmodels
  model.currentRound(plainState.currentRound?.map(resultToResultState) ?? null);
}
