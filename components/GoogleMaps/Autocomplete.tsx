// @ts-nocheck
import React, { useEffect, useState, useCallback, FormEvent } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

import { buildRegisterComponentFn } from "../../lib";

import Zoom from "./Zoom";

interface Props {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
}

export const Autocomplete: React.FC<Props> = ({ onPlaceSelect }) => {
  const map = useMap();
  const places = useMapsLibrary("places");

  const [sessionToken, setSessionToken] =
    useState<google.maps.places.AutocompleteSessionToken | null>(null);
  const [autocompleteService, setAutocompleteService] =
    useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] =
    useState<google.maps.places.PlacesService | null>(null);
  const [predictionResults, setPredictionResults] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (!places || !map) return;

    setAutocompleteService(new places.AutocompleteService());
    setPlacesService(new places.PlacesService(map));
    setSessionToken(new places.AutocompleteSessionToken());

    return () => {
      setAutocompleteService(null);
      setPlacesService(null);
    };
  }, [map, places]);

  const fetchPredictions = useCallback(
    async (input: string) => {
      if (!autocompleteService || !input) {
        setPredictionResults([]);
        return;
      }

      autocompleteService.getPlacePredictions(
        { input, sessionToken },
        (predictions = []) => {
          setPredictionResults(predictions);
        }
      );
    },
    [autocompleteService, sessionToken]
  );

  const onInputChange = useCallback(
    (event: FormEvent<HTMLInputElement>) => {
      const value = (event.target as HTMLInputElement).value;
      setInputValue(value);
      fetchPredictions(value);
    },
    [fetchPredictions]
  );

  const handleSuggestionClick = useCallback(
    (placeId: string) => {
      if (!placesService || !places) return;

      placesService.getDetails(
        {
          placeId,
          fields: ["geometry", "name", "formatted_address"],
          sessionToken,
        },
        (placeDetails) => {
          onPlaceSelect(placeDetails);
          setPredictionResults([]);
          setInputValue(placeDetails?.formatted_address || "");
          setSessionToken(new places.AutocompleteSessionToken());
        }
      );
    },
    [onPlaceSelect, places, placesService, sessionToken]
  );

  const handleActionOnFirstPrediction = useCallback(() => {
    if (predictionResults.length > 0) {
      handleSuggestionClick(predictionResults[0].place_id);
    }
  }, [predictionResults, handleSuggestionClick]);

  const handleEnter = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        handleActionOnFirstPrediction();
      }
    },
    [handleActionOnFirstPrediction]
  );

  return (
    <div className="autocomplete-container">
      <div className="autocomplete-input-container">
        <input
          className="autocomplete-input"
          value={inputValue}
          onInput={onInputChange}
          onKeyDown={handleEnter}
          placeholder="Nach Ort / PLZ suchen"
        />
        <Zoom onClick={handleActionOnFirstPrediction} />
      </div>

      {predictionResults.length > 0 && (
        <ul className="autocomplete-suggestions-container">
          {predictionResults.map(({ place_id, description }) => (
            <li
              className="autocomplete-suggestion-item"
              key={place_id}
              onClick={() => handleSuggestionClick(place_id)}
            >
              {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const registerAutocomplete = buildRegisterComponentFn(Autocomplete, {
  name: "map-autocomplete",
  displayName: "Map - Autocomplete (Google Maps)",
  importPath: "@xyz/plasmic-components",
  importName: "Map",
  props: {
    children: { type: "slot" },
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
