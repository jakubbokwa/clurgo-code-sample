// @ts-nocheck
import React, { ReactNode, useContext, useEffect } from "react";

import { buildRegisterComponentFn } from "../../lib";
import { StorefinderContext } from "../../contexts/StorefinderProvider";
import useFetchStores from "../../hooks/useFetchStores";

type StoreDetailsContainerProps = {
  contentStoreLoaded: ReactNode;
  contentStoreNotLoaded: ReactNode;
  className: string;
  simulateStoreSelected: boolean;
};

const StoreDetailsContainer = ({
  className,
  contentStoreLoaded,
  contentStoreNotLoaded,
  simulateStoreSelected,
}: StoreDetailsContainerProps) => {
  const storefinderData = useContext(StorefinderContext);
  const { currentStore, setCurrentStore } = storefinderData || {};

  const allStores = useFetchStores();

  useEffect(() => {
    if (setCurrentStore) {
      setCurrentStore(
        simulateStoreSelected && allStores.data ? allStores.data[0] : null
      );
    }
  }, [allStores.data, setCurrentStore, simulateStoreSelected]);

  const renderedScenario = currentStore
    ? contentStoreLoaded
    : contentStoreNotLoaded;

  return <div className={className}>{renderedScenario}</div>;
};

export default StoreDetailsContainer;

export const registerStoreDetailsContainer = buildRegisterComponentFn(
  StoreDetailsContainer,
  {
    name: "store-details-container",
    displayName: "Store Details Container (Google Maps)",
    importPath: "@xyz/plasmic-components",
    importName: "StoreDetailsContainer",
    props: {
      contentStoreLoaded: {
        type: "slot",
      },
      contentStoreNotLoaded: {
        type: "slot",
      },
      simulateStoreSelected: {
        type: "boolean",
        displayName: "Simulate selected store",
      },
    },
  }
);
