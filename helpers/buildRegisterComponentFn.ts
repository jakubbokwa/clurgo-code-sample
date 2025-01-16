// @ts-nocheck
import { FC } from "react";
import { CodeComponentMeta } from "@plasmicapp/host";
import registerComponent from "@plasmicapp/host/registerComponent";

export function buildRegisterComponentFn<P>(
  component: FC<P>,
  meta: CodeComponentMeta<P>
) {
  return function registerCustomComponent(
    loader?: { registerComponent: typeof registerComponent },
    customComponentMeta?: CodeComponentMeta<P>
  ) {
    if (loader) {
      loader.registerComponent(component, customComponentMeta ?? meta);
    } else {
      registerComponent(component, customComponentMeta ?? meta);
    }
  };
}
