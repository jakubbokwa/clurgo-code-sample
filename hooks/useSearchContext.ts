// @ts-ignore
import { useContext } from "react";
import SearchContext from "../contexts/searchContext";

export const useSearchContext = () => {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error("SearchContext not provided");
  }

  return context;
};
