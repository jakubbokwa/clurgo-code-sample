// @ts-nocheck
import React, { useContext } from "react";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";

import { StorefinderContext } from "../../contexts/StorefinderProvider";
import type { Store } from "../../types/Hygraph/Store";
import useFetchStores from "../../hooks/useFetchStores";
import { buildRegisterComponentFn } from "../../lib";

import { MapPin, MapPinSelected } from "./MapPin";

type MarkersCollectionProps = {
  children?: React.ReactNode;
  selectedColor: string;
  notSelectedColor: string;
};

const MarkersCollection = ({
  selectedColor,
  notSelectedColor,
}: MarkersCollectionProps) => {
  const storefinderData = useContext(StorefinderContext);
  const allStores = useFetchStores().data || [];
  const map = useMap();

  if (!storefinderData) return null;

  const { currentStore, setCurrentStore } = storefinderData;

  const handleClick = (store: Store) => {
    setCurrentStore(store);
    if (map) {
      map.setCenter({
        lat: store?.location?.latitude || 0,
        lng: store?.location?.longitude || 0,
      });
      map.setZoom(10);
    }

    const storeInfoElement = document.getElementById("store-info");
    if (storeInfoElement) {
      const offsetPosition =
        storeInfoElement.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <>
      {allStores.map((store) => (
        <AdvancedMarker
          key={store.id}
          position={{
            lat: store?.location?.latitude || 0,
            lng: store?.location?.longitude || 0,
          }}
          onClick={() => handleClick(store)}
        >
          {store === currentStore ? (
            <MapPinSelected color={selectedColor} />
          ) : (
            <MapPin color={notSelectedColor} />
          )}
        </AdvancedMarker>
      ))}
    </>
  );
};

export default MarkersCollection;

export const registerMarkersCollection = buildRegisterComponentFn(
  MarkersCollection,
  {
    name: "markers-collection",
    displayName: "Markers Collection (Google Maps)",
    importPath: "@xyz/plasmic-components",
    importName: "MarkersCollectionGoogleMap",
    props: {
      selectedColor: { type: "color" },
      notSelectedColor: { type: "color" },
    },
  }
);
