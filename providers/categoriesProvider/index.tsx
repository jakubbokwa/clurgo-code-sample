// @ts-nocheck
import { ReactNode } from "react";
import { gql } from "graphql-request";

import { useStackContext } from "../StackProvider";
import { usePlasmicQueryData } from "@plasmicapp/loader-nextjs";
import { useFlags } from "flagsmith/react";

import { getSettings } from "../../utils/getSettings";
import { CategoriesContext } from "../../contexts/categoriesContext";

interface CategoriesProviderProps {
  children: ReactNode;
}

export function CategoriesProvider({ children }: CategoriesProviderProps) {
  const graphQLClient = useStackContext().client;
  const flags = useFlags(["market"]);

  const settings = getSettings();
  const marketName = settings.organization.marketName;

  const GET_ALL_CATEGORIES_QUERY = flags["market"].enabled
    ? gql`
        query ShopCategories($marketName: String!) {
          categories(
            first: 100
            where: { markets_some: { name: $marketName } }
          ) {
            id
            name
            label
          }
        }
      `
    : gql`
      query ShopCategories() {
        categories(first: 100) {
          id
          name
          label
        }
      }
    `;

  const { data } = usePlasmicQueryData("categories", async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resp: any = await graphQLClient.request({
        document: GET_ALL_CATEGORIES_QUERY,
        variables: { marketName },
      });

      return { categories: resp.categories };
    } catch (error) {
      console.log(
        "GRAPHQL ERROR! (CategoriesContext): " + JSON.stringify(error)
      );
      throw error;
    }
  });

  return (
    <CategoriesContext.Provider value={data || { categories: [] }}>
      {children}
    </CategoriesContext.Provider>
  );
}
