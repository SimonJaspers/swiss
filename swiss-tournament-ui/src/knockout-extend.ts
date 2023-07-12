import * as ko from "knockout";

ko.subscribable.fn.map = function <TValue, TOut>(
  this: ko.Subscribable<TValue>,
  f: (value: TValue) => TOut
) {
  return ko.pureComputed(() => f(this()));
};

const ogEventHandler = ko.bindingHandlers.event;
ko.bindingHandlers.event = {
  init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
    const wrappedHandlers = valueAccessor();

    if (bindingContext.$root.errorHandler) {
      for (const [eventType, eventHandler] of Object.entries(wrappedHandlers)) {
        wrappedHandlers[eventType] = function tryCatch() {
          try {
            eventHandler.apply(this, arguments);
          } catch(err) {
            bindingContext.$root.errorHandler(err);
          }
        }
      }
    }

    ogEventHandler.init(
      element,
      function() { return wrappedHandlers; },
      allBindings,
      viewModel,
      bindingContext
    );
  }
}

// Wrap submit handler in try-catch
const ogSubmitHandler = ko.bindingHandlers.submit;
ko.bindingHandlers.submit = {
  init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
    const ogHandler = valueAccessor();
    let wrappedHandler = ogHandler;

    if (bindingContext.$root.errorHandler) {
      wrappedHandler = function(event) {
        try {
          ogHandler.call(this, event);
        } catch(err) {
          bindingContext.$root.errorHandler(err);
        }
      }
    }

    return ogSubmitHandler.init(
      element,
      function() { return wrappedHandler; },
      allBindings,
      viewModel,
      bindingContext
    );
  }
}

