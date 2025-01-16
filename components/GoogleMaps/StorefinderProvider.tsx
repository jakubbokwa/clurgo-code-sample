// @ts-nocheck
import React, { useState, ReactNode } from "react";
import { buildRegisterComponentFn } from "../../lib";
import { StorefinderContext } from "../../contexts/StorefinderProvider";
import type { Store } from "../../types/Hygraph/Store";

type StorefinderProviderProps = {
  children: ReactNode;
};

export const StorefinderProvider = ({ children }: StorefinderProviderProps) => {
  const [currentStore, setCurrentStore] = useState<Store | null>(null);

  return (
    <StorefinderContext.Provider
      value={{
        currentStore,
        setCurrentStore,
      }}
    >
      {children}
    </StorefinderContext.Provider>
  );
};

export const registerStorefinderProvider = buildRegisterComponentFn(
  StorefinderProvider,
  {
    name: "storefinder-provider",
    displayName: "Storefinder Provider",
    importPath: "@xyz/plasmic-components",
    importName: "StorefinderProvider",
    props: {
      children: { type: "slot" },
    },
  }
);
