// @ts-nocheck
import React, {
  BaseSyntheticEvent,
  Children,
  ReactElement,
  ReactNode,
  cloneElement,
  isValidElement,
  useEffect,
  useState,
} from "react";
import {
  APIProvider,
  ControlPosition,
  Map as VisGlMap,
} from "@vis.gl/react-google-maps";

import { buildRegisterComponentFn } from "../../helpers/buildRegisterComponentFn";

import MapHandler from "./MapHandler";
import { CustomMapControl } from "./MapControl";

type MapProps = {
  children: ReactNode;
  childrenNoConsent: ReactNode;
  zoom: number;
  mapId: string | null;
  centerLatitude: number;
  centerLongitude: number;
  disableDefaultUI: boolean;
  className: string;
};

const MapWithConsent = ({
  children,
  childrenNoConsent,
  zoom,
  mapId,
  centerLatitude,
  centerLongitude,
  disableDefaultUI,
  className,
}: MapProps) => {
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isConsent, setIsConsent] = useState(
    localStorage.getItem("mapConsentGiven") === "true"
  );

  const handleSetIsConsent = (e: BaseSyntheticEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".map-consent")) {
      localStorage.setItem("mapConsentGiven", "true");
      setIsConsent(true);
    }
  };

  const renderChildrenNoConsent = () =>
    Children.map(childrenNoConsent, (child) =>
      isValidElement(child)
        ? cloneElement(child as ReactElement, {
            onClick: handleSetIsConsent,
          })
        : child
    );

  useEffect(() => {
    setIsReady(true);
  }, [children]);

  if (!isConsent) {
    return <div className={className}>{renderChildrenNoConsent()}</div>;
  }

  if (!isReady) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className={className}>
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
        <VisGlMap
          defaultZoom={zoom}
          defaultCenter={{ lat: centerLatitude, lng: centerLongitude }}
          mapId={mapId}
          gestureHandling={"cooperative"}
          disableDefaultUI={disableDefaultUI}
        >
          {children}
        </VisGlMap>
        <CustomMapControl
          controlPosition={ControlPosition.TOP_RIGHT}
          onPlaceSelect={setSelectedPlace}
        />
        <MapHandler place={selectedPlace} />
      </APIProvider>
    </div>
  );
};

export default MapWithConsent;

export const registerMapWithConsent = buildRegisterComponentFn(MapWithConsent, {
  name: "map-with-consent",
  displayName: "Map with consent (Google Maps)",
  importPath: "@xyz/plasmic-components",
  importName: "MapWithConsent",
  props: {
    children: { type: "slot" },
    childrenNoConsent: { type: "slot" },
    zoom: {
      type: "number",
      defaultValue: 5,
    },
    mapId: {
      type: "string",
      defaultValue: "bf51a910020fa25a",
    },
    centerLatitude: {
      type: "number",
      defaultValue: 51.1657,
    },
    centerLongitude: {
      type: "number",
      defaultValue: 10.4515,
    },
    disableDefaultUI: {
      type: "boolean",
      defaultValue: true,
    },
  },
});
