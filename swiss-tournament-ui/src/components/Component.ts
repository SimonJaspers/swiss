import ko from "knockout";

// type VMConstructor = (x: { [key: string]: any }) => { [key: string]: any };
// TODO: how do I type this to ensure object goes in and object goes out while
//       still allowing for more precisely typed VM constructors?
type VMConstructor = (params: any) => any;

export const registerComponent = (
  tag: string,
  vmConstructor: VMConstructor,
  template: string,
): void => {
  if (!ko.components.isRegistered(tag)) {
    ko.components.register(tag, {
      template,
      viewModel: {
        createViewModel: vmConstructor,
      },
    });
  }
};
