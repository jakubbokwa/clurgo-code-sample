//@ts-nocheck
import React from "react";
import { ControlPosition, MapControl } from "@vis.gl/react-google-maps";

import { Autocomplete } from "./Autocomplete";

type CustomAutocompleteControlProps = {
  controlPosition: ControlPosition;
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
};

export const CustomMapControl = ({
  controlPosition,
  onPlaceSelect,
}: CustomAutocompleteControlProps) => {
  return (
    <MapControl position={controlPosition}>
      <Autocomplete onPlaceSelect={onPlaceSelect} />
    </MapControl>
  );
};
