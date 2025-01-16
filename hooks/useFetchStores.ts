//@ts-nocheck
import { usePlasmicQueryData } from "@plasmicapp/loader-nextjs";
import { gql, GraphQLClient } from "graphql-request";

import { useStackContext } from "../contexts";

import { Store } from "../types/Hygraph/Store";
import { getSettings } from "../utils/getSettings";
import { STORE_FRAGMENT } from "../fragments/Store";

export type ShopType = "all" | "online" | "offline";

const QUERY_CONFIG: Record<ShopType, { where: string; orderBy: string }> = {
  all: {
    where: "{ markets_some: { name: $marketName } }",
    orderBy: "name_ASC",
  },
  online: {
    where: "{ markets_some: { name: $marketName }, openingDate: null }",
    orderBy: "name_ASC",
  },
  offline: {
    where: "{ markets_some: { name: $marketName }, openingDate_not: null }",
    orderBy: "openingDate_ASC",
  },
};

export function useFetchStores(shopType: ShopType = "all") {
  const client = useStackContext().client;

  return usePlasmicQueryData(`stores-${shopType}`, () =>
    fetchStores(client, shopType)
  );
}

export async function fetchStores(
  client: GraphQLClient,
  shopType: ShopType = "all"
): Promise<Store[]> {
  const settings = getSettings();
  const marketName = settings.organization.marketName;

  const { where, orderBy } = QUERY_CONFIG[shopType];

  const QUERY = gql`
      query getStores($marketName: String!) {
          stores(
              first: 100
              where: ${where}
              orderBy: ${orderBy}
          ) {
              ...StoreFragment
          }
      }
      ${STORE_FRAGMENT}
  `;

  const result: { stores: Store[] } = await client.request({
    document: QUERY,
    variables: { marketName },
  });

  return result.stores;
}

export default useFetchStores;
