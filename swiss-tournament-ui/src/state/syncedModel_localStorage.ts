import ko from "knockout";

export function createSyncedModel<TModel>(
  storageKey: string,
  model: TModel,
  stringify: (model: TModel) => string,
  write: (model: TModel, storedModel: string) => void
): [TModel, () => void] {
  const storedModel = localStorage.getItem(storageKey);

  if (storedModel !== null) {
    write(model, storedModel)
  }

  const autoSync = ko.computed(() => {
    const string = stringify(model);
    localStorage.setItem(storageKey, string);
  });

  return [ model, function dispose() { autoSync.dispose(); } ];
}
