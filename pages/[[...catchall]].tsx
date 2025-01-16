// @ts-nocheck
import * as React from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import {
  PlasmicComponent,
  extractPlasmicQueryData,
  ComponentRenderData,
  PlasmicRootProvider,
} from "@plasmicapp/loader-nextjs";
import { PLASMIC } from "../plasmic-init";
import { FlagsmithProvider } from "flagsmith/react";
import flagsmith from "flagsmith";
import fState from "../flagsmith";
import client from "../graphql-client";

import { StackProvider } from "../contexts";
import { CategoriesProvider } from "../contexts/CategoriesProvider";
import { SearchProvider } from "../contexts/SearchContext";
import { checkFeatureFlag } from "../helpers/featureFlagHelper";

export const getStaticPaths: GetStaticPaths = async () => {
  const pageModules = await PLASMIC.fetchPages();
  return {
    paths: pageModules
      .filter(
        (page) =>
          !page.path.includes("p/[slug]") &&
          !page.path.includes("c/[slug]") &&
          !page.path.includes("stores/[slug]")
      )
      .map((mod) => ({
        params: {
          catchall: mod.path.substring(1).split("/"),
        },
      })),

    // Turn on "fallback: 'blocking'" if you would like new paths created
    // in Plasmic to be automatically available
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const flagState = await fState();

  const { catchall } = context.params ?? {};
  const plasmicPath =
    typeof catchall === "string"
      ? catchall
      : Array.isArray(catchall)
      ? `/${catchall.join("/")}`
      : "/";
  const plasmicData = await PLASMIC.maybeFetchComponentData(plasmicPath);
  if (!plasmicData) {
    // non-Plasmic catch-all
    return { notFound: true };
  }

  const notFound = checkFeatureFlag(catchall, flagState);
  if (notFound) {
    return notFound;
  }

  const pageMeta = plasmicData.entryCompMetas[0];
  const queryCache = await extractPlasmicQueryData(
    <PlasmicRootProvider
      loader={PLASMIC}
      prefetchedData={plasmicData}
      pageParams={pageMeta.params}
      skipFonts={true}
    >
      <FlagsmithProvider flagsmith={flagsmith} serverState={flagState}>
        <StackProvider client={client}>
          <SearchProvider>
            {/*<NavigationProvider>*/}
            <CategoriesProvider>
              <PlasmicComponent component={pageMeta.displayName} />
            </CategoriesProvider>
            {/*</NavigationProvider>*/}
          </SearchProvider>
        </StackProvider>
      </FlagsmithProvider>
    </PlasmicRootProvider>
  );

  return {
    props: {
      plasmicData,
      queryCache,
    },
    revalidate: 60,
  };
};

export default function PlasmicLoaderPage(props: {
  plasmicData?: ComponentRenderData;
  queryCache?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}) {
  const { plasmicData, queryCache } = props;
  const router = useRouter();
  if (!plasmicData || plasmicData.entryCompMetas.length === 0) {
    return {
      notFound: true,
    };
  }

  const pageMeta = plasmicData.entryCompMetas[0];

  return (
    <PlasmicRootProvider
      loader={PLASMIC}
      prefetchedData={plasmicData}
      prefetchedQueryData={queryCache}
      pageParams={pageMeta.params}
      pageQuery={router.query}
      skipFonts={true}
    >
      <PlasmicComponent component={pageMeta.displayName} />
    </PlasmicRootProvider>
  );
}
