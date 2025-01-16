// @ts-ignore
import { createContext } from "react";

const SearchContext = createContext<null | {
  searchedPhrase: string;
  setSearchedPhrase: (string: string) => void;
}>(null);

export default SearchContext;
