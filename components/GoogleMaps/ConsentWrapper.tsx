// @ts-nocheck
import React, { ReactNode } from "react";
import { buildRegisterComponentFn } from "../../lib";

type ConsentWrapperProps = {
  className: string;
  children: ReactNode;
  onConsent: () => void;
  mapConsentClass: string;
};

const ConsentWrapper = ({
  className,
  children,
  onConsent,
  mapConsentClass = "map-consent",
}: ConsentWrapperProps) => {
  return (
    <div className={`${className} ${mapConsentClass}`} onClick={onConsent}>
      {children}
    </div>
  );
};

export default ConsentWrapper;

export const registerConsentWrapper = buildRegisterComponentFn(ConsentWrapper, {
  name: "consent-wrapper",
  displayName: "Consent Wrapper",
  importPath: "@xyz/plasmic-components",
  importName: "ConsentWrapper",
  props: {
    children: { type: "slot" },
    mapConsentClass: {
      type: "string",
      defaultValue: "map-consent",
    },
  },
});
