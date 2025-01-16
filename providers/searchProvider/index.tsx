// @ts-nocheck
import { ReactNode, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";

import SearchContext from "../../contexts/searchContext";

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const searchQueryParam = (router.query?.q as string) || "";

  const [searchedPhrase, setSearchedPhrase] =
    useState<string>(searchQueryParam);

  const isSearchPage = useMemo(
    () => /^\/search/.test(router.asPath),
    [router.asPath]
  );

  useEffect(() => {
    if (!isSearchPage) {
      setSearchedPhrase("");
    }
  }, [isSearchPage]);

  return (
    <SearchContext.Provider
      value={{
        searchedPhrase,
        setSearchedPhrase,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
