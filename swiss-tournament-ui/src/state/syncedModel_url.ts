import ko from "knockout";

/**
 * Syncs a model's state with the URLs search query. This prevents components having
 * to deal with the browser's history and document.location APIs. Instead, they can
 * write to an observable to update the URL, and read from it to access the URL
 * @param model
 * @returns
 */
export function createSyncedModel_url<
  TModel extends Record<string, ko.Subscribable<string | null>>,
>(model: TModel): [TModel, () => void] {
  // Write from URL
  const writeFromUrl = () => {
    const currentParams = new URLSearchParams(document.location.search);
    for (const [k, obsValue] of Object.entries(model)) {
      if (currentParams.has(k)) obsValue(currentParams.get(k));
      else obsValue(null);
    }
  };

  // Initial read from URL state
  writeFromUrl();

  // Write to URL
  const autoSync = ko
    .computed(() => {
      const searchParams = new URLSearchParams(window.location.search);

      for (const [key, obsValue] of Object.entries(model)) {
        const value = obsValue();
        if (value !== null) {
          searchParams.set(key, value);
        } else {
          searchParams.delete(key);
        }
      }

      const params = `${searchParams.toString()}`;

      // Prevent pushing state if it's equal
      const currentQuery = window.location.search.slice(1);
      const urlNeedsUpdate = params !== currentQuery;
      if (urlNeedsUpdate) {
        const newUrl =
          window.location.pathname + (params.length ? `?${params}` : ``);
        history.pushState(null, "", newUrl);
      }
    })
    .extend({ deferred: true });

  window.addEventListener("popstate", writeFromUrl);

  return [
    model,
    function dispose() {
      autoSync.dispose();
      window.removeEventListener("popstate", writeFromUrl);
    },
  ];
}
