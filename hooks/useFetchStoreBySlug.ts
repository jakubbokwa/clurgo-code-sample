// @ts-nocheck
import { usePlasmicQueryData } from "@plasmicapp/loader-nextjs";
import { gql, GraphQLClient } from "graphql-request";

import { useStackContext } from "../contexts";

import { Store } from "../types/Hygraph/Store";
import { getSettings } from "../utils/getSettings";
import { STORE_FRAGMENT } from "../fragments/Store";

export function useFetchStoreBySlug(slug: string) {
  const client = useStackContext().client;

  return usePlasmicQueryData(`stores/${slug}`, () =>
    fetchStoreBySlug(slug, client)
  );
}

export async function fetchStoreBySlug(
  slug: string,
  client: GraphQLClient
): Promise<Store> {
  const settings = getSettings();
  const marketName = settings.organization.marketName;

  const QUERY = gql`
    query getStoreBySlug($slug: String!, $marketName: String!) {
      stores(where: { slug: $slug, markets_some: { name: $marketName } }) {
        ...StoreFragment
      }
    }
    ${STORE_FRAGMENT}
  `;

  const result: {
    stores: Store[];
  } = await client.request({
    document: QUERY,
    variables: {
      slug,
      marketName,
    },
  });

  return result.stores[0];
}

export default useFetchStoreBySlug;
