import * as ko from "knockout";
import {
  type SubscribableFunctions,
  type PureComputed,
  type Subscribable,
} from "knockout";

declare module "knockout" {
  interface SubscribableFunctions<T> {
    map<TOut>(f: (x: T) => TOut): PureComputed<TOut>;
  }
}
