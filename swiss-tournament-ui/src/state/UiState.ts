import ko from "knockout";
import { createSyncedModel_url } from "./syncedModel_url";

type UiState = {
  /** The id of the selected player */
  id: ko.Observable<string | null>;
};

const [syncedState, _dispose] = createSyncedModel_url({
  id: ko.observable<string | null>(null),
});

export const uiState: UiState = syncedState;
