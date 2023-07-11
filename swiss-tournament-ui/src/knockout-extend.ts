import * as ko from "knockout";

ko.subscribable.fn.map = function <TValue, TOut>(
  this: ko.Subscribable<TValue>,
  f: (value: TValue) => TOut,
) {
  return ko.pureComputed(() => f(this()));
};
