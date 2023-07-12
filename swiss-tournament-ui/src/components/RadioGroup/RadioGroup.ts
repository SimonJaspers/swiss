import ko from "knockout"
import { registerComponent } from "../Component";
import template from "./RadioGroup.html?raw";
import "./RadioGroup.scss";

export type RadioGroupOption<TValue> = { value: TValue, label: string };

const RadioGroupVM = <TValue>({ options, value }: {
  options: RadioGroupOption<TValue>[],
  value: ko.Observable<TValue>
}) => {

  return {
    options,
    value
  }
}

registerComponent("radio-group", RadioGroupVM, template);